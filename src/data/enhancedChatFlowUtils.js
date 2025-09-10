import { v4 as uuidv4 } from 'uuid';
import {
  createChatBotSystem,
  createStoryCard,
  createEnhancedQuestion,
  createEnhancedAnswer,
  createEnhancedAction,
  createConversationContext,
  ACTION_TYPES,
  addCardToSystem,
  findCardById,
  searchCards,
  convertCardToRuntime,
  processEnhancedAction
} from './enhancedChatFlowModel.js';

/**
 * Enhanced Chat Flow Utilities
 * Provides functions for managing multi-card chatbot systems
 */

/**
 * Creates a new chatbot system with default cards
 * @param {string} name - System name
 * @param {string} description - System description
 * @returns {Object} New chatbot system
 */
export function createNewChatBotSystem(name = 'New Chatbot System', description = '') {
  const system = createChatBotSystem(name, description);
  
  // Create default welcome card
  const welcomeCard = createDefaultWelcomeCard();
  const supportCard = createDefaultSupportCard();
  
  // Add cards to system
  let updatedSystem = addCardToSystem(system, welcomeCard);
  updatedSystem = addCardToSystem(updatedSystem, supportCard);
  
  // Set welcome card as default
  updatedSystem.settings.defaultCardId = welcomeCard.id;
  updatedSystem.settings.fallbackCardId = welcomeCard.id;
  
  return updatedSystem;
}

/**
 * Creates a default welcome card
 * @returns {Object} Welcome story card
 */
function createDefaultWelcomeCard() {
  const card = createStoryCard('Welcome', 'Initial greeting and navigation', 'general');
  card.tags = ['welcome', 'greeting', 'navigation'];
  card.priority = 1;
  
  // Create welcome question
  const welcomeQuestion = createEnhancedQuestion(
    '👋 Hi there! Welcome to Zongotek. I\'m your virtual assistant. How can I help you today?',
    'multiple_choice',
    { x: 100, y: 100 }
  );
  
  // Create answers with enhanced actions
  const servicesAnswer = createEnhancedAnswer('🛠️ Learn about our services');
  servicesAnswer.styling.isPrimary = true;
  servicesAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_CARD, {
      cardId: 'services_card', // Will be dynamically resolved
      searchQuery: 'services'
    })
  ];
  
  const supportAnswer = createEnhancedAnswer('🔧 Technical support');
  supportAnswer.styling.isSecondary = true;
  supportAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.SEARCH_AND_LOAD_CARD, {
      query: 'technical support',
      fallbackMessage: 'Let me connect you with our technical team.'
    })
  ];
  
  const pricingAnswer = createEnhancedAnswer('💰 Pricing information');
  pricingAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.SEARCH_AND_LOAD_CARD, {
      query: 'pricing plans',
      fallbackMessage: 'Here\'s information about our pricing plans.'
    })
  ];
  
  const humanAnswer = createEnhancedAnswer('👨‍💼 Talk to a human');
  humanAnswer.styling.color = 'success';
  humanAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.TRANSFER_TO_AGENT, {
      department: 'sales',
      message: 'I\'ll connect you with one of our team members right away.'
    })
  ];
  
  // Add answers to question
  welcomeQuestion.answers = [servicesAnswer, supportAnswer, pricingAnswer, humanAnswer];
  
  // Add question to card
  card.questions = [welcomeQuestion];
  card.startQuestionId = welcomeQuestion.id;
  
  return card;
}

/**
 * Creates a default support card
 * @returns {Object} Support story card
 */
function createDefaultSupportCard() {
  const card = createStoryCard('Technical Support', 'Technical assistance and troubleshooting', 'support');
  card.tags = ['support', 'technical', 'troubleshooting', 'help'];
  card.priority = 1;
  
  // Create support question
  const supportQuestion = createEnhancedQuestion(
    '🔧 I\'m here to help with technical issues. What type of problem are you experiencing?',
    'multiple_choice',
    { x: 100, y: 100 }
  );
  
  // Create support answers
  const loginAnswer = createEnhancedAnswer('🔐 Login or account issues');
  loginAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_QUESTION, {
      questionId: 'login_help_question'
    })
  ];
  
  const performanceAnswer = createEnhancedAnswer('⚡ Performance problems');
  performanceAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_QUESTION, {
      questionId: 'performance_help_question'
    })
  ];
  
  const bugAnswer = createEnhancedAnswer('🐛 Bug or error reporting');
  bugAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.TRANSFER_TO_AGENT, {
      department: 'technical',
      message: 'I\'ll connect you with a technical specialist to help with this bug.'
    })
  ];
  
  const backAnswer = createEnhancedAnswer('⬅️ Back to main menu');
  backAnswer.styling.isSecondary = true;
  backAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.RETURN_TO_PREVIOUS)
  ];
  
  supportQuestion.answers = [loginAnswer, performanceAnswer, bugAnswer, backAnswer];
  
  // Create login help question
  const loginHelpQuestion = createEnhancedQuestion(
    '🔐 For login issues, please try these steps first:\n\n1. Clear your browser cache\n2. Check your email for reset instructions\n3. Try using an incognito window\n\nDid this help resolve your issue?',
    'multiple_choice',
    { x: 100, y: 400 }
  );
  loginHelpQuestion.id = 'login_help_question';
  
  const resolvedAnswer = createEnhancedAnswer('✅ Yes, that fixed it!');
  resolvedAnswer.styling.color = 'success';
  resolvedAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.SEND_MESSAGE, {
      message: 'Great! I\'m glad I could help. Is there anything else you need assistance with?'
    }),
    createEnhancedAction(ACTION_TYPES.RETURN_TO_PREVIOUS)
  ];
  
  const notResolvedAnswer = createEnhancedAnswer('❌ Still having issues');
  notResolvedAnswer.styling.color = 'warning';
  notResolvedAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.TRANSFER_TO_AGENT, {
      department: 'technical',
      message: 'Let me connect you with a technical specialist who can help further.'
    })
  ];
  
  loginHelpQuestion.answers = [resolvedAnswer, notResolvedAnswer];
  
  // Create performance help question
  const performanceHelpQuestion = createEnhancedQuestion(
    '⚡ For performance issues, let\'s identify the problem:\n\nWhat specifically are you experiencing?',
    'multiple_choice',
    { x: 100, y: 700 }
  );
  performanceHelpQuestion.id = 'performance_help_question';
  
  const slowAnswer = createEnhancedAnswer('🐌 Slow loading times');
  const crashAnswer = createEnhancedAnswer('💥 Application crashes');
  const freezeAnswer = createEnhancedAnswer('🧊 System freezing');
  
  [slowAnswer, crashAnswer, freezeAnswer].forEach(answer => {
    answer.actions = [
      createEnhancedAction(ACTION_TYPES.TRANSFER_TO_AGENT, {
        department: 'technical',
        message: `I'll connect you with a specialist who can help with ${answer.text.toLowerCase()}.`
      })
    ];
  });
  
  performanceHelpQuestion.answers = [slowAnswer, crashAnswer, freezeAnswer];
  
  // Add all questions to card
  card.questions = [supportQuestion, loginHelpQuestion, performanceHelpQuestion];
  card.startQuestionId = supportQuestion.id;
  
  return card;
}

/**
 * Enhanced runtime conversion for multi-card system
 * @param {Object} system - The chatbot system
 * @param {Object} context - Current conversation context
 * @returns {Object} Runtime flows for all cards
 */
export function convertSystemToRuntime(system, context = null) {
  const runtimeFlows = {};
  
  system.cards.forEach(card => {
    const cardFlows = convertCardToRuntime(card, context);
    Object.assign(runtimeFlows, cardFlows);
  });
  
  return runtimeFlows;
}

/**
 * Process enhanced action with multi-card support
 * @param {Object} action - The action to process
 * @param {Object} context - Current conversation context
 * @param {Object} system - The chatbot system
 * @returns {Promise<Object>} Action result
 */
