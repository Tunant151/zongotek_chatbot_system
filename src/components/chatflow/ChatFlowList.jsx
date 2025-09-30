import React, { useState } from 'react'
import { useChatFlow } from '@/context/ChatFlowContext'
import { Plus, Edit, Trash2, Check } from 'lucide-react'
import { createNewChatFlow } from '@/data/chatFlowUtils'
import { formatDistanceToNow } from 'date-fns'

const ChatFlowList = () => {
  const { 
    chatFlows, 
    addChatFlow, 
    deleteChatFlow, 
    setActiveChatFlow,
    setCurrentEditingFlow,
    activeChatFlowId
  } = useChatFlow()

  const handleCreateFlow = () => {
    const newFlow = createNewChatFlow()
    addChatFlow(newFlow)
    setCurrentEditingFlow(newFlow)
  }

  const handleEditFlow = (flow) => {
    setCurrentEditingFlow(flow)
  }

  const handleDeleteFlow = (flowId) => {
    if (window.confirm('Are you sure you want to delete this chat flow?')) {
      deleteChatFlow(flowId)
    }
  }

  const handleSetActive = (flowId) => {
    setActiveChatFlow(flowId)
  }

  return (
    <div className="p-4 bg-base-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base-content">Chat Flows</h2>
        <button
          onClick={handleCreateFlow}
          className="flex gap-2 items-center px-4 py-2 font-semibold rounded-lg transition-colors bg-primary text-primary-content hover:bg-primary-focus"
        >
          <Plus size={16} />
          Create New Flow
        </button>
      </div>

      {chatFlows.length === 0 ? (
        <div className="py-8 text-center rounded-lg bg-base-200">
          <p className="text-base-content/70">No chat flows created yet.</p>
          <p className="mt-2 text-base-content/70">Click the button above to create your first chat flow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chatFlows.map((flow) => (
            <div 
              key={flow.id} 
              className={`
                border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-base-100
                ${flow.id === activeChatFlowId ? 'border-primary border-2' : 'border-base-300'}
              `}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold truncate text-base-content">{flow.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditFlow(flow)}
                      className="p-1 transition-colors text-base-content/50 hover:text-base-content"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="p-1 transition-colors text-base-content/50 hover:text-error"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-base-content/70 line-clamp-2">{flow.description}</p>
                
                <div className="flex justify-between items-center mt-4">
                  <span 
                    className={`
                      px-2 py-1 text-xs rounded-full
                      ${flow.status === 'active' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-base-300 text-base-content/70'}
                    `}
                  >
                    {flow.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="text-xs text-base-content/50">
                    {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="pt-3 mt-4 border-t border-base-300">
                  {flow.id === activeChatFlowId ? (
                    <button
                      className="flex gap-1 justify-center items-center py-1 w-full text-sm transition-colors text-primary hover:text-primary-focus"
                      disabled
                    >
                      <Check size={14} />
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetActive(flow.id)}
                      className="flex gap-1 justify-center items-center py-1 w-full text-sm transition-colors text-base-content/50 hover:text-primary"
                    >
                      Set as Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatFlowList
