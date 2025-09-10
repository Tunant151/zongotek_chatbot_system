import React from 'react'
import { Home, MessageCircle, Send } from 'lucide-react'

const WelcomeScreen = ({ onStartChat, onClose, width = 320, height = 384 }) => {
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  return (
    <div 
      className="bg-[#262626] border border-[#404040] rounded-[18px] shadow-xl flex flex-col overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-b from-[#FFD700] to-[#E6B800] text-white rounded-t-[18px]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight">
              How can we help<br />
              you today? <span className="text-3xl">👋</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="px-1 ml-4 text-white/80 hover:text-white"
            title="Minimize"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Whitney AI Introduction Card */}
        <div className="bg-[#343434] rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-[#262626]">
                <img 
                  src="./aibot.png"
                  alt="Whitney"
                  className="hidden object-cover w-full h-full"
                />
                <h1 className="text-2xl font-bold leading-tight text-red-500">
                  Whitney Ai
                </h1>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22C55E] rounded-full border-2 border-[#343434]"></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">Whitney Ai</span>
                <span className="text-xs text-gray-400">• {currentTime.toLowerCase().replace(/\s/g, '')}</span>
              </div>
              <p className="text-sm text-white">Hi, let us know if you have any questions.</p>
            </div>
          </div>

          {/* In-card CTA */}
          <button
            onClick={onStartChat}
            className="w-full bg-[#FFD700] text-[#333333] py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#FFEB66] transition-colors"
          >
            <span>Chat now</span>
            <Send size={18} />
          </button>
        </div>

        {/* Spacer (replace large center button) */}
        <div className="flex-1" />
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        {/* Bottom navigation bar */}
        <div className="bg-[#3A3A3A] rounded-full px-8 py-4 flex items-center justify-between shadow-lg">
          <button className="flex flex-col items-center gap-1 text-white">
            <Home size={20} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70">
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Chat</span>
          </button>
        </div>

        {/* Powered by LiveChat (below nav) */}
        <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
          <span className="mr-1">Powered by</span>
          <div className="w-4 h-4 bg-[#FF6B35] rounded flex items-center justify-center mr-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span>LiveChat</span>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
