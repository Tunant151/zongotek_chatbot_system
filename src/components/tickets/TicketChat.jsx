import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Clock } from 'lucide-react'

const TicketChat = ({ ticket, currentUser, onUpdateTicket }) => {
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [ticket.messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newMessage.trim(),
      type: 'agent',
      timestamp: new Date().toISOString(),
      agentId: currentUser.id,
      agentName: currentUser.name
    }

    const updatedTicket = {
      ...ticket,
      messages: [...ticket.messages, message],
      updatedAt: new Date().toISOString()
    }

    await onUpdateTicket(updatedTicket)
    setNewMessage('')
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const groupMessagesByDate = (messages) => {
    const groups = []
    let currentGroup = null
    
    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString()
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        }
        groups.push(currentGroup)
      } else {
        currentGroup.messages.push(message)
      }
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(ticket.messages || [])

  const quickReplies = [
    "Thank you for contacting us. I'll help you with this issue.",
    "I understand your concern. Let me look into this for you.",
    "Could you please provide more details about the issue?",
    "I've escalated this to our technical team. You should hear back within 24 hours.",
    "Your issue has been resolved. Please let me know if you need any further assistance.",
    "Thank you for your patience. Is there anything else I can help you with?"
  ]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [newMessage])

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base-content">
              Conversation with {ticket.customerName}
            </h3>
            <p className="text-sm text-base-content/60">
              {ticket.messages?.length || 0} messages
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isTyping && (
              <div className="flex items-center gap-1 text-sm text-base-content/60">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-base-content/60 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-base-content/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-base-content/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Customer is typing...</span>
              </div>
            )}
            
            <button className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/60">
            <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
              💬
            </div>
            <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
            <p className="text-center max-w-md">
              Send a message to begin helping {ticket.customerName} with their request.
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-base-300 text-base-content/60 text-xs rounded-full">
                  {new Date(group.date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Messages in this group */}
              {group.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.type === 'agent' ? 'order-2' : 'order-1'}`}>
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.type === 'agent'
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200 text-base-content'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    
                    {/* Message info */}
                    <div className={`mt-1 flex items-center gap-1 text-xs text-base-content/60 ${
                      message.type === 'agent' ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock size={10} />
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {message.type === 'agent' && message.agentName && (
                        <span>• {message.agentName}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    message.type === 'agent' 
                      ? 'bg-primary text-primary-content order-1 mr-2' 
                      : 'bg-base-300 text-base-content order-2 ml-2'
                  }`}>
                    {message.type === 'agent' 
                      ? (message.agentName || currentUser.name || 'A').charAt(0).toUpperCase()
                      : (ticket.customerName || 'C').charAt(0).toUpperCase()
                    }
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="p-3 border-t border-base-300 bg-base-200/50">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-base-content/60 mr-2">Quick replies:</span>
            {quickReplies.slice(0, 3).map((reply, index) => (
              <button
                key={index}
                onClick={() => setNewMessage(reply)}
                className="px-2 py-1 text-xs bg-base-300 text-base-content rounded hover:bg-base-400 transition-colors"
              >
                {reply.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-base-300 bg-base-100">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors">
            <Paperclip size={16} />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 text-base-content placeholder-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Emoji button */}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-2 p-1 text-base-content/70 hover:text-base-content rounded transition-colors"
            >
              <Smile size={16} />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-base-content/60">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{newMessage.length}/2000</span>
        </div>
      </div>
    </div>
  )
}

export default TicketChat
