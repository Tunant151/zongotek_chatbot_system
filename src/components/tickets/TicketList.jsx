import React, { useState, useMemo } from 'react'
import { useTickets } from '@/context/TicketContext'
import TicketFilters from './TicketFilters'
import TicketCard from './TicketCard'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'

const TicketList = ({ onSelectTicket, selectedTicket, onCreateTicket }) => {
  const { 
    tickets, 
    departments, 
    isLoading,
    getTicketsByStatus,
    getTicketsByDepartment 
  } = useTickets()

  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status)
    }

    // Filter by department
    if (filters.department !== 'all') {
      filtered = filtered.filter(ticket => ticket.departmentId === filters.department)
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.customerName.toLowerCase().includes(searchLower) ||
        ticket.customerEmail.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort tickets
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority] || 0
          bValue = priorityOrder[b.priority] || 0
          break
        case 'customerName':
          aValue = a.customerName.toLowerCase()
          bValue = b.customerName.toLowerCase()
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [tickets, filters])

  // Calculate ticket counts for filter tabs
  const ticketCounts = useMemo(() => {
    return {
      all: tickets.length,
      pending: getTicketsByStatus('pending').length,
      picked: getTicketsByStatus('picked').length,
      resolved: getTicketsByStatus('resolved').length,
      closed: getTicketsByStatus('closed').length
    }
  }, [tickets, getTicketsByStatus])

  // Get urgent tickets count
  const urgentTicketsCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-base-content/60">
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading tickets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-base-content">Support Tickets</h1>
          
          {/* Urgent Alerts */}
          {urgentTicketsCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-error/20 text-error rounded-full border border-error/30">
              <AlertCircle size={14} />
              <span className="text-xs font-medium">
                {urgentTicketsCount} urgent
              </span>
            </div>
          )}
          
          {/* Total Count */}
          <span className="text-sm text-base-content/60">
            {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw size={16} />
          </button>
          
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors"
            >
              <Plus size={16} />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <TicketFilters 
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        ticketCounts={ticketCounts}
      />

      {/* Ticket List */}
      <div className="flex-1 overflow-auto">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-base-content/60">
            <AlertCircle size={48} className="mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-center max-w-md">
              {filters.search || filters.status !== 'all' || filters.department !== 'all' || filters.priority !== 'all'
                ? 'Try adjusting your filters to see more tickets.'
                : 'No support tickets have been created yet.'}
            </p>
            {onCreateTicket && (
              <button
                onClick={onCreateTicket}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors"
              >
                <Plus size={16} />
                Create First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={onSelectTicket}
                isSelected={selectedTicket?.id === ticket.id}
                departments={departments}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-base-300 bg-base-200">
        <div className="flex justify-between text-xs text-base-content/60">
          <span>
            Showing {filteredTickets.length} tickets
          </span>
          <span>
            {ticketCounts.pending} pending • {ticketCounts.picked} in progress • {ticketCounts.closed} closed
          </span>
        </div>
      </div>
    </div>
  )
}

export default TicketList
