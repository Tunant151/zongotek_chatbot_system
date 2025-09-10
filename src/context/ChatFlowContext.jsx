import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { updateChatFlowStatus } from '@/data/chatFlowModel'
import { validateChatFlow, convertChatFlowToRuntime } from '@/data/chatFlowUtils'
import { fetchChatFlows } from '@/utils/database'

const ChatFlowContext = createContext()

// Action types
const ACTIONS = {
  SET_CHAT_FLOWS: 'SET_CHAT_FLOWS',
  ADD_CHAT_FLOW: 'ADD_CHAT_FLOW',
  UPDATE_CHAT_FLOW: 'UPDATE_CHAT_FLOW',
  DELETE_CHAT_FLOW: 'DELETE_CHAT_FLOW',
  SET_ACTIVE_CHAT_FLOW: 'SET_ACTIVE_CHAT_FLOW',
  SET_CURRENT_EDITING_FLOW: 'SET_CURRENT_EDITING_FLOW',
  CLEAR_CURRENT_EDITING_FLOW: 'CLEAR_CURRENT_EDITING_FLOW'
}

// Initial state
const initialState = {
  chatFlows: [],
  activeChatFlowId: null,
  currentEditingFlow: null,
  runtimeFlows: {}
}

// Reducer function
function chatFlowReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CHAT_FLOWS:
      return { 
        ...state, 
        chatFlows: action.payload,
        // Update runtime flows when setting chat flows
        runtimeFlows: action.payload.reduce((flows, flow) => {
          if (flow.status === 'active') {
            return { ...flows, ...convertChatFlowToRuntime(flow) }
          }
          return flows
        }, {})
      }
    
    case ACTIONS.ADD_CHAT_FLOW:
      return { 
        ...state, 
        chatFlows: [...state.chatFlows, action.payload] 
      }
    
    case ACTIONS.UPDATE_CHAT_FLOW: {
      const updatedFlows = state.chatFlows.map(flow => 
        flow.id === action.payload.id ? action.payload : flow
      )
      
      // Update runtime flows if the updated flow is active
      let updatedRuntimeFlows = { ...state.runtimeFlows }
      if (action.payload.status === 'active') {
        updatedRuntimeFlows = { 
          ...updatedRuntimeFlows, 
          ...convertChatFlowToRuntime(action.payload) 
        }
      }
      
      return { 
        ...state, 
        chatFlows: updatedFlows,
        runtimeFlows: updatedRuntimeFlows
      }
    }
    
    case ACTIONS.DELETE_CHAT_FLOW: {
      const filteredFlows = state.chatFlows.filter(flow => flow.id !== action.payload)
      
      // Remove from runtime flows if it was active
      const deletedFlow = state.chatFlows.find(flow => flow.id === action.payload)
      let updatedRuntimeFlows = { ...state.runtimeFlows }
      
      if (deletedFlow && deletedFlow.status === 'active') {
        // Remove all questions of this flow from runtime
        deletedFlow.questions.forEach(question => {
          delete updatedRuntimeFlows[question.id]
        })
      }
      
      return { 
        ...state, 
        chatFlows: filteredFlows,
        runtimeFlows: updatedRuntimeFlows,
        // Clear current editing flow if it was deleted
        currentEditingFlow: state.currentEditingFlow?.id === action.payload 
          ? null 
          : state.currentEditingFlow
      }
    }
    
    case ACTIONS.SET_ACTIVE_CHAT_FLOW: {
      // First, deactivate all flows
      const updatedFlows = state.chatFlows.map(flow => {
        if (flow.id === action.payload) {
          return updateChatFlowStatus(flow, 'active')
        } else if (flow.status === 'active') {
          return updateChatFlowStatus(flow, 'inactive')
        }
        return flow
      })
      
      // Update runtime flows with the newly activated flow
      const activeFlow = updatedFlows.find(flow => flow.id === action.payload)
      const runtimeFlows = activeFlow ? convertChatFlowToRuntime(activeFlow) : {}
      
      return { 
        ...state, 
        chatFlows: updatedFlows,
        activeChatFlowId: action.payload,
        runtimeFlows
      }
    }
    
    case ACTIONS.SET_CURRENT_EDITING_FLOW:
      return { ...state, currentEditingFlow: action.payload }
    
    case ACTIONS.CLEAR_CURRENT_EDITING_FLOW:
      return { ...state, currentEditingFlow: null }
    
    default:
      return state
  }
}

