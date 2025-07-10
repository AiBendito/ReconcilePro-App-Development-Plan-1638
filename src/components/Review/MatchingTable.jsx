import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useDataStore } from '../../stores/dataStore'
import toast from 'react-hot-toast'

const { FiCheck, FiX, FiSplit, FiSearch } = FiIcons

function MatchingTable() {
  const { expenses, sales, confirmMatch, ignoreMatch, triggerAutoMatch } = useDataStore()
  const [pendingExpenses, setPendingExpenses] = useState([])
  const [suggestedMatches, setSuggestedMatches] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [isAutoMatching, setIsAutoMatching] = useState(false)

  useEffect(() => {
    // Filter pending expenses
    const pending = expenses.filter(expense => expense.status === 'pending')
    setPendingExpenses(pending)

    // Find suggested matches for each pending expense
    const matches = {}
    pending.forEach(expense => {
      const potentialMatches = sales
        .filter(sale => sale.status === 'pending')
        .map(sale => {
          const amountDiff = Math.abs(expense.amount - sale.amount)
          const dateDiff = Math.abs(new Date(expense.date) - new Date(sale.date))
          const daysDiff = dateDiff / (1000 * 60 * 60 * 24)
          
          // Calculate match score (0-100)
          let score = 0
          if (amountDiff === 0) score += 70
          else if (amountDiff < expense.amount * 0.1) score += 50
          else if (amountDiff < expense.amount * 0.2) score += 30
          
          if (daysDiff <= 1) score += 30
          else if (daysDiff <= 7) score += 20
          else if (daysDiff <= 30) score += 10
          
          return { ...sale, matchScore: score, daysDiff }
        })
        .filter(match => match.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3) // Top 3 matches
      
      if (potentialMatches.length > 0) {
        matches[expense.id] = potentialMatches
      }
    })
    
    setSuggestedMatches(matches)
  }, [expenses, sales])

  const handleConfirmMatch = async (expenseId, saleId) => {
    try {
      await confirmMatch(expenseId, saleId)
      toast.success('Match confirmed successfully!')
    } catch (error) {
      toast.error('Error confirming match')
    }
  }

  const handleIgnoreMatch = async (expenseId) => {
    try {
      await ignoreMatch(expenseId, 'expense')
      toast.success('Transaction ignored')
    } catch (error) {
      toast.error('Error ignoring transaction')
    }
  }

  const handleAutoMatch = async () => {
    setIsAutoMatching(true)
    try {
      await triggerAutoMatch()
      toast.success('Auto-matching completed!')
    } catch (error) {
      toast.error('Error during auto-matching')
    } finally {
      setIsAutoMatching(false)
    }
  }

  const filteredExpenses = pendingExpenses.filter(expense =>
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Review Matches</h2>
        <button
          onClick={handleAutoMatch}
          disabled={isAutoMatching}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAutoMatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Auto-matching...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiCheck} className="w-4 h-4" />
              <span>Run Auto-Match</span>
            </>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SafeIcon icon={FiSearch} className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Matching Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiCheck} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending matches</h3>
            <p className="text-gray-600">All transactions have been processed!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Matches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.vendor}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${expense.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {suggestedMatches[expense.id] ? (
                        <div className="space-y-2">
                          {suggestedMatches[expense.id].map((match) => (
                            <div
                              key={match.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {match.customer}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ${match.amount.toFixed(2)} • {format(new Date(match.date), 'MMM d')}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {match.matchScore}% match • {Math.round(match.daysDiff)} days apart
                                </div>
                              </div>
                              <button
                                onClick={() => handleConfirmMatch(expense.id, match.id)}
                                className="ml-3 px-3 py-1 bg-success-600 text-white text-xs rounded-md hover:bg-success-700 transition-colors"
                              >
                                Match
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No suggested matches</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleIgnoreMatch(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Ignore this expense"
                        >
                          <SafeIcon icon={FiX} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MatchingTable