import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import Papa from 'papaparse'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { useDataStore } from '../../stores/dataStore'
import toast from 'react-hot-toast'

const { FiUpload, FiFile, FiCheck, FiX } = FiIcons

function CSVUpload() {
  const [uploadType, setUploadType] = useState('expense')
  const [previewData, setPreviewData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [file, setFile] = useState(null)
  
  const { uploadCSVBatch } = useDataStore()

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setFile(file)
    
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file')
          return
        }
        setPreviewData(results.data)
      },
      error: (error) => {
        toast.error('Error reading CSV file')
        console.error('CSV parse error:', error)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!file || !previewData) return

    setIsProcessing(true)
    
    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const processedData = results.data
              .filter(row => row.date && row.amount) // Filter out empty rows
              .map(row => ({
                date: new Date(row.date).toISOString().split('T')[0],
                amount: parseFloat(row.amount),
                vendor: uploadType === 'expense' ? row.vendor || row.description : undefined,
                customer: uploadType === 'sale' ? row.customer || row.description : undefined,
                description: row.description || '',
              }))

            await uploadCSVBatch(file, uploadType, processedData)
            toast.success(`Successfully uploaded ${processedData.length} ${uploadType} transactions`)
            
            // Reset form
            setFile(null)
            setPreviewData(null)
          } catch (error) {
            toast.error('Error uploading CSV data')
            console.error('Upload error:', error)
          } finally {
            setIsProcessing(false)
          }
        },
        error: (error) => {
          toast.error('Error processing CSV file')
          console.error('CSV processing error:', error)
          setIsProcessing(false)
        }
      })
    } catch (error) {
      toast.error('Error uploading file')
      console.error('Upload error:', error)
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewData(null)
  }

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setUploadType('expense')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === 'expense'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setUploadType('sale')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === 'sale'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sales
        </button>
      </div>

      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <SafeIcon icon={FiUpload} className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click to browse and select a file
          </p>
          <p className="text-xs text-gray-500">
            Supported format: CSV files only
          </p>
        </div>

        {/* File Info */}
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFile} className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Preview Data */}
      {previewData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview (First 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData[0] && Object.keys(previewData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>Upload {uploadType === 'expense' ? 'Expenses' : 'Sales'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CSVUpload