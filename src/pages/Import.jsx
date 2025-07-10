import React from 'react'
import { motion } from 'framer-motion'
import CSVUpload from '../components/Import/CSVUpload'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUpload, FiInfo } = FiIcons

function Import() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Transactions</h1>
        <p className="text-gray-600 mt-1">
          Upload your CSV files to start the reconciliation process.
        </p>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary-50 border border-primary-200 rounded-lg p-6"
      >
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiInfo} className="w-5 h-5 text-primary-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-primary-900 mb-2">CSV Format Requirements</h3>
            <div className="text-sm text-primary-800 space-y-1">
              <p><strong>Expenses:</strong> Required columns: date, amount, vendor, description</p>
              <p><strong>Sales:</strong> Required columns: date, amount, customer, description</p>
              <p><strong>Date format:</strong> YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY</p>
              <p><strong>Amount format:</strong> Numeric values (e.g., 123.45)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CSV Upload Component */}
      <CSVUpload />

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Matching</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Ensure consistent date formats across all CSV files</li>
          <li>• Use clear, descriptive vendor/customer names</li>
          <li>• Include transaction descriptions for better context</li>
          <li>• Upload expenses and sales from the same time period</li>
          <li>• Remove any header rows or summary rows from your CSV</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default Import