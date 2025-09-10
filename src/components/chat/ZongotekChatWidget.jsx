import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@/context/ChatContext'
import { useTickets } from '@/context/TicketContext'
import { useChatFlow } from '@/context/ChatFlowContext'
import { useTheme } from '@/context/ThemeContext'
import ChatBubble from './ChatBubble'
import { MessageCircle, X, Minimize2, Send, ArrowUp, Phone } from 'lucide-react'

// Import database utilities
import { fetchChatFlows, getInitialChatFlow, getChatFlowById } from '@/utils/database'

const ZongotekChatWidget = () => {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    setCurrentFlow,
    currentFlow,
    clearChat
  } = useChat()
  
  const { isDarkMode } = useTheme()
  
  const { runtimeFlows } = useChatFlow()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addTicket } = useTickets()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  
  // Initialize chat with welcome message
  useEffect(() => {
    const initializeChat = async () => {
      if (messages.length === 0 && !currentFlow && !isInitialized) {
        setIsInitialized(true)
        
        try {
          // First, try to find an initial flow from the active runtime flows
          const customInitialFlow = Object.values(runtimeFlows).find(flow => 
            flow.isInitial === true
          )
          
          // If no custom initial flow, try to find the first flow in runtime flows
          const firstRuntimeFlow = customInitialFlow || Object.values(runtimeFlows)[0]
          
          let initialFlow = firstRuntimeFlow
          
          // If no runtime flows, fetch from database
          if (!initialFlow) {
            initialFlow = await getInitialChatFlow()
          }
          
          if (initialFlow) {
            setCurrentFlow(initialFlow)
            
            // Add welcome message with typing effect
            setIsTyping(true)
            setTimeout(() => {
              addMessage({
                id: `msg_${Date.now()}`,
                text: initialFlow.message,
                type: 'bot',
                timestamp: new Date().toISOString(),
                flow: initialFlow
              })
              setIsTyping(false)
            }, 1000)
          }
        } catch (error) {
          console.error('Error initializing chat:', error)
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
  }, [messages.length, currentFlow, isInitialized, addMessage, setCurrentFlow, runtimeFlows])

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
    // If we have a current flow with options, check if the message matches any option
    if (currentFlow?.options) {
      const matchedOption = currentFlow.options.find(
        option => option.text.toLowerCase() === text.toLowerCase() || 
                 option.value.toLowerCase() === text.toLowerCase()
      )

      if (matchedOption) {
        // Find the next flow based on the matched option value
        const nextFlow = await findFlow(matchedOption.value)
        if (nextFlow) {
          setCurrentFlow(nextFlow)
          
          // Add bot response
          addMessage({
            id: `msg_${Date.now()}`,
            text: nextFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: nextFlow
          })
          return
        }
      }
    }

    // If no match or no current flow options, provide a fallback response
    try {
      const chatFlowsData = await fetchChatFlows()
      const fallbackResponses = chatFlowsData.sampleResponses?.fallback || [
        "I'm sorry, I didn't understand that. Could you please rephrase?",
        "I'm not sure I follow. Can you try asking in a different way?",
        "I apologize, but I'm having trouble understanding your request."
      ]
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      
      addMessage({
        id: `msg_${Date.now()}`,
        text: randomResponse,
        type: 'bot',
        timestamp: new Date().toISOString()
      })

      // After fallback, return to welcome flow
      const welcomeFlow = await findFlow('welcome')
      if (welcomeFlow) {
        setTimeout(() => {
          setCurrentFlow(welcomeFlow)
          addMessage({
            id: `msg_${Date.now()}`,
            text: "Let me help you with something specific. What would you like to know about?",
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: welcomeFlow
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Error processing user message:', error)
      // Fallback response
      addMessage({
        id: `msg_${Date.now()}`,
        text: "I'm sorry, I'm having trouble understanding. Could you please try again?",
        type: 'bot',
        timestamp: new Date().toISOString()
      })
    }
  }

  const findFlow = async (flowId) => {
    // First check runtime flows from editor
    const runtimeFlow = Object.values(runtimeFlows).find(flow => flow.id === flowId)
    if (runtimeFlow) return runtimeFlow
    
    // Then check database flows
    try {
      return await getChatFlowById(flowId)
    } catch (error) {
      console.error('Error finding flow:', error)
      return null
    }
  }

  const handleOptionClick = async (option) => {
    // Add user message showing the selected option
    addMessage({
      id: `msg_${Date.now()}`,
      text: option.text,
      type: 'user',
      timestamp: new Date().toISOString()
    })

    // Simulate bot typing
    setIsTyping(true)

    // Process the option after a short delay
    setTimeout(async () => {
      try {
        // Check if option has a value (flow ID) to navigate to
        if (option.value) {
          const nextFlow = await findFlow(option.value)
          if (nextFlow) {
            setCurrentFlow(nextFlow)
            
            // Add bot response
            addMessage({
              id: `msg_${Date.now()}`,
              text: nextFlow.message,
              type: 'bot',
              timestamp: new Date().toISOString(),
              flow: nextFlow
            })
          } else {
            // Fallback if flow not found
            addMessage({
              id: `msg_${Date.now()}`,
              text: "I'm sorry, I couldn't find that option. Please try again.",
              type: 'bot',
              timestamp: new Date().toISOString()
            })
          }
        } else {
          // Handle different action types for backward compatibility
          switch (option.action) {
            case 'navigate': {
              const nextFlow = await findFlow(option.nextFlow)
              if (nextFlow) {
                setCurrentFlow(nextFlow)
                
                // Add bot response
                addMessage({
                  id: `msg_${Date.now()}`,
                  text: nextFlow.message,
                  type: 'bot',
                  timestamp: new Date().toISOString(),
                  flow: nextFlow
                })
              }
              break
            }
              
            case 'transfer':
              // Handle transfer to agent
              addMessage({
                id: `msg_${Date.now()}`,
                text: `I'm transferring you to our ${option.department} team. Please wait while I connect you...`,
                type: 'bot',
                timestamp: new Date().toISOString()
              })
              
              // Create a ticket for the transfer
              addTicket({
                subject: `Chat Transfer - ${option.department}`,
                description: `Customer requested transfer to ${option.department} team`,
                departmentId: option.department,
                status: 'pending',
                messages: messages
              })
              break
              
            case 'url':
              // Handle URL redirect
              addMessage({
                id: `msg_${Date.now()}`,
                text: `I'm redirecting you to: ${option.url}`,
                type: 'bot',
                timestamp: new Date().toISOString()
              })
              
              // Open URL in new tab
              setTimeout(() => {
                window.open(option.url, '_blank')
              }, 1000)
              break
              
            case 'message':
            default: {
              // Handle message response
              const responseMessage = option.message || "Thank you for your response."
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
    if (!isOpen) {
      setIsLoading(true)
      
      // Start 5-second timer
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(true)
        setIsLoading(false)
      }, 2000)
    }
  }

  const handleMouseLeave = () => {
    setIsLoading(false)
    
    // Clear timeout if user stops hovering
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleOnClick = () => {
    setIsOpen(true)
    setIsLoading(false)
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
        <div className="fixed z-50 right-6 bottom-6">
          <div className="relative">
            {/* Loading overlay */}
              {isLoading && (
                <div className="absolute z-10 flex items-center justify-center rounded-full left-2 -top-8">
                  <div className="z-10 bg-green-400 loader"></div>
                </div>
              )}
            <button
              onClick={handleOnClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="bg-[#FFD700] hover:bg-[#FFC700] transition-all overflow-hidden duration-300 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 relative"
              aria-label="Open chat"
            >
              <img src="./aibot.png" alt="AI Assistant" className="w-full h-full" />
              
              
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
        <div className="fixed z-50 right-6 bottom-6">
        {/* AI Toggle Button */}
        <div className="absolute bottom-0 right-0">
          <div className="relative">
            <button
              onClick={() => setIsOpen(true)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="bg-[#FFD700] hover:bg-[#FFC700] transition-all overflow-hidden duration-300 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 relative"
              aria-label="Open chat"
            >
              <img src="./aibot.png" alt="AI Assistant" className="w-full h-full" />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center p-0 rounded-full bg-black/20">
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
            className={`absolute -top-7 right-0 ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'} transition-colors z-10 p-1 rounded-full hover:bg-black/10`}
          >
            <X size={20} />
          </button>

          {/* Hand wave emoji */}
          <div className="flex items-center justify-center h-32 mx-4 mt-4 overflow-hidden bg-white rounded-lg">
            <img 
              src="./handwave.gif" 
              alt="AI Assistant" 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Welcome message */}
          <div className={`p-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <p className="mb-4 text-sm">Hi, let us know if you have any questions.</p>
            
            {/* Action buttons */}
            <div className="space-y-2">
              <div className="flex flex-row gap-2">
                <button
                  onClick={handleChatNow}
                  className="w-full bg-[#e4c206] hover:bg-[#FFC700] text-black font-medium py-2 px-4 rounded transition-colors"
                >
                  Chat now
                </button>
                
                <button
                  onClick={handleJustBrowsing}
                  className={`py-2 w-full text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                >
                  Just browsing
                </button>
              </div>

              <div className="flex flex-row gap-2">
              <button
                  onClick={handleChatNow}
                  className="w-full bg-[#e4c206] hover:bg-[#FFC700] text-black font-medium py-2 px-4 rounded transition-colors"
                >
                  Call us
                </button>
              </div>
              
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
                className="w-full text-[#FFD700] hover:text-[#FFC700] py-2 text-sm transition-colors pointer"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>

            {/* Message input area */}
            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Write a message..."
                className={`w-full bg-transparent border-b ${isDarkMode ? 'placeholder-gray-400 text-white border-gray-600' : 'placeholder-gray-500 text-gray-800 border-gray-300'} py-2 pr-10 focus:outline-none focus:border-[#FFD700] transition-colors`}
                onFocus={handleChatNow}
              />
              <button className={`absolute top-2 right-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                <ArrowUp size={18} />
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
    <div className={`fixed bottom-6 right-6 w-80 sm:w-96 ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-amber-50 border border-amber-200'} rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden transform transition-all duration-300`}>
      {/* Chat Header */}
      <div className={`${isDarkMode ? 'bg-[#2D2D2D] text-white border-gray-600' : 'bg-amber-100 text-gray-800 border-amber-300'} p-4 flex justify-between items-center border-b`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD700] mr-3">
            <img
              src="./aibot.png"
              alt="Support Agent"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium">Zongotek Support</h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>We typically reply in a few minutes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setIsExpanded(false)
              setShowWelcome(true)
            }} 
            className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-amber-200'}`}
            aria-label="Minimize chat"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={() => {
              clearChat()
              setIsOpen(false)
              setShowWelcome(true)
              setIsExpanded(false)
            }} 
            className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-amber-200'}`}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 p-4 overflow-y-auto max-h-96 ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className={`flex items-center space-x-2 p-3 max-w-[80%] ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-amber-100 border border-amber-200'} rounded-lg shadow mb-2`}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
          </div>
        )}
        
        {/* Options buttons */}
        {currentFlow?.options && !isTyping && (
          <div className="flex flex-wrap gap-2 p-0 mt-2">
            {currentFlow.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="bg-[#FFD700] hover:bg-[#FFC700] text-black px-2 py-1 rounded-full text-sm font-medium transition-colors"
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-600 bg-[#2D2D2D]' : 'border-amber-300 bg-amber-100'}`}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a message..."
            className={`flex-1 bg-transparent border-b ${isDarkMode ? 'placeholder-gray-400 text-white border-gray-600' : 'placeholder-gray-500 text-gray-800 border-gray-300'} py-2 focus:outline-none focus:border-[#FFD700] transition-colors`}
            ref={inputRef}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#FFD700] hover:bg-[#FFC700] text-black p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userInput.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <div className={`mt-3 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Powered by Zongotek AI
        </div>
      </div>
    </div>
  )
}

export default ZongotekChatWidget