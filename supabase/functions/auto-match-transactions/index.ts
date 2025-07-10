import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchResult {
  expenseId: string
  saleId: string
  confidence: number
  reasons: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user settings
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const dateToleranceDays = settings?.date_tolerance_days || 7
    const autoMatchThreshold = settings?.auto_match_threshold || 95
    const matchStrategy = settings?.match_strategy || 'amount_and_date'

    // Get pending expenses and sales
    const { data: expenses } = await supabaseClient
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    const { data: sales } = await supabaseClient
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (!expenses || !sales) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transactions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find matches
    const matches: MatchResult[] = []

    for (const expense of expenses) {
      const potentialMatches = sales.map(sale => {
        const confidence = calculateMatchConfidence(
          expense,
          sale,
          dateToleranceDays,
          matchStrategy
        )
        return { sale, confidence }
      })
      .filter(match => match.confidence >= autoMatchThreshold)
      .sort((a, b) => b.confidence - a.confidence)

      if (potentialMatches.length > 0) {
        const bestMatch = potentialMatches[0]
        matches.push({
          expenseId: expense.id,
          saleId: bestMatch.sale.id,
          confidence: bestMatch.confidence,
          reasons: getMatchReasons(expense, bestMatch.sale, dateToleranceDays)
        })
      }
    }

    // Apply matches
    let matchedCount = 0
    for (const match of matches) {
      // Update expense
      await supabaseClient
        .from('expenses')
        .update({
          matched_to_sale_id: match.saleId,
          status: 'matched'
        })
        .eq('id', match.expenseId)

      // Update sale
      await supabaseClient
        .from('sales')
        .update({
          matched_to_expense_id: match.expenseId,
          status: 'matched'
        })
        .eq('id', match.saleId)

      matchedCount++
    }

    return new Response(
      JSON.stringify({
        success: true,
        matchedCount,
        totalExpenses: expenses.length,
        totalSales: sales.length,
        matches
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in auto-match-transactions:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateMatchConfidence(
  expense: any,
  sale: any,
  dateToleranceDays: number,
  matchStrategy: string
): number {
  let confidence = 0

  // Amount matching (70% weight)
  const amountDiff = Math.abs(expense.amount - sale.amount)
  if (amountDiff === 0) {
    confidence += 70
  } else if (amountDiff < expense.amount * 0.05) {
    confidence += 50
  } else if (amountDiff < expense.amount * 0.1) {
    confidence += 30
  } else if (amountDiff < expense.amount * 0.2) {
    confidence += 10
  }

  // Date matching (20% weight)
  if (matchStrategy === 'amount_and_date' || matchStrategy === 'fuzzy_match') {
    const dateDiff = Math.abs(
      new Date(expense.date).getTime() - new Date(sale.date).getTime()
    )
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24)

    if (daysDiff === 0) {
      confidence += 20
    } else if (daysDiff <= 1) {
      confidence += 15
    } else if (daysDiff <= dateToleranceDays) {
      confidence += 10
    }
  }

  // Description matching (10% weight)
  if (matchStrategy === 'fuzzy_match') {
    const descriptionSimilarity = calculateStringSimilarity(
      expense.description || '',
      sale.description || ''
    )
    confidence += descriptionSimilarity * 10
  }

  return Math.min(confidence, 100)
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

function getMatchReasons(expense: any, sale: any, dateToleranceDays: number): string[] {
  const reasons = []
  
  if (expense.amount === sale.amount) {
    reasons.push('Exact amount match')
  }
  
  const dateDiff = Math.abs(
    new Date(expense.date).getTime() - new Date(sale.date).getTime()
  )
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24)
  
  if (daysDiff === 0) {
    reasons.push('Same date')
  } else if (daysDiff <= dateToleranceDays) {
    reasons.push(`Within ${Math.round(daysDiff)} day${daysDiff > 1 ? 's' : ''}`)
  }
  
  return reasons
}