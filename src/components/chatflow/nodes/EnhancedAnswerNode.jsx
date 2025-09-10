import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Plus, Edit, Trash2, ArrowRight, MessageSquare, ExternalLink, Users, Search } from 'lucide-react'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'
import { createEnhancedAction, ACTION_TYPES } from '@/data/enhancedChatFlowModel'

const EnhancedAnswerNode = ({ data, isConnectable }) => {
  const { updateStoryCard, currentEditingCard } = useEnhancedChatFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [answerText, setAnswerText] = useState(data.answer.text)
  const [showActions, setShowActions] = useState(false)

  const handleSave = () => {
    if (answerText.trim() === '') return

    const updatedCard = { ...currentEditingCard }
    let questionIndex = -1
    let answerIndex = -1
    
    updatedCard.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === data.answer.id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      updatedCard.questions[questionIndex].answers[answerIndex].text = answerText.trim()
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
    
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this answer?')) {
      const updatedCard = { ...currentEditingCard }
      
      updatedCard.questions.forEach((question, qIndex) => {
        const answerIndex = question.answers.findIndex(a => a.id === data.answer.id)
        if (answerIndex !== -1) {
          updatedCard.questions[qIndex].answers.splice(answerIndex, 1)
        }
      })
      
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
  }

  const handleAddAction = (actionType) => {
    let newAction
    
    switch (actionType) {
      case ACTION_TYPES.SEND_MESSAGE:
        newAction = createEnhancedAction(ACTION_TYPES.SEND_MESSAGE, {
          message: 'Thank you for your response.'
        })
        break
      case ACTION_TYPES.NAVIGATE_TO_CARD:
        newAction = createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_CARD, {
          cardId: 'select_card'
        })
        break
      case ACTION_TYPES.SEARCH_AND_LOAD_CARD:
        newAction = createEnhancedAction(ACTION_TYPES.SEARCH_AND_LOAD_CARD, {
          query: 'search_term'
        })
        break
      case ACTION_TYPES.TRANSFER_TO_AGENT:
        newAction = createEnhancedAction(ACTION_TYPES.TRANSFER_TO_AGENT, {
          department: 'operations'
        })
        break
      case ACTION_TYPES.REDIRECT_TO_URL:
        newAction = createEnhancedAction(ACTION_TYPES.REDIRECT_TO_URL, {
          url: 'https://example.com'
        })
        break
      default:
        return
    }

    const updatedCard = { ...currentEditingCard }
    let questionIndex = -1
    let answerIndex = -1
    
    updatedCard.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === data.answer.id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      if (!updatedCard.questions[questionIndex].answers[answerIndex].actions) {
        updatedCard.questions[questionIndex].answers[answerIndex].actions = []
      }
      updatedCard.questions[questionIndex].answers[answerIndex].actions.push(newAction)
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
  }

  const handleRemoveAction = (actionId) => {
    const updatedCard = { ...currentEditingCard }
    let questionIndex = -1
    let answerIndex = -1
    
    updatedCard.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === data.answer.id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      updatedCard.questions[questionIndex].answers[answerIndex].actions = 
        updatedCard.questions[questionIndex].answers[answerIndex].actions.filter(
          action => action.id !== actionId
        )
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setAnswerText(data.answer.text)
      setIsEditing(false)
    }
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case ACTION_TYPES.NAVIGATE_TO_QUESTION: return <ArrowRight size={12} />
      case ACTION_TYPES.NAVIGATE_TO_CARD: return <ArrowRight size={12} />
      case ACTION_TYPES.SEARCH_AND_LOAD_CARD: return <Search size={12} />
      case ACTION_TYPES.SEND_MESSAGE: return <MessageSquare size={12} />
      case ACTION_TYPES.TRANSFER_TO_AGENT: return <Users size={12} />
      case ACTION_TYPES.REDIRECT_TO_URL: return <ExternalLink size={12} />
      default: return <ArrowRight size={12} />
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
      case ACTION_TYPES.NAVIGATE_TO_QUESTION: return 'text-green-600'
      case ACTION_TYPES.NAVIGATE_TO_CARD: return 'text-purple-600'
      case ACTION_TYPES.SEARCH_AND_LOAD_CARD: return 'text-yellow-600'
      case ACTION_TYPES.SEND_MESSAGE: return 'text-blue-600'
      case ACTION_TYPES.TRANSFER_TO_AGENT: return 'text-red-600'
      case ACTION_TYPES.REDIRECT_TO_URL: return 'text-indigo-600'
      default: return 'text-gray-600'
    }
  }

  const getStylingClasses = () => {
    // Use consistent dark styling for all answer nodes
    const base = 'border-2 rounded-lg shadow-lg min-w-[280px] max-w-[320px]'
    
    // Always use dark theme styling for consistency
    return `${base} border-gray-600 bg-gray-800 text-white`
  }

  return (
    <div className={getStylingClasses()}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-current/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide opacity-75">
            {data.answer.type || 'button'}
          </span>
          {data.answer.styling?.icon && (
            <span className="text-sm">{data.answer.styling.icon}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Actions"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            className="w-full p-2 text-sm bg-black/10 border border-current/20 rounded focus:outline-none focus:ring-2 focus:ring-current/50"
            autoFocus
            placeholder="Enter answer text..."
          />
        ) : (
          <div 
            className="text-sm cursor-pointer hover:bg-black/10 p-2 rounded transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {data.answer.text || 'Click to edit answer...'}
          </div>
        )}

        {/* Actions */}
        {data.answer.actions && data.answer.actions.length > 0 && (
          <div className="mt-3 space-y-1">
            <h4 className="text-xs font-semibold opacity-75">Actions:</h4>
            {data.answer.actions.map((action, index) => (
              <div key={action.id || index} className="flex items-center justify-between p-2 bg-black/10 rounded text-xs">
                <div className="flex items-center gap-2">
                  <span className={getActionColor(action.type)}>
                    {getActionIcon(action.type)}
                  </span>
                  <span className="truncate">
                    {action.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveAction(action.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors opacity-50 hover:opacity-100"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Actions Panel */}
        {showActions && (
          <div className="mt-3 p-3 bg-black/10 rounded border border-current/20">
            <h4 className="text-xs font-semibold mb-2 opacity-75">Add Action:</h4>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleAddAction(ACTION_TYPES.SEND_MESSAGE)}
                className="p-2 text-xs bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center gap-1"
              >
                <MessageSquare size={10} />
                Message
              </button>
              <button
                onClick={() => handleAddAction(ACTION_TYPES.NAVIGATE_TO_CARD)}
                className="p-2 text-xs bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center gap-1"
              >
                <ArrowRight size={10} />
                Go to Card
              </button>
              <button
                onClick={() => handleAddAction(ACTION_TYPES.SEARCH_AND_LOAD_CARD)}
                className="p-2 text-xs bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center gap-1"
              >
                <Search size={10} />
                Search Cards
              </button>
              <button
                onClick={() => handleAddAction(ACTION_TYPES.TRANSFER_TO_AGENT)}
                className="p-2 text-xs bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center gap-1"
              >
                <Users size={10} />
                Transfer
              </button>
              <button
                onClick={() => handleAddAction(ACTION_TYPES.REDIRECT_TO_URL)}
                className="p-2 text-xs bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center gap-1"
              >
                <ExternalLink size={10} />
                URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <div className="text-xs opacity-50 flex justify-between items-center">
          <span>Actions: {data.answer.actions?.length || 0}</span>
          <span className="font-mono">{data.answer.id.slice(-8)}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-current bg-current/20"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-current bg-current"
      />
    </div>
  )
}

export default EnhancedAnswerNode
