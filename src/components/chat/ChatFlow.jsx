import React from 'react'

const ChatFlow = ({ flow, onOptionSelect }) => {
  if (!flow || !flow.options || flow.options.length === 0) {
    return null
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        {flow.options.map((option, index) => {
          const isPrimary = option.isPrimary
          const isSecondary = option.isSecondary
          
          return (
            <button
              key={index}
              onClick={() => onOptionSelect(option)}
              className={`
                p-3 rounded-lg transition-colors text-sm font-medium shadow-sm
                ${isPrimary 
                  ? 'bg-[#FFD700] text-[#333333] hover:bg-[#FFED4E] border border-[#FFD700]' 
                  : isSecondary
                  ? 'bg-[#333333] text-white hover:bg-[#444444] border border-[#333333]'
                  : 'bg-[#FFD700] text-[#333333] hover:bg-[#FFED4E] border border-[#FFD700]'
                }
              `}
            >
              {option.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChatFlow
