import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { fetchTickets, fetchDepartments, getTicketMetrics } from '@/utils/database'

const TicketContext = createContext()

// Action types
const ACTIONS = {
  SET_TICKETS: 'SET_TICKETS',
  ADD_TICKET: 'ADD_TICKET',
  UPDATE_TICKET: 'UPDATE_TICKET',
  REMOVE_TICKET: 'REMOVE_TICKET',
  SET_ACTIVE_TICKET: 'SET_ACTIVE_TICKET',
  SET_DEPARTMENTS: 'SET_DEPARTMENTS',
  SET_AGENTS: 'SET_AGENTS',
  SET_METRICS: 'SET_METRICS',
  SET_LOADING: 'SET_LOADING'
}

// Initial state
const initialState = {
  tickets: [],
  activeTicket: null,
  departments: [],
  agents: [],
  metrics: {
    totalAgents: 0,
    pendingTickets: 0,
    closedToday: 0,
    avgWaitTime: 0
  },
  isLoading: false
}

// Reducer function
function ticketReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TICKETS:
      return { ...state, tickets: action.payload }
    
    case ACTIONS.ADD_TICKET:
      return { 
        ...state, 
        tickets: [...state.tickets, action.payload]
      }
    
    case ACTIONS.UPDATE_TICKET:
      return {
        ...state,
        tickets: state.tickets.map(ticket => 
          ticket.id === action.payload.id ? action.payload : ticket
        )
      }
    
    case ACTIONS.REMOVE_TICKET:
      return {
        ...state,
        tickets: state.tickets.filter(ticket => ticket.id !== action.payload)
      }
    
    case ACTIONS.SET_ACTIVE_TICKET:
      return { ...state, activeTicket: action.payload }
    
    case ACTIONS.SET_DEPARTMENTS:
      return { ...state, departments: action.payload }
    
    case ACTIONS.SET_AGENTS:
      return { ...state, agents: action.payload }
    
    case ACTIONS.SET_METRICS:
      return { ...state, metrics: action.payload }
    
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    default:
      return state
  }
}

// Ticket provider component
export function TicketProvider({ children }) {
  const [state, dispatch] = useReducer(ticketReducer, initialState)

  // Load data from database on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load tickets from database
        const tickets = await fetchTickets()
        dispatch({ type: ACTIONS.SET_TICKETS, payload: tickets })
        
        // Load departments from database
        const departments = await fetchDepartments()
        dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: departments })
        
        // Load metrics from database
        const metrics = await getTicketMetrics()
        dispatch({ type: ACTIONS.SET_METRICS, payload: metrics })
        
      } catch (error) {
        console.error('Error loading ticket data:', error)
        // Fallback to localStorage if database fails
        const savedTickets = localStorage.getItem('tickets')
        const savedDepartments = localStorage.getItem('departments')
        
        if (savedTickets) {
          dispatch({ type: ACTIONS.SET_TICKETS, payload: JSON.parse(savedTickets) })
        }
        
        if (savedDepartments) {
          dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: JSON.parse(savedDepartments) })
        }
      }
    }
    
    initializeData()
  }, [])

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(state.tickets))
  }, [state.tickets])

  // Save departments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(state.departments))
  }, [state.departments])

  // Save agents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('agents', JSON.stringify(state.agents))
  }, [state.agents])

  // Update metrics whenever tickets change (metrics are calculated in database utility)
  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const metrics = await getTicketMetrics()
        dispatch({ type: ACTIONS.SET_METRICS, payload: metrics })
      } catch (error) {
        console.error('Error updating metrics:', error)
        // Fallback to local calculation
        const metrics = {
          totalAgents: state.agents.filter(agent => agent.status === 'active').length,
          pendingTickets: state.tickets.filter(ticket => ticket.status === 'pending').length,
          closedToday: state.tickets.filter(ticket => 
            ticket.status === 'closed' && 
            new Date(ticket.closedAt).toDateString() === new Date().toDateString()
          ).length,
          avgWaitTime: calculateAverageWaitTime(state.tickets)
        }
        dispatch({ type: ACTIONS.SET_METRICS, payload: metrics })
      }
    }
    
    updateMetrics()
  }, [state.tickets, state.agents])

  // Helper function to calculate average wait time
  const calculateAverageWaitTime = (tickets) => {
    const closedTickets = tickets.filter(ticket => ticket.status === 'closed' && ticket.pickedAt && ticket.closedAt)
    
    if (closedTickets.length === 0) return 0
    
    const totalWaitTime = closedTickets.reduce((total, ticket) => {
      const waitTime = new Date(ticket.pickedAt) - new Date(ticket.createdAt)
      return total + waitTime
    }, 0)
    
    return Math.round(totalWaitTime / closedTickets.length / 1000 / 60) // Convert to minutes
  }

  // Context value
  const value = {
    ...state,
    addTicket: (ticket) => {
      const newTicket = {
        ...ticket,
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
      dispatch({ type: ACTIONS.ADD_TICKET, payload: newTicket })
      return newTicket
    },
    updateTicket: (ticket) => dispatch({ type: ACTIONS.UPDATE_TICKET, payload: ticket }),
    removeTicket: (ticketId) => dispatch({ type: ACTIONS.REMOVE_TICKET, payload: ticketId }),
    setActiveTicket: (ticket) => dispatch({ type: ACTIONS.SET_ACTIVE_TICKET, payload: ticket }),
    setDepartments: (departments) => dispatch({ type: ACTIONS.SET_DEPARTMENTS, payload: departments }),
    setAgents: (agents) => dispatch({ type: ACTIONS.SET_AGENTS, payload: agents }),
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    
    // Helper functions
    getTicketsByStatus: (status) => state.tickets.filter(ticket => ticket.status === status),
    getTicketsByDepartment: (departmentId) => state.tickets.filter(ticket => ticket.departmentId === departmentId),
    getActiveAgents: () => state.agents.filter(agent => agent.status === 'active'),
    getNextTicket: (departmentId) => {
      const pendingTickets = state.tickets.filter(ticket => 
        ticket.status === 'pending' && 
        (!departmentId || ticket.departmentId === departmentId)
      )
      return pendingTickets.length > 0 ? pendingTickets[0] : null
    }
  }

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  )
}

// Custom hook to use ticket context
export function useTickets() {
  const context = useContext(TicketContext)
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider')
  }
  return context
}
