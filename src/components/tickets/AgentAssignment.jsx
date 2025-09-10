import React, { useState } from 'react'
import { User, UserPlus, UserMinus, Clock } from 'lucide-react'

const AgentAssignment = ({ 
  ticket, 
  agents = [], 
  currentUser,
  onAssignAgent,
  onUnassignAgent,
  onPickUpTicket 
}) => {
  const [isAssigning, setIsAssigning] = useState(false)

  const getAvailableAgents = () => {
    // Filter agents by department and availability
    return agents.filter(agent => 
      agent.departmentId === ticket.departmentId && 
      agent.status === 'active'
    )
  }

  const getCurrentAgent = () => {
    if (!ticket.agentId) return null
    return agents.find(agent => agent.id === ticket.agentId)
  }

  const handleAssignAgent = async (agentId) => {
    setIsAssigning(true)
    try {
      await onAssignAgent(ticket.id, agentId)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassign = async () => {
    setIsAssigning(true)
    try {
      await onUnassignAgent(ticket.id)
    } finally {
      setIsAssigning(false)
    }
  }

  const handlePickUp = async () => {
    setIsAssigning(true)
    try {
      await onPickUpTicket(ticket.id, currentUser.id)
    } finally {
      setIsAssigning(false)
    }
  }

  const currentAgent = getCurrentAgent()
  const availableAgents = getAvailableAgents()
  const canPickUp = ticket.status === 'pending' && !ticket.agentId
  const canAssign = currentUser?.role === 'admin' || currentUser?.departmentId === ticket.departmentId
  const isAssignedToCurrentUser = ticket.agentId === currentUser?.id

  return (
    <div className="space-y-3">
      {/* Current Assignment Status */}
      <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-300">
        <div className="flex items-center gap-2">
          <User size={16} className="text-base-content/70" />
          <span className="text-sm font-medium text-base-content">
            Assignment Status:
          </span>
        </div>
        
        {currentAgent ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content text-sm font-medium">
                {currentAgent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-base-content">
                  {currentAgent.name}
                </div>
                <div className="text-xs text-base-content/60">
                  {currentAgent.email}
                </div>
              </div>
            </div>
            {canAssign && (
              <button
                onClick={handleUnassign}
                disabled={isAssigning}
                className="ml-2 p-1 text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                title="Unassign agent"
              >
                <UserMinus size={16} />
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-base-content/60">Unassigned</span>
        )}
      </div>

      {/* Pickup Button (for current user) */}
      {canPickUp && currentUser?.departmentId === ticket.departmentId && (
        <button
          onClick={handlePickUp}
          disabled={isAssigning}
          className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50"
        >
          <UserPlus size={16} />
          {isAssigning ? 'Picking up...' : 'Pick Up This Ticket'}
        </button>
      )}

      {/* Quick Actions for Assigned Agent */}
      {isAssignedToCurrentUser && (
        <div className="flex gap-2">
          <button
            onClick={() => onPickUpTicket(ticket.id, currentUser.id)}
            disabled={isAssigning || ticket.status !== 'pending'}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-success text-success-content rounded hover:bg-success-focus transition-colors disabled:opacity-50"
          >
            <Clock size={14} />
            Start Working
          </button>
        </div>
      )}

      {/* Agent Assignment Dropdown (for admins or department leads) */}
      {canAssign && availableAgents.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content">
            Assign to Agent:
          </label>
          <select
            onChange={(e) => e.target.value && handleAssignAgent(e.target.value)}
            disabled={isAssigning}
            className="w-full p-2 border border-base-300 rounded-lg bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            value=""
          >
            <option value="">Select an agent...</option>
            {availableAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
                {agent.currentTickets ? ` - ${agent.currentTickets} active tickets` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* No Available Agents Message */}
      {canAssign && availableAgents.length === 0 && !currentAgent && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-center gap-2 text-warning">
            <User size={16} />
            <span className="text-sm font-medium">No Available Agents</span>
          </div>
          <p className="text-xs text-warning/80 mt-1">
            No active agents found in the {ticket.departmentId} department.
          </p>
        </div>
      )}

      {/* Assignment History */}
      {ticket.pickedAt && (
        <div className="text-xs text-base-content/60 p-2 bg-base-200/50 rounded border-l-4 border-l-info/30">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} />
            <span className="font-medium">Assignment History</span>
          </div>
          <div>Picked up: {new Date(ticket.pickedAt).toLocaleString()}</div>
          {ticket.closedAt && (
            <div>Closed: {new Date(ticket.closedAt).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default AgentAssignment
