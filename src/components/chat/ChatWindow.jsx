import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Download, Clock, Users, Trash2 } from 'lucide-react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatFlow from './ChatFlow'

const ChatWindow = ({ 
  messages, 
  onSendMessage, 
  onClose, 
  onFlowOption,
  onClearChat,
  onCancelTransfer,
  isAgentMode,
  queuePosition,
  width = 320,
  height = 384
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const isMobile = window.innerWidth <= 768

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  const handleDownloadChat = () => {
    const chatText = messages.map(msg => 
      `${msg.type === 'user' ? 'You' : 'Bot'}: ${msg.text}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      onClearChat()
    }
  }

  return (
    <div 
      className={`
        bg-[#262626] border border-[#404040] rounded-lg shadow-xl
        ${isMobile ? 'fixed inset-4' : ''}
        flex flex-col
        overflow-hidden
        w-full h-full
      `}
      style={{
        width: isMobile ? 'auto' : `${width}px`,
        height: isMobile ? 'auto' : `${height}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#262626] text-white">
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-[#333333] rounded transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button className="p-1 hover:bg-[#333333] rounded transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center">
              <span className="text-[#333333] font-bold text-sm">W</span>
            </div>
            <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
            <span className="font-semibold">Whitney Ai</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Minimize button */}
          <button
            className="p-1 hover:bg-[#333333] rounded transition-colors"
            title="Minimize"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded transition-colors"
            title="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          messages={messages} 
          onFlowOption={onFlowOption}
          isAgentMode={isAgentMode}
          onCancelTransfer={onCancelTransfer}
        />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#404040]">
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSend={handleSendMessage}
          isTyping={isTyping}
          disabled={isAgentMode}
          placeholder={isAgentMode ? "Waiting for agent..." : "Write a message..."}
        />
        
        {/* Powered by LiveChat footer */}
        <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
          <span className="mr-1">Powered by</span>
          <div className="w-4 h-4 bg-[#FF6B35] rounded flex items-center justify-center mr-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span>LiveChat</span>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
