/**
 * Database utility functions for fetching data from JSON files
 */

// Import JSON data directly from src/data
import databaseData from '@/data/database.json'
import usersData from '@/data/users.json'
import ticketsData from '@/data/tickets.json'
import departmentsData from '@/data/departments.json'
import customersData from '@/data/customers.json'
import chatFlowTemplatesData from '@/data/chatFlowTemplates.json'
import settingsData from '@/data/settings.json'

/**
 * Generic function to get JSON data (now synchronous since we import directly)
 * @param {string} dataType - The data type to retrieve
 * @returns {any} The JSON data
 */
const getJsonData = (dataType) => {
  switch (dataType) {
    case 'database':
      return databaseData
    case 'users':
      return usersData
    case 'tickets':
      return ticketsData
    case 'departments':
      return departmentsData
    case 'customers':
      return customersData
    case 'chatFlowTemplates':
      return chatFlowTemplatesData
    case 'settings':
      return settingsData
    default:
      throw new Error(`Unknown data type: ${dataType}`)
  }
}

/**
 * Fetch users data
 * @returns {Array} Array of users
 */
export const fetchUsers = () => {
  const data = getJsonData('users')
  return data.users || []
}

/**
 * Fetch chat flows data
 * @returns {Object} Chat flows object with flows and sample responses
 */
export const fetchChatFlows = () => {
  return getJsonData('database')
}

/**
 * Fetch tickets data
 * @returns {Array} Array of tickets
 */
export const fetchTickets = () => {
  const data = getJsonData('tickets')
  return data.tickets || []
}

/**
 * Fetch departments data
 * @returns {Array} Array of departments
 */
export const fetchDepartments = () => {
  const data = getJsonData('departments')
  return data.departments || []
}

/**
 * Fetch customers data
 * @returns {Array} Array of customers
 */
export const fetchCustomers = () => {
  const data = getJsonData('customers')
  return data.customers || []
}

/**
 * Fetch chat flow templates data
 * @returns {Array} Array of chat flow templates
 */
export const fetchChatFlowTemplates = () => {
  const data = getJsonData('chatFlowTemplates')
  return data.templates || []
}

/**
 * Fetch settings data
 * @returns {Object} Settings object
 */
export const fetchSettings = () => {
  return getJsonData('settings')
}

/**
 * Find a user by username and password (for authentication)
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Object|null} User object or null if not found
 */
export const authenticateUser = (username, password) => {
  const users = fetchUsers()
  return users.find(user => 
    user.username === username && user.password === password
  ) || null
}

/**
 * Find a user by ID
 * @param {string} userId - The user ID
 * @returns {Object|null} User object or null if not found
 */
export const findUserById = (userId) => {
  const users = fetchUsers()
  return users.find(user => user.id === userId) || null
}

/**
 * Find tickets by status
 * @param {string} status - The ticket status
 * @returns {Array} Array of tickets with the specified status
 */
export const findTicketsByStatus = (status) => {
  const tickets = fetchTickets()
  return tickets.filter(ticket => ticket.status === status)
}

/**
 * Find tickets by department
 * @param {string} departmentId - The department ID
 * @returns {Array} Array of tickets for the specified department
 */
export const findTicketsByDepartment = (departmentId) => {
  const tickets = fetchTickets()
  return tickets.filter(ticket => ticket.departmentId === departmentId)
}

/**
 * Find tickets by agent
 * @param {string} agentId - The agent ID
 * @returns {Array} Array of tickets assigned to the specified agent
 */
export const findTicketsByAgent = (agentId) => {
  const tickets = fetchTickets()
  return tickets.filter(ticket => ticket.agentId === agentId)
}

/**
 * Find a department by ID
 * @param {string} departmentId - The department ID
 * @returns {Object|null} Department object or null if not found
 */
export const findDepartmentById = (departmentId) => {
  const departments = fetchDepartments()
  return departments.find(dept => dept.id === departmentId) || null
}

/**
 * Find a customer by ID
 * @param {string} customerId - The customer ID
 * @returns {Object|null} Customer object or null if not found
 */
export const findCustomerById = (customerId) => {
  const customers = fetchCustomers()
  return customers.find(customer => customer.id === customerId) || null
}

/**
 * Get chat flow by ID
 * @param {string} flowId - The flow ID
 * @returns {Object|null} Chat flow object or null if not found
 */
export const getChatFlowById = (flowId) => {
  const data = fetchChatFlows()
  return data.chatFlows.find(flow => flow.id === flowId) || null
}

/**
 * Get initial chat flow
 * @returns {Object|null} Initial chat flow object or null if not found
 */
export const getInitialChatFlow = () => {
  const data = fetchChatFlows()
  return data.chatFlows.find(flow => flow.isInitial === true) || data.chatFlows[0] || null
}

/**
 * Get chat flow templates by category
 * @param {string} category - The template category
 * @returns {Array} Array of templates in the specified category
 */
export const getChatFlowTemplatesByCategory = (category) => {
  const templates = fetchChatFlowTemplates()
  return templates.filter(template => template.category === category)
}

/**
 * Get public chat flow templates
 * @returns {Array} Array of public templates
 */
export const getPublicChatFlowTemplates = () => {
  const templates = fetchChatFlowTemplates()
  return templates.filter(template => template.isPublic === true)
}

/**
 * Calculate ticket metrics
 * @returns {Object} Object containing various ticket metrics
 */
export const getTicketMetrics = () => {
  const tickets = fetchTickets()
  const users = fetchUsers()
  
  const totalTickets = tickets.length
  const pendingTickets = tickets.filter(t => t.status === 'pending').length
  const activeTickets = tickets.filter(t => t.status === 'picked').length
  const closedTickets = tickets.filter(t => t.status === 'closed').length
  
  // Calculate closed today
  const today = new Date().toISOString().split('T')[0]
  const closedToday = tickets.filter(t => 
    t.status === 'closed' && t.closedAt && t.closedAt.startsWith(today)
  ).length
  
  // Calculate average wait time (simplified)
  const avgWaitTime = tickets.length > 0 ? 
    Math.round(tickets.reduce((acc, ticket) => {
      if (ticket.pickedAt && ticket.createdAt) {
        const waitTime = new Date(ticket.pickedAt) - new Date(ticket.createdAt)
        return acc + (waitTime / (1000 * 60)) // Convert to minutes
      }
      return acc
    }, 0) / tickets.length) : 0
  
  return {
    totalTickets,
    pendingTickets,
    activeTickets,
    closedTickets,
    closedToday,
    avgWaitTime,
    totalAgents: users.filter(u => u.role === 'agent').length
  }
}