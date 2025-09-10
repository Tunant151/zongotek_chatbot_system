import React from 'react'
import { useAuth } from '@/context/AuthContext'
import LiveChatDashboard from '@/components/livechat/LiveChatDashboard'

const LiveChatPage = () => {
  const { user } = useAuth()

  // Redirect if user is not authenticated or doesn't have agent permissions
  if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="text-center text-base-content/60">
          <div className="w-24 h-24 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
            🔒
          </div>
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p>You need agent or admin permissions to access the live chat system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-base-100">
      <LiveChatDashboard currentUser={user} />
    </div>
  )
}

export default LiveChatPage
