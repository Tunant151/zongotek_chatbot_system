import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { MessageSquare, Edit } from 'lucide-react'
import { useChatFlow } from '@/context/ChatFlowContext'

const QuestionNode = ({ id, data }) => {
  const { currentEditingFlow, updateChatFlow } = useChatFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [questionText, setQuestionText] = useState(data.question.text)

  const handleTextChange = (e) => {
    setQuestionText(e.target.value)
  }

  const handleSave = () => {
    // Update the question text in the flow
    const updatedFlow = { ...currentEditingFlow }
    const questionIndex = updatedFlow.questions.findIndex(q => q.id === id)
    
    if (questionIndex !== -1) {
      updatedFlow.questions[questionIndex].text = questionText
      updateChatFlow(updatedFlow)
      
      // Update the node data
      data.label = questionText
      data.question.text = questionText
    }
    
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setQuestionText(data.question.text)
    }
  }

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-[#333333] min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-[#333333]"
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#333333]" />
          <span className="text-xs font-medium text-gray-500">Question</span>
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit size={14} />
        </button>
      </div>
      
      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={questionText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
            rows={3}
          />
          <div className="text-xs text-gray-500 mt-1">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div className="text-sm font-medium">{data.label}</div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#FFD700]"
      />
    </div>
  )
}

export default QuestionNode