import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Users, 
  Settings, 
  BarChart3,
  Bot,
  Headphones
} from 'lucide-react'

const DemoPageComponent = () => {
  const [theme, setTheme] = useState('light')

  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 
    'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 
    'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 
    'business', 'acid', 'lemonade', 'night', 'coffee', 'winter', 
    'dim', 'nord', 'sunset'
  ]

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zongotek-gold rounded-lg flex items-center justify-center">
                <Bot className="text-zongotek-black" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zongotek-black">Zongotek Chat Demo</h1>
                <p className="text-sm text-zongotek-black/70">Live Chat & Support System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
                        onClick={() => changeTheme(themeName)}
                        className={`capitalize ${theme === themeName ? 'active' : ''}`}
                      >
                        {themeName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-zongotek-black">
            Welcome to <span className="text-zongotek-gold">Zongotek</span>
          </h2>
          <p className="text-xl text-zongotek-black/70 mb-8 max-w-2xl mx-auto">
            Experience our advanced chatbot and live support system. 
            Click the chat bubble in the bottom right to start a conversation!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-zongotek-gold hover:bg-zongotek-gold-dark text-zongotek-black font-semibold">
              <MessageCircle size={20} className="mr-2" />
              Start Chat
            </Button>
            <Button size="lg" className="border-zongotek-gold text-zongotek-gold hover:bg-zongotek-gold hover:text-zongotek-black">
              <Headphones size={20} className="mr-2" />
              Live Support
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-zongotek-black">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-zongotek-white p-6 rounded-lg border border-zongotek-gray-light text-center shadow-sm">
              <div className="w-16 h-16 bg-zongotek-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-zongotek-gold" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-zongotek-black">AI Chatbot</h4>
              <p className="text-zongotek-black/70">
                Intelligent chatbot with pre-programmed flows and automatic responses
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zongotek-white p-6 rounded-lg border border-zongotek-gray-light text-center shadow-sm">
              <div className="w-16 h-16 bg-zongotek-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-zongotek-gold" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-zongotek-black">Live Agents</h4>
              <p className="text-zongotek-black/70">
                Seamless transfer to human agents when needed
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zongotek-white p-6 rounded-lg border border-zongotek-gray-light text-center shadow-sm">
              <div className="w-16 h-16 bg-zongotek-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-zongotek-gold" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-zongotek-black">Analytics</h4>
              <p className="text-zongotek-black/70">
                Real-time metrics and performance tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Content */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Try It Out</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                  <h4 className="text-lg font-semibold mb-3">Chatbot Features</h4>
                  <ul className="space-y-2 text-sm text-base-content/70">
                    <li>• Pre-programmed conversation flows</li>
                    <li>• Button-based navigation</li>
                    <li>• Automatic agent transfer</li>
                    <li>• Session persistence</li>
                    <li>• Chat history export</li>
                  </ul>
                </div>

                <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                  <h4 className="text-lg font-semibold mb-3">Agent Dashboard</h4>
                  <ul className="space-y-2 text-sm text-base-content/70">
                    <li>• Real-time ticket management</li>
                    <li>• Department-based routing</li>
                    <li>• FIFO queue system</li>
                    <li>• Status indicators</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                  <h4 className="text-lg font-semibold mb-3">Admin Features</h4>
                  <ul className="space-y-2 text-sm text-base-content/70">
                    <li>• Agent management</li>
                    <li>• Department configuration</li>
                    <li>• System analytics</li>
                    <li>• Ticket monitoring</li>
                    <li>• Performance reports</li>
                  </ul>
                </div>

                <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                  <h4 className="text-lg font-semibold mb-3">Technical Features</h4>
                  <ul className="space-y-2 text-sm text-base-content/70">
                    <li>• Responsive design</li>
                    <li>• Theme customization</li>
                    <li>• Real-time updates</li>
                    <li>• Local storage</li>
                    <li>• Modern React stack</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">How to Test</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Start a Chat</h4>
                  <p className="text-base-content/70">Click the chat bubble in the bottom right corner to open the chat widget</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Try the Bot</h4>
                  <p className="text-base-content/70">Use the button options to navigate through different topics and flows</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Request Live Agent</h4>
                  <p className="text-base-content/70">Click "Talk to Human" or type keywords like "agent" or "human" to transfer</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Test Agent Dashboard</h4>
                  <p className="text-base-content/70">Login as an agent (agent1/agent123) to see the live chat interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-base-content/70">
            © 2024 Zongotek. Built with React, Tailwind CSS, and DaisyUI.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DemoPageComponent
