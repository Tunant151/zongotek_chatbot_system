import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useChatFlow } from './ChatFlowContext'

const ChatContext = createContext()

// Action types
const ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_IS_OPEN: 'SET_IS_OPEN',
  SET_CURRENT_FLOW: 'SET_CURRENT_FLOW',
  SET_AGENT_MODE: 'SET_AGENT_MODE',
  SET_QUEUE_POSITION: 'SET_QUEUE_POSITION',
  SET_SESSION_ID: 'SET_SESSION_ID',
  CLEAR_CHAT: 'CLEAR_CHAT'
}

// Initial state
const initialState = {
  messages: [],
  isOpen: false,
  currentFlow: null,
  isAgentMode: false,
  queuePosition: null,
  sessionId: null,
  isLoading: false
}

// Reducer function
function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload }
    
    case ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [...state.messages, action.payload]
      }
    
    case ACTIONS.SET_IS_OPEN:
      return { ...state, isOpen: action.payload }
    
    case ACTIONS.SET_CURRENT_FLOW:
      return { ...state, currentFlow: action.payload }
    
    case ACTIONS.SET_AGENT_MODE:
      return { ...state, isAgentMode: action.payload }
    
    case ACTIONS.SET_QUEUE_POSITION:
      return { ...state, queuePosition: action.payload }
    
    case ACTIONS.SET_SESSION_ID:
      return { ...state, sessionId: action.payload }
    
    case ACTIONS.CLEAR_CHAT:
      return { 
        ...state, 
        messages: [],
        currentFlow: null,
        isAgentMode: false,
        queuePosition: null
      }
    
    default:
      return state
  }
}

// Chat provider component
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { runtimeFlows } = useChatFlow()

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('chatSession')
    if (savedSession) {
      const session = JSON.parse(savedSession)
      const sessionAge = Date.now() - session.timestamp
      
      // Keep session for 24 hours
      if (sessionAge < 24 * 60 * 60 * 1000) {
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: session.messages })
        dispatch({ type: ACTIONS.SET_SESSION_ID, payload: session.sessionId })
        dispatch({ type: ACTIONS.SET_CURRENT_FLOW, payload: session.currentFlow })
      } else {
        localStorage.removeItem('chatSession')
      }
    }
  }, [])

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      const session = {
        messages: state.messages,
        sessionId: state.sessionId,
        currentFlow: state.currentFlow,
        timestamp: Date.now()
      }
      localStorage.setItem('chatSession', JSON.stringify(session))
    }
  }, [state.messages, state.sessionId, state.currentFlow])

  // Generate session ID if not exists
  useEffect(() => {
    if (!state.sessionId) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      dispatch({ type: ACTIONS.SET_SESSION_ID, payload: sessionId })
    }
  }, [state.sessionId])

  // Context value
  const value = {
    ...state,
    addMessage: (message) => dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message }),
    setMessages: (messages) => dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages }),
    setIsOpen: (isOpen) => dispatch({ type: ACTIONS.SET_IS_OPEN, payload: isOpen }),
    setCurrentFlow: (flow) => dispatch({ type: ACTIONS.SET_CURRENT_FLOW, payload: flow }),
    setAgentMode: (isAgentMode) => dispatch({ type: ACTIONS.SET_AGENT_MODE, payload: isAgentMode }),
    setQueuePosition: (position) => dispatch({ type: ACTIONS.SET_QUEUE_POSITION, payload: position }),
    clearChat: () => dispatch({ type: ACTIONS.CLEAR_CHAT })
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

// Custom hook to use chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
