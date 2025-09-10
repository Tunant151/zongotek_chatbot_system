import React from 'react'

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'picked':
        return 'bg-info/20 text-info border-info/30'
      case 'resolved':
        return 'bg-success/20 text-success border-success/30'
      case 'closed':
        return 'bg-base-300 text-base-content border-base-300'
      default:
        return 'bg-base-200 text-base-content border-base-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'picked':
        return '🔄'
      case 'resolved':
        return '✅'
      case 'closed':
        return '🔒'
      default:
        return '❓'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'picked':
        return 'In Progress'
      case 'resolved':
        return 'Resolved'
      case 'closed':
        return 'Closed'
      default:
        return 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles(status)}`}>
      <span>{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </span>
  )
}

export default StatusBadge
