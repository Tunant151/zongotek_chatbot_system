import React from 'react'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'
import EnhancedChatFlowList from '@/components/chatflow/EnhancedChatFlowList'
import EnhancedChatFlowEditor from '@/components/chatflow/EnhancedChatFlowEditor'

const EnhancedChatFlowBuilder = () => {
  const { currentEditingCard, isLoading } = useEnhancedChatFlow()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading enhanced chatbot system...</p>
        </div>
      </div>
    )
  }

  // Show editor if a card is being edited
  if (currentEditingCard) {
    return <EnhancedChatFlowEditor />
  }

  // Show card list by default
  return <EnhancedChatFlowList />
}

export default EnhancedChatFlowBuilder
