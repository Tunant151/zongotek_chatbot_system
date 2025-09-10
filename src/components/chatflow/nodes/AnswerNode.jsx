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
      
      // Ensure actions array exists
      if (!updatedFlow.questions[questionIndex].answers[answerIndex].actions) {
        updatedFlow.questions[questionIndex].answers[answerIndex].actions = []
      }
      updatedFlow.questions[questionIndex].answers[answerIndex].actions.push(newAction)
      updateChatFlow(updatedFlow)
      
      // Update the node data
      if (!data.answer.actions) {
        data.answer.actions = []
      }
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
    <div className="px-4 py-3 shadow-lg rounded-lg min-w-[280px] max-w-[320px] bg-gray-800 border-2 border-gray-600 text-white">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white bg-white/20"
      />
      
      <div className="flex items-center justify-between mb-2 border-b border-white/20 pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-white" />
          <span className="text-xs font-medium text-white uppercase tracking-wide">Answer</span>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded"
          >
            <Edit size={14} />
          </button>
          
          <button 
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-1 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded"
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
            className="w-full p-2 border border-white/20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/10 text-white placeholder-white/50"
            rows={2}
          />
          <div className="text-xs text-white/70 mt-1">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div className="text-sm font-medium text-white cursor-pointer hover:bg-white/10 p-2 rounded transition-colors" onClick={() => setIsEditing(true)}>
          {data.label}
        </div>
      )}
      
      {showActionMenu && (
        <div className="mt-2 p-2 bg-white/10 border border-white/20 rounded shadow-sm">
          <div className="text-xs font-medium text-white/70 mb-2">Add Action:</div>
          <div className="grid grid-cols-2 gap-1">
            <button 
              onClick={() => handleAddAction('navigate')}
              className="text-left text-xs px-2 py-1 hover:bg-white/20 rounded text-white transition-colors"
            >
              Navigate
            </button>
            <button 
              onClick={() => handleAddAction('message')}
              className="text-left text-xs px-2 py-1 hover:bg-white/20 rounded text-white transition-colors"
            >
              Message
            </button>
            <button 
              onClick={() => handleAddAction('redirect')}
              className="text-left text-xs px-2 py-1 hover:bg-white/20 rounded text-white transition-colors"
            >
              Redirect
            </button>
            <button 
              onClick={() => handleAddAction('transfer')}
              className="text-left text-xs px-2 py-1 hover:bg-white/20 rounded text-white transition-colors"
            >
              Transfer
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-white/20">
        <button
          onClick={togglePrimary}
          className="text-xs text-white/70 hover:text-white transition-colors"
        >
          {data.answer.isPrimary ? 'Primary Button' : 'Set as Primary'}
        </button>
        
        {data.answer.actions && data.answer.actions.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-white/70 mb-1">Actions:</div>
            <div className="space-y-1">
              {data.answer.actions && data.answer.actions.map((action) => (
                <div key={action.id} className="text-xs bg-white/10 px-2 py-1 rounded text-white">
                  {action.type === 'navigate_to_question' && 'Navigate'}
                  {action.type === 'send_message' && 'Send Message'}
                  {action.type === 'redirect_to_url' && 'Redirect'}
                  {action.type === 'transfer_to_agent' && 'Transfer'}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-white/50 mt-2 flex justify-between items-center">
          <span>Actions: {data.answer.actions?.length || 0}</span>
          <span className="font-mono">{id.slice(-8)}</span>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white bg-white"
      />
    </div>
  )
}

export default AnswerNode