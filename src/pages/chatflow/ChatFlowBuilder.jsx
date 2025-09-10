import React, { useState } from 'react'
import { ChatFlowProvider } from '@/context/ChatFlowContext'
import ChatFlowList from '@/components/chatflow/ChatFlowList'
import ChatFlowDetails from '@/components/chatflow/ChatFlowDetails'
import ChatFlowEditor from '@/components/chatflow/ChatFlowEditor'
import ChatFlowTester from '@/components/chatflow/ChatFlowTester'
import { useChatFlow } from '@/context/ChatFlowContext'

const ChatFlowBuilderContent = () => {
  const { currentEditingFlow } = useChatFlow()
  const [showTester, setShowTester] = useState(false)

  // Handle back from tester
  const handleBackFromTester = () => {
    setShowTester(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showTester && currentEditingFlow ? (
        <ChatFlowTester flowId={currentEditingFlow.id} onBack={handleBackFromTester} />
      ) : currentEditingFlow ? (
        currentEditingFlow.questions ? (
          <ChatFlowEditor />
        ) : (
          <ChatFlowDetails onTest={() => setShowTester(true)} />
        )
      ) : (
        <ChatFlowList />
      )}
    </div>
  )
}

const ChatFlowBuilder = () => {
  return (
    <ChatFlowProvider>
      <ChatFlowBuilderContent />
    </ChatFlowProvider>
  )
}

export default ChatFlowBuilder
