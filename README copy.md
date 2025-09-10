# 🚀 Beetech ReactJS Template

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/ESLint-9.30.1-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
</div>

## 📋 Overview

This template serves as the official starting point for Beetech's React projects. It provides a modern, optimized setup with the latest React 19, Vite 7, and Tailwind CSS 4, along with a collection of pre-configured UI components and utilities to accelerate development.

## ✨ Features

- 🔥 **Latest React 19** with all the new features
- ⚡ **Vite 7** for lightning-fast development and builds
- 🎨 **Tailwind CSS 4** for utility-first styling
- 🧩 **Shadcn UI Components** pre-configured with New York style
- 📦 **Modern Package Management** with npm
- 🔍 **ESLint 9** for code quality
- 🔄 **Hot Module Replacement (HMR)** for instant feedback
- 📱 **Responsive Design** utilities built-in
- 🌙 **Dark Mode Support** ready to implement
- 🧰 **Utility Libraries** (clsx, tailwind-merge, etc.)
- 🎭 **Icon Libraries** (Lucide React, React Icons)
- 🔔 **Toast Notifications** with react-toastify
- 🔄 **Loading States** with react-spinners

## 📦 Pre-installed Packages

### Core

- React 19.1.0
- React DOM 19.1.0
- Vite 7.0.4

### UI & Styling

- Tailwind CSS 4.1.11
- tailwind-merge 3.3.1
- class-variance-authority 0.7.1
- clsx 2.1.1
- @headlessui/react 2.2.4
- @radix-ui/react-slot 1.2.3
- daisyUI 5.0.46
- tw-animate-css 1.3.5

### Icons & Visual Elements

- lucide-react 0.525.0
- react-icons 5.5.0
- react-spinners 0.17.0

### Notifications

- react-toastify 11.0.5

### Development

- ESLint 9.30.1
- Various ESLint plugins
- Type definitions for React and Node

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 10.x or higher

### Clone the Template

```bash
# Clone the repository into your project folder
git clone https://gitlab.com/beetech/beetech-reactjs-template.git my-project

# Navigate to the project directory
cd my-project

# Remove the existing git repository
rm -rf .git

# Initialize a new git repository
git init

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 🧩 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── assets/         # Project assets (images, fonts, etc.)
│   ├── components/     # Reusable components
│   │   └── ui/         # UI components (from shadcn/ui)
│   ├── lib/            # Utility functions and helpers
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application-specific styles
│   ├── index.css       # Global styles and Tailwind imports
│   └── main.jsx        # Application entry point
├── .gitignore          # Git ignore file
├── components.json     # shadcn/ui configuration
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML entry point
├── jsconfig.json       # JavaScript configuration
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # Project documentation
```

## 🔧 Customization

### Adding New UI Components

This template uses the shadcn/ui component system. To add new components, refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs).

### Modifying Styles

Tailwind CSS is configured in the `src/index.css` file. You can customize the theme by modifying the CSS variables in the `:root` selector.

## 📝 Important Notes

- This template uses React 19, which includes several new features and improvements over previous versions.
- The project is configured with absolute imports using the `@/` prefix.
- ESLint is configured with recommended settings for React projects.

## 📄 License

This template is proprietary and owned by Beetech. Unauthorized use, modification, or distribution is prohibited.

---

<div align="center">
  <p>Made with ❤️ by Beetech</p>
</div>