// ChatFlow provider component
export function ChatFlowProvider({ children }) {
  const [state, dispatch] = useReducer(chatFlowReducer, initialState)

  // Load chat flows from database on mount
  useEffect(() => {
    const loadChatFlows = async () => {
      try {
        // First try to load from database
        const dbData = await fetchChatFlows()
        if (dbData && dbData.chatFlows) {
          // Convert database format to editor format if needed
          const convertedFlows = dbData.chatFlows.map(flow => {
            // If it's already in the correct format, return as is
            if (flow.questions) {
              return flow
            }
            // Convert from database format (message/options) to editor format (questions/answers)
            const convertedFlow = {
              id: flow.id,
              name: flow.id.charAt(0).toUpperCase() + flow.id.slice(1),
              description: flow.message || '',
              status: 'inactive',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              questions: [],
              startQuestionId: null
            }
            
            // Convert message/options to question/answers format
            if (flow.message && flow.options) {
              const question = {
                id: `q_${flow.id}`,
                text: flow.message,
                type: 'text',
                isInitial: flow.isInitial || false,
                position: { x: 250, y: 100 },
                answers: flow.options.map((option, index) => ({
                  id: `a_${flow.id}_${index}`,
                  text: option.text,
                  isPrimary: index === 0,
                  isSecondary: index === 1,
                  actions: [
                    {
                      id: `action_${flow.id}_${index}`,
                      type: 'navigate_to_question',
                      payload: {
                        questionId: option.value
                      }
                    }
                  ]
                }))
              }
              convertedFlow.questions.push(question)
              convertedFlow.startQuestionId = question.id
            }
            
            return convertedFlow
          })
          
          dispatch({ type: ACTIONS.SET_CHAT_FLOWS, payload: convertedFlows })
          
          // Set active flow ID if there's an active flow
          const activeFlow = convertedFlows.find(flow => flow.status === 'active')
          if (activeFlow) {
            dispatch({ type: ACTIONS.SET_ACTIVE_CHAT_FLOW, payload: activeFlow.id })
          }
        }
      } catch (error) {
        console.error('Error loading chat flows from database:', error)
        
        // Fallback to localStorage
        const savedFlows = localStorage.getItem('chatFlows')
        if (savedFlows) {
          try {
            const parsedFlows = JSON.parse(savedFlows)
            dispatch({ type: ACTIONS.SET_CHAT_FLOWS, payload: parsedFlows })
            
            // Set active flow ID if there's an active flow
            const activeFlow = parsedFlows.find(flow => flow.status === 'active')
            if (activeFlow) {
              dispatch({ type: ACTIONS.SET_ACTIVE_CHAT_FLOW, payload: activeFlow.id })
            }
          } catch (parseError) {
            console.error('Error parsing saved chat flows:', parseError)
          }
        }
      }
    }
    
    loadChatFlows()
  }, [])

  // Save chat flows to localStorage whenever they change
  useEffect(() => {
    if (state.chatFlows.length > 0) {
      localStorage.setItem('chatFlows', JSON.stringify(state.chatFlows))
    }
  }, [state.chatFlows])

  // Context value
  const value = {
    ...state,
    setChatFlows: (flows) => dispatch({ type: ACTIONS.SET_CHAT_FLOWS, payload: flows }),
    addChatFlow: (flow) => dispatch({ type: ACTIONS.ADD_CHAT_FLOW, payload: flow }),
    updateChatFlow: (flow) => dispatch({ type: ACTIONS.UPDATE_CHAT_FLOW, payload: flow }),
    deleteChatFlow: (flowId) => dispatch({ type: ACTIONS.DELETE_CHAT_FLOW, payload: flowId }),
    setActiveChatFlow: (flowId) => dispatch({ type: ACTIONS.SET_ACTIVE_CHAT_FLOW, payload: flowId }),
    setCurrentEditingFlow: (flow) => dispatch({ type: ACTIONS.SET_CURRENT_EDITING_FLOW, payload: flow }),
    clearCurrentEditingFlow: () => dispatch({ type: ACTIONS.CLEAR_CURRENT_EDITING_FLOW })
  }

  return (
    <ChatFlowContext.Provider value={value}>
      {children}
    </ChatFlowContext.Provider>
  )
}

// Custom hook to use chat flow context
export function useChatFlow() {
  const context = useContext(ChatFlowContext)
  if (!context) {
    throw new Error('useChatFlow must be used within a ChatFlowProvider')
  }
  return context
}