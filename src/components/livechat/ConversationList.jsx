import React, { useState, useMemo } from 'react'
import { 
  MessageCircle, 
  Clock, 
  User, 
  AlertCircle, 
  Search,
  Filter,
  Bell,
  BellOff
} from 'lucide-react'

const ConversationList = ({ 
  conversations = [], 
  onSelectConversation, 
  selectedConversation,
  onToggleNotifications,
  notificationsEnabled = true
}) => {
  const [filters, setFilters] = useState({
    status: 'all', // all, active, waiting, closed
    search: '',
    priority: 'all'
  })

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(conv => conv.status === filters.status)
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(conv => conv.priority === filters.priority)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(conv =>
        conv.customerName.toLowerCase().includes(searchLower) ||
        conv.customerEmail.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by priority and last activity
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.lastActivity) - new Date(a.lastActivity)
    })

    return filtered
  }, [conversations, filters])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success border-success/30'
      case 'waiting':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'closed':
        return 'bg-base-300 text-base-content border-base-300'
      default:
        return 'bg-base-200 text-base-content border-base-300'
    }
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now - date) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getUnreadCount = () => {
    return conversations.filter(conv => conv.unreadCount > 0).length
  }

  const getWaitingCount = () => {
    return conversations.filter(conv => conv.status === 'waiting').length
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-base-content">Live Conversations</h2>
          
          <div className="flex items-center gap-2">
            {/* Notifications Toggle */}
            <button
              onClick={onToggleNotifications}
              className={`p-2 rounded-lg transition-colors ${
                notificationsEnabled 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300 text-base-content'
              }`}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-base-content/70">
              {conversations.filter(c => c.status === 'active').length} Active
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-base-content/70">
              {getWaitingCount()} Waiting
            </span>
          </div>
          {getUnreadCount() > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
              <span className="text-error font-medium">
                {getUnreadCount()} Unread
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 border-b border-base-300 bg-base-200/50">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="w-full pl-9 pr-3 py-2 text-sm rounded border border-base-300 bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-2 py-1 text-xs rounded border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="px-2 py-1 text-xs rounded border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/60 p-4">
            <MessageCircle size={48} className="mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations</h3>
            <p className="text-center text-sm">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                ? 'No conversations match your filters.'
                : 'No active conversations at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-primary/10 border border-primary/30 shadow-sm'
                    : 'bg-base-100 hover:bg-base-200 border border-transparent'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content text-sm font-medium">
                      {conversation.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-base-content truncate">
                          {conversation.customerName}
                        </h4>
                        {conversation.priority === 'urgent' && (
                          <AlertCircle size={12} className="text-error flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-base-content/60 truncate">
                        {conversation.customerEmail}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(conversation.status)}`}>
                      {conversation.status}
                    </span>
                    {conversation.priority !== 'medium' && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Message */}
                {conversation.lastMessage && (
                  <p className="text-sm text-base-content/80 mb-2 line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-base-content/60">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{formatTime(conversation.lastActivity)}</span>
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-error rounded-full"></div>
                      <span className="font-medium text-error">
                        {conversation.unreadCount} new
                      </span>
                    </div>
                  )}
                </div>

                {/* Wait Time for Waiting Conversations */}
                {conversation.status === 'waiting' && conversation.waitTime && (
                  <div className="mt-2 p-2 bg-warning/10 border border-warning/30 rounded text-xs">
                    <div className="flex items-center gap-1 text-warning">
                      <Clock size={10} />
                      <span>Waiting {conversation.waitTime}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
