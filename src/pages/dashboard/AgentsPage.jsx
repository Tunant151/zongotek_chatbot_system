import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTickets } from '@/context/TicketContext'
import AgentList from '@/components/agents/AgentList'
import AgentDetail from '@/components/agents/AgentDetail'

const AgentsPage = () => {
  const { user } = useAuth()
  const { departments } = useTickets()
  
  const [selectedAgent, setSelectedAgent] = useState(null)

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent)
  }

  const handleCloseAgentDetail = () => {
    setSelectedAgent(null)
  }

  const handleUpdateAgent = async (updatedAgent) => {
    try {
      // TODO: Implement agent update API call
      console.log('Update agent:', updatedAgent)
      // For now, just update the local state
      setSelectedAgent(updatedAgent)
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const handleCreateAgent = () => {
    // TODO: Implement agent creation modal
    console.log('Create new agent')
  }

  return (
    <div className="flex h-screen bg-base-100">
      {/* Left Panel - Agent List */}
      <div className={`${selectedAgent ? 'w-1/3' : 'w-full'} border-r border-base-300 transition-all duration-300`}>
        <AgentList
          onSelectAgent={handleSelectAgent}
          selectedAgent={selectedAgent}
          onCreateAgent={handleCreateAgent}
        />
      </div>

      {/* Right Panel - Agent Detail */}
      {selectedAgent && (
        <div className="flex-1">
          <AgentDetail
            agent={selectedAgent}
            onClose={handleCloseAgentDetail}
            departments={departments}
            onUpdateAgent={handleUpdateAgent}
            onToggleStatus={handleUpdateAgent}
            currentUser={user}
          />
        </div>
      )}
      
      {/* Empty State when no agent selected */}
      {!selectedAgent && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-base-200/50">
          <div className="text-center text-base-content/60">
            <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
              👥
            </div>
            <h3 className="text-lg font-medium mb-2">Select an agent</h3>
            <p>Choose an agent from the list to view their details and performance metrics.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentsPage
