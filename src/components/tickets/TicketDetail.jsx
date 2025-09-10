import React, { useState } from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building,
  Edit3,
  Save,
  XCircle
} from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import AgentAssignment from './AgentAssignment'
import TicketChat from './TicketChat'
import { useTickets } from '@/context/TicketContext'

const TicketDetail = ({ 
  ticket, 
  onClose, 
  agents = [], 
  currentUser,
  onAssignAgent,
  onUnassignAgent,
  onPickUpTicket,
  onUpdateTicket 
}) => {
  const { departments } = useTickets()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    subject: ticket.subject,
    description: ticket.description,
    priority: ticket.priority,
    departmentId: ticket.departmentId
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getDepartmentInfo = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept || { name: 'Unknown', color: 'neutral' }
  }

  const handleSaveEdit = async () => {
    try {
      await onUpdateTicket({
        ...ticket,
        ...editForm,
        updatedAt: new Date().toISOString()
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    const updateData = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }

    if (newStatus === 'closed') {
      updateData.closedAt = new Date().toISOString()
    }

    await onUpdateTicket(updateData)
  }

  const department = getDepartmentInfo(ticket.departmentId)
  const canEdit = currentUser?.role === 'admin' || 
                  currentUser?.id === ticket.agentId ||
                  currentUser?.departmentId === ticket.departmentId

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-base-content">
            Ticket #{ticket.id.slice(-6).toUpperCase()}
          </h2>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
              title={isEditing ? 'Cancel editing' : 'Edit ticket'}
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

      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Ticket Info */}
        <div className="w-1/3 border-r border-base-300 overflow-auto">
          <div className="p-4 space-y-6">
            {/* Ticket Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Ticket Information</h3>
              
              {/* Subject */}
              <div>
                <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
                  Subject
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                    className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-base-content mt-1">{ticket.subject}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-base-content/80 mt-1">{ticket.description}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="w-full mt-1 p-2 border border-base-300 rounded bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <PriorityBadge priority={ticket.priority} />
                  </div>
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
                        subject: ticket.subject,
                        description: ticket.description,
                        priority: ticket.priority,
                        departmentId: ticket.departmentId
                      })
                    }}
                    className="px-3 py-1 bg-base-300 text-base-content rounded text-sm hover:bg-base-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base-content">Customer Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-base-content/60" />
                  <span className="text-base-content">{ticket.customerName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-base-content/60" />
                  <a 
                    href={`mailto:${ticket.customerEmail}`}
                    className="text-primary hover:underline"
                  >
                    {ticket.customerEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Agent Assignment */}
            <div>
              <h3 className="font-semibold text-base-content mb-3">Agent Assignment</h3>
              <AgentAssignment
                ticket={ticket}
                agents={agents}
                currentUser={currentUser}
                onAssignAgent={onAssignAgent}
                onUnassignAgent={onUnassignAgent}
                onPickUpTicket={onPickUpTicket}
              />
            </div>

            {/* Status Controls */}
            {canEdit && (
              <div className="space-y-3">
                <h3 className="font-semibold text-base-content">Status Control</h3>
                
                <div className="space-y-2">
                  {ticket.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange('picked')}
                      className="w-full p-2 bg-info text-info-content rounded hover:bg-info-focus transition-colors"
                    >
                      Mark as In Progress
                    </button>
                  )}
                  
                  {ticket.status === 'picked' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('resolved')}
                        className="w-full p-2 bg-success text-success-content rounded hover:bg-success-focus transition-colors"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => handleStatusChange('pending')}
                        className="w-full p-2 bg-warning text-warning-content rounded hover:bg-warning-focus transition-colors"
                      >
                        Return to Pending
                      </button>
                    </>
                  )}
                  
                  {ticket.status === 'resolved' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('closed')}
                        className="w-full p-2 bg-neutral text-neutral-content rounded hover:bg-neutral-focus transition-colors"
                      >
                        Close Ticket
                      </button>
                      <button
                        onClick={() => handleStatusChange('picked')}
                        className="w-full p-2 bg-warning text-warning-content rounded hover:bg-warning-focus transition-colors"
                      >
                        Reopen Ticket
                      </button>
                    </>
                  )}
                  
                  {ticket.status === 'closed' && currentUser?.role === 'admin' && (
                    <button
                      onClick={() => handleStatusChange('picked')}
                      className="w-full p-2 bg-warning text-warning-content rounded hover:bg-warning-focus transition-colors"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-2 text-xs text-base-content/60">
              <h3 className="font-semibold text-base-content text-sm">Timeline</h3>
              
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>Created: {formatDate(ticket.createdAt)}</span>
              </div>
              
              {ticket.pickedAt && (
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Picked up: {formatDate(ticket.pickedAt)}</span>
                </div>
              )}
              
              {ticket.closedAt && (
                <div className="flex items-center gap-2">
                  <XCircle size={12} />
                  <span>Closed: {formatDate(ticket.closedAt)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Clock size={12} />
                <span>Last updated: {formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col">
          <TicketChat 
            ticket={ticket}
            currentUser={currentUser}
            onUpdateTicket={onUpdateTicket}
          />
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
