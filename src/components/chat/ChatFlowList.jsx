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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Chat Flows</h2>
        <button
          onClick={handleCreateFlow}
          className="flex items-center gap-2 bg-[#FFD700] text-[#333333] px-4 py-2 rounded-lg hover:bg-[#FFED4E] transition-colors"
        >
          <Plus size={16} />
          Create New Flow
        </button>
      </div>

      {chatFlows.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No chat flows created yet.</p>
          <p className="text-gray-500 mt-2">Click the button above to create your first chat flow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatFlows.map((flow) => (
            <div 
              key={flow.id} 
              className={`
                border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
                ${flow.id === activeChatFlowId ? 'border-[#FFD700] border-2' : 'border-gray-200'}
              `}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg truncate">{flow.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditFlow(flow)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{flow.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  <span 
                    className={`
                      px-2 py-1 text-xs rounded-full
                      ${flow.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'}
                    `}
                  >
                    {flow.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {flow.id === activeChatFlowId ? (
                    <button
                      className="w-full flex items-center justify-center gap-1 py-1 text-sm text-green-600 hover:text-green-700 transition-colors"
                      disabled
                    >
                      <Check size={14} />
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetActive(flow.id)}
                      className="w-full flex items-center justify-center gap-1 py-1 text-sm text-gray-500 hover:text-[#FFD700] transition-colors"
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