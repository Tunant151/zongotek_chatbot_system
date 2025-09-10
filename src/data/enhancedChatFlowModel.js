/**
 * Enhanced ChatFlow Data Model
 * 
 * This file defines the enhanced data structure for the multi-card chatbot system.
 * It supports cross-card navigation, dynamic card loading, and advanced button actions.
 */

/**
 * ChatBot System Model
 * Represents the entire chatbot system with multiple story cards
 */
export const createChatBotSystem = (name, description = '') => {
  return {
    id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cards: [],
    settings: {
      defaultCardId: null,
      fallbackCardId: null,
      enableCrossCardNavigation: true,
      enableSmartSuggestions: true,
      maxConversationHistory: 50
    }
  }
}

/**
 * Story Card Model
 * Represents a complete conversation story/flow that can be linked to other cards
 */
export const createStoryCard = (name, description = '', category = 'general') => {
  return {
    id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    category, // 'sales', 'support', 'general', 'technical', etc.
    status: 'inactive', // 'active', 'inactive', 'draft'
    priority: 1, // 1 = high, 2 = medium, 3 = low
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [],
    startQuestionId: null,
    tags: [], // For search and categorization
    metadata: {
      estimatedDuration: 5, // minutes
      difficulty: 'easy', // 'easy', 'medium', 'hard'
      successRate: 0, // percentage
      usage: 0 // number of times used
    },
    linkedCards: [], // Cards that this card can navigate to
    triggers: [] // Conditions that automatically load this card
  }
}

/**
 * Enhanced Question Model
 * Supports more question types and conditional logic
 */
export const createEnhancedQuestion = (text, type = 'text', position = { x: 0, y: 0 }) => {
  return {
    id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    type, // 'text', 'input', 'multiple_choice', 'card_selection', 'search'
    position,
    answers: [],
    conditions: [],
    variables: [], // Variables that can be used in this question
    personalization: {
      useUserName: false,
      useHistory: false,
      useContext: false
    },
    metadata: {
      importance: 'normal', // 'low', 'normal', 'high', 'critical'
      timeoutAction: null, // Action to take if user doesn't respond
      maxRetries: 3
    }
  }
}

/**
 * Enhanced Answer Model
 * Supports multiple actions and enhanced configurations
 */
export const createEnhancedAnswer = (text, type = 'button') => {
  return {
    id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    type, // 'button', 'quick_reply', 'input', 'selection'
    actions: [],
    conditions: [], // Conditions for showing this answer
    styling: {
      isPrimary: false,
      isSecondary: false,
      color: 'default', // 'default', 'success', 'warning', 'danger'
      icon: null // Icon to display with the answer
    },
    analytics: {
      clickCount: 0,
      conversionRate: 0,
      lastUsed: null
    }
  }
}

/**
 * Enhanced Action Model
 * Supports cross-card navigation and dynamic actions
 */
export const createEnhancedAction = (type, payload = {}) => {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type, // 'navigate_to_question', 'navigate_to_card', 'search_cards', 'dynamic_load', etc.
    payload,
    conditions: [], // Conditions for executing this action
    priority: 1, // Execution order if multiple actions
    delay: 0, // Delay before execution (ms)
    metadata: {
      description: '',
      createdAt: new Date().toISOString()
    }
  }
}

/**
 * Enhanced Action Types
 */
export const ACTION_TYPES = {
  // Navigation actions
  NAVIGATE_TO_QUESTION: 'navigate_to_question',
  NAVIGATE_TO_CARD: 'navigate_to_card',
  SEARCH_AND_LOAD_CARD: 'search_and_load_card',
  RETURN_TO_PREVIOUS: 'return_to_previous',
  GO_TO_START: 'go_to_start',
  
  // Communication actions
  SEND_MESSAGE: 'send_message',
  TRANSFER_TO_AGENT: 'transfer_to_agent',
  SCHEDULE_CALLBACK: 'schedule_callback',
  SEND_EMAIL: 'send_email',
  
  // Data actions
  SAVE_USER_DATA: 'save_user_data',
  UPDATE_CONTEXT: 'update_context',
  SET_VARIABLE: 'set_variable',
  
  // External actions
  REDIRECT_TO_URL: 'redirect_to_url',
  OPEN_MODAL: 'open_modal',
  TRIGGER_WEBHOOK: 'trigger_webhook',
  
  // Conditional actions
  CONDITIONAL_BRANCH: 'conditional_branch',
  RANDOM_SELECTION: 'random_selection',
  WEIGHTED_SELECTION: 'weighted_selection'
}

/**
 * Conversation Context Model
 * Tracks the user's journey across cards
 */
export const createConversationContext = (userId = null) => {
  return {
    id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    sessionId: `session_${Date.now()}`,
    startTime: new Date().toISOString(),
    currentCardId: null,
    currentQuestionId: null,
    history: [], // Array of visited cards and questions
    variables: {}, // User-specific variables
    userData: {
      name: null,
      email: null,
      preferences: {},
      previousInteractions: []
    },
    analytics: {
      cardSwitches: 0,
      questionsAnswered: 0,
      totalTime: 0,
      dropOffPoints: []
    }
  }
}

/**
 * Card Link Model
 * Represents connections between cards
 */
