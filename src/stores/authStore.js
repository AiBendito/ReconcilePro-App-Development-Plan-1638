import { create } from 'zustand'
import { supabase } from '../config/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  subscription: null,

  // Initialize auth state
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user, loading: false })
        get().fetchSubscription()
      } else {
        set({ user: null, loading: false })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ user: null, loading: false })
    }
  },

  // Sign up
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user })
    get().fetchSubscription()
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, subscription: null })
  },

  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  // Update password
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  // Fetch subscription status
  fetchSubscription: async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', get().user?.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      set({ subscription: data })
    } catch (error) {
      console.error('Subscription fetch error:', error)
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        set({ user: session?.user })
        get().fetchSubscription()
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, subscription: null })
      }
      callback(event, session)
    })
  },
}))