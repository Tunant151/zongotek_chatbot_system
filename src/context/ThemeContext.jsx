import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'zongotek'
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'zongotek'
  })

  // All available DaisyUI themes
  const themes = [
    'zongotek', 'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 
    'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 
    'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 
    'business', 'acid', 'lemonade', 'night', 'coffee', 'winter', 
    'dim', 'nord', 'sunset'
  ]

  // Dark mode themes list
  const darkThemes = ['zongotek', 'dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'night', 'coffee', 'dim', 'nord']

  // Check if current theme is a dark theme
  const isDarkMode = darkThemes.includes(theme)

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleDarkMode = () => {
    // Toggle between light and dark versions of current theme or default ones
    if (isDarkMode) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  const setThemeValue = (newTheme) => {
    setTheme(newTheme)
  }

  const value = {
    theme,
    themes,
    toggleTheme: toggleDarkMode,
    toggleDarkMode,
    isDarkMode,
    setTheme: setThemeValue
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
