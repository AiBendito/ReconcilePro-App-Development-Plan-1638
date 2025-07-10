import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUpload, FiCheck, FiX, FiClock } = FiIcons

function ActivityFeed({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return FiUpload
      case 'match':
        return FiCheck
      case 'ignore':
        return FiX
      default:
        return FiClock
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'upload':
        return 'text-primary-600 bg-primary-50'
      case 'match':
        return 'text-success-600 bg-success-50'
      case 'ignore':
        return 'text-danger-600 bg-danger-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Mock activities if none provided
  const mockActivities = [
    {
      id: 1,
      type: 'upload',
      title: 'CSV file uploaded',
      description: 'expenses_march_2024.csv - 45 transactions',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 2,
      type: 'match',
      title: '12 transactions matched',
      description: 'Auto-matching completed successfully',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      id: 3,
      type: 'upload',
      title: 'CSV file uploaded',
      description: 'sales_march_2024.csv - 38 transactions',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <SafeIcon icon={getActivityIcon(activity.type)} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {displayActivities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <SafeIcon icon={FiClock} className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No recent activity</p>
        </div>
      )}
    </motion.div>
  )
}

export default ActivityFeed