import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@/context/ChatContext'
import { useTickets } from '@/context/TicketContext'
import { useChatFlow } from '@/context/ChatFlowContext'
import { getInitialFlow, getFlow } from '@/data/chatFlows'
import ChatBubble from './ChatBubble'
import ChatWindow from './ChatWindow'
import WelcomeScreen from './WelcomeScreen'
import { MessageCircle, X, Minimize2 } from 'lucide-react'

const ChatWidget = () => {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    setCurrentFlow,
    currentFlow,
    isAgentMode,
    queuePosition,
    clearChat
  } = useChat()
  
  const { runtimeFlows } = useChatFlow?.() || { runtimeFlows: {} }
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
  
  const { addTicket } = useTickets()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [originalPosition] = useState({ x: 20, y: 20 }) // Fixed original position
  const [size, setSize] = useState({ width: 350, height: 380 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = useState(null)
  const widgetRef = useRef(null)
  const isMobile = window.innerWidth <= 768

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0 && !currentFlow && !isInitialized) {
      setIsInitialized(true)
      
      // Check if we have custom flows from the editor
      const customInitialFlow = Object.values(runtimeFlows).find(flow => 
        flow.isInitial === true || flow.id === 'welcome'
      )
      
      // Use custom flow if available, otherwise fall back to default
      const initialFlow = customInitialFlow || getInitialFlow()
      setCurrentFlow(initialFlow)
      
      // Add welcome message
      addMessage({
        id: `msg_${Date.now()}`,
        text: initialFlow.message,
        type: 'bot',
        timestamp: new Date().toISOString(),
        flow: initialFlow
      })
      
      // Add navigation message with options if it exists
      setTimeout(() => {
        // Check for custom navigation flow first
        const customNavigationFlow = Object.values(runtimeFlows).find(flow => 
          flow.id === 'welcome_navigation'
        )
        
        const navigationFlow = customNavigationFlow || getFlow('welcome_navigation')
        
        if (navigationFlow) {
          addMessage({
            id: `msg_${Date.now()}`,
            text: navigationFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: navigationFlow
          })
        }
      }, 500) // Small delay for better UX
    }
  }, [messages.length, currentFlow, isInitialized, addMessage, setCurrentFlow, runtimeFlows])

  // Handle drag start
  const handleDragStart = (e) => {
    if (isMobile) return
    
    // Don't start dragging if clicking on resize handles
    if (e.target.closest('[data-resize-handle]')) {
      return
    }
    
    setIsDragging(true)
    const rect = widgetRef.current.getBoundingClientRect()
    
    // Calculate offset from where the user clicked relative to the widget
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Handle drag move
  const handleDragMove = (e) => {
    if (!isDragging || isMobile) return
    
    const widgetWidth = isOpen || showWelcomeScreen ? size.width : 60
    const widgetHeight = isOpen || showWelcomeScreen ? size.height : 60
    
    // Calculate new position based on mouse movement
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    
    // Convert to bottom-right positioning
    const bottomRightX = window.innerWidth - newX - widgetWidth
    const bottomRightY = window.innerHeight - newY - widgetHeight
    
    // Constrain to viewport (allow dragging to top and left edges)
    const maxX = window.innerWidth - widgetWidth
    const maxY = window.innerHeight - widgetHeight
    
    setPosition({
      x: Math.max(0, Math.min(bottomRightX, maxX)),
      y: Math.max(0, Math.min(bottomRightY, maxY))
    })
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Handle resize start
  const handleResizeStart = (e, direction) => {
    if (isMobile) return
    
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
  }

  // Handle resize move
  const handleResizeMove = (e) => {
    if (!isResizing || isMobile) return
    
    const rect = widgetRef.current.getBoundingClientRect()
    const minWidth = 300
    const minHeight = 300
    const maxWidth = window.innerWidth - 40
    const maxHeight = window.innerHeight - 40
    
    let newWidth = size.width
    let newHeight = size.height
    
    if (resizeDirection.includes('e')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - rect.left))
    }
    if (resizeDirection.includes('w')) {
      const rightEdge = rect.right
      newWidth = Math.max(minWidth, Math.min(maxWidth, rightEdge - e.clientX))
    }
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY - rect.top))
    }
    if (resizeDirection.includes('n')) {
      const bottomEdge = rect.bottom
      newHeight = Math.max(minHeight, Math.min(maxHeight, bottomEdge - e.clientY))
    }
    
    setSize({ width: newWidth, height: newHeight })
  }

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)
    setResizeDirection(null)
  }

  // Add event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, resizeDirection, size])

  // Handle transfer to agent
  const handleTransfer = (department = 'operations') => {
    addMessage({
      id: `msg_${Date.now()}`,
      text: "I'm transferring you to a live agent. Please wait...",
      type: 'bot',
      timestamp: new Date().toISOString()
    })

    // Create ticket
    const ticket = addTicket({
      sessionId: `session_${Date.now()}`,
      departmentId: department,
      subject: 'Chat Transfer',
      description: 'User requested transfer to live agent',
      priority: 'medium',
      messages: messages
    })

    // Simulate transfer delay
    setTimeout(() => {
      addMessage({
        id: `msg_${Date.now()}`,
        text: `You've been connected to our ${department} team. An agent will be with you shortly.`,
        type: 'system',
        timestamp: new Date().toISOString()
      })
    }, 2000)
  }

  // Handle user message
  const handleUserMessage = (text) => {
    const userMessage = {
      id: `msg_${Date.now()}`,
      text,
      type: 'user',
      timestamp: new Date().toISOString()
    }
    
    addMessage(userMessage)

    // Check for transfer keywords
    const transferKeywords = ['human', 'agent', 'person', 'representative', 'support']
    const hasTransferKeyword = transferKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    )

    if (hasTransferKeyword) {
      setTimeout(() => handleTransfer(), 1000)
      return
    }

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: `msg_${Date.now()}`,
        text: "I understand you're asking about that. Let me connect you with a live agent who can help you better.",
        type: 'bot',
        timestamp: new Date().toISOString()
      }
      addMessage(botMessage)
      
      setTimeout(() => handleTransfer(), 1500)
    }, 1000)
  }

  // Handle flow option selection
  const handleFlowOption = (option) => {
    if (option.action === 'transfer') {
      handleTransfer(option.department)
    } else if (option.action === 'navigate') {
      // Navigate to next flow
      const nextFlow = getFlow(option.nextFlow)
      setCurrentFlow(nextFlow)
      
      addMessage({
        id: `msg_${Date.now()}`,
        text: nextFlow.message,
        type: 'bot',
        timestamp: new Date().toISOString(),
        flow: nextFlow
      })

      // Handle multi-step flows for main sections
      if (option.nextFlow === 'it_solutions') {
        setTimeout(() => {
          const servicesFlow = getFlow('it_solutions_services')
          addMessage({
            id: `msg_${Date.now()}`,
            text: servicesFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: servicesFlow
          })
        }, 1000)
      } else if (option.nextFlow === 'education') {
        setTimeout(() => {
          const programsFlow = getFlow('education_programs')
          addMessage({
            id: `msg_${Date.now()}`,
            text: programsFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: programsFlow
          })
        }, 1000)
      } else if (option.nextFlow === 'estore') {
        setTimeout(() => {
          const categoriesFlow = getFlow('estore_categories')
          addMessage({
            id: `msg_${Date.now()}`,
            text: categoriesFlow.message,
            type: 'bot',
            timestamp: new Date().toISOString(),
            flow: categoriesFlow
          })
        }, 1000)
      }
    }
  }

  // Handle chat close - reset position to original
  const handleClose = () => {
    setIsOpen(false)
    setShowWelcomeScreen(false)
    setPosition(originalPosition) // Reset to original position
  }

  // Handle welcome screen close
  const handleWelcomeClose = () => {
    setShowWelcomeScreen(false)
  }

  // Handle start chat from welcome screen
  const handleStartChat = () => {
    setShowWelcomeScreen(false)
    setIsOpen(true)
  }

  // Handle clear chat - reset initialization state
  const handleClearChat = () => {
    clearChat()
    setIsInitialized(false) // Allow re-initialization after clear
  }

  // Handle cancel transfer
  const handleCancelTransfer = () => {
    // Remove the transfer message and go back to main menu
    const updatedMessages = messages.filter(msg => !msg.flow?.isTransferring)
    clearChat()
    setIsInitialized(false)
    
    // Re-add the welcome messages
    setTimeout(() => {
      const initialFlow = getInitialFlow()
      setCurrentFlow(initialFlow)
      
      addMessage({
        id: `msg_${Date.now()}`,
        text: initialFlow.message,
        type: 'bot',
        timestamp: new Date().toISOString(),
        flow: initialFlow
      })
      
      setTimeout(() => {
        const navigationFlow = getFlow('welcome_navigation')
        addMessage({
          id: `msg_${Date.now()}`,
          text: navigationFlow.message,
          type: 'bot',
          timestamp: new Date().toISOString(),
          flow: navigationFlow
        })
      }, 500)
    }, 100)
  }

  // Widget styles
  const widgetStyles = {
    position: 'fixed',
    bottom: isMobile ? '20px' : `${position.y}px`,
    right: isMobile ? '20px' : `${position.x}px`,
    width: isOpen || showWelcomeScreen ? `${size.width}px` : '60px',
    height: isOpen || showWelcomeScreen ? `${size.height}px` : '60px',
    zIndex: 1000,
    cursor: isDragging ? 'grabbing' : isResizing ? 'nw-resize' : 'grab',
    userSelect: 'none'
  }

  return (
    <div 
      ref={widgetRef}
      style={widgetStyles}
      className="chat-widget"
      onMouseDown={handleDragStart}
    >
      {/* Chat Bubble (when closed) */}
      {!isOpen && !showWelcomeScreen && (
        <ChatBubble 
          onClick={() => setShowWelcomeScreen(true)}
          isDragging={isDragging}
          queuePosition={queuePosition}
        />
      )}

      {/* Welcome Screen */}
      {showWelcomeScreen && (
        <WelcomeScreen
          onStartChat={handleStartChat}
          onClose={handleWelcomeClose}
          width={size.width}
          height={size.height}
                  />
        )}
        
        {/* Resize handles for Welcome Screen */}
        {showWelcomeScreen && (
          <>
            <div 
              data-resize-handle
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-transparent hover:bg-blue-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div 
              data-resize-handle
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize bg-transparent hover:bg-blue-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div 
              data-resize-handle
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize bg-transparent hover:bg-blue-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div 
              data-resize-handle
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent hover:bg-blue-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />
            
            {/* Edge resize handles */}
            <div 
              data-resize-handle
              className="absolute top-0 left-4 right-4 h-2 cursor-n-resize bg-transparent hover:bg-green-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div 
              data-resize-handle
              className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize bg-transparent hover:bg-green-500/10"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div 
              data-resize-handle
              className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize bg-transparent hover:bg-green-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
            <div 
              data-resize-handle
              className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize bg-transparent hover:bg-green-500/10"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
          </>
        )}

        {/* Chat Window (when open) */}
        {isOpen && (
        <>
          <ChatWindow
            messages={messages}
            onSendMessage={handleUserMessage}
            onClose={handleClose}
            onFlowOption={handleFlowOption}
            onClearChat={handleClearChat}
            onCancelTransfer={handleCancelTransfer}
            isAgentMode={isAgentMode}
            queuePosition={queuePosition}
            width={size.width}
            height={size.height}
          />
          
          {/* Resize handles */}
          <div 
            data-resize-handle
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-transparent hover:bg-blue-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            data-resize-handle
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize bg-transparent hover:bg-blue-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            data-resize-handle
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize bg-transparent hover:bg-blue-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            data-resize-handle
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent hover:bg-blue-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edge resize handles */}
          <div 
            data-resize-handle
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize bg-transparent hover:bg-green-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            data-resize-handle
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize bg-transparent hover:bg-green-500/10"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            data-resize-handle
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize bg-transparent hover:bg-green-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            data-resize-handle
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize bg-transparent hover:bg-green-500/10"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </div>
  )
}

export default ChatWidget
