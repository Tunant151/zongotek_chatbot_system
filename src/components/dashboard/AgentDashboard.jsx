import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTickets } from '@/context/TicketContext'
import { useChat } from '@/context/ChatContext'
import { Button } from '@/components/ui/button'
import { 
  LogOut, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Users,
  Activity
} from 'lucide-react'

const AgentDashboardComponent = () => {
  const { user, logout, toggleAgentStatus } = useAuth()
  const { 
    tickets, 
    activeTicket, 
    setActiveTicket, 
    updateTicket, 
    getTicketsByStatus,
    getNextTicket,
    metrics 
  } = useTickets()
  const { messages, addMessage, setIsOpen } = useChat()
  
  const [isActive, setIsActive] = useState(user?.status === 'active')

  // Toggle agent status
  const handleToggleStatus = () => {
    setIsActive(!isActive)
    toggleAgentStatus(user.id)
  }

  // Pick up next ticket
  const handlePickTicket = () => {
    const nextTicket = getNextTicket(user.departmentId)
    if (nextTicket) {
      setActiveTicket(nextTicket)
      updateTicket({
        ...nextTicket,
        status: 'picked',
        pickedAt: new Date().toISOString(),
        agentId: user.id
      })
    }
  }

  // Close current ticket
  const handleCloseTicket = () => {
    if (activeTicket) {
      updateTicket({
        ...activeTicket,
        status: 'closed',
        closedAt: new Date().toISOString()
      })
      setActiveTicket(null)
    }
  }

  // Send message to user
  const handleSendMessage = (text) => {
    if (activeTicket) {
      const message = {
        id: `msg_${Date.now()}`,
        text,
        type: 'agent',
        timestamp: new Date().toISOString(),
        agentId: user.id
      }
      
      addMessage(message)
      
      // Update ticket with new message
      updateTicket({
        ...activeTicket,
        messages: [...(activeTicket.messages || []), message]
      })
    }
  }

  const pendingTickets = getTicketsByStatus('pending')
  const myTickets = tickets.filter(ticket => ticket.agentId === user.id)

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-base-content">
                Agent Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-success' : 'bg-error'}`}></div>
                <span className="text-sm text-base-content/70">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-base-content/70">Welcome back,</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Status & Actions */}
          <div className="space-y-6">
            {/* Status Toggle */}
            <div className="bg-base-100 rounded-lg p-6 border border-base-300">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-primary" />
                Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agent Status</span>
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    onClick={handleToggleStatus}
                    className="min-w-[100px]"
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Department</span>
                  <span className="text-sm font-medium capitalize">{user?.departmentId || 'General'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-base-100 rounded-lg p-6 border border-base-300">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-primary" />
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <Button
                  onClick={handlePickTicket}
                  disabled={!isActive || pendingTickets.length === 0 || activeTicket}
                  className="w-full"
                >
                  <Clock className="mr-2" size={16} />
                  Pick Next Ticket ({pendingTickets.length})
                </Button>
                
                {activeTicket && (
                  <Button
                    onClick={handleCloseTicket}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Close Current Ticket
                  </Button>
                )}
              </div>
            </div>

            {/* My Tickets */}
            <div className="bg-base-100 rounded-lg p-6 border border-base-300">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="text-primary" />
                My Tickets
              </h2>
              
              <div className="space-y-2">
                {myTickets.slice(0, 5).map(ticket => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeTicket?.id === ticket.id
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                    }`}
                    onClick={() => setActiveTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {ticket.subject}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === 'picked' ? 'bg-warning/20 text-warning' :
                        ticket.status === 'closed' ? 'bg-success/20 text-success' :
                        'bg-error/20 text-error'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/70 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {myTickets.length === 0 && (
                  <p className="text-sm text-base-content/50 text-center py-4">
                    No tickets assigned yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Active Chat */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg border border-base-300 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-base-300">
                {activeTicket ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{activeTicket.subject}</h3>
                      <p className="text-sm text-base-content/70">
                        Ticket #{activeTicket.id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTicket.status === 'picked' ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}>
                        {activeTicket.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-2 text-base-content/50" size={32} />
                    <h3 className="font-semibold">No Active Chat</h3>
                    <p className="text-sm text-base-content/70">
                      Pick a ticket to start chatting
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTicket ? (
                  <div className="space-y-4">
                    {activeTicket.messages?.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          message.type === 'agent'
                            ? 'bg-primary text-primary-content'
                            : 'bg-base-200 text-base-content'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-base-content/50">
                    <div className="text-center">
                      <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Select a ticket to view messages</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              {activeTicket && (
                <div className="p-4 border-t border-base-300">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple chat input component
const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <Button onClick={handleSend} disabled={!message.trim()}>
        Send
      </Button>
    </div>
  )
}

export default AgentDashboardComponent
