import React from 'react'
import { 
  User, 
  Mail, 
  Building, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  MoreVertical,
  Edit,
  UserCheck,
  UserX
} from 'lucide-react'
import AgentStatusBadge from './AgentStatusBadge'

const AgentCard = ({ 
  agent, 
  onSelect, 
  onEdit, 
  onToggleStatus,
  isSelected = false,
  departments = [],
  ticketStats = {}
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getDepartmentInfo = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept || { name: 'Unknown', color: 'neutral' }
  }

  const department = getDepartmentInfo(agent.departmentId)
  const stats = ticketStats[agent.id] || {
    totalTickets: 0,
    activeTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0
  }

  // Simulate online status (in real app, this would come from WebSocket or real-time data)
  const isOnline = agent.status === 'active' && Math.random() > 0.3

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-base-300 bg-base-100 hover:border-base-400'
      }`}
      onClick={() => onSelect(agent)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base-content truncate">
              {agent.name}
            </h3>
            <p className="text-sm text-base-content/70 truncate">
              {agent.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <AgentStatusBadge status={agent.status} isOnline={isOnline} />
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Show dropdown menu
              }}
              className="p-1 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Department */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${department.color}/20 text-${department.color} border border-${department.color}/30`}>
          <Building size={12} className="mr-1" />
          {department.name}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-base-200/50 rounded">
          <div className="text-lg font-semibold text-base-content">
            {stats.activeTickets}
          </div>
          <div className="text-xs text-base-content/60">
            Active Tickets
          </div>
        </div>
        
        <div className="text-center p-2 bg-base-200/50 rounded">
          <div className="text-lg font-semibold text-base-content">
            {stats.resolvedToday}
          </div>
          <div className="text-xs text-base-content/60">
            Resolved Today
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-content/70">Total Tickets</span>
          <span className="font-medium text-base-content">{stats.totalTickets}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-content/70">Avg Response</span>
          <span className="font-medium text-base-content">
            {stats.avgResponseTime > 0 ? `${stats.avgResponseTime}m` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center gap-2 text-xs text-base-content/60 pt-2 border-t border-base-300">
        <Clock size={12} />
        <span>Last active: {formatDate(agent.lastLogin)}</span>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3 pt-2 border-t border-base-300">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(agent)
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-base-300 text-base-content rounded hover:bg-base-400 transition-colors"
        >
          <Edit size={12} />
          Edit
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleStatus(agent)
          }}
          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            agent.status === 'active'
              ? 'bg-error/20 text-error hover:bg-error/30'
              : 'bg-success/20 text-success hover:bg-success/30'
          }`}
        >
          {agent.status === 'active' ? (
            <>
              <UserX size={12} />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck size={12} />
              Activate
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AgentCard
