import React from 'react'
import { Clock, User, Mail, MessageCircle, Calendar } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const TicketCard = ({ ticket, onSelect, isSelected = false, departments = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A'
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getDepartmentInfo = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept || { name: 'Unknown', color: 'neutral' }
  }

  const department = getDepartmentInfo(ticket.departmentId)
  const messageCount = ticket.messages ? ticket.messages.length : 0
  const lastMessage = ticket.messages && ticket.messages.length > 0 
    ? ticket.messages[ticket.messages.length - 1] 
    : null

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-base-300 bg-base-100 hover:border-base-400'
      }`}
      onClick={() => onSelect(ticket)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base-content truncate">
            {ticket.subject}
          </h3>
          <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
            {ticket.description}
          </p>
        </div>
        <div className="flex flex-col gap-1 ml-3">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-3 mb-3 text-sm text-base-content/70">
        <div className="flex items-center gap-1">
          <User size={14} />
          <span className="truncate max-w-[120px]">{ticket.customerName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Mail size={14} />
          <span className="truncate max-w-[150px]">{ticket.customerEmail}</span>
        </div>
      </div>

      {/* Department */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${department.color}/20 text-${department.color} border border-${department.color}/30`}>
          {department.name}
        </span>
      </div>

      {/* Last Message Preview */}
      {lastMessage && (
        <div className="mb-3 p-2 bg-base-200/50 rounded border-l-4 border-l-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-base-content/60">
              {lastMessage.type === 'customer' ? '👤 Customer' : '🎧 Agent'}
            </span>
            <span className="text-xs text-base-content/50">
              {getTimeAgo(lastMessage.timestamp)}
            </span>
          </div>
          <p className="text-sm text-base-content/80 line-clamp-2">
            {lastMessage.text}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-base-content/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageCircle size={12} />
            <span>{messageCount} messages</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Created {getTimeAgo(ticket.createdAt)}</span>
          </div>
        </div>
        
        {ticket.agentId && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Assigned</span>
          </div>
        )}
      </div>

      {/* Urgency Indicator */}
      {ticket.priority === 'urgent' && (
        <div className="mt-2 flex items-center gap-1 text-error text-xs font-medium">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          Urgent - Requires immediate attention
        </div>
      )}
    </div>
  )
}

export default TicketCard
