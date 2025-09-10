import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  AlertCircle,
  Bell,
  BellOff,
  Settings,
  RefreshCw
} from 'lucide-react'
import ConversationList from './ConversationList'
import LiveChatInterface from './LiveChatInterface'
import CustomerInfo from './CustomerInfo'

const LiveChatDashboard = ({ currentUser }) => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for conversations
  useEffect(() => {
    const mockConversations = [
      {
        id: 'conv_001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@company.com',
        customerPhone: '+1 (555) 123-4567',
        customerCompany: 'TechCorp Inc.',
        status: 'active',
        priority: 'high',
        departmentId: 'technical',
        startedAt: '2024-01-15T10:30:00.000Z',
        lastActivity: '2024-01-15T11:15:00.000Z',
        lastMessage: 'I need help with my server configuration',
        messageCount: 8,
        unreadCount: 2,
        duration: '45m',
        messages: [
          {
            id: 'msg_001',
            text: 'Hello, I need help with my server configuration. The system keeps crashing.',
            type: 'customer',
            timestamp: '2024-01-15T10:30:00.000Z'
          },
          {
            id: 'msg_002',
            text: 'Hello John! I\'m sorry to hear about the server issues. Let me help you troubleshoot this.',
            type: 'agent',
            timestamp: '2024-01-15T10:32:00.000Z',
            agentId: currentUser.id,
            agentName: currentUser.name
          },
          {
            id: 'msg_003',
            text: 'Can you tell me what error messages you\'re seeing?',
            type: 'agent',
            timestamp: '2024-01-15T10:33:00.000Z',
            agentId: currentUser.id,
            agentName: currentUser.name
          },
          {
            id: 'msg_004',
            text: 'I\'m getting "Connection timeout" errors and the server becomes unresponsive.',
            type: 'customer',
            timestamp: '2024-01-15T10:35:00.000Z'
          },
          {
            id: 'msg_005',
            text: 'I see. This sounds like a resource issue. Let me check your server logs.',
            type: 'agent',
            timestamp: '2024-01-15T10:36:00.000Z',
            agentId: currentUser.id,
            agentName: currentUser.name
          }
        ]
      },
      {
        id: 'conv_002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@business.com',
        customerPhone: '+1 (555) 987-6543',
        customerCompany: 'Business Solutions LLC',
        status: 'waiting',
        priority: 'medium',
        departmentId: 'sales',
        startedAt: '2024-01-15T11:00:00.000Z',
        lastActivity: '2024-01-15T11:00:00.000Z',
        lastMessage: 'I\'m interested in your premium package',
        messageCount: 1,
        unreadCount: 1,
        waitTime: '15m',
        messages: [
          {
            id: 'msg_006',
            text: 'Hello, I\'m interested in your premium package. Can you tell me more about the features?',
            type: 'customer',
            timestamp: '2024-01-15T11:00:00.000Z'
          }
        ]
      },
      {
        id: 'conv_003',
        customerName: 'Mike Davis',
        customerEmail: 'mike.davis@enterprise.com',
        customerPhone: '+1 (555) 456-7890',
        customerCompany: 'Enterprise Corp',
        status: 'active',
        priority: 'urgent',
        departmentId: 'technical',
        startedAt: '2024-01-15T09:45:00.000Z',
        lastActivity: '2024-01-15T11:20:00.000Z',
        lastMessage: 'The system is completely down!',
        messageCount: 12,
        unreadCount: 3,
        duration: '1h 35m',
        messages: [
          {
            id: 'msg_007',
            text: 'URGENT: Our entire system is down! We need immediate assistance!',
            type: 'customer',
            timestamp: '2024-01-15T09:45:00.000Z'
          },
          {
            id: 'msg_008',
            text: 'I understand this is urgent, Mike. I\'m escalating this to our senior technical team immediately.',
            type: 'agent',
            timestamp: '2024-01-15T09:47:00.000Z',
            agentId: currentUser.id,
            agentName: currentUser.name
          }
        ]
      }
    ]

    setConversations(mockConversations)
  }, [currentUser])

  // Mock customer history data
  const getCustomerHistory = (customerEmail) => {
    return [
      {
        type: 'chat',
        date: '2024-01-10T14:30:00.000Z',
        description: 'Previous chat about billing questions',
        status: 'resolved'
      },
      {
        type: 'ticket',
        date: '2024-01-05T09:15:00.000Z',
        description: 'Support ticket #12345 - Login issues',
        status: 'closed'
      },
      {
        type: 'chat',
        date: '2023-12-28T16:45:00.000Z',
        description: 'Chat about feature requests',
        status: 'resolved'
      }
    ]
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    }
  }

  const handleSendMessage = async (conversationId, message) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                messages: [...conv.messages, message],
                lastActivity: message.timestamp,
                lastMessage: message.text,
                messageCount: conv.messageCount + 1
              }
            : conv
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseConversation = async (conversationId) => {
    try {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, status: 'closed' }
            : conv
        )
      )
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
      }
    } catch (error) {
      console.error('Error closing conversation:', error)
    }
  }

  const handleTransfer = (conversation) => {
    // TODO: Implement transfer functionality
    console.log('Transfer conversation:', conversation.id)
  }

  const handleEscalate = (conversation) => {
    // TODO: Implement escalation functionality
    console.log('Escalate conversation:', conversation.id)
  }

  const handleCreateTicket = (conversation) => {
    // TODO: Implement ticket creation from conversation
    console.log('Create ticket from conversation:', conversation.id)
  }

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
    // TODO: Implement actual notification toggle
  }

  // Calculate dashboard metrics
  const activeConversations = conversations.filter(c => c.status === 'active').length
  const waitingConversations = conversations.filter(c => c.status === 'waiting').length
  const urgentConversations = conversations.filter(c => c.priority === 'urgent').length
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="flex h-screen bg-base-100">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 border-r border-base-300">
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          onToggleNotifications={handleToggleNotifications}
          notificationsEnabled={notificationsEnabled}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <LiveChatInterface
            conversation={selectedConversation}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onCloseConversation={handleCloseConversation}
            onTransfer={handleTransfer}
            onEscalate={handleEscalate}
            onCreateTicket={handleCreateTicket}
          />
        </div>

        {/* Right Sidebar - Customer Info */}
        <CustomerInfo
          conversation={selectedConversation}
          customerHistory={selectedConversation ? getCustomerHistory(selectedConversation.customerEmail) : []}
          onTransfer={handleTransfer}
          onEscalate={handleEscalate}
          onCreateTicket={handleCreateTicket}
          currentUser={currentUser}
        />
      </div>

      {/* Dashboard Header Overlay */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-base-content/70">Online</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MessageCircle size={14} className="text-primary" />
              <span className="font-medium text-base-content">{activeConversations}</span>
              <span className="text-base-content/60">active</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-warning" />
              <span className="font-medium text-base-content">{waitingConversations}</span>
              <span className="text-base-content/60">waiting</span>
            </div>
            
            {urgentConversations > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle size={14} className="text-error" />
                <span className="font-medium text-error">{urgentConversations}</span>
                <span className="text-base-content/60">urgent</span>
              </div>
            )}
            
            {totalUnread > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                <span className="font-medium text-error">{totalUnread}</span>
                <span className="text-base-content/60">unread</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveChatDashboard
