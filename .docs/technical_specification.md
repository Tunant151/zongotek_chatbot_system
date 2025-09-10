# Zongotek Chatbot & Live Ticketing System - Technical Specification 🚀

## Project Overview
A custom frontend-only chatbot and live ticketing system for Zongotek, inspired by Chatbot.com and Kommo CRM interfaces.

---

## 🎯 Core Features

### 1. User-Facing Chat Widget
- **Floating bubble** with hover preview and click to open
- **Responsive design**: Corner widget on desktop, full-screen on mobile
- **Draggable/resizable** (if possible)
- **Theme adaptive** with DaisyUI themes
- **Anonymous chat sessions** with 24-hour persistence

### 2. Custom Chatbot System
- **Pre-programmed flow diagrams** with button-based navigation
- **Rich media support**: Buttons (MVP), images and carousels (future)
- **Automatic agent transfer** triggers:
  - User request button
  - Text detection ("talk to human", "agent", etc.)
  - End of knowledge base flow
- **Queue system** for when no agents are available

### 3. Live Agent Dashboard
- **Agent authentication/login** system
- **Clock-in/out** functionality with active status indicators
- **Real-time ticket management** with FIFO priority
- **Department-based routing** (Sales, Operations, Technical)
- **Manual override** for ticket routing

### 4. Central Admin Dashboard
- **Real-time metrics**:
  - Total active agents
  - Pending tickets count
  - Tickets closed today
  - Average wait time
- **Data visualization** with charts and graphs
- **Department management** (dynamic creation)
- **Admin settings** for widget customization

---

## 🏗️ Technical Architecture

### Technology Stack
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4 + DaisyUI
- **UI Components**: shadcn/ui + Headless UI
- **State Management**: React Context + localStorage/IndexedDB
- **Real-time**: WebSocket/Server-Sent Events
- **PDF Export**: jsPDF or similar
- **Notifications**: Browser notifications + email (agents only)

### Project Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWidget.jsx
│   │   ├── ChatBubble.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   └── ChatFlow.jsx
│   ├── dashboard/
│   │   ├── AgentDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── TicketManager.jsx
│   │   ├── MetricsPanel.jsx
│   │   └── DepartmentManager.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── AuthGuard.jsx
│   └── ui/ (existing shadcn components)
├── pages/
│   ├── ChatPage.jsx
│   ├── AgentPage.jsx
│   ├── AdminPage.jsx
│   └── LoginPage.jsx
├── hooks/
│   ├── useChat.js
│   ├── useTickets.js
│   ├── useAuth.js
│   └── useRealTime.js
├── context/
│   ├── ChatContext.jsx
│   ├── TicketContext.jsx
│   └── AuthContext.jsx
├── utils/
│   ├── chatFlow.js
│   ├── ticketRouting.js
│   ├── pdfExport.js
│   └── notifications.js
└── data/
    ├── chatFlows.js
    ├── departments.js
    └── mockData.js
```

---

## 📱 User Interface Design

### Chat Widget Design
- **Modern & minimal** design inspired by Chatbot.com
- **Theme adaptive** using DaisyUI themes
- **Floating bubble** with smooth animations
- **Responsive breakpoints**:
  - Desktop: Corner widget (300x400px)
  - Mobile: Full-screen overlay
- **Draggable** within viewport bounds
- **Hover preview** shows "Chat with us"

### Dashboard Design
- **Kommo CRM inspired** clean interface
- **Real-time updates** with live indicators
- **Dark/light theme** support
- **Responsive grid** layout
- **Accessibility** features (WCAG compliant)

---

## 🔄 Data Flow & State Management

### Chat Session Flow
1. User opens chat widget
2. Chatbot greets with flow diagram
3. User interacts via buttons/text
4. System processes responses
5. Transfer to agent if needed
6. Session persists for 24 hours

### Ticket Management Flow
1. Chatbot creates ticket when transfer needed
2. NLP analysis routes to department
3. Ticket appears in agent queue
4. Agent picks up ticket (FIFO)
5. Real-time chat between user and agent
6. Ticket closed when resolved

### Data Storage Strategy
- **localStorage**: User preferences, theme settings
- **IndexedDB**: Chat history, session data
- **SessionStorage**: Current session state
- **Context API**: Real-time application state

---

## 🎨 Component Specifications

### ChatWidget Component
```jsx
// Features: Floating, draggable, responsive, theme adaptive
// Props: position, size, theme, onMessage, onTransfer
// State: isOpen, isDragging, messages, currentFlow
```

### AgentDashboard Component
```jsx
// Features: Real-time tickets, status management, chat interface
// Props: agentId, department, onStatusChange
// State: activeTickets, status, notifications
```

### AdminDashboard Component
```jsx
// Features: Metrics, department management, settings
// Props: adminLevel, departments
// State: metrics, departments, settings
```

---

## 🔧 Implementation Phases

### Phase 1: MVP (Core Features)
1. **Chat Widget** - Basic floating bubble with chat interface
2. **Simple Chatbot** - Pre-programmed responses with buttons
3. **Basic Ticket System** - Create and assign tickets
4. **Agent Login** - Simple authentication
5. **Basic Dashboard** - View tickets and metrics

### Phase 2: Enhanced Features
1. **Real-time Updates** - WebSocket integration
2. **Advanced Chatbot** - Flow diagrams and NLP
3. **Department Routing** - Automatic and manual
4. **PDF Export** - Chat history export
5. **Notifications** - Browser and email alerts

### Phase 3: Advanced Features
1. **Rich Media** - Images and carousels
2. **Analytics** - Advanced charts and reporting
3. **Customization** - Admin settings panel
4. **Offline Support** - Service worker implementation
5. **Performance Optimization** - Code splitting and lazy loading

---

## 🚀 Getting Started

### Next Steps
1. Set up project structure with components
2. Create chat widget with basic functionality
3. Implement authentication system
4. Build dashboard layouts
5. Add real-time features
6. Integrate PDF export
7. Add notifications system

### Development Priorities
1. **Chat Widget** - Core user interface
2. **Authentication** - Agent login system
3. **Ticket Management** - Basic CRUD operations
4. **Real-time Updates** - Live chat functionality
5. **Dashboard** - Metrics and management

---

## 📋 Success Criteria
- [ ] Chat widget works on all devices
- [ ] Real-time chat between users and agents
- [ ] Ticket system with department routing
- [ ] Agent authentication and status management
- [ ] Admin dashboard with metrics
- [ ] PDF export functionality
- [ ] Theme adaptive design
- [ ] Responsive and accessible interface
