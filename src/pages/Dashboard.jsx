import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'
import StatsCard from '../components/Dashboard/StatsCard'
import ActivityFeed from '../components/Dashboard/ActivityFeed'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiBarChart, FiTrendingUp, FiClock, FiDollarSign, FiUpload, FiCheck } = FiIcons

function Dashboard() {
  const { stats, loading, fetchAllData } = useDataStore()
  const { subscription } = useAuthStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const statsCards = [
    {
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: FiBarChart,
      color: 'primary',
    },
    {
      title: 'Matched Percentage',
      value: `${stats.matchedPercentage}%`,
      icon: FiTrendingUp,
      color: 'success',
    },
    {
      title: 'Pending Items',
      value: stats.pendingCount.toLocaleString(),
      icon: FiClock,
      color: 'warning',
    },
    {
      title: 'Total Amount',
      value: `$${stats.totalAmount.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'primary',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your reconciliation overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <SafeIcon icon={FiUpload} className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors">
            <SafeIcon icon={FiCheck} className="w-4 h-4" />
            <span>Auto-Match</span>
          </button>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && subscription.status !== 'active' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 border border-warning-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="w-5 h-5 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-warning-800">
                Your subscription is inactive
              </p>
              <p className="text-sm text-warning-700">
                Upgrade to unlock all features and unlimited transactions.
              </p>
            </div>
            <button className="ml-auto px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors">
              Upgrade Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <ActivityFeed />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <SafeIcon icon={FiUpload} className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Import Transactions</p>
                <p className="text-sm text-gray-600">Upload CSV files for expenses or sales</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <SafeIcon icon={FiCheck} className="w-5 h-5 text-success-600" />
              <div>
                <p className="font-medium text-gray-900">Review Matches</p>
                <p className="text-sm text-gray-600">Confirm or reject suggested matches</p>
              </div>
            </button>
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <SafeIcon icon={FiBarChart} className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Export reconciliation reports</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard