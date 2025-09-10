/**
 * Chat Flow utility functions
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Create a new chat flow with default structure
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
    const initialQuestion = {
      id: `q_${uuidv4()}`,
      text: chatFlow.message,
      type: 'text',
      isInitial: true,
      position: { x: 250, y: 100 },
      answers: []
    }
    
    chatFlow.options.forEach((option, index) => {
      const answer = {
        id: `a_${uuidv4()}`,
        text: option.text,
        isPrimary: index === 0,
        isSecondary: false,
        actions: []
      }
      
      // Create action based on option value
      if (option.value) {
        const action = {
          id: `action_${uuidv4()}`,
          type: 'navigate_to_flow',
          payload: { flowId: option.value }
        }
        answer.actions.push(action)
      }
      
      initialQuestion.answers.push(answer)
    })
    
    runtimeFlow.questions.push(initialQuestion)
  }
  
  return runtimeFlow
}

/**
 * Get flow statistics
 * @param {Object} chatFlow - The chat flow
 * @returns {Object} Statistics object
 */
export const getFlowStatistics = (chatFlow) => {
  if (!chatFlow) return { questions: 0, answers: 0, actions: 0 }
  
  const questions = chatFlow.questions?.length || 0
  let answers = 0
  let actions = 0
  
  chatFlow.questions?.forEach(question => {
    answers += question.answers?.length || 0
    question.answers?.forEach(answer => {
      actions += answer.actions?.length || 0
    })
  })
  
  return { questions, answers, actions }
}

/**
 * Find question by ID
 * @param {Object} chatFlow - The chat flow
 * @param {string} questionId - The question ID
 * @returns {Object|null} Question object or null
 */
export const findQuestionById = (chatFlow, questionId) => {
  if (!chatFlow?.questions) return null
  return chatFlow.questions.find(q => q.id === questionId) || null
}

/**
 * Find answer by ID
 * @param {Object} chatFlow - The chat flow
 * @param {string} answerId - The answer ID
 * @returns {Object|null} Answer object or null
 */
export const findAnswerById = (chatFlow, answerId) => {
  if (!chatFlow?.questions) return null
  
  for (const question of chatFlow.questions) {
    const answer = question.answers?.find(a => a.id === answerId)
    if (answer) return answer
  }
  
  return null
}

/**
 * Update question text
 * @param {Object} chatFlow - The chat flow
 * @param {string} questionId - The question ID
 * @param {string} newText - The new text
 * @returns {Object} Updated chat flow
 */
export const updateQuestionText = (chatFlow, questionId, newText) => {
  if (!chatFlow?.questions) return chatFlow
  
  return {
    ...chatFlow,
    questions: chatFlow.questions.map(question =>
      question.id === questionId
        ? { ...question, text: newText }
        : question
    ),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Update answer text
 * @param {Object} chatFlow - The chat flow
 * @param {string} answerId - The answer ID
 * @param {string} newText - The new text
 * @returns {Object} Updated chat flow
 */
export const updateAnswerText = (chatFlow, answerId, newText) => {
  if (!chatFlow?.questions) return chatFlow
  
  return {
    ...chatFlow,
    questions: chatFlow.questions.map(question => ({
      ...question,
      answers: question.answers?.map(answer =>
        answer.id === answerId
          ? { ...answer, text: newText }
          : answer
      ) || []
    })),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Delete question
 * @param {Object} chatFlow - The chat flow
 * @param {string} questionId - The question ID
 * @returns {Object} Updated chat flow
 */
export const deleteQuestion = (chatFlow, questionId) => {
  if (!chatFlow?.questions) return chatFlow
  
  return {
    ...chatFlow,
    questions: chatFlow.questions.filter(q => q.id !== questionId),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Delete answer
 * @param {Object} chatFlow - The chat flow
 * @param {string} answerId - The answer ID
 * @returns {Object} Updated chat flow
 */
export const deleteAnswer = (chatFlow, answerId) => {
  if (!chatFlow?.questions) return chatFlow
  
  return {
    ...chatFlow,
    questions: chatFlow.questions.map(question => ({
      ...question,
      answers: question.answers?.filter(a => a.id !== answerId) || []
    })),
    updatedAt: new Date().toISOString()
  }
}