export const createCardLink = (fromCardId, toCardId, triggerType = 'manual', conditions = []) => {
  return {
    id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromCardId,
    toCardId,
    triggerType, // 'manual', 'automatic', 'conditional', 'search_result'
    conditions,
    weight: 1, // For weighted selection
    metadata: {
      usage: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    }
  }
}

/**
 * Helper Functions for Enhanced System
 */

// Add a card to the system
export const addCardToSystem = (system, card) => {
  const updatedSystem = { ...system }
  updatedSystem.cards = [...updatedSystem.cards, card]
  
  // Set as default if first card
  if (!updatedSystem.settings.defaultCardId && updatedSystem.cards.length === 1) {
    updatedSystem.settings.defaultCardId = card.id
  }
  
  updatedSystem.updatedAt = new Date().toISOString()
  return updatedSystem
}

// Find a card by ID
export const findCardById = (system, cardId) => {
  return system.cards.find(card => card.id === cardId)
}

// Find cards by category
export const findCardsByCategory = (system, category) => {
  return system.cards.filter(card => card.category === category)
}

// Search cards by tags or content
export const searchCards = (system, query, options = {}) => {
  const { includeQuestions = true, includeTags = true, fuzzyMatch = true } = options
  
  return system.cards.filter(card => {
    // Search in card name and description
    const nameMatch = card.name.toLowerCase().includes(query.toLowerCase())
    const descMatch = card.description.toLowerCase().includes(query.toLowerCase())
    
    // Search in tags
    const tagMatch = includeTags && card.tags.some(tag => 
      tag.toLowerCase().includes(query.toLowerCase())
    )
    
    // Search in questions
    const questionMatch = includeQuestions && card.questions.some(question =>
      question.text.toLowerCase().includes(query.toLowerCase())
    )
    
    return nameMatch || descMatch || tagMatch || questionMatch
  })
}

// Get linked cards for a specific card
export const getLinkedCards = (system, cardId) => {
  const card = findCardById(system, cardId)
  if (!card) return []
  
  return card.linkedCards.map(linkId => findCardById(system, linkId)).filter(Boolean)
}

// Update conversation context
export const updateConversationContext = (context, updates) => {
  return {
    ...context,
    ...updates,
    history: [
      ...context.history,
      {
        timestamp: new Date().toISOString(),
        cardId: updates.currentCardId || context.currentCardId,
        questionId: updates.currentQuestionId || context.currentQuestionId,
        action: updates.action || 'navigate'
      }
    ]
  }
}

// Convert enhanced card to runtime format
export const convertCardToRuntime = (card, context = null) => {
  const runtimeFlows = {}
  
  card.questions.forEach(question => {
    const flowOptions = question.answers.map(answer => {
      const actions = answer.actions.map(action => ({
        type: action.type,
        payload: action.payload,
        priority: action.priority,
        delay: action.delay
      }))
      
      return {
        text: answer.text,
        actions,
        styling: answer.styling,
        type: answer.type
      }
    })
    
    runtimeFlows[question.id] = {
      id: question.id,
      cardId: card.id,
      message: question.text,
      type: question.type,
      options: flowOptions,
      metadata: question.metadata
    }
  })
  
  return runtimeFlows
}

// Process enhanced action
export const processEnhancedAction = async (action, context, system) => {
  const { type, payload, conditions } = action
  
  // Check conditions first
  if (conditions.length > 0) {
    const conditionsMet = evaluateConditions(conditions, context)
    if (!conditionsMet) return null
  }
  
  switch (type) {
    case ACTION_TYPES.NAVIGATE_TO_CARD:
      return {
        type: 'card_navigation',
        targetCardId: payload.cardId,
        targetQuestionId: payload.questionId || null
      }
      
    case ACTION_TYPES.SEARCH_AND_LOAD_CARD:
      const searchResults = searchCards(system, payload.query)
      const bestMatch = searchResults[0] // Simple: take first result
      if (bestMatch) {
        return {
          type: 'card_navigation',
          targetCardId: bestMatch.id,
          targetQuestionId: bestMatch.startQuestionId
        }
      }
      return { type: 'search_no_results', query: payload.query }
      
    case ACTION_TYPES.RETURN_TO_PREVIOUS:
      const previousEntry = context.history[context.history.length - 2]
      if (previousEntry) {
        return {
          type: 'card_navigation',
          targetCardId: previousEntry.cardId,
          targetQuestionId: previousEntry.questionId
        }
      }
      return { type: 'no_previous_card' }
      
    default:
      return { type: 'unknown_action', action }
  }
}

// Evaluate conditions
const evaluateConditions = (conditions, context) => {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'user_data':
        return context.userData[condition.field] === condition.value
      case 'variable':
        return context.variables[condition.name] === condition.value
      case 'history_contains':
        return context.history.some(entry => entry.cardId === condition.cardId)
      default:
        return true
    }
  })
}

export default {
  createChatBotSystem,
  createStoryCard,
  createEnhancedQuestion,
  createEnhancedAnswer,
  createEnhancedAction,
  createConversationContext,
  createCardLink,
  ACTION_TYPES,
  addCardToSystem,
  findCardById,
  findCardsByCategory,
  searchCards,
  getLinkedCards,
  updateConversationContext,
  convertCardToRuntime,
  processEnhancedAction
}
