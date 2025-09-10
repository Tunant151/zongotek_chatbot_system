import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { fetchUsers, authenticateUser } from '@/utils/database'

const AuthContext = createContext()

// Action types
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_IS_AUTHENTICATED: 'SET_IS_AUTHENTICATED',
  SET_LOADING: 'SET_LOADING',
  LOGOUT: 'LOGOUT',
  SET_AGENTS: 'SET_AGENTS',
  ADD_AGENT: 'ADD_AGENT',
  UPDATE_AGENT: 'UPDATE_AGENT',
  REMOVE_AGENT: 'REMOVE_AGENT'
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  agents: []
}

// Reducer function
function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload }
    
    case ACTIONS.SET_IS_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload }
    
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case ACTIONS.LOGOUT:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false 
      }
    
    case ACTIONS.SET_AGENTS:
      return { ...state, agents: action.payload }
    
    case ACTIONS.ADD_AGENT:
      return { 
        ...state, 
        agents: [...state.agents, action.payload]
      }
    
    case ACTIONS.UPDATE_AGENT:
      return {
        ...state,
        agents: state.agents.map(agent => 
          agent.id === action.payload.id ? action.payload : agent
        )
      }
    
    case ACTIONS.REMOVE_AGENT:
      return {
        ...state,
        agents: state.agents.filter(agent => agent.id !== action.payload)
      }
    
    default:
      return state
  }
}

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load authentication state from localStorage on mount and load agents from database
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('authUser')
      
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          dispatch({ type: ACTIONS.SET_USER, payload: user })
          dispatch({ type: ACTIONS.SET_IS_AUTHENTICATED, payload: true })
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('authUser')
        }
      }
      
      // Load agents from database
      try {
        const users = await fetchUsers()
        dispatch({ type: ACTIONS.SET_AGENTS, payload: users })
      } catch (error) {
        console.error('Error loading users:', error)
        // Fallback to localStorage if database fails
        const savedAgents = localStorage.getItem('authAgents')
        if (savedAgents) {
          dispatch({ type: ACTIONS.SET_AGENTS, payload: JSON.parse(savedAgents) })
        }
      }
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
    
    initializeAuth()
  }, [])

  // Save user to localStorage whenever authentication state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('authUser', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('authUser')
    }
  }, [state.user])

  // Save agents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('authAgents', JSON.stringify(state.agents))
  }, [state.agents])

  // Login function
  const login = async (username, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    
    try {
      const user = await authenticateUser(username, password)
      
      if (user) {
        const userWithoutPassword = { ...user }
        delete userWithoutPassword.password // Don't store password in user object
        
        dispatch({ type: ACTIONS.SET_USER, payload: userWithoutPassword })
        dispatch({ type: ACTIONS.SET_IS_AUTHENTICATED, payload: true })
        dispatch({ type: ACTIONS.SET_LOADING, payload: false })
        
        return { success: true, user: userWithoutPassword }
      } else {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false })
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  // Logout function
  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT })
  }

  // Clock in/out function
  const toggleAgentStatus = (agentId) => {
    const updatedAgents = state.agents.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          status: agent.status === 'active' ? 'inactive' : 'active'
        }
      }
      return agent
    })
    
    dispatch({ type: ACTIONS.SET_AGENTS, payload: updatedAgents })
    
    // Update current user if it's the logged-in agent
    if (state.user && state.user.id === agentId) {
      const updatedUser = updatedAgents.find(agent => agent.id === agentId)
      if (updatedUser) {
        const user = { ...updatedUser }
        delete user.password
        dispatch({ type: ACTIONS.SET_USER, payload: user })
      }
    }
  }

  // Context value
  const value = {
    ...state,
    login,
    logout,
    toggleAgentStatus,
    addAgent: (agent) => {
      const newAgent = {
        ...agent,
        id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'inactive'
      }
      dispatch({ type: ACTIONS.ADD_AGENT, payload: newAgent })
      return newAgent
    },
    updateAgent: (agent) => dispatch({ type: ACTIONS.UPDATE_AGENT, payload: agent }),
    removeAgent: (agentId) => dispatch({ type: ACTIONS.REMOVE_AGENT, payload: agentId }),
    
    // Helper functions
    getActiveAgents: () => state.agents.filter(agent => agent.status === 'active'),
    getAgentsByDepartment: (departmentId) => state.agents.filter(agent => agent.departmentId === departmentId),
    isAdmin: () => state.user?.role === 'admin',
    isAgent: () => state.user?.role === 'agent'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
