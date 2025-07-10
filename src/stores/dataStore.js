import { create } from 'zustand'
import { supabase } from '../config/supabase'

export const useDataStore = create((set, get) => ({
  expenses: [],
  sales: [],
  batches: [],
  settings: null,
  integrations: [],
  loading: false,
  stats: {
    totalTransactions: 0,
    matchedPercentage: 0,
    pendingCount: 0,
    totalAmount: 0,
  },

  // Fetch all data
  fetchAllData: async () => {
    set({ loading: true })
    try {
      await Promise.all([
        get().fetchExpenses(),
        get().fetchSales(),
        get().fetchBatches(),
        get().fetchSettings(),
        get().fetchIntegrations(),
      ])
      get().calculateStats()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      set({ loading: false })
    }
  },

  // Fetch expenses
  fetchExpenses: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    set({ expenses: data || [] })
  },

  // Fetch sales
  fetchSales: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    set({ sales: data || [] })
  },

  // Fetch batches
  fetchBatches: async () => {
    const { data, error } = await supabase
      .from('csv_batches')
      .select('*')
      .order('upload_date', { ascending: false })
    
    if (error) throw error
    set({ batches: data || [] })
  },

  // Fetch settings
  fetchSettings: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    set({ settings: data })
  },

  // Update settings
  updateSettings: async (newSettings) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        ...newSettings,
        user_id: supabase.auth.user?.id,
      })
      .select()
      .single()
    
    if (error) throw error
    set({ settings: data })
  },

  // Fetch integrations
  fetchIntegrations: async () => {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    set({ integrations: data || [] })
  },

  // Calculate stats
  calculateStats: () => {
    const { expenses, sales } = get()
    const totalTransactions = expenses.length + sales.length
    const matchedExpenses = expenses.filter(e => e.status === 'matched').length
    const matchedSales = sales.filter(s => s.status === 'matched').length
    const totalMatched = matchedExpenses + matchedSales
    const matchedPercentage = totalTransactions > 0 ? (totalMatched / totalTransactions) * 100 : 0
    const pendingCount = expenses.filter(e => e.status === 'pending').length + 
                        sales.filter(s => s.status === 'pending').length
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) +
                       sales.reduce((sum, s) => sum + parseFloat(s.amount), 0)

    set({
      stats: {
        totalTransactions,
        matchedPercentage: Math.round(matchedPercentage),
        pendingCount,
        totalAmount,
      }
    })
  },

  // Upload CSV batch
  uploadCSVBatch: async (file, type, data) => {
    try {
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('csv_batches')
        .insert({
          filename: file.name,
          type,
          total_rows: data.length,
          user_id: supabase.auth.user?.id,
        })
        .select()
        .single()

      if (batchError) throw batchError

      // Insert transaction data
      const transactions = data.map(row => ({
        ...row,
        csv_batch_id: batch.id,
        user_id: supabase.auth.user?.id,
      }))

      const tableName = type === 'expense' ? 'expenses' : 'sales'
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(transactions)

      if (insertError) throw insertError

      // Update batch status
      await supabase
        .from('csv_batches')
        .update({ 
          status: 'completed',
          processed_rows: data.length 
        })
        .eq('id', batch.id)

      // Refresh data
      await get().fetchAllData()
      
      return batch
    } catch (error) {
      console.error('CSV upload error:', error)
      throw error
    }
  },

  // Confirm match
  confirmMatch: async (expenseId, saleId) => {
    try {
      // Update expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          matched_to_sale_id: saleId,
          status: 'matched'
        })
        .eq('id', expenseId)

      if (expenseError) throw expenseError

      // Update sale
      const { error: saleError } = await supabase
        .from('sales')
        .update({
          matched_to_expense_id: expenseId,
          status: 'matched'
        })
        .eq('id', saleId)

      if (saleError) throw saleError

      // Refresh data
      await get().fetchAllData()
    } catch (error) {
      console.error('Match confirmation error:', error)
      throw error
    }
  },

  // Ignore match
  ignoreMatch: async (transactionId, type) => {
    try {
      const tableName = type === 'expense' ? 'expenses' : 'sales'
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'ignored' })
        .eq('id', transactionId)

      if (error) throw error

      // Refresh data
      await get().fetchAllData()
    } catch (error) {
      console.error('Ignore match error:', error)
      throw error
    }
  },

  // Trigger auto-matching
  triggerAutoMatch: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-match-transactions')
      if (error) throw error
      
      // Refresh data after matching
      await get().fetchAllData()
      return data
    } catch (error) {
      console.error('Auto-match error:', error)
      throw error
    }
  },
}))