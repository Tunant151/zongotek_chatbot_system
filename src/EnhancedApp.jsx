import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatProvider } from '@/context/ChatContext'
import { TicketProvider } from '@/context/TicketContext'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { EnhancedChatFlowProvider } from '@/context/EnhancedChatFlowContext'
import EnhancedZongotekChatWidget from '@/components/chat/EnhancedZongotekChatWidget'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/pages/auth/Login'
import AgentDashboard from '@/pages/dashboard/AgentDashboard'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'
import AgentsPage from '@/pages/dashboard/AgentsPage'
import TicketsPage from '@/pages/dashboard/TicketsPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import DemoPage from '@/pages/demo/DemoPage'
import EnhancedChatFlowBuilder from '@/pages/chatflow/EnhancedChatFlowBuilder'
import { useAuth } from '@/context/AuthContext'
import { Settings, Zap } from 'lucide-react'

// Import CSS
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Enhanced App component with multi-card chatbot system
function EnhancedAppContent() {
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
          <p className="text-base-content/70">Initializing Enhanced Zongotek System...</p>
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
            className="btn btn-primary btn-sm gap-2"
          >
            <Zap size={14} />
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
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm gap-2">
              <Settings size={16} />
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
            className="btn btn-outline btn-sm gap-2"
          >
            <Zap size={14} />
            Enhanced Demo
          </button>
        </div>
        
        {/* Enhanced Chat Widget available even when not logged in */}
        <EnhancedZongotekChatWidget />
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
            <Route path="/chatflow" element={<EnhancedChatFlowBuilder />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </>
        )}
        
        {/* Agent Routes */}
        {user?.role !== 'admin' && (
          <>
            <Route path="/" element={<AgentDashboard />} />
            <Route path="/tickets" element={<AgentDashboard />} />
            <Route path="/settings" element={<AgentDashboard />} />
          </>
        )}
        
        {/* Fallback - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Enhanced Chat Widget for authenticated users */}
      <EnhancedZongotekChatWidget />
    </MainLayout>
  )
}

// Enhanced App wrapper with providers
function EnhancedApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <EnhancedChatFlowProvider>
            <ChatProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground">
                  <EnhancedAppContent />
                </div>
              </BrowserRouter>
            </ChatProvider>
          </EnhancedChatFlowProvider>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default EnhancedApp
