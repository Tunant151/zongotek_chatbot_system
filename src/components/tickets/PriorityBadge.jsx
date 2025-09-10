import React from 'react'

const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-success/20 text-success border-success/30'
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'high':
        return 'bg-error/20 text-error border-error/30'
      case 'urgent':
        return 'bg-error text-error-content border-error'
      default:
        return 'bg-base-200 text-base-content border-base-300'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low':
        return '🔽'
      case 'medium':
        return '➖'
      case 'high':
        return '🔺'
      case 'urgent':
        return '🚨'
      default:
        return '❓'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low':
        return 'Low'
      case 'medium':
        return 'Medium'
      case 'high':
        return 'High'
      case 'urgent':
        return 'Urgent'
      default:
        return 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityStyles(priority)}`}>
      <span>{getPriorityIcon(priority)}</span>
      {getPriorityText(priority)}
    </span>
  )
}

export default PriorityBadge
