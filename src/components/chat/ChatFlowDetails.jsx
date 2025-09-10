import React, { useState, useEffect } from 'react'
import { useChatFlow } from '@/context/ChatFlowContext'
import { ArrowLeft, Save, PlayCircle } from 'lucide-react'

const ChatFlowDetails = ({ onTest }) => {
  const { currentEditingFlow, updateChatFlow, clearCurrentEditingFlow } = useChatFlow()
  const [flowData, setFlowData] = useState({
    name: '',
    description: '',
    status: 'inactive'
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (currentEditingFlow) {
      setFlowData({
        name: currentEditingFlow.name,
        description: currentEditingFlow.description,
        status: currentEditingFlow.status
      })
    }
  }, [currentEditingFlow])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFlowData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = (e) => {
    setFlowData(prev => ({
      ...prev,
      status: e.target.checked ? 'active' : 'inactive'
    }))
  }

  const handleSave = () => {
    if (!flowData.name.trim()) {
      alert('Please enter a name for the chat flow')
      return
    }

    setIsSaving(true)
    
    const updatedFlow = {
      ...currentEditingFlow,
      name: flowData.name,
      description: flowData.description,
      status: flowData.status,
      updatedAt: new Date().toISOString()
    }

    updateChatFlow(updatedFlow)
    setIsSaving(false)
  }

  const handleBack = () => {
    clearCurrentEditingFlow()
  }

  if (!currentEditingFlow) {
    return null
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Edit Chat Flow</h2>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={flowData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
            placeholder="Enter chat flow name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={flowData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
            placeholder="Enter chat flow description"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="status"
              checked={flowData.status === 'active'}
              onChange={handleStatusChange}
              className="h-4 w-4 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
            />
            <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
              Set as active
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Only one chat flow can be active at a time. Setting this flow as active will deactivate all other flows.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onTest}
            className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <PlayCircle size={16} />
            Test Flow
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#FFD700] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#FFED4E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatFlowDetails