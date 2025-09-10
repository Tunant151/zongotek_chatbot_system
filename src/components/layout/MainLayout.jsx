import React, { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import { 
  Settings, 
  Home, 
  MessageSquare, 
  Users, 
  Ticket, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  ChevronDown,
  MessageCircle
} from 'lucide-react'

const MainLayout = ({ children }) => {
  const { theme, themes, setTheme, toggleDarkMode, isDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Check if current path matches the given path
  const isActive = (path) => {
    return location.pathname === path
  }

  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  // Define the system sections for navigation
  const systemSections = [
    { id: 'dashboard', name: 'Dashboard', path: '/', icon: <Home size={18} /> },
    { id: 'chatflow', name: 'Chat Flow Builder', path: '/chatflow', icon: <MessageSquare size={18} />, adminOnly: true },
    { id: 'agents', name: 'Agents', path: '/agents', icon: <Users size={18} />, adminOnly: true },
    { id: 'tickets', name: 'Tickets', path: '/tickets', icon: <Ticket size={18} /> },
    { id: 'livechat', name: 'Live Chat', path: '/livechat', icon: <MessageCircle size={18} /> },
    { id: 'settings', name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ]

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Sidebar - Desktop */}
      <aside 
        className={`bg-base-200 border-r border-base-300 h-screen sticky top-0 transition-all duration-300 hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex justify-between items-center p-4">
          {sidebarOpen ? (
            <div className="flex items-center">
              <div className="flex justify-center items-center mr-2 w-8 h-8 rounded-full bg-primary text-primary-content">
                <span className="font-bold">Z</span>
              </div>
              <h1 className="text-xl font-bold">Zongotek</h1>
            </div>
          ) : (
            <div className="flex justify-center items-center mx-auto w-8 h-8 rounded-full bg-primary text-primary-content">
              <span className="font-bold">Z</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="btn btn-sm btn-ghost btn-square"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="mt-4">
          <ul className="menu menu-md">
            {systemSections.map((section) => {
              // Skip admin-only sections for non-admin users
              if (section.adminOnly && user?.role !== 'admin') return null;
              
              return (
                <li key={section.id}>
                  <Link 
                    to={section.path} 
                    className={`${isActive(section.path) ? 'active' : ''}`}
                    title={section.name}
                  >
                    {section.icon}
                    {sidebarOpen && <span>{section.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Theme Selector */}
        {sidebarOpen && (
          <div className="absolute right-0 left-0 bottom-20 p-4">
            <div className="w-full dropdown dropdown-top">
              <div tabIndex={0} role="button" className="w-full btn btn-outline btn-sm">
                <Settings size={16} className="mr-2" />
                Theme
                <ChevronDown size={16} />
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
          </div>
        )}

        {/* User Info */}
        <div className="absolute right-0 bottom-0 left-0 p-4 border-t border-base-300">
          {sidebarOpen ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-2 avatar placeholder">
                  <div className="w-8 rounded-full bg-neutral text-neutral-content">
                    <span>{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs capitalize opacity-70">{user?.role || 'User'}</p>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-ghost btn-sm btn-square"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className="avatar placeholder">
                <div className="w-8 rounded-full bg-neutral text-neutral-content">
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-ghost btn-sm btn-square"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={toggleMobileMenu} 
          className="btn btn-primary btn-circle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden">
          <div className="overflow-y-auto w-64 h-full bg-base-100">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <div className="flex items-center">
                <div className="flex justify-center items-center mr-2 w-8 h-8 rounded-full bg-primary text-primary-content">
                  <span className="font-bold">Z</span>
                </div>
                <h1 className="text-xl font-bold">Zongotek</h1>
              </div>
              <button 
                onClick={toggleMobileMenu} 
                className="btn btn-sm btn-ghost btn-square"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <ul className="p-2 menu menu-md">
                {systemSections.map((section) => {
                  // Skip admin-only sections for non-admin users
                  if (section.adminOnly && user?.role !== 'admin') return null;
                  
                  return (
                    <li key={section.id}>
                      <Link 
                        to={section.path} 
                        className={`${isActive(section.path) ? 'active' : ''}`}
                        onClick={toggleMobileMenu}
                      >
                        {section.icon}
                        <span>{section.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Theme Controls */}
            <div className="p-4 border-t border-base-300">
              <div className="flex justify-between items-center">
                <span className="font-medium">Dark Mode</span>
                <button 
                  onClick={toggleDarkMode} 
                  className="btn btn-circle btn-sm"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              
              <div className="mt-4 w-full dropdown dropdown-top">
                <div tabIndex={0} role="button" className="w-full btn btn-outline btn-sm">
                  <Settings size={16} className="mr-2" />
                  Theme
                  <ChevronDown size={16} />
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
            </div>

            {/* User Info */}
            <div className="absolute right-0 bottom-0 left-0 p-4 border-t border-base-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-2 avatar placeholder">
                    <div className="w-8 rounded-full bg-neutral text-neutral-content">
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs capitalize opacity-70">{user?.role || 'User'}</p>
                  </div>
                </div>
                <button 
                  onClick={logout} 
                  className="btn btn-ghost btn-sm btn-square"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 border-b bg-base-100 border-base-300">
          <div className="container flex justify-between items-center px-4 py-3 mx-auto">
            <h2 className="text-lg font-bold">
              {location.search.includes('mode=chatflow') 
                ? 'Chat Flow Builder' 
                : isActive('/agents')
                ? 'Agents Management'
                : isActive('/tickets')
                ? 'Tickets Management'
                : isActive('/settings')
                ? 'Settings'
                : 'Dashboard'}
            </h2>
            <div className="flex gap-2 items-center">
              <button 
                onClick={toggleDarkMode} 
                className="btn btn-sm btn-ghost btn-circle"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="hidden py-4 border-t bg-base-200 border-base-300">
          <div className="container px-4 mx-auto text-sm text-center text-base-content/70">
            &copy; {new Date().getFullYear()} Zongotek. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout