import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SettingsForm from '../components/Settings/SettingsForm'
import IntegrationCard from '../components/Settings/IntegrationCard'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCloud, FiSlack, FiCreditCard, FiGithub } = FiIcons

function Settings() {
  const [loadingIntegration, setLoadingIntegration] = useState(null)

  const integrations = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Automatically import CSV files from a designated folder',
      icon: FiCloud,
      isConnected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receive notifications about matching progress and results',
      icon: FiSlack,
      isConnected: false,
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Import sales data directly from your Stripe account',
      icon: FiCreditCard,
      isConnected: false,
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Automatically sync reconciliation reports to your repository',
      icon: FiGithub,
      isConnected: false,
    },
  ]

  const handleConnect = async (integrationId) => {
    setLoadingIntegration(integrationId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoadingIntegration(null)
  }

  const handleDisconnect = async (integrationId) => {
    setLoadingIntegration(integrationId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoadingIntegration(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your reconciliation preferences and integrations.
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm />

      {/* Integrations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              {...integration}
              onConnect={() => handleConnect(integration.id)}
              onDisconnect={() => handleDisconnect(integration.id)}
              isLoading={loadingIntegration === integration.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Settings