import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Clock, 
  User,
  Phone,
  Video,
  Monitor,
  FileText,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'

const LiveChatInterface = ({ 
  conversation, 
  currentUser,
  onSendMessage,
  onCloseConversation,
  onTransfer,
  onEscalate,
  onCreateTicket
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newMessage.trim(),
      type: 'agent',
      timestamp: new Date().toISOString(),
      agentId: currentUser.id,
      agentName: currentUser.name
    }

    await onSendMessage(conversation.id, message)
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const quickReplies = [
    "Hello! How can I help you today?",
    "Thank you for contacting us. I'll be with you shortly.",
    "I understand your concern. Let me look into this for you.",
    "Could you please provide more details about the issue?",
    "I've escalated this to our technical team. You should hear back within 24 hours.",
    "Your issue has been resolved. Is there anything else I can help you with?",
    "Thank you for your patience. I'm working on your request.",
    "I'll need to transfer you to a specialist. Please hold on."
  ]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [newMessage])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-200/50">
        <div className="text-center text-base-content/60">
          <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p>Select a conversation from the list to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
              {conversation.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-base-content">
                {conversation.customerName}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  conversation.status === 'active' ? 'bg-success animate-pulse' :
                  conversation.status === 'waiting' ? 'bg-warning' :
                  'bg-base-300'
                }`}></div>
                <span className="text-sm text-base-content/70 capitalize">
                  {conversation.status}
                </span>
                {conversation.priority === 'urgent' && (
                  <span className="px-2 py-0.5 text-xs bg-error text-error-content rounded-full">
                    URGENT
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Typing indicator */}
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
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button 
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title="Phone call"
              >
                <Phone size={16} />
              </button>
              <button 
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title="Video call"
              >
                <Video size={16} />
              </button>
              <button 
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title="Screen share"
              >
                <Monitor size={16} />
              </button>
              <button 
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title="More options"
              >
                <MoreVertical size={16} />
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={() => onCloseConversation(conversation.id)}
                className="p-2 text-base-content/70 hover:text-base-content hover:bg-base-300 rounded-lg transition-colors"
                title="Close conversation"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {conversation.messages && conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/60">
            <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
              💬
            </div>
            <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
            <p className="text-center max-w-md">
              Send a message to begin helping {conversation.customerName} with their request.
            </p>
          </div>
        ) : (
          conversation.messages?.map((message, index) => (
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
                  : (conversation.customerName || 'C').charAt(0).toUpperCase()
                }
              </div>
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
            {quickReplies.slice(0, 4).map((reply, index) => (
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

        {/* Character count and shortcuts */}
        <div className="flex justify-between items-center mt-2 text-xs text-base-content/60">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{newMessage.length}/2000</span>
        </div>
      </div>
    </div>
  )
}

export default LiveChatInterface
