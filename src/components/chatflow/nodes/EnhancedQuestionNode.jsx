import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { MessageSquare, Edit, Trash2, Settings } from 'lucide-react'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'

const EnhancedQuestionNode = ({ data, isConnectable }) => {
  const { updateStoryCard, currentEditingCard } = useEnhancedChatFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [questionText, setQuestionText] = useState(data.question.text)
  const [showSettings, setShowSettings] = useState(false)

  const handleSave = () => {
    if (questionText.trim() === '') return

    const updatedCard = { ...currentEditingCard }
    const questionIndex = updatedCard.questions.findIndex(q => q.id === data.question.id)
    
    if (questionIndex !== -1) {
      updatedCard.questions[questionIndex].text = questionText.trim()
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
    
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this question and all its answers?')) {
      const updatedCard = { ...currentEditingCard }
      updatedCard.questions = updatedCard.questions.filter(q => q.id !== data.question.id)
      updatedCard.updatedAt = new Date().toISOString()
      updateStoryCard(updatedCard)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setQuestionText(data.question.text)
      setIsEditing(false)
    }
  }

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'input': return '📝'
      case 'multiple_choice': return '☑️'
      case 'card_selection': return '🗂️'
      case 'search': return '🔍'
      default: return '💬'
    }
  }

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'normal': return 'border-blue-500 bg-blue-50'
      case 'low': return 'border-gray-500 bg-gray-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <div className={`relative bg-base-100 border-2 ${getImportanceColor(data.question.metadata?.importance)} rounded-lg shadow-lg min-w-[280px] max-w-[350px]`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getQuestionTypeIcon(data.question.type)}</span>
          <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
            {data.question.type.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-base-200 rounded transition-colors"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-base-200 rounded transition-colors"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-error hover:text-error-content rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            className="w-full p-2 text-sm bg-base-200 border border-base-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            autoFocus
            placeholder="Enter your question..."
          />
        ) : (
          <div 
            className="text-sm text-base-content cursor-pointer hover:bg-base-200 p-2 rounded transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {data.question.text || 'Click to edit question...'}
          </div>
        )}

        {/* Question metadata */}
        <div className="mt-2 flex flex-wrap gap-1">
          {data.question.metadata?.importance !== 'normal' && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              data.question.metadata.importance === 'critical' ? 'bg-error text-error-content' :
              data.question.metadata.importance === 'high' ? 'bg-warning text-warning-content' :
              'bg-info text-info-content'
            }`}>
              {data.question.metadata.importance}
            </span>
          )}
          
          {data.question.personalization?.useUserName && (
            <span className="text-xs px-2 py-1 bg-secondary text-secondary-content rounded-full">
              Personalized
            </span>
          )}
          
          {data.question.conditions?.length > 0 && (
            <span className="text-xs px-2 py-1 bg-accent text-accent-content rounded-full">
              Conditional
            </span>
          )}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-3 p-3 bg-base-200 rounded border">
            <h4 className="text-xs font-semibold mb-2">Question Settings</h4>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-base-content/70 mb-1">Type:</label>
                <select 
                  value={data.question.type}
                  className="select select-xs select-bordered w-full"
                  onChange={(e) => {
                    const updatedCard = { ...currentEditingCard }
                    const questionIndex = updatedCard.questions.findIndex(q => q.id === data.question.id)
                    if (questionIndex !== -1) {
                      updatedCard.questions[questionIndex].type = e.target.value
                      updateStoryCard(updatedCard)
                    }
                  }}
                >
                  <option value="text">Text</option>
                  <option value="input">Input</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="card_selection">Card Selection</option>
                  <option value="search">Search</option>
                </select>
              </div>
              
              <div>
                <label className="block text-base-content/70 mb-1">Importance:</label>
                <select 
                  value={data.question.metadata?.importance || 'normal'}
                  className="select select-xs select-bordered w-full"
                  onChange={(e) => {
                    const updatedCard = { ...currentEditingCard }
                    const questionIndex = updatedCard.questions.findIndex(q => q.id === data.question.id)
                    if (questionIndex !== -1) {
                      if (!updatedCard.questions[questionIndex].metadata) {
                        updatedCard.questions[questionIndex].metadata = {}
                      }
                      updatedCard.questions[questionIndex].metadata.importance = e.target.value
                      updateStoryCard(updatedCard)
                    }
                  }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <div className="text-xs text-base-content/50 flex justify-between items-center">
          <span>Answers: {data.question.answers?.length || 0}</span>
          <span className="font-mono">{data.question.id.slice(-8)}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-primary bg-base-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-primary bg-primary"
      />
    </div>
  )
}

export default EnhancedQuestionNode
