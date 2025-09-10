import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { MessageCircle, Edit, Plus } from 'lucide-react'
import { useChatFlow } from '@/context/ChatFlowContext'
import { createAction } from '@/data/chatFlowModel'

const AnswerNode = ({ id, data }) => {
  const { currentEditingFlow, updateChatFlow } = useChatFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [answerText, setAnswerText] = useState(data.answer.text)
  const [showActionMenu, setShowActionMenu] = useState(false)

  const handleTextChange = (e) => {
    setAnswerText(e.target.value)
  }

  const handleSave = () => {
    // Find the question that contains this answer
    const updatedFlow = { ...currentEditingFlow }
    let questionIndex = -1
    let answerIndex = -1
    
    // Find the question and answer indices
    updatedFlow.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      updatedFlow.questions[questionIndex].answers[answerIndex].text = answerText
      updateChatFlow(updatedFlow)
      
      // Update the node data
      data.label = answerText
      data.answer.text = answerText
    }
    
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setAnswerText(data.answer.text)
    }
  }

  const handleAddAction = (actionType) => {
    // Find the question that contains this answer
    const updatedFlow = { ...currentEditingFlow }
    let questionIndex = -1
    let answerIndex = -1
    
    // Find the question and answer indices
    updatedFlow.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      let newAction
      
      switch (actionType) {
        case 'navigate':
          newAction = createAction('navigate_to_question', { questionId: null })
          break
        case 'message':
          newAction = createAction('send_message', { message: 'Custom message' })
          break
        case 'redirect':
          newAction = createAction('redirect_to_url', { url: 'https://example.com' })
          break
        case 'transfer':
          newAction = createAction('transfer_to_agent', { department: 'support' })
          break
        default:
          return
      }
      
      updatedFlow.questions[questionIndex].answers[answerIndex].actions.push(newAction)
      updateChatFlow(updatedFlow)
      
      // Update the node data
      data.answer.actions.push(newAction)
    }
    
    setShowActionMenu(false)
  }

  const togglePrimary = () => {
    // Find the question that contains this answer
    const updatedFlow = { ...currentEditingFlow }
    let questionIndex = -1
    let answerIndex = -1
    
    // Find the question and answer indices
    updatedFlow.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      const isPrimary = updatedFlow.questions[questionIndex].answers[answerIndex].isPrimary
      updatedFlow.questions[questionIndex].answers[answerIndex].isPrimary = !isPrimary
      updateChatFlow(updatedFlow)
      
      // Update the node data
      data.answer.isPrimary = !data.answer.isPrimary
    }
  }

  return (
    <div className={`
      px-4 py-3 shadow-md rounded-md min-w-[200px]
      ${data.answer.isPrimary 
        ? 'bg-[#FFD700] border-2 border-[#FFD700]' 
        : data.answer.isSecondary
        ? 'bg-[#333333] text-white border-2 border-[#333333]'
        : 'bg-white border-2 border-[#FFD700]'}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 ${data.answer.isPrimary ? 'bg-[#333333]' : 'bg-[#FFD700]'}`}
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className={data.answer.isPrimary ? 'text-[#333333]' : 'text-[#FFD700]'} />
          <span className={`text-xs font-medium ${data.answer.isPrimary ? 'text-[#333333]' : 'text-gray-500'}`}>Answer</span>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => setIsEditing(true)}
            className={`p-1 ${data.answer.isPrimary ? 'text-[#333333] hover:text-gray-800' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <Edit size={14} />
          </button>
          
          <button 
            onClick={() => setShowActionMenu(!showActionMenu)}
            className={`p-1 ${data.answer.isPrimary ? 'text-[#333333] hover:text-gray-800' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={answerText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
            rows={2}
          />
          <div className="text-xs text-gray-500 mt-1">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div className={`text-sm font-medium ${data.answer.isPrimary ? 'text-[#333333]' : data.answer.isSecondary ? 'text-white' : ''}`}>
          {data.label}
        </div>
      )}
      
      {showActionMenu && (
        <div className="mt-2 p-2 bg-white border border-gray-200 rounded shadow-sm">
          <div className="text-xs font-medium text-gray-500 mb-1">Add Action:</div>
          <div className="space-y-1">
            <button 
              onClick={() => handleAddAction('navigate')}
              className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
            >
              Navigate to Question
            </button>
            <button 
              onClick={() => handleAddAction('message')}
              className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
            >
              Send Message
            </button>
            <button 
              onClick={() => handleAddAction('redirect')}
              className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
            >
              Redirect to URL
            </button>
            <button 
              onClick={() => handleAddAction('transfer')}
              className="w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
            >
              Transfer to Agent
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <button
          onClick={togglePrimary}
          className={`text-xs ${data.answer.isPrimary ? 'text-[#333333]' : 'text-gray-500'}`}
        >
          {data.answer.isPrimary ? 'Primary Button' : 'Set as Primary'}
        </button>
        
        {data.answer.actions.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500">Actions:</div>
            <div className="space-y-1 mt-1">
              {data.answer.actions.map((action, index) => (
                <div key={action.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {action.type === 'navigate_to_question' && 'Navigate'}
                  {action.type === 'send_message' && 'Send Message'}
                  {action.type === 'redirect_to_url' && 'Redirect'}
                  {action.type === 'transfer_to_agent' && 'Transfer'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${data.answer.isPrimary ? 'bg-[#333333]' : 'bg-[#FFD700]'}`}
      />
    </div>
  )
}

export default AnswerNode