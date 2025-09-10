import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@/context/ChatContext'
import { useTickets } from '@/context/TicketContext'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'
import { useTheme } from '@/context/ThemeContext'
import ChatBubble from './ChatBubble'
import { MessageCircle, X, Minimize2, Send, ArrowUp, Phone } from 'lucide-react'
import { ACTION_TYPES } from '@/data/enhancedChatFlowModel'

const EnhancedZongotekChatWidget = () => {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    clearChat
  } = useChat()
  
  const { isDarkMode } = useTheme()
  
  const { 
    runtimeFlows, 
    conversationContext, 
    updateConversationContext,
    navigateToCard,
    navigateToQuestion,
    searchAndNavigate,
    goToPrevious,
    getCurrentFlow,
    processAction,
    chatBotSystem
  } = useEnhancedChatFlow()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addTicket } = useTickets()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  
  // Initialize enhanced chat system
  useEffect(() => {
    const initializeChat = async () => {
      if (messages.length === 0 && !isInitialized && chatBotSystem && conversationContext) {
        setIsInitialized(true)
        
        try {
          // Get the current flow from the conversation context
          const currentFlow = getCurrentFlow()
          
          if (currentFlow) {
            // Add welcome message with typing effect
            setIsTyping(true)
            setTimeout(() => {
              addMessage({
                id: `msg_${Date.now()}`,
                text: currentFlow.message,
                type: 'bot',
                timestamp: new Date().toISOString(),
                flow: currentFlow,
                cardId: currentFlow.cardId
              })
              setIsTyping(false)
            }, 1000)
          } else {
            // Fallback welcome message
            setIsTyping(true)
            setTimeout(() => {
              addMessage({
                id: `msg_${Date.now()}`,
                text: "👋 Hi there! Welcome to Zongotek. I'm your virtual assistant. How can I help you today?",
                type: 'bot',
                timestamp: new Date().toISOString()
              })
              setIsTyping(false)
            }, 1000)
          }
        } catch (error) {
          console.error('Error initializing enhanced chat:', error)
          // Fallback welcome message
          setIsTyping(true)
          setTimeout(() => {
            addMessage({
              id: `msg_${Date.now()}`,
              text: "👋 Hi there! Welcome to Zongotek. I'm your virtual assistant. How can I help you today?",
              type: 'bot',
              timestamp: new Date().toISOString()
            })
            setIsTyping(false)
          }, 1000)
        }
      }
    }
    
    initializeChat()
  }, [messages.length, isInitialized, addMessage, chatBotSystem, conversationContext, getCurrentFlow])

  // Update loading state based on system initialization
  useEffect(() => {
    if (chatBotSystem && conversationContext) {
      setIsLoading(false)
    }
  }, [chatBotSystem, conversationContext])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!userInput.trim()) return

    // Add user message
    addMessage({
      id: `msg_${Date.now()}`,
      text: userInput,
      type: 'user',
      timestamp: new Date().toISOString()
    })

    // Clear input
    setUserInput('')

    // Simulate bot typing
    setIsTyping(true)

    // Process the message and get response
    setTimeout(() => {
      processUserMessage(userInput)
      setIsTyping(false)
    }, 1000)
  }

  const processUserMessage = async (text) => {
    const currentFlow = getCurrentFlow()
    
    // If we have a current flow with options, check if the message matches any option
    if (currentFlow?.options) {
      const matchedOption = currentFlow.options.find(
        option => option.text.toLowerCase() === text.toLowerCase() || 
                 option.value?.toLowerCase() === text.toLowerCase()
      )

      if (matchedOption) {
        await handleOptionClick(matchedOption)
        return
      }
    }

    // Try to search for relevant cards based on the user message
    const foundCard = await searchAndNavigate(text)
    
    if (foundCard) {
      const newFlow = getCurrentFlow()
      if (newFlow) {
        addMessage({
          id: `msg_${Date.now()}`,
          text: newFlow.message,
          type: 'bot',
          timestamp: new Date().toISOString(),
          flow: newFlow,
          cardId: newFlow.cardId
        })
        return
      }
    }

    // If no match found, provide a fallback response
    const fallbackResponses = [
      "I'm sorry, I didn't understand that. Could you please rephrase?",
      "I'm not sure I follow. Can you try asking in a different way?",
      "Let me help you find what you're looking for. Could you be more specific?",
      "I apologize, but I'm having trouble understanding your request. Try using the buttons below for better assistance."
    ]
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    
    addMessage({
      id: `msg_${Date.now()}`,
      text: randomResponse,
      type: 'bot',
      timestamp: new Date().toISOString()
    })

    // Show current flow options if available
    setTimeout(() => {
      const currentFlow = getCurrentFlow()
      if (currentFlow && currentFlow.options.length > 0) {
        addMessage({
          id: `msg_${Date.now()}`,
          text: "Here are some options that might help:",
          type: 'bot',
          timestamp: new Date().toISOString(),
          flow: currentFlow,
          cardId: currentFlow.cardId
        })
      }
    }, 1000)
  }

  const handleOptionClick = async (option) => {
    // Add user message showing their selection
    addMessage({
      id: `msg_${Date.now()}`,
      text: option.text,
      type: 'user',
      timestamp: new Date().toISOString()
    })

    // Show typing indicator
    setIsTyping(true)

    setTimeout(async () => {
      try {
        // Process each action in the option
        if (option.actions && option.actions.length > 0) {
          for (const action of option.actions) {
            const result = await processAction(action)
            
            if (result) {
              switch (result.type) {
                case 'card_navigation': {
                  // Navigate to the target card
                  navigateToCard(result.targetCardId, result.targetQuestionId)
                  
                  // Get the new flow and add its message
                  const newFlow = getCurrentFlow()
                  if (newFlow) {
                    addMessage({
                      id: `msg_${Date.now()}`,
                      text: newFlow.message,
                      type: 'bot',
                      timestamp: new Date().toISOString(),
                      flow: newFlow,
                      cardId: newFlow.cardId
                    })
                  }
                  break
                }
                
                case 'search_no_results': {
                  addMessage({
                    id: `msg_${Date.now()}`,
                    text: `I couldn't find specific information about "${result.query}". Let me connect you with a specialist who can help.`,
                    type: 'bot',
                    timestamp: new Date().toISOString()
                  })
                  
                  // Auto-transfer to agent
                  setTimeout(() => {
                    handleTransferToAgent('operations')
                  }, 1000)
                  break
                }
                
                case 'no_previous_card': {
                  addMessage({
                    id: `msg_${Date.now()}`,
                    text: "You're already at the beginning of our conversation. How can I help you?",
                    type: 'bot',
                    timestamp: new Date().toISOString()
                  })
                  break
                }
                
                default: {
                  // Handle traditional action types
                  await handleTraditionalAction(action, option)
                }
              }
            } else {
              // Handle traditional actions directly
              await handleTraditionalAction(action, option)
            }
          }
        } else {
          // Fallback: treat as simple message
          addMessage({
            id: `msg_${Date.now()}`,
            text: option.message || "Thank you for your response.",
            type: 'bot',
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error handling option click:', error)
        addMessage({
          id: `msg_${Date.now()}`,
          text: "I'm sorry, something went wrong. Please try again.",
          type: 'bot',
          timestamp: new Date().toISOString()
        })
      }
      
      setIsTyping(false)
    }, 1000)
  }

  const handleTraditionalAction = async (action, option) => {
    switch (action.type) {
      case ACTION_TYPES.NAVIGATE_TO_QUESTION: {
        navigateToQuestion(action.payload.questionId)
        const newFlow = getCurrentFlow()
        if (newFlow) {
          addMessage({
            id: `msg_${Date.now()}`,
            text: newFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: newFlow,
            cardId: newFlow.cardId
          })
        }
        break
      }
      
      case ACTION_TYPES.TRANSFER_TO_AGENT: {
        const department = action.payload.department || 'operations'
        const message = action.payload.message || `I'll connect you with our ${department} team right away.`
        
        addMessage({
          id: `msg_${Date.now()}`,
          text: message,
          type: 'bot',
          timestamp: new Date().toISOString()
        })
        
        setTimeout(() => {
          handleTransferToAgent(department)
        }, 1000)
        break
      }
      
      case ACTION_TYPES.REDIRECT_TO_URL: {
        addMessage({
          id: `msg_${Date.now()}`,
          text: `I'm redirecting you to: ${action.payload.url}`,
          type: 'bot',
          timestamp: new Date().toISOString()
        })
        
        setTimeout(() => {
          window.open(action.payload.url, '_blank')
        }, 1000)
        break
      }
      
      case ACTION_TYPES.SEND_MESSAGE:
      default: {
        const responseMessage = action.payload.message || option.message || "Thank you for your response."
        addMessage({
          id: `msg_${Date.now()}`,
          text: responseMessage,
          type: 'bot',
          timestamp: new Date().toISOString()
        })
        break
      }
    }
  }

  const handleTransferToAgent = (department = 'operations') => {
    // Create a support ticket
    const ticket = addTicket({
      title: 'Chat Transfer Request',
      description: 'User requested to speak with an agent',
      priority: 'medium',
      departmentId: department,
      status: 'pending',
      customerId: conversationContext?.userId || 'anonymous',
      messages: messages.map(msg => ({
        text: msg.text,
        type: msg.type,
        timestamp: msg.timestamp
      }))
    })

    addMessage({
      id: `msg_${Date.now()}`,
      text: `Perfect! I've created ticket #${ticket.id.slice(-8)} for you. One of our ${department} specialists will be with you shortly. Your estimated wait time is 2-3 minutes.`,
      type: 'bot',
      timestamp: new Date().toISOString()
    })

    // Update conversation context
    updateConversationContext({
      action: 'transfer_to_agent',
      ticketId: ticket.id,
      department: department
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  // Handle welcome screen actions
  const handleChatNow = () => {
    setShowWelcome(false)
    setIsExpanded(true)
  }

  const handleJustBrowsing = () => {
    setIsOpen(false)
    setShowWelcome(true)
  }

  const handleCallUs = () => {
    // Implement call functionality or redirect
    window.open('tel:+1234567890', '_self')
  }

  const handleShowMore = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle hover loading animation
  const handleMouseEnter = () => {
    setIsLoading(true)
    
    // Start 5-second timer
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
      setIsLoading(false)
    }, 5000)
  }

  const handleMouseLeave = () => {
    setIsLoading(false)
    
    // Clear timeout if user stops hovering
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // CSS for loader animation
  const loaderStyles = `
    .loader {
      width: 50px;
      aspect-ratio: 2;
      --_g: no-repeat radial-gradient(circle closest-side, #ffffff 90%, #0000);
      background: 
        var(--_g) 0%   50%,
        var(--_g) 50%  50%,
        var(--_g) 100% 50%;
      background-size: calc(100%/3) 50%;
      animation: l3 1s infinite linear;
    }
    @keyframes l3 {
      20% { background-position: 0%   0%, 50%  50%, 100%  50%; }
      40% { background-position: 0% 100%, 50%   0%, 100%  50%; }
      60% { background-position: 0%  50%, 50% 100%, 100%   0%; }
      80% { background-position: 0%  50%, 50%  50%, 100% 100%; }
    }
  `

  // Toggle button (hand wave emoji)
  if (!isOpen) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
        <div className="fixed right-6 bottom-6 z-50">
          <div className="relative">
            {/* Loading overlay */}
              {isLoading && (
                <div className="flex absolute inset-0 z-10 justify-center items-center bg-red-500 rounded-full -top-15">
                  <div className="z-10 loader"></div>
                </div>
              )}
            <button
              onClick={() => setIsOpen(true)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="bg-[#FFD700] hover:bg-[#FFC700] transition-all overflow-hidden duration-300 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 relative"
              aria-label="Open chat"
            >
              <img src="/aibot.png" alt="AI Assistant" className="w-full h-full" />
              
              
            </button>
          </div>
        </div>
      </>
    )
  }

  // Welcome screen
  if (showWelcome && !isExpanded) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
        <div className="fixed right-6 bottom-6 z-50">
        {/* AI Toggle Button */}
        <div className="absolute right-0 bottom-0">
          <div className="relative">
            <button
              onClick={() => setIsOpen(true)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="bg-[#FFD700] hover:bg-[#FFC700] transition-all overflow-hidden duration-300 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 relative"
              aria-label="Open chat"
            >
              <img src="/aibot.png" alt="AI Assistant" className="w-full h-full" />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="flex absolute inset-0 justify-center items-center rounded-full bg-black/20">
                  <div className="loader"></div>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Welcome Modal */}
        <div className={`${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-amber-50 shadow-[##000000ab]'} absolute bottom-20 right-0 rounded-lg shadow-2xl shadow-opacity-10 w-80 transform transition-all duration-300 animate-in slide-in-from-bottom-5`}>
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className={`absolute top-2 right-2 ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'} transition-colors z-10 p-1 rounded-full hover:bg-black/10`}
          >
            <X size={20} />
          </button>
          
          <div className="p-6">
            {/* Hand wave GIF */}
            <div className="flex justify-center mb-4">
              <img src="/handwave.gif" alt="Hand wave" className="w-12 h-12" />
            </div>
            
            {/* Welcome message */}
            <div className={`text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <h3 className="text-lg font-semibold mb-2">Hi there! 👋</h3>
              <p className="text-sm">
                We're here to help! Send us a message or give us a call.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-3 mb-4">
              <button
                onClick={handleChatNow}
                className="w-full bg-[#e4c206] hover:bg-[#FFC700] text-black font-medium py-2 px-4 rounded transition-colors"
              >
                Chat now
              </button>
              
              <button
                onClick={handleJustBrowsing}
                className={`w-full ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-medium py-2 px-4 rounded transition-colors`}
              >
                Just browsing
              </button>
              
              <button
                onClick={handleChatNow}
                className="w-full bg-[#e4c206] hover:bg-[#FFC700] text-black font-medium py-2 px-4 rounded transition-colors"
              >
                Call us
              </button>
              
              {isExpanded && (
                <>
                  <button
                    onClick={handleCallUs}
                    className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={16} />
                    Call us
                  </button>
                </>
              )}
              
              <button
                onClick={handleShowMore}
                className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
            
            {/* Message input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Send us a message..."
                className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'} border rounded-lg py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleChatNow()
                    handleSendMessage()
                  }
                }}
              />
              <button
                onClick={() => {
                  handleChatNow()
                  handleSendMessage()
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#FFD700] hover:text-[#FFC700] transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            
            {/* Agent avatar */}
            {/* <div className="flex justify-end mt-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFD700]">
                <img
                  src="/aibot.png"
                  alt="Support Agent"
                  className="object-cover w-full h-full"
                />
              </div>
            </div> */}
          </div>
        </div>
      </div>
      </>
    )
  }

  // Full chat window
  return (
    <div className={`fixed bottom-6 right-6 w-80 sm:w-96 ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-amber-50 border border-amber-200'} rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden transform transition-all duration-300`}
         style={isDarkMode ? {} : { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
      {/* Chat Header */}
      <div className={`${isDarkMode ? 'bg-[#2D2D2D] text-white border-gray-600' : 'bg-amber-100 text-gray-800 border-amber-300'} p-4 flex justify-between items-center border-b`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD700] mr-3">
            <img
              src="/aibot.png"
              alt="Support Agent"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Zongotek Support</h3>
            <p className="text-xs opacity-75">
              {conversationContext?.currentCardId ? `Card: ${conversationContext.currentCardId}` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWelcome(true)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-amber-50'} p-4 overflow-y-auto max-h-96 space-y-3`}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onOptionClick={handleOptionClick} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-amber-100 text-gray-800 border border-amber-200'} rounded-lg px-4 py-2 max-w-xs`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className={`${isDarkMode ? 'bg-[#2D2D2D] border-gray-600' : 'bg-amber-50 border-amber-200'} p-4 border-t`}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-amber-300 text-gray-800 placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            className="bg-[#FFD700] hover:bg-[#FFC700] disabled:opacity-50 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => goToPrevious()}
            className={`text-xs ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors px-2 py-1 rounded`}
          >
            ← Back
          </button>
          <button
            onClick={() => handleTransferToAgent('operations')}
            className={`text-xs ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors px-2 py-1 rounded`}
          >
            👨‍💼 Human Agent
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedZongotekChatWidget
