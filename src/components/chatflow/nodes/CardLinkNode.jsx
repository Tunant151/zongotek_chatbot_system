import React from 'react'
import { Handle, Position } from 'reactflow'
import { ExternalLink, Search, ArrowRight } from 'lucide-react'

const CardLinkNode = ({ data, isConnectable }) => {
  const getNodeContent = () => {
    if (data.isSearch) {
      return {
        icon: <Search size={16} />,
        title: 'Search Cards',
        subtitle: `Query: "${data.searchQuery}"`,
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-800'
      }
    } else {
      return {
        icon: <ExternalLink size={16} />,
        title: 'Navigate to Card',
        subtitle: data.targetCardName || 'Unknown Card',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-800'
      }
    }
  }

  const { icon, title, subtitle, bgColor, borderColor, textColor } = getNodeContent()

  return (
    <div className={`${bgColor} border-2 ${borderColor} ${textColor} rounded-lg shadow-lg min-w-[200px] max-w-[250px]`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-current/20">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {data.isSearch ? 'Search' : 'Card Link'}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-sm font-medium mb-1">{title}</div>
        <div className="text-xs opacity-75 truncate">{subtitle}</div>
        
        {data.targetCardId && (
          <div className="mt-2 text-xs font-mono opacity-50">
            ID: {data.targetCardId.slice(-8)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-1 text-xs opacity-75">
          <ArrowRight size={10} />
          <span>Cross-card navigation</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={`w-3 h-3 border-2 ${borderColor} bg-white`}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={`w-3 h-3 border-2 ${borderColor} ${bgColor}`}
      />
    </div>
  )
}

export default CardLinkNode
