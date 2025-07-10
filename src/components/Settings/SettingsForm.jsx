import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDataStore } from '../../stores/dataStore'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiSave, FiSettings } = FiIcons

function SettingsForm() {
  const { settings, updateSettings } = useDataStore()
  const [formData, setFormData] = useState({
    date_tolerance_days: 7,
    auto_match_threshold: 95,
    match_strategy: 'amount_and_date',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        date_tolerance_days: settings.date_tolerance_days || 7,
        auto_match_threshold: settings.auto_match_threshold || 95,
        match_strategy: settings.match_strategy || 'amount_and_date',
      })
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateSettings(formData)
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error('Error updating settings')
      console.error('Settings update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <SafeIcon icon={FiSettings} className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Matching Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Tolerance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Tolerance (Days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={formData.date_tolerance_days}
            onChange={(e) => handleChange('date_tolerance_days', parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum number of days between transactions to consider them a potential match
          </p>
        </div>

        {/* Auto-match Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-match Threshold (%)
          </label>
          <input
            type="number"
            min="50"
            max="100"
            value={formData.auto_match_threshold}
            onChange={(e) => handleChange('auto_match_threshold', parseFloat(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum confidence score required for automatic matching (50-100%)
          </p>
        </div>

        {/* Match Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Match Strategy
          </label>
          <select
            value={formData.match_strategy}
            onChange={(e) => handleChange('match_strategy', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="amount_only">Amount Only</option>
            <option value="amount_and_date">Amount + Date</option>
            <option value="fuzzy_match">Fuzzy Match</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Strategy used for finding potential matches between expenses and sales
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default SettingsForm