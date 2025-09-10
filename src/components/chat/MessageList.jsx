import React, { useRef, useEffect } from 'react'
import { User, Bot, Clock, AlertCircle } from 'lucide-react'
import ChatFlow from './ChatFlow'
import TransferLoading from './TransferLoading'

const MessageList = ({ messages, onFlowOption, isAgentMode, onCancelTransfer }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderMessage = (message) => {
    const isUser = message.type === 'user'
    const isBot = message.type === 'bot'
    const isSystem = message.type === 'system'
    const isTransferring = message.flow?.isTransferring

    return (
      <div
        key={message.id}
        className={`flex gap-3 p-3 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FFD700] text-[#333333] flex items-center justify-center">
            {isSystem ? (
              <AlertCircle size={16} />
            ) : (
              <span className="font-bold text-sm">W</span>
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
          {isTransferring ? (
            <TransferLoading onCancel={onCancelTransfer} />
          ) : (
            <div
              className={`
                p-3 rounded-lg text-sm
                ${isUser 
                  ? 'bg-[#FFD700] text-[#333333]' 
                  : isSystem
                  ? 'bg-[#FFA500] text-[#333333]'
                  : 'bg-[#404040] text-white'
                }
              `}
            >
              {/* Message text with line breaks */}
              <div className="whitespace-pre-wrap">{message.text}</div>
              
              {/* Time */}
              <div className={`text-xs mt-1 ${
                isUser ? 'text-[#333333]/70' : 'text-white/50'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          )}

          {/* Flow options for bot messages */}
          {isBot && message.flow && message.flow.options && !isTransferring && (
            <ChatFlow 
              flow={message.flow} 
              onOptionSelect={onFlowOption}
            />
          )}
        </div>

        {/* User avatar */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#333333] text-white flex items-center justify-center">
            <User size={16} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-base-content/50">
          <div className="text-center">
            <Bot size={48} className="mx-auto mb-2 opacity-50" />
            <p>Start a conversation</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

export default MessageList