export async function processEnhancedActionWithSystem(action, context, system) {
  const result = await processEnhancedAction(action, context, system);
  
  // Handle special cases for multi-card system
  if (result.type === 'card_navigation') {
    // Update context with new card navigation
    const updatedContext = {
      ...context,
      currentCardId: result.targetCardId,
      currentQuestionId: result.targetQuestionId,
      analytics: {
        ...context.analytics,
        cardSwitches: context.analytics.cardSwitches + 1
      }
    };
    
    return {
      ...result,
      context: updatedContext
    };
  }
  
  return result;
}

/**
 * Find the best matching card for a query
 * @param {Object} system - The chatbot system
 * @param {string} query - Search query
 * @param {Object} context - Current conversation context
 * @returns {Object|null} Best matching card
 */
export function findBestMatchingCard(system, query, context = null) {
  const searchResults = searchCards(system, query, {
    includeQuestions: true,
    includeTags: true,
    fuzzyMatch: true
  });
  
  if (searchResults.length === 0) return null;
  
  // Score results based on various factors
  const scoredResults = searchResults.map(card => {
    let score = 0;
    
    // Name match bonus
    if (card.name.toLowerCase().includes(query.toLowerCase())) score += 10;
    
    // Tag match bonus
    if (card.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) score += 8;
    
    // Priority bonus (higher priority = higher score)
    score += (4 - card.priority);
    
    // Usage bonus (more used = higher score)
    score += Math.min(card.metadata.usage * 0.1, 5);
    
    // Success rate bonus
    score += card.metadata.successRate * 0.05;
    
    return { card, score };
  });
  
  // Sort by score and return the best match
  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults[0].card;
}

/**
 * Create a new story card with basic structure
 * @param {string} name - Card name
 * @param {string} description - Card description
 * @param {string} category - Card category
 * @returns {Object} New story card
 */
export function createNewStoryCard(name, description = '', category = 'general') {
  const card = createStoryCard(name, description, category);
  
  // Add a default question
  const defaultQuestion = createEnhancedQuestion(
    'This is a new conversation flow. What would you like to know?',
    'multiple_choice',
    { x: 100, y: 100 }
  );
  
  // Add default answers
  const helpAnswer = createEnhancedAnswer('I need help');
  helpAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.SEND_MESSAGE, {
      message: 'I\'m here to help! Please let me know what specific assistance you need.'
    })
  ];
  
  const backAnswer = createEnhancedAnswer('Go back');
  backAnswer.styling.isSecondary = true;
  backAnswer.actions = [
    createEnhancedAction(ACTION_TYPES.RETURN_TO_PREVIOUS)
  ];
  
  defaultQuestion.answers = [helpAnswer, backAnswer];
  card.questions = [defaultQuestion];
  card.startQuestionId = defaultQuestion.id;
  
  return card;
}

/**
 * Validate enhanced chatbot system
 * @param {Object} system - The chatbot system to validate
 * @returns {Object} Validation result
 */
export function validateChatBotSystem(system) {
  const errors = [];
  const warnings = [];
  
  // Check system structure
  if (!system.id) errors.push('System ID is required');
  if (!system.name) errors.push('System name is required');
  if (!Array.isArray(system.cards) || system.cards.length === 0) {
    errors.push('System must have at least one card');
  }
  
  // Check default card exists
  if (system.settings.defaultCardId) {
    const defaultCard = findCardById(system, system.settings.defaultCardId);
    if (!defaultCard) errors.push('Default card not found');
  }
  
  // Validate each card
  system.cards.forEach((card, index) => {
    const cardErrors = validateStoryCard(card);
    if (cardErrors.length > 0) {
      errors.push(`Card ${index + 1} (${card.name}): ${cardErrors.join(', ')}`);
    }
    
    // Check for orphaned questions (no way to reach them)
    if (card.questions.length > 1) {
      const reachableQuestions = new Set([card.startQuestionId]);
      
      // Find all questions reachable through navigation
      card.questions.forEach(question => {
        question.answers.forEach(answer => {
          answer.actions.forEach(action => {
            if (action.type === ACTION_TYPES.NAVIGATE_TO_QUESTION) {
              reachableQuestions.add(action.payload.questionId);
            }
          });
        });
      });
      
      const orphanedQuestions = card.questions.filter(q => !reachableQuestions.has(q.id));
      if (orphanedQuestions.length > 0) {
        warnings.push(`Card "${card.name}" has ${orphanedQuestions.length} unreachable questions`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single story card
 * @param {Object} card - The card to validate
 * @returns {Array} Array of error messages
 */
function validateStoryCard(card) {
  const errors = [];
  
  if (!card.id) errors.push('Card ID is required');
  if (!card.name) errors.push('Card name is required');
  if (!Array.isArray(card.questions) || card.questions.length === 0) {
    errors.push('Card must have at least one question');
  }
  
  // Check start question exists
  if (card.startQuestionId) {
    const startQuestion = card.questions.find(q => q.id === card.startQuestionId);
    if (!startQuestion) errors.push('Start question not found');
  }
  
  // Validate questions
  card.questions.forEach(question => {
    if (!question.text || question.text.trim() === '') {
      errors.push('Question text cannot be empty');
    }
    
    if (!Array.isArray(question.answers) || question.answers.length === 0) {
      errors.push('Each question must have at least one answer');
    }
    
    // Validate answers
    question.answers.forEach(answer => {
      if (!answer.text || answer.text.trim() === '') {
        errors.push('Answer text cannot be empty');
      }
      
      if (!Array.isArray(answer.actions) || answer.actions.length === 0) {
        errors.push('Each answer must have at least one action');
      }
    });
  });
  
  return errors;
}

/**
 * Get analytics for the chatbot system
 * @param {Object} system - The chatbot system
 * @param {Array} contexts - Array of conversation contexts
 * @returns {Object} Analytics data
 */
export function getSystemAnalytics(system, contexts = []) {
  const analytics = {
    totalCards: system.cards.length,
    totalQuestions: system.cards.reduce((sum, card) => sum + card.questions.length, 0),
    totalAnswers: system.cards.reduce((sum, card) => 
      sum + card.questions.reduce((qSum, question) => qSum + question.answers.length, 0), 0),
    
    // Usage analytics
    totalConversations: contexts.length,
    averageCardSwitches: contexts.length > 0 
      ? contexts.reduce((sum, ctx) => sum + ctx.analytics.cardSwitches, 0) / contexts.length 
      : 0,
    averageQuestionsAnswered: contexts.length > 0
      ? contexts.reduce((sum, ctx) => sum + ctx.analytics.questionsAnswered, 0) / contexts.length
      : 0,
    
    // Card analytics
    cardUsage: system.cards.map(card => ({
      cardId: card.id,
      name: card.name,
      usage: card.metadata.usage,
      successRate: card.metadata.successRate
    })),
    
    // Most popular paths
    popularPaths: getPopularPaths(contexts),
    
    // Drop-off analysis
    dropOffPoints: getDropOffAnalysis(contexts)
  };
  
  return analytics;
}

/**
 * Get popular conversation paths
 * @param {Array} contexts - Array of conversation contexts
 * @returns {Array} Popular paths
 */
function getPopularPaths(contexts) {
  const pathCounts = {};
  
  contexts.forEach(context => {
    const path = context.history
      .map(entry => `${entry.cardId}-${entry.questionId}`)
      .join(' -> ');
    
    if (path.length > 0) {
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    }
  });
  
  return Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 paths
}

/**
 * Analyze drop-off points in conversations
 * @param {Array} contexts - Array of conversation contexts
 * @returns {Array} Drop-off analysis
 */
function getDropOffAnalysis(contexts) {
  const dropOffCounts = {};
  
  contexts.forEach(context => {
    if (context.analytics.dropOffPoints && context.analytics.dropOffPoints.length > 0) {
      context.analytics.dropOffPoints.forEach(point => {
        const key = `${point.cardId}-${point.questionId}`;
        dropOffCounts[key] = (dropOffCounts[key] || 0) + 1;
      });
    }
  });
  
  return Object.entries(dropOffCounts)
    .map(([point, count]) => ({ point, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 drop-off points
}

export default {
  createNewChatBotSystem,
  createNewStoryCard,
  convertSystemToRuntime,
  processEnhancedActionWithSystem,
  findBestMatchingCard,
  validateChatBotSystem,
  getSystemAnalytics
};
