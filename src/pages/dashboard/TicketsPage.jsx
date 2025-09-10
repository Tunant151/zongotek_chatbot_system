import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTickets } from '@/context/TicketContext'
import TicketList from '@/components/tickets/TicketList'
import TicketDetail from '@/components/tickets/TicketDetail'

const TicketsPage = () => {
  const { user } = useAuth()
  const { 
    updateTicket, 
    agents = [], 
    setLoading 
  } = useTickets()
  
  const [selectedTicket, setSelectedTicket] = useState(null)

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
  }

  const handleCloseTicketDetail = () => {
    setSelectedTicket(null)
  }

  const handleAssignAgent = async (ticketId, agentId) => {
    setLoading(true)
    try {
      const ticket = selectedTicket
      const updatedTicket = {
        ...ticket,
        agentId,
        status: 'picked',
        pickedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await updateTicket(updatedTicket)
      setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error assigning agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignAgent = async (ticketId) => {
    setLoading(true)
    try {
      const ticket = selectedTicket
      const updatedTicket = {
        ...ticket,
        agentId: null,
        status: 'pending',
        pickedAt: null,
        updatedAt: new Date().toISOString()
      }
      
      await updateTicket(updatedTicket)
      setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error unassigning agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePickUpTicket = async (ticketId, agentId) => {
    setLoading(true)
    try {
      const ticket = selectedTicket
      const updatedTicket = {
        ...ticket,
        agentId,
        status: 'picked',
        pickedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await updateTicket(updatedTicket)
      setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error picking up ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTicket = async (updatedTicket) => {
    setLoading(true)
    try {
      await updateTicket(updatedTicket)
      setSelectedTicket(updatedTicket)
    } catch (error) {
      console.error('Error updating ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = () => {
    // TODO: Implement ticket creation modal
    console.log('Create new ticket')
  }

  return (
    <div className="flex h-screen bg-base-100">
      {/* Left Panel - Ticket List */}
      <div className={`${selectedTicket ? 'w-1/3' : 'w-full'} border-r border-base-300 transition-all duration-300`}>
        <TicketList
          onSelectTicket={handleSelectTicket}
          selectedTicket={selectedTicket}
          onCreateTicket={handleCreateTicket}
        />
      </div>

      {/* Right Panel - Ticket Detail */}
      {selectedTicket && (
        <div className="flex-1">
          <TicketDetail
            ticket={selectedTicket}
            onClose={handleCloseTicketDetail}
            agents={agents}
            currentUser={user}
            onAssignAgent={handleAssignAgent}
            onUnassignAgent={handleUnassignAgent}
            onPickUpTicket={handlePickUpTicket}
            onUpdateTicket={handleUpdateTicket}
          />
        </div>
      )}
      
      {/* Empty State when no ticket selected */}
      {!selectedTicket && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-base-200/50">
          <div className="text-center text-base-content/60">
            <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
              🎫
            </div>
            <h3 className="text-lg font-medium mb-2">Select a ticket</h3>
            <p>Choose a ticket from the list to view its details and start a conversation.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsPage
