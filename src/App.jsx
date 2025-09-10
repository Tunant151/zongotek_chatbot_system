import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatProvider } from '@/context/ChatContext'
import { TicketProvider } from '@/context/TicketContext'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ChatFlowProvider } from '@/context/ChatFlowContext'
import ZongotekChatWidget from '@/components/chat/ZongotekChatWidget'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/pages/auth/Login'
import AgentDashboard from '@/pages/dashboard/AgentDashboard'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'
import AgentsPage from '@/pages/dashboard/AgentsPage'
import TicketsPage from '@/pages/dashboard/TicketsPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import DemoPage from '@/pages/demo/DemoPage'
import ChatFlowBuilder from '@/pages/chatflow/ChatFlowBuilder'
import LiveChatPage from '@/pages/livechat/LiveChatPage'
import { useAuth } from '@/context/AuthContext'
import { Settings } from 'lucide-react'

// Import CSS
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Main App component with routing
function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { theme, themes, setTheme } = useTheme()
  const [showDemo, setShowDemo] = useState(false)

  // Set Zongotek theme on document load
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'zongotek')
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Show demo page if requested
  if (showDemo) {
    return (
      <div>
        <DemoPage />
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDemo(false)}
            className="btn btn-primary btn-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Login />
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          {/* Theme Selector */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              <Settings size={16} className="mr-2" />
              Theme
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto">
              {themes.map(themeName => (
                <li key={themeName}>
                  <button
                    onClick={() => setTheme(themeName)}
                    className={`capitalize ${theme === themeName ? 'active' : ''}`}
                  >
                    {themeName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setShowDemo(true)}
            className="btn btn-outline btn-sm"
          >
            View Demo
          </button>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <Routes>
        {/* Admin Routes */}
        {user?.role === 'admin' && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/chatflow" element={<ChatFlowBuilder />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/livechat" element={<LiveChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </>
        )}
        
        {/* Agent Routes */}
        {user?.role !== 'admin' && (
          <>
            <Route path="/" element={<AgentDashboard />} />
            <Route path="/tickets" element={<AgentDashboard />} />
            <Route path="/livechat" element={<LiveChatPage />} />
            <Route path="/settings" element={<AgentDashboard />} />
          </>
        )}
        
        {/* Fallback - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}

// Main App wrapper with providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <ChatFlowProvider>
            <ChatProvider>
              {/* Import BrowserRouter from react-router-dom */}
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground">
                  <AppContent />
                  <ZongotekChatWidget />
                </div>
              </BrowserRouter>
            </ChatProvider>
          </ChatFlowProvider>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App