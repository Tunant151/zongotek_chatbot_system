import React, { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTickets } from '@/context/TicketContext'
import AgentFilters from './AgentFilters'
import AgentCard from './AgentCard'
import { Plus, RefreshCw, AlertCircle, Users } from 'lucide-react'

const AgentList = ({ onSelectAgent, selectedAgent, onCreateAgent }) => {
  const { user } = useAuth()
  const { departments, tickets } = useTickets()
  
  // Get agents from users (filter by role)
  const agents = useMemo(() => {
    // In a real app, this would come from a separate agents API
    // For now, we'll simulate by filtering users and adding some mock data
    const mockAgents = [
      {
        id: "agent_001",
        username: "john.doe",
        name: "John Doe",
        email: "john.doe@zongotek.com",
        role: "agent",
        departmentId: "sales",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: "2024-01-15T09:15:00.000Z"
      },
      {
        id: "agent_002",
        username: "jane.smith",
        name: "Jane Smith",
        email: "jane.smith@zongotek.com",
        role: "agent",
        departmentId: "technical",
        status: "active",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: "2024-01-15T08:45:00.000Z"
      },
      {
        id: "agent_003",
        username: "mike.wilson",
        name: "Mike Wilson",
        email: "mike.wilson@zongotek.com",
        role: "agent",
        departmentId: "operations",
        status: "inactive",
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: "2024-01-14T16:20:00.000Z"
      },
      {
        id: "agent_004",
        username: "sarah.jones",
        name: "Sarah Jones",
        email: "sarah.jones@zongotek.com",
        role: "agent",
        departmentId: "technical",
        status: "busy",
        createdAt: "2024-01-05T00:00:00.000Z",
        lastLogin: "2024-01-15T10:30:00.000Z"
      },
      {
        id: "agent_005",
        username: "david.brown",
        name: "David Brown",
        email: "david.brown@zongotek.com",
        role: "agent",
        departmentId: "sales",
        status: "away",
        createdAt: "2024-01-10T00:00:00.000Z",
        lastLogin: "2024-01-15T07:20:00.000Z"
      }
    ]
    
    return mockAgents
  }, [])

  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    role: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Calculate ticket statistics for each agent
  const agentTicketStats = useMemo(() => {
    const stats = {}
    
    agents.forEach(agent => {
      const agentTickets = tickets.filter(ticket => ticket.agentId === agent.id)
      const activeTickets = agentTickets.filter(ticket => ticket.status === 'picked')
      const resolvedToday = agentTickets.filter(ticket => {
        if (!ticket.closedAt) return false
        const today = new Date().toDateString()
        return new Date(ticket.closedAt).toDateString() === today
      }).length

      // Mock average response time
      const avgResponseTime = Math.floor(Math.random() * 30) + 5

      stats[agent.id] = {
        totalTickets: agentTickets.length,
        activeTickets: activeTickets.length,
        resolvedToday,
        avgResponseTime
      }
    })
    
    return stats
  }, [agents, tickets])

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let filtered = [...agents]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(agent => agent.status === filters.status)
    }

    // Filter by department
    if (filters.department !== 'all') {
      filtered = filtered.filter(agent => agent.departmentId === filters.department)
    }

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(agent => agent.role === filters.role)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower) ||
        agent.username.toLowerCase().includes(searchLower)
      )
    }

    // Sort agents
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (filters.sortBy) {
        case 'lastLogin':
          aValue = new Date(a.lastLogin)
          bValue = new Date(b.lastLogin)
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'department':
          aValue = a.departmentId
          bValue = b.departmentId
          break
        case 'tickets':
          aValue = agentTicketStats[a.id]?.totalTickets || 0
          bValue = agentTicketStats[b.id]?.totalTickets || 0
          break
        case 'name':
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [agents, filters, agentTicketStats])

  // Calculate agent counts for filter tabs
  const agentCounts = useMemo(() => {
    return {
      all: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      busy: agents.filter(a => a.status === 'busy').length,
      away: agents.filter(a => a.status === 'away').length
    }
  }, [agents])

  // Get online agents count
  const onlineAgentsCount = agents.filter(a => a.status === 'active').length

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-base-content">Support Agents</h1>
          
          {/* Online Status */}
          <div className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-full border border-success/30">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">
              {onlineAgentsCount} online
            </span>
          </div>
          
          {/* Total Count */}
          <span className="text-sm text-base-content/60">
            {filteredAgents.length} of {agents.length} agents
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
            title="Refresh agents"
          >
            <RefreshCw size={16} />
          </button>
          
          {onCreateAgent && user?.role === 'admin' && (
            <button
              onClick={onCreateAgent}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors"
            >
              <Plus size={16} />
              Add Agent
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <AgentFilters 
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        agentCounts={agentCounts}
      />

      {/* Agent List */}
      <div className="flex-1 overflow-auto">
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-base-content/60">
            <Users size={48} className="mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents found</h3>
            <p className="text-center max-w-md">
              {filters.search || filters.status !== 'all' || filters.department !== 'all' || filters.role !== 'all'
                ? 'Try adjusting your filters to see more agents.'
                : 'No support agents have been added yet.'}
            </p>
            {onCreateAgent && user?.role === 'admin' && (
              <button
                onClick={onCreateAgent}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors"
              >
                <Plus size={16} />
                Add First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={onSelectAgent}
                onEdit={(agent) => onSelectAgent(agent)}
                onToggleStatus={(agent) => {
                  // TODO: Implement status toggle
                  console.log('Toggle status for:', agent.name)
                }}
                isSelected={selectedAgent?.id === agent.id}
                departments={departments}
                ticketStats={agentTicketStats}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-base-300 bg-base-200">
        <div className="flex justify-between text-xs text-base-content/60">
          <span>
            Showing {filteredAgents.length} agents
          </span>
          <span>
            {agentCounts.active} active • {agentCounts.busy} busy • {agentCounts.away} away
          </span>
        </div>
      </div>
    </div>
  )
}

export default AgentList
