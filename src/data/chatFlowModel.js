/**
 * Chat Flow Model utilities for creating and managing chat flow objects
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Create a new question object
 * @param {string} text - The question text
 * @param {boolean} isInitial - Whether this is the initial question
 * @param {Object} position - Position coordinates {x, y}
 * @returns {Object} Question object
 */
export const createQuestion = (text, isInitial = false, position = { x: 250, y: 100 }) => {
  return {
    id: `q_${uuidv4()}`,
    text,
    type: 'text',
    isInitial,
    position,
    answers: []
  }
}

/**
 * Create a new answer object
 * @param {string} text - The answer text
 * @param {boolean} isPrimary - Whether this is a primary answer
 * @param {boolean} isSecondary - Whether this is a secondary answer
 * @returns {Object} Answer object
 */
export const createAnswer = (text, isPrimary = true, isSecondary = false) => {
  return {
    id: `a_${uuidv4()}`,
    text,
    isPrimary,
    isSecondary,
    actions: []
  }
}

/**
 * Create a new action object
 * @param {string} type - The action type
 * @param {Object} payload - The action payload
 * @returns {Object} Action object
 */
export const createAction = (type, payload = {}) => {
  return {
    id: `action_${uuidv4()}`,
    type,
    payload
  }
}

/**
 * Add a question to a chat flow
 * @param {Object} chatFlow - The chat flow object
 * @param {Object} question - The question to add
 * @returns {Object} Updated chat flow
 */
export const addQuestionToChatFlow = (chatFlow, question) => {
  return {
    ...chatFlow,
    questions: [...(chatFlow.questions || []), question]
  }
}

/**
 * Update chat flow status
 * @param {Object} chatFlow - The chat flow object
 * @param {string} status - The new status
 * @returns {Object} Updated chat flow
 */
export const updateChatFlowStatus = (chatFlow, status) => {
  return {
    ...chatFlow,
    status,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Create a new chat flow
 * @param {string} name - The flow name
 * @param {string} description - The flow description
 * @returns {Object} New chat flow object
 */
export const createNewChatFlow = (name, description = '') => {
  const now = new Date().toISOString()
  return {
    id: `flow_${uuidv4()}`,
    name,
    description,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    questions: []
  }
}

/**
 * Validate a chat flow structure
 * @param {Object} chatFlow - The chat flow to validate
 * @returns {Object} Validation result {isValid: boolean, errors: string[]}
 */
export const validateChatFlow = (chatFlow) => {
  const errors = []
  
  if (!chatFlow) {
    errors.push('Chat flow is required')
    return { isValid: false, errors }
  }
  
  if (!chatFlow.name || chatFlow.name.trim() === '') {
    errors.push('Chat flow name is required')
  }
  
  if (!chatFlow.questions || !Array.isArray(chatFlow.questions)) {
    errors.push('Chat flow must have questions array')
  } else if (chatFlow.questions.length === 0) {
    errors.push('Chat flow must have at least one question')
  } else {
    // Validate questions
    chatFlow.questions.forEach((question, index) => {
      if (!question.text || question.text.trim() === '') {
        errors.push(`Question ${index + 1} must have text`)
      }
      
      if (!question.answers || !Array.isArray(question.answers)) {
        errors.push(`Question ${index + 1} must have answers array`)
      } else {
        // Validate answers
        question.answers.forEach((answer, answerIndex) => {
          if (!answer.text || answer.text.trim() === '') {
            errors.push(`Question ${index + 1}, Answer ${answerIndex + 1} must have text`)
          }
          
          if (!answer.actions || !Array.isArray(answer.actions)) {
            errors.push(`Question ${index + 1}, Answer ${answerIndex + 1} must have actions array`)
          }
        })
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Convert chat flow to runtime format
 * @param {Object} chatFlow - The chat flow to convert
 * @returns {Object} Runtime chat flow
 */
export const convertChatFlowToRuntime = (chatFlow) => {
  if (!chatFlow) return null
  
  // If it's already in runtime format, return as is
  if (chatFlow.questions) {
    return chatFlow
  }
  
  // Convert from simple format to runtime format
  const runtimeFlow = {
    id: chatFlow.id,
    name: chatFlow.name || 'Untitled Flow',
    description: chatFlow.description || '',
    status: chatFlow.status || 'active',
    createdAt: chatFlow.createdAt || new Date().toISOString(),
    updatedAt: chatFlow.updatedAt || new Date().toISOString(),
    questions: []
  }
  
  // Convert simple message/options format to questions/answers format
  if (chatFlow.message && chatFlow.options) {
    const initialQuestion = createQuestion(chatFlow.message, true, { x: 250, y: 100 })
    
    chatFlow.options.forEach((option, index) => {
      const answer = createAnswer(option.text, index === 0, false)
      
      // Create action based on option value
      if (option.value) {
        const action = createAction('navigate_to_flow', { flowId: option.value })
        answer.actions.push(action)
      }
      
      initialQuestion.answers.push(answer)
    })
    
    runtimeFlow.questions.push(initialQuestion)
  }
  
  return runtimeFlow
}
