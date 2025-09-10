import React from 'react'
import { Send, Smile, Plus } from 'lucide-react'

const MessageInput = ({ 
  value, 
  onChange, 
  onKeyPress, 
  onSend, 
  isTyping, 
  disabled, 
  placeholder 
}) => {
  return (
    <div className="flex items-center gap-2 bg-[#404040] border border-[#404040] rounded-full px-4 py-3">
      {/* Text Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          style={{ minHeight: '24px' }}
        />
        
        {/* Typing indicator */}
        {isTyping && !disabled && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Emoji Button */}
        <button
          className="p-1.5 rounded-full hover:bg-[#505050] transition-colors text-white hover:text-white"
          title="Add emoji"
          disabled={disabled}
        >
          <Smile size={18} />
        </button>
        
        {/* Attachment Button */}
        <button
          className="p-1.5 rounded-full hover:bg-[#505050] transition-colors text-white hover:text-white"
          title="Add attachment"
          disabled={disabled}
        >
          <Plus size={18} />
        </button>
        
        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
            value.trim() && !disabled
              ? 'bg-[#FFD700] text-[#333333] hover:bg-[#FFED4E]'
              : 'bg-[#505050] text-gray-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default MessageInput
