import React from 'react'
import { format } from 'date-fns'
import { useTheme } from '@/context/ThemeContext'

const ChatBubble = ({ message }) => {
  const { text, type, timestamp } = message
  const isBot = type === 'bot'
  const { isDarkMode } = useTheme()
  
  // Format timestamp to show only time (e.g., 10:30 AM)
  const formattedTime = timestamp ? format(new Date(timestamp), 'h:mm a') : ''
  
  return (
    <div className={`flex mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-end max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        {isBot && (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFD700] mr-2 flex-shrink-0">
            <img
              src="./aibot.png"
              alt="Support Agent"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className={`${isBot ? '':'ml-2'}`}>
          <div className={`
            px-4 py-2 rounded-lg shadow-sm
            ${isBot 
              ? (isDarkMode ? 'bg-[#2D2D2D] text-white' : 'bg-amber-100 text-gray-800 border border-amber-200') + ' rounded-bl-none' 
              : 'bg-[#FFD700] text-black rounded-br-none'
            }
          `}>
            <p className="text-sm">{text}</p>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBubble
