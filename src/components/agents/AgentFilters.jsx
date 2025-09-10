import React from 'react'
import { Search, Filter, Users, Activity, Building } from 'lucide-react'

const AgentFilters = ({ 
  filters, 
  onFilterChange, 
  departments = [],
  agentCounts = {}
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Agents', count: agentCounts.all || 0 },
    { value: 'active', label: 'Active', count: agentCounts.active || 0 },
    { value: 'inactive', label: 'Inactive', count: agentCounts.inactive || 0 },
    { value: 'busy', label: 'Busy', count: agentCounts.busy || 0 },
    { value: 'away', label: 'Away', count: agentCounts.away || 0 }
  ]

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Administrators' },
    { value: 'agent', label: 'Support Agents' }
  ]

  return (
    <div className="p-4 bg-base-200 border-b border-base-300">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search agents by name, email, or username..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange({ ...filters, status: option.value })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.status === option.value
                ? 'bg-primary text-primary-content'
                : 'bg-base-100 text-base-content hover:bg-base-300'
            }`}
          >
            {option.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              filters.status === option.value
                ? 'bg-primary-content/20 text-primary-content'
                : 'bg-base-300 text-base-content'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Building size={16} className="text-base-content/70" />
          <select
            value={filters.department || 'all'}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className="px-3 py-1 rounded border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Users size={16} className="text-base-content/70" />
          <select
            value={filters.role || 'all'}
            onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
            className="px-3 py-1 rounded border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-base-content/70" />
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            className="px-3 py-1 rounded border border-base-300 bg-base-100 text-base-content text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="name">Sort by Name</option>
            <option value="lastLogin">Sort by Last Login</option>
            <option value="createdAt">Sort by Join Date</option>
            <option value="department">Sort by Department</option>
            <option value="tickets">Sort by Ticket Count</option>
          </select>
        </div>

        {/* Sort Direction */}
        <button
          onClick={() => onFilterChange({ 
            ...filters, 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          className="px-3 py-1 rounded border border-base-300 bg-base-100 text-base-content text-sm hover:bg-base-300 transition-colors"
        >
          {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>
    </div>
  )
}

export default AgentFilters
