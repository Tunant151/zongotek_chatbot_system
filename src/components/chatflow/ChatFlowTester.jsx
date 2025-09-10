import React, { useState, useEffect } from 'react'
import { useChatFlow } from '@/context/ChatFlowContext'
import { Send, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { convertChatFlowToRuntime } from '@/data/chatFlowUtils'

const ChatFlowTester = ({ flowId, onBack }) => {
  const { chatFlows, runtimeFlows } = useChatFlow()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [currentFlow, setCurrentFlow] = useState(null)
  const [isTyping, setIsTyping] = useState(false)

  // Find the flow to test
  useEffect(() => {
    const flow = chatFlows.find(f => f.id === flowId)
    if (flow) {
      // Convert the flow to runtime format for testing
      const testFlow = convertChatFlowToRuntime(flow)
      
      // Start with the first question
      const initialQuestion = flow.questions.find(q => q.isInitial) || flow.questions[0]
      if (initialQuestion) {
        setCurrentFlow(testFlow[initialQuestion.id])
        
        // Add initial message
        setMessages([{
          id: `msg_${Date.now()}`,
          text: initialQuestion.text,
          type: 'bot',
          timestamp: new Date().toISOString(),
          flow: testFlow[initialQuestion.id]
        }])
      }
    }
  }, [flowId, chatFlows])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage = {
        id: `msg_${Date.now()}`,
        text: inputValue.trim(),
        type: 'user',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputValue('')
      setIsTyping(false)
      
      // Simulate bot response (in a real scenario, this would process the user input)
      setTimeout(() => {
        // For testing purposes, just show a generic response
        const botMessage = {
          id: `msg_${Date.now()}`,
          text: "I'm just a test bot. Please use the flow options to navigate.",
          type: 'bot',
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, botMessage])
      }, 1000)
    }
  }

  const handleOptionSelect = (option) => {
    // Add user selection as a message
    const userMessage = {
      id: `msg_${Date.now()}`,
      text: option.text,
      type: 'user',
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Process the action
    switch (option.action) {
      case 'navigate':
        // Navigate to another question in the flow
        const flow = chatFlows.find(f => f.id === flowId)
        if (flow) {
          const testFlow = convertChatFlowToRuntime(flow)
          const nextFlow = testFlow[option.nextFlow]
          
          if (nextFlow) {
            setCurrentFlow(nextFlow)
            
            // Add bot message for the next flow
            setTimeout(() => {
              const botMessage = {
                id: `msg_${Date.now()}`,
                text: nextFlow.message,
                type: 'bot',
                timestamp: new Date().toISOString(),
                flow: nextFlow
              }
              
              setMessages(prev => [...prev, botMessage])
            }, 500)
          }
        }
        break
        
      case 'message':
        // Just send a message response
        setTimeout(() => {
          const botMessage = {
            id: `msg_${Date.now()}`,
            text: option.message || "Thank you for your response.",
            type: 'bot',
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, botMessage])
        }, 500)
        break
        
      case 'url':
        // Simulate opening URL
        setTimeout(() => {
          const botMessage = {
            id: `msg_${Date.now()}`,
            text: `I would open this URL: ${option.url}`,
            type: 'bot',
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, botMessage])
        }, 500)
        break
        
      case 'transfer':
        // Simulate agent transfer
        setTimeout(() => {
          const botMessage = {
            id: `msg_${Date.now()}`,
            text: `I would transfer you to ${option.department || 'an agent'}.`,
            type: 'bot',
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, botMessage])
        }, 500)
        break
        
      default:
        // Default message response
        setTimeout(() => {
          const botMessage = {
            id: `msg_${Date.now()}`,
            text: "Thank you for your response.",
            type: 'bot',
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, botMessage])
        }, 500)
        break
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

  const handleReset = () => {
    // Reset the test chat
    setMessages([])
    
    // Find the flow to test again
    const flow = chatFlows.find(f => f.id === flowId)
    if (flow) {
      // Start with the first question
      const initialQuestion = flow.questions.find(q => q.isInitial) || flow.questions[0]
      if (initialQuestion) {
        const testFlow = convertChatFlowToRuntime(flow)
        
        setCurrentFlow(testFlow[initialQuestion.id])
        
        // Add initial message
        setMessages([{
          id: `msg_${Date.now()}`,
          text: initialQuestion.text,
          type: 'bot',
          timestamp: new Date().toISOString(),
          flow: testFlow[initialQuestion.id]
        }])
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
          <h2 className="text-lg font-semibold">Test Chat Flow</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw size={16} className="mr-2" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'}`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        
        {/* Flow Options */}
        {currentFlow && currentFlow.options && currentFlow.options.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              {currentFlow.options.map((option, index) => {
                const isPrimary = option.isPrimary;
                const isSecondary = option.isSecondary;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      p-3 rounded-lg transition-colors text-sm font-medium shadow-sm
                      ${isPrimary 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : isSecondary
                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                        : 'bg-muted hover:bg-muted/90'}
                    `}
                  >
                    {option.text}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows="1"
            />
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim()}
            className={`${!inputValue.trim() ? 'opacity-50' : ''}`}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatFlowTester