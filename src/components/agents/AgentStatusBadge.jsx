import React from 'react'

const AgentStatusBadge = ({ status, isOnline = false }) => {
  const getStatusStyles = (status, isOnline) => {
    if (isOnline && status === 'active') {
      return 'bg-success/20 text-success border-success/30'
    }
    
    switch (status) {
      case 'active':
        return 'bg-info/20 text-info border-info/30'
      case 'inactive':
        return 'bg-base-300 text-base-content border-base-300'
      case 'busy':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'away':
        return 'bg-error/20 text-error border-error/30'
      default:
        return 'bg-base-200 text-base-content border-base-300'
    }
  }

  const getStatusIcon = (status, isOnline) => {
    if (isOnline && status === 'active') {
      return '🟢'
    }
    
    switch (status) {
      case 'active':
        return '🔵'
      case 'inactive':
        return '⚫'
      case 'busy':
        return '🟡'
      case 'away':
        return '🔴'
      default:
        return '❓'
    }
  }

  const getStatusText = (status, isOnline) => {
    if (isOnline && status === 'active') {
      return 'Online'
    }
    
    switch (status) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      case 'busy':
        return 'Busy'
      case 'away':
        return 'Away'
      default:
        return 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles(status, isOnline)}`}>
      <span>{getStatusIcon(status, isOnline)}</span>
      {getStatusText(status, isOnline)}
    </span>
  )
}

export default AgentStatusBadge
