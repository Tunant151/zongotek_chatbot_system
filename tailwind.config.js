/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zongotek Brand Colors
        'zongotek': {
          'gold': '#e1a00e',      // Primary gold color
          'gold-dark': '#c88a0c', // Darker gold for hover states
          'gold-light': '#f4c430', // Lighter gold for backgrounds
          'black': '#000000',     // Pure black
          'white': '#FFFFFF',     // Pure white
          'gray-dark': '#1a1a1a', // Dark gray for backgrounds
          'gray-light': '#f8f9fa' // Light gray for subtle backgrounds
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        zongotek: {
          "primary": "#e1a00e",        // Zongotek Gold
          "primary-content": "#000000", // Black text on gold
          "secondary": "#c88a0c",      // Darker gold
          "secondary-content": "#000000", // Black text
          "accent": "#f4c430",         // Light gold
          "accent-content": "#000000", // Black text
          "neutral": "#1a1a1a",        // Dark gray
          "neutral-content": "#FFFFFF", // White text
          "base-100": "#FFFFFF",       // White background
          "base-200": "#f8f9fa",       // Light gray
          "base-300": "#e9ecef",       // Medium gray
          "base-content": "#000000",   // Black text
          "info": "#3b82f6",           // Blue
          "success": "#10b981",        // Green
          "warning": "#f59e0b",        // Orange
          "error": "#ef4444",          // Red
        },
      },
      "light",
      "dark",
    ],
  },
}