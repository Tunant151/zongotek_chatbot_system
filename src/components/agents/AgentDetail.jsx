import React, { useState } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Building,
  Edit3,
  Save,
  XCircle,
  MessageSquare,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react'
import AgentStatusBadge from './AgentStatusBadge'
import { useTickets } from '@/context/TicketContext'

const AgentDetail = ({ 
  agent, 
  onClose, 
  departments = [],
  onUpdateAgent,
  onToggleStatus,
  currentUser
}) => {
  const { tickets } = useTickets()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: agent.name,
    email: agent.email,
    departmentId: agent.departmentId,
    role: agent.role
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getDepartmentInfo = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept || { name: 'Unknown', color: 'neutral' }
  }

  // Calculate agent statistics
  const agentStats = React.useMemo(() => {
    const agentTickets = tickets.filter(ticket => ticket.agentId === agent.id)
    const activeTickets = agentTickets.filter(ticket => ticket.status === 'picked')
    const resolvedToday = agentTickets.filter(ticket => {
      if (!ticket.closedAt) return false
      const today = new Date().toDateString()
      return new Date(ticket.closedAt).toDateString() === today
    }).length

    // Calculate average response time (mock data for now)
    const avgResponseTime = Math.floor(Math.random() * 30) + 5 // 5-35 minutes

    return {
      totalTickets: agentTickets.length,
      activeTickets: activeTickets.length,
      resolvedToday,
      avgResponseTime,
      totalResolved: agentTickets.filter(t => t.status === 'closed').length
    }
  }, [tickets, agent.id])

  const handleSaveEdit = async () => {
    try {
      const updatedAgent = {
        ...agent,
        ...editForm,
        updatedAt: new Date().toISOString()
      }
      
      await onUpdateAgent(updatedAgent)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedAgent = {
        ...agent,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }
      
      await onUpdateAgent(updatedAgent)
    } catch (error) {
      console.error('Error updating agent status:', error)
    }
  }

  const department = getDepartmentInfo(agent.departmentId)
  const canEdit = currentUser?.role === 'admin' || currentUser?.id === agent.id

  // Simulate online status
  const isOnline = agent.status === 'active' && Math.random() > 0.3

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold text-lg">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-base-content">
              {agent.name}
            </h2>
            <div className="flex items-center gap-2">
              <AgentStatusBadge status={agent.status} isOnline={isOnline} />
              <span className="text-sm text-base-content/60">
                {agent.role === 'admin' ? 'Administrator' : 'Support Agent'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
              title={isEditing ? 'Cancel editing' : 'Edit agent'}
            >
              {isEditing ? <XCircle size={16} /> : <Edit3 size={16} />}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Agent Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base-content">Agent Information</h3>
          
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-base-content mt-1">{agent.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-base-content mt-1">{agent.email}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              Department
            </label>
            {isEditing ? (
              <select
                value={editForm.departmentId}
                onChange={(e) => setEditForm({...editForm, departmentId: e.target.value})}
                className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            ) : (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${department.color}/20 text-${department.color} border border-${department.color}/30`}>
                  <Building size={12} className="mr-1" />
                  {department.name}
                </span>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              Role
            </label>
            {isEditing && currentUser?.role === 'admin' ? (
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="agent">Support Agent</option>
                <option value="admin">Administrator</option>
              </select>
            ) : (
              <p className="text-base-content mt-1">
                {agent.role === 'admin' ? 'Administrator' : 'Support Agent'}
              </p>
            )}
          </div>

          {/* Save/Cancel buttons when editing */}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1 bg-success text-success-content rounded text-sm hover:bg-success-focus transition-colors"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    name: agent.name,
                    email: agent.email,
                    departmentId: agent.departmentId,
                    role: agent.role
                  })
                }}
                className="px-3 py-1 bg-base-300 text-base-content rounded text-sm hover:bg-base-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Performance Statistics */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base-content">Performance Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-300">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-primary" />
                <span className="text-sm font-medium text-base-content">Total Tickets</span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {agentStats.totalTickets}
              </div>
            </div>
            
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-300">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-success" />
                <span className="text-sm font-medium text-base-content">Active Tickets</span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {agentStats.activeTickets}
              </div>
            </div>
            
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-300">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-warning" />
                <span className="text-sm font-medium text-base-content">Resolved Today</span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {agentStats.resolvedToday}
              </div>
            </div>
            
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-300">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-info" />
                <span className="text-sm font-medium text-base-content">Avg Response</span>
              </div>
              <div className="text-2xl font-bold text-base-content">
                {agentStats.avgResponseTime}m
              </div>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        {currentUser?.role === 'admin' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base-content">Status Control</h3>
            
            <div className="space-y-2">
              {agent.status === 'active' && (
                <>
                  <button
                    onClick={() => handleStatusChange('busy')}
                    className="w-full p-2 bg-warning text-warning-content rounded hover:bg-warning-focus transition-colors"
                  >
                    Mark as Busy
                  </button>
                  <button
                    onClick={() => handleStatusChange('away')}
                    className="w-full p-2 bg-error text-error-content rounded hover:bg-error-focus transition-colors"
                  >
                    Mark as Away
                  </button>
                  <button
                    onClick={() => handleStatusChange('inactive')}
                    className="w-full p-2 bg-base-300 text-base-content rounded hover:bg-base-400 transition-colors"
                  >
                    Deactivate Agent
                  </button>
                </>
              )}
              
              {agent.status === 'inactive' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="w-full p-2 bg-success text-success-content rounded hover:bg-success-focus transition-colors"
                >
                  Activate Agent
                </button>
              )}
              
              {(agent.status === 'busy' || agent.status === 'away') && (
                <>
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="w-full p-2 bg-success text-success-content rounded hover:bg-success-focus transition-colors"
                  >
                    Mark as Active
                  </button>
                  <button
                    onClick={() => handleStatusChange('inactive')}
                    className="w-full p-2 bg-base-300 text-base-content rounded hover:bg-base-400 transition-colors"
                  >
                    Deactivate Agent
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="space-y-2 text-xs text-base-content/60">
          <h3 className="font-semibold text-base-content text-sm">Account Information</h3>
          
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span>Joined: {formatDate(agent.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>Last login: {formatDate(agent.lastLogin)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User size={12} />
            <span>Username: {agent.username}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentDetail
