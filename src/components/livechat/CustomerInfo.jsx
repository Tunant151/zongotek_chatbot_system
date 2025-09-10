import React, { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MessageCircle, 
  Ticket,
  Clock,
  AlertTriangle,
  Star,
  History,
  ExternalLink
} from 'lucide-react'

const CustomerInfo = ({ 
  conversation, 
  customerHistory = [],
  onTransfer,
  onEscalate,
  onCreateTicket,
  currentUser
}) => {
  const [showHistory, setShowHistory] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error text-error-content'
      case 'high':
        return 'bg-error/20 text-error border-error/30'
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'low':
        return 'bg-success/20 text-success border-success/30'
      default:
        return 'bg-base-200 text-base-content'
    }
  }

  const getDepartmentColor = (departmentId) => {
    const colors = {
      sales: 'success',
      technical: 'warning',
      operations: 'info',
      security: 'error',
      admin: 'primary'
    }
    return colors[departmentId] || 'neutral'
  }

  if (!conversation) {
    return (
      <div className="w-80 bg-base-100 border-l border-base-300 flex items-center justify-center">
        <div className="text-center text-base-content/60">
          <User size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p>Select a conversation to view customer information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-base-100 border-l border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold text-lg">
            {conversation.customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-base-content">
              {conversation.customerName}
            </h3>
            <p className="text-sm text-base-content/70">
              {conversation.customerEmail}
            </p>
          </div>
        </div>

        {/* Priority Badge */}
        {conversation.priority !== 'medium' && (
          <div className="mb-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(conversation.priority)}`}>
              <AlertTriangle size={12} className="mr-1" />
              {conversation.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            conversation.status === 'active' ? 'bg-success animate-pulse' :
            conversation.status === 'waiting' ? 'bg-warning' :
            'bg-base-300'
          }`}></div>
          <span className="text-sm text-base-content/70 capitalize">
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-base-content">Contact Information</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-base-content/60" />
              <a 
                href={`mailto:${conversation.customerEmail}`}
                className="text-primary hover:underline"
              >
                {conversation.customerEmail}
              </a>
            </div>
            
            {conversation.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-base-content/60" />
                <a 
                  href={`tel:${conversation.customerPhone}`}
                  className="text-primary hover:underline"
                >
                  {conversation.customerPhone}
                </a>
              </div>
            )}
            
            {conversation.customerCompany && (
              <div className="flex items-center gap-2 text-sm">
                <Building size={14} className="text-base-content/60" />
                <span className="text-base-content">{conversation.customerCompany}</span>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-base-content">Conversation Details</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-base-content/60" />
              <span className="text-base-content/70">Started:</span>
              <span className="text-base-content">{formatDate(conversation.startedAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-base-content/60" />
              <span className="text-base-content/70">Duration:</span>
              <span className="text-base-content">{conversation.duration || '0m'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-base-content/60" />
              <span className="text-base-content/70">Messages:</span>
              <span className="text-base-content">{conversation.messageCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Department Assignment */}
        {conversation.departmentId && (
          <div className="space-y-3">
            <h4 className="font-medium text-base-content">Department</h4>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${getDepartmentColor(conversation.departmentId)}/20 text-${getDepartmentColor(conversation.departmentId)} border border-${getDepartmentColor(conversation.departmentId)}/30`}>
                <Building size={12} className="mr-1" />
                {conversation.departmentId.charAt(0).toUpperCase() + conversation.departmentId.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Customer History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-base-content">Customer History</h4>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-primary hover:underline"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
          
          {showHistory && (
            <div className="space-y-2 max-h-40 overflow-auto">
              {customerHistory.length === 0 ? (
                <p className="text-sm text-base-content/60">No previous interactions</p>
              ) : (
                customerHistory.map((history, index) => (
                  <div key={index} className="p-2 bg-base-200/50 rounded border-l-4 border-l-primary/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-base-content">
                        {history.type === 'chat' ? '💬 Chat' : '🎫 Ticket'}
                      </span>
                      <span className="text-xs text-base-content/60">
                        {formatDate(history.date)}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/80 line-clamp-2">
                      {history.description}
                    </p>
                    {history.status && (
                      <span className={`inline-block mt-1 px-1 py-0.5 text-xs rounded ${
                        history.status === 'resolved' ? 'bg-success/20 text-success' :
                        history.status === 'closed' ? 'bg-base-300 text-base-content' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {history.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-base-content">Quick Actions</h4>
          
          <div className="space-y-2">
            <button
              onClick={() => onTransfer(conversation)}
              className="w-full flex items-center gap-2 p-2 bg-info/20 text-info rounded hover:bg-info/30 transition-colors text-sm"
            >
              <ExternalLink size={14} />
              Transfer to Another Agent
            </button>
            
            <button
              onClick={() => onEscalate(conversation)}
              className="w-full flex items-center gap-2 p-2 bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors text-sm"
            >
              <AlertTriangle size={14} />
              Escalate to Supervisor
            </button>
            
            <button
              onClick={() => onCreateTicket(conversation)}
              className="w-full flex items-center gap-2 p-2 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors text-sm"
            >
              <Ticket size={14} />
              Create Support Ticket
            </button>
          </div>
        </div>

        {/* Customer Satisfaction */}
        {conversation.satisfactionRating && (
          <div className="space-y-3">
            <h4 className="font-medium text-base-content">Satisfaction Rating</h4>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < conversation.satisfactionRating
                      ? 'text-warning fill-warning'
                      : 'text-base-300'
                  }`}
                />
              ))}
              <span className="text-sm text-base-content/70 ml-2">
                {conversation.satisfactionRating}/5
              </span>
            </div>
            {conversation.satisfactionComment && (
              <p className="text-sm text-base-content/80 italic">
                "{conversation.satisfactionComment}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerInfo
