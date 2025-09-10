import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  createNewChatBotSystem,
  createNewStoryCard,
  convertSystemToRuntime,
  processEnhancedActionWithSystem,
  findBestMatchingCard,
  validateChatBotSystem,
  getSystemAnalytics
} from '@/data/enhancedChatFlowUtils'
import {
  createConversationContext,
  findCardById,
  addCardToSystem,
  updateConversationContext,
  ACTION_TYPES
} from '@/data/enhancedChatFlowModel'

const EnhancedChatFlowContext = createContext()

// Action types
const ACTIONS = {
  SET_CHATBOT_SYSTEM: 'SET_CHATBOT_SYSTEM',
  UPDATE_SYSTEM: 'UPDATE_SYSTEM',
  ADD_STORY_CARD: 'ADD_STORY_CARD',
  UPDATE_STORY_CARD: 'UPDATE_STORY_CARD',
  DELETE_STORY_CARD: 'DELETE_STORY_CARD',
  SET_ACTIVE_CARD: 'SET_ACTIVE_CARD',
  SET_CURRENT_EDITING_CARD: 'SET_CURRENT_EDITING_CARD',
  CLEAR_CURRENT_EDITING_CARD: 'CLEAR_CURRENT_EDITING_CARD',
  SET_CONVERSATION_CONTEXT: 'SET_CONVERSATION_CONTEXT',
  UPDATE_CONVERSATION_CONTEXT: 'UPDATE_CONVERSATION_CONTEXT',
  SET_RUNTIME_FLOWS: 'SET_RUNTIME_FLOWS',
  SET_LOADING: 'SET_LOADING'
}

// Initial state
const initialState = {
  chatBotSystem: null,
  activeCardId: null,
  currentEditingCard: null,
  conversationContext: null,
  runtimeFlows: {},
  isLoading: false,
  analytics: null
}

// Reducer function
function enhancedChatFlowReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CHATBOT_SYSTEM: {
      const system = action.payload
      const runtimeFlows = convertSystemToRuntime(system, state.conversationContext)
      
      return {
        ...state,
        chatBotSystem: system,
        runtimeFlows,
        activeCardId: system.settings.defaultCardId
      }
    }
    
    case ACTIONS.UPDATE_SYSTEM: {
      const updatedSystem = action.payload
      const runtimeFlows = convertSystemToRuntime(updatedSystem, state.conversationContext)
      
      return {
        ...state,
        chatBotSystem: updatedSystem,
        runtimeFlows
      }
    }
    
    case ACTIONS.ADD_STORY_CARD: {
      if (!state.chatBotSystem) return state
      
      const updatedSystem = addCardToSystem(state.chatBotSystem, action.payload)
      const runtimeFlows = convertSystemToRuntime(updatedSystem, state.conversationContext)
      
      return {
        ...state,
        chatBotSystem: updatedSystem,
        runtimeFlows
      }
    }
    
    case ACTIONS.UPDATE_STORY_CARD: {
      if (!state.chatBotSystem) return state
      
      const updatedSystem = {
        ...state.chatBotSystem,
        cards: state.chatBotSystem.cards.map(card =>
          card.id === action.payload.id ? action.payload : card
        ),
        updatedAt: new Date().toISOString()
      }
      
      const runtimeFlows = convertSystemToRuntime(updatedSystem, state.conversationContext)
      
      return {
        ...state,
        chatBotSystem: updatedSystem,
        runtimeFlows
      }
    }
    
    case ACTIONS.DELETE_STORY_CARD: {
      if (!state.chatBotSystem) return state
      
      const updatedSystem = {
        ...state.chatBotSystem,
        cards: state.chatBotSystem.cards.filter(card => card.id !== action.payload),
        updatedAt: new Date().toISOString()
      }
      
      // Update default card if deleted
      if (updatedSystem.settings.defaultCardId === action.payload) {
        updatedSystem.settings.defaultCardId = updatedSystem.cards[0]?.id || null
      }
      
      const runtimeFlows = convertSystemToRuntime(updatedSystem, state.conversationContext)
      
      return {
        ...state,
        chatBotSystem: updatedSystem,
        runtimeFlows,
        currentEditingCard: state.currentEditingCard?.id === action.payload 
          ? null 
          : state.currentEditingCard,
        activeCardId: state.activeCardId === action.payload 
          ? updatedSystem.settings.defaultCardId 
          : state.activeCardId
      }
    }
    
    case ACTIONS.SET_ACTIVE_CARD:
      return {
        ...state,
        activeCardId: action.payload
      }
    
    case ACTIONS.SET_CURRENT_EDITING_CARD:
      return {
        ...state,
        currentEditingCard: action.payload
      }
    
    case ACTIONS.CLEAR_CURRENT_EDITING_CARD:
      return {
        ...state,
        currentEditingCard: null
      }
    
    case ACTIONS.SET_CONVERSATION_CONTEXT: {
      const context = action.payload
      const runtimeFlows = state.chatBotSystem 
        ? convertSystemToRuntime(state.chatBotSystem, context)
        : state.runtimeFlows
      
      return {
        ...state,
        conversationContext: context,
        runtimeFlows
      }
    }
    
    case ACTIONS.UPDATE_CONVERSATION_CONTEXT: {
      const updatedContext = updateConversationContext(state.conversationContext, action.payload)
      const runtimeFlows = state.chatBotSystem 
        ? convertSystemToRuntime(state.chatBotSystem, updatedContext)
        : state.runtimeFlows
      
      return {
        ...state,
        conversationContext: updatedContext,
        runtimeFlows
      }
    }
    
    case ACTIONS.SET_RUNTIME_FLOWS:
      return {
        ...state,
        runtimeFlows: action.payload
      }
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    
    default:
      return state
  }
}

// Enhanced ChatFlow provider component
export function EnhancedChatFlowProvider({ children }) {
  const [state, dispatch] = useReducer(enhancedChatFlowReducer, initialState)

  // Initialize chatbot system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      
      try {
        // Try to load existing system from localStorage
        const savedSystem = localStorage.getItem('enhancedChatBotSystem')
        let system
        
        if (savedSystem) {
          system = JSON.parse(savedSystem)
        } else {
          // Create new system with default cards
          system = createNewChatBotSystem('Zongotek Chatbot', 'Enhanced multi-card chatbot system')
        }
        
        dispatch({ type: ACTIONS.SET_CHATBOT_SYSTEM, payload: system })
        
        // Initialize conversation context
        const context = createConversationContext()
        context.currentCardId = system.settings.defaultCardId
        
        // Find the start question of the default card
        if (system.settings.defaultCardId) {
          const defaultCard = findCardById(system, system.settings.defaultCardId)
          if (defaultCard && defaultCard.startQuestionId) {
            context.currentQuestionId = defaultCard.startQuestionId
          }
        }
        
        dispatch({ type: ACTIONS.SET_CONVERSATION_CONTEXT, payload: context })
        
      } catch (error) {
        console.error('Error initializing enhanced chatbot system:', error)
        
        // Fallback: create new system
        const system = createNewChatBotSystem('Zongotek Chatbot', 'Enhanced multi-card chatbot system')
        dispatch({ type: ACTIONS.SET_CHATBOT_SYSTEM, payload: system })
        
        const context = createConversationContext()
        context.currentCardId = system.settings.defaultCardId
        dispatch({ type: ACTIONS.SET_CONVERSATION_CONTEXT, payload: context })
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false })
      }
    }
    
    initializeSystem()
  }, [])

  // Save system to localStorage whenever it changes
  useEffect(() => {
    if (state.chatBotSystem) {
      localStorage.setItem('enhancedChatBotSystem', JSON.stringify(state.chatBotSystem))
    }
  }, [state.chatBotSystem])

  // Save conversation context to localStorage
  useEffect(() => {
    if (state.conversationContext) {
      localStorage.setItem('conversationContext', JSON.stringify(state.conversationContext))
    }
  }, [state.conversationContext])

  // Context value with enhanced methods
  const value = {
    ...state,
    
    // System management
    updateSystem: (system) => dispatch({ type: ACTIONS.UPDATE_SYSTEM, payload: system }),
    
    // Card management
    addStoryCard: (card) => dispatch({ type: ACTIONS.ADD_STORY_CARD, payload: card }),
    updateStoryCard: (card) => dispatch({ type: ACTIONS.UPDATE_STORY_CARD, payload: card }),
    deleteStoryCard: (cardId) => dispatch({ type: ACTIONS.DELETE_STORY_CARD, payload: cardId }),
    setActiveCard: (cardId) => dispatch({ type: ACTIONS.SET_ACTIVE_CARD, payload: cardId }),
    
    // Editor management
    setCurrentEditingCard: (card) => dispatch({ type: ACTIONS.SET_CURRENT_EDITING_CARD, payload: card }),
    clearCurrentEditingCard: () => dispatch({ type: ACTIONS.CLEAR_CURRENT_EDITING_CARD }),
    
    // Conversation management
    setConversationContext: (context) => dispatch({ type: ACTIONS.SET_CONVERSATION_CONTEXT, payload: context }),
    updateConversationContext: (updates) => dispatch({ type: ACTIONS.UPDATE_CONVERSATION_CONTEXT, payload: updates }),
    
    // Utility methods
    createNewCard: (name, description, category) => {
      const newCard = createNewStoryCard(name, description, category)
      dispatch({ type: ACTIONS.ADD_STORY_CARD, payload: newCard })
      return newCard
    },
    
    findCardById: (cardId) => {
      if (!state.chatBotSystem) return null
      return findCardById(state.chatBotSystem, cardId)
    },
    
    searchCards: (query) => {
      if (!state.chatBotSystem) return []
      return findBestMatchingCard(state.chatBotSystem, query, state.conversationContext)
    },
    
    processAction: async (action) => {
      if (!state.chatBotSystem || !state.conversationContext) return null
      return await processEnhancedActionWithSystem(action, state.conversationContext, state.chatBotSystem)
    },
    
    validateSystem: () => {
      if (!state.chatBotSystem) return { isValid: false, errors: ['No system loaded'] }
      return validateChatBotSystem(state.chatBotSystem)
    },
    
    getAnalytics: (contexts = []) => {
      if (!state.chatBotSystem) return null
      return getSystemAnalytics(state.chatBotSystem, contexts)
    },
    
    // Navigation helpers
    navigateToCard: (cardId, questionId = null) => {
      const updates = {
        currentCardId: cardId,
        currentQuestionId: questionId,
        action: 'navigate_to_card'
      }
      
      // If questionId not provided, use the card's start question
      if (!questionId && state.chatBotSystem) {
        const card = findCardById(state.chatBotSystem, cardId)
        if (card && card.startQuestionId) {
          updates.currentQuestionId = card.startQuestionId
        }
      }
      
      dispatch({ type: ACTIONS.UPDATE_CONVERSATION_CONTEXT, payload: updates })
    },
    
    navigateToQuestion: (questionId) => {
      const updates = {
        currentQuestionId: questionId,
        action: 'navigate_to_question'
      }
      dispatch({ type: ACTIONS.UPDATE_CONVERSATION_CONTEXT, payload: updates })
    },
    
    searchAndNavigate: async (query) => {
      if (!state.chatBotSystem) return false
      
      const matchingCard = findBestMatchingCard(state.chatBotSystem, query, state.conversationContext)
      if (matchingCard) {
        value.navigateToCard(matchingCard.id)
        return true
      }
      return false
    },
    
    goToPrevious: () => {
      if (!state.conversationContext || state.conversationContext.history.length < 2) return false
      
      const previousEntry = state.conversationContext.history[state.conversationContext.history.length - 2]
      if (previousEntry) {
        value.navigateToCard(previousEntry.cardId, previousEntry.questionId)
        return true
      }
      return false
    },
    
    goToStart: () => {
      if (!state.chatBotSystem) return false
      
      const defaultCardId = state.chatBotSystem.settings.defaultCardId
      if (defaultCardId) {
        value.navigateToCard(defaultCardId)
        return true
      }
      return false
    },
    
    // Runtime flow helpers
    getCurrentFlow: () => {
      if (!state.conversationContext || !state.conversationContext.currentQuestionId) return null
      return state.runtimeFlows[state.conversationContext.currentQuestionId] || null
    },
    
    getFlowById: (flowId) => {
      return state.runtimeFlows[flowId] || null
    },
    
    // Card helpers
    getActiveCard: () => {
      if (!state.chatBotSystem || !state.activeCardId) return null
      return findCardById(state.chatBotSystem, state.activeCardId)
    },
    
    getCurrentCard: () => {
      if (!state.chatBotSystem || !state.conversationContext?.currentCardId) return null
      return findCardById(state.chatBotSystem, state.conversationContext.currentCardId)
    },
    
    getCardsByCategory: (category) => {
      if (!state.chatBotSystem) return []
      return state.chatBotSystem.cards.filter(card => card.category === category)
    },
    
    getAllCategories: () => {
      if (!state.chatBotSystem) return []
      const categories = [...new Set(state.chatBotSystem.cards.map(card => card.category))]
      return categories.sort()
    }
  }

  return (
    <EnhancedChatFlowContext.Provider value={value}>
      {children}
    </EnhancedChatFlowContext.Provider>
  )
}

// Custom hook to use enhanced chat flow context
export function useEnhancedChatFlow() {
  const context = useContext(EnhancedChatFlowContext)
  if (!context) {
    throw new Error('useEnhancedChatFlow must be used within an EnhancedChatFlowProvider')
  }
  return context
}

// Legacy compatibility hook - provides the same interface as the original
export function useEnhancedChatFlowLegacy() {
  const enhancedContext = useEnhancedChatFlow()
  
  // Map enhanced context to legacy format for backward compatibility
  return {
    chatFlows: enhancedContext.chatBotSystem?.cards || [],
    activeChatFlowId: enhancedContext.activeCardId,
    currentEditingFlow: enhancedContext.currentEditingCard,
    runtimeFlows: enhancedContext.runtimeFlows,
    
    setChatFlows: (flows) => {
      // Convert legacy flows to cards
      const system = {
        ...enhancedContext.chatBotSystem,
        cards: flows
      }
      enhancedContext.updateSystem(system)
    },
    
    addChatFlow: (flow) => enhancedContext.addStoryCard(flow),
    updateChatFlow: (flow) => enhancedContext.updateStoryCard(flow),
    deleteChatFlow: (flowId) => enhancedContext.deleteStoryCard(flowId),
    setActiveChatFlow: (flowId) => enhancedContext.setActiveCard(flowId),
    setCurrentEditingFlow: (flow) => enhancedContext.setCurrentEditingCard(flow),
    clearCurrentEditingFlow: () => enhancedContext.clearCurrentEditingCard()
  }
}

export default {
  EnhancedChatFlowProvider,
  useEnhancedChatFlow,
  useEnhancedChatFlowLegacy
}
