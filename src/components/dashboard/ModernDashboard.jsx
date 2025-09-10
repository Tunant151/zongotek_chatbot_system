import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTickets } from '@/context/TicketContext'
import { Link, useLocation } from 'react-router-dom'
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  Filter,
  BarChart3,
  Activity,
  Zap,
  Star,
  Bot
} from 'lucide-react'

const ModernDashboard = () => {
  const { user, agents } = useAuth()
  const { tickets, departments, metrics } = useTickets()
  const [timeFilter, setTimeFilter] = useState('today')
  const [userFilter, setUserFilter] = useState('all')

  // Calculate metrics based on time filter
  const getFilteredData = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let filteredTickets = tickets
    
    switch (timeFilter) {
      case 'today':
        filteredTickets = tickets.filter(ticket => 
          new Date(ticket.createdAt) >= today
        )
        break
      case 'yesterday':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const dayBeforeYesterday = new Date(yesterday)
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1)
        filteredTickets = tickets.filter(ticket => {
          const ticketDate = new Date(ticket.createdAt)
          return ticketDate >= dayBeforeYesterday && ticketDate < yesterday
        })
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filteredTickets = tickets.filter(ticket => 
          new Date(ticket.createdAt) >= weekAgo
        )
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filteredTickets = tickets.filter(ticket => 
          new Date(ticket.createdAt) >= monthAgo
        )
        break
      default:
        filteredTickets = tickets
    }
    
    return filteredTickets
  }

  const filteredTickets = getFilteredData()
  const todayTickets = tickets.filter(ticket => 
    new Date(ticket.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  )

  // Calculate metrics
  const dashboardMetrics = {
    incomingMessages: {
      total: todayTickets.length,
      today: todayTickets.length,
      breakdown: {
        chatbot: todayTickets.filter(t => t.source === 'chatbot').length,
        livechat: todayTickets.filter(t => t.source === 'livechat').length,
        email: todayTickets.filter(t => t.source === 'email').length,
        phone: todayTickets.filter(t => t.source === 'phone').length,
        other: todayTickets.filter(t => !t.source || t.source === 'other').length
      }
    },
    ongoingConversations: {
      total: tickets.filter(t => t.status === 'picked').length,
      today: todayTickets.filter(t => t.status === 'picked').length
    },
    unansweredConversations: {
      total: tickets.filter(t => t.status === 'pending').length,
      today: todayTickets.filter(t => t.status === 'pending').length
    },
    medianReplyTime: {
      total: calculateMedianReplyTime(tickets),
      today: calculateMedianReplyTime(todayTickets)
    },
    longestAwaitingReply: {
      value: calculateLongestAwaitingReply(tickets)
    },
    activeAgents: {
      total: agents.filter(a => a.status === 'active').length,
      today: agents.filter(a => a.status === 'active').length
    },
    closedTickets: {
      total: tickets.filter(t => t.status === 'closed').length,
      today: todayTickets.filter(t => t.status === 'closed').length
    },
    totalRevenue: {
      total: calculateTotalRevenue(tickets),
      today: calculateTotalRevenue(todayTickets)
    },
    tasks: {
      total: tickets.filter(t => t.status === 'picked').length,
      today: todayTickets.filter(t => t.status === 'picked').length
    }
  }

  function calculateMedianReplyTime(ticketList) {
    const replyTimes = ticketList
      .filter(t => t.pickedAt && t.createdAt)
      .map(t => {
        const created = new Date(t.createdAt)
        const picked = new Date(t.pickedAt)
        return Math.round((picked - created) / (1000 * 60)) // minutes
      })
      .filter(time => time > 0)
    
    if (replyTimes.length === 0) return 0
    
    replyTimes.sort((a, b) => a - b)
    const mid = Math.floor(replyTimes.length / 2)
    return replyTimes.length % 2 === 0 
      ? Math.round((replyTimes[mid - 1] + replyTimes[mid]) / 2)
      : replyTimes[mid]
  }

  function calculateLongestAwaitingReply(ticketList) {
    const pendingTickets = ticketList.filter(t => t.status === 'pending')
    if (pendingTickets.length === 0) return '0m'
    
    const now = new Date()
    const longestWait = Math.max(...pendingTickets.map(ticket => {
      const created = new Date(ticket.createdAt)
      return Math.round((now - created) / (1000 * 60 * 60 * 24)) // days
    }))
    
    return longestWait > 0 ? `${longestWait}d` : '0m'
  }

  function calculateTotalRevenue(ticketList) {
    // Mock revenue calculation - in real app, this would come from actual sales data
    return ticketList.filter(t => t.status === 'closed').length * 150 // $150 per closed ticket
  }

  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div> */}

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <span className="text-lg font-bold text-white">Z</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">ZONGOTEK</h1>
                    <p className="text-sm text-slate-400">Customer Support Dashboard</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Welcome back,</p>
                  <p className="font-semibold text-white">{user?.name}</p>
                </div>
                <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Filters */}
        <div className="px-6 py-4 border-b backdrop-blur-sm bg-slate-800/30 border-slate-700/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {['today', 'yesterday', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === period
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 text-sm text-white rounded-lg border bg-slate-700/50 border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agents</option>
                </select>
              </div>
              
              <button className="p-2 rounded-lg transition-colors bg-slate-700/50 hover:bg-slate-600/50">
                <Settings size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="px-6 py-3 border-b backdrop-blur-sm bg-slate-800/20 border-slate-700/20">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">Quick Access:</span>
            <div className="flex items-center space-x-2">
              <Link 
                to="/agents" 
                className="flex items-center px-3 py-1 space-x-1 text-sm rounded-lg transition-colors bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
              >
                <Users size={14} />
                <span>Agents</span>
              </Link>
              <Link 
                to="/tickets" 
                className="flex items-center px-3 py-1 space-x-1 text-sm rounded-lg transition-colors bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
              >
                <MessageSquare size={14} />
                <span>Tickets</span>
              </Link>
              <Link 
                to="/chatflow" 
                className="flex items-center px-3 py-1 space-x-1 text-sm rounded-lg transition-colors bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
              >
                <Bot size={14} />
                <span>Chat Flow</span>
              </Link>
              <Link 
                to="/livechat" 
                className="flex items-center px-3 py-1 space-x-1 text-sm rounded-lg transition-colors bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white"
              >
                <MessageSquare size={14} />
                <span>Live Chat</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            {/* Incoming Messages */}
            <DashboardWidget
              title="INCOMING MESSAGES"
              total={dashboardMetrics.incomingMessages.total}
              today={dashboardMetrics.incomingMessages.today}
              icon={<MessageSquare size={20} />}
              color="green"
              breakdown={dashboardMetrics.incomingMessages.breakdown}
            />

            {/* Ongoing Conversations */}
            <DashboardWidget
              title="ONGOING CONVERSATIONS"
              total={dashboardMetrics.ongoingConversations.total}
              today={dashboardMetrics.ongoingConversations.today}
              icon={<Users size={20} />}
              color="purple"
            />

            {/* Unanswered Conversations */}
            <DashboardWidget
              title="UNANSWERED CONVERSATIONS"
              total={dashboardMetrics.unansweredConversations.total}
              today={dashboardMetrics.unansweredConversations.today}
              icon={<AlertCircle size={20} />}
              color="purple"
            />

            {/* Lead Sources */}
            <DashboardWidget
              title="LEAD SOURCES"
              icon={<TrendingUp size={20} />}
              color="blue"
              customContent={
                <div className="py-4 text-center">
                  <div className="mb-2 text-sm text-slate-400">▲ Not enough data to display</div>
                  <div className="mx-auto w-16 h-16">
                    <div className="w-full h-full rounded-full border-4 animate-spin border-slate-600 border-t-blue-500"></div>
                  </div>
                </div>
              }
            />

            {/* Median Reply Time */}
            <DashboardWidget
              title="MEDIAN REPLY TIME"
              total={dashboardMetrics.medianReplyTime.total}
              today={dashboardMetrics.medianReplyTime.today}
              icon={<Clock size={20} />}
              color="green"
              suffix="m"
            />

            {/* Longest Awaiting Reply */}
            <DashboardWidget
              title="LONGEST AWAITING REPLY"
              total={dashboardMetrics.longestAwaitingReply.value}
              icon={<Clock size={20} />}
              color="purple"
            />

            {/* Active Agents */}
            <DashboardWidget
              title="ACTIVE AGENTS"
              total={dashboardMetrics.activeAgents.total}
              today={dashboardMetrics.activeAgents.today}
              icon={<Users size={20} />}
              color="purple"
            />

            {/* Closed Tickets */}
            <DashboardWidget
              title="CLOSED TICKETS"
              total={dashboardMetrics.closedTickets.total}
              today={dashboardMetrics.closedTickets.today}
              icon={<CheckCircle size={20} />}
              color="purple"
            />

            {/* Total Revenue */}
            <DashboardWidget
              title="TOTAL REVENUE"
              total={dashboardMetrics.totalRevenue.total}
              today={dashboardMetrics.totalRevenue.today}
              icon={<DollarSign size={20} />}
              color="purple"
              prefix="$"
            />

            {/* Tasks */}
            <DashboardWidget
              title="TASKS"
              total={dashboardMetrics.tasks.total}
              today={dashboardMetrics.tasks.today}
              icon={<Activity size={20} />}
              color="purple"
            />

            {/* Performance Metrics */}
            <DashboardWidget
              title="PERFORMANCE"
              icon={<BarChart3 size={20} />}
              color="blue"
              customContent={
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Response Rate</span>
                    <span className="font-semibold text-white">95%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Satisfaction</span>
                    <span className="font-semibold text-white">4.8/5</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-700">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              }
            />

          </div>
        </div>
      </div>
    </div>
  )
}

const DashboardWidget = ({ 
  title, 
  total, 
  today, 
  icon, 
  color, 
  suffix = '', 
  prefix = '', 
  breakdown,
  customContent 
}) => {
  const colorClasses = {
    green: 'text-green-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400'
  }

  const bgColorClasses = {
    green: 'bg-green-500/20',
    purple: 'bg-purple-500/20',
    blue: 'bg-blue-500/20',
    yellow: 'bg-yellow-500/20',
    red: 'bg-red-500/20'
  }

  return (
    <div className="p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 bg-slate-800/50 border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${bgColorClasses[color]}`}>
          <div className={colorClasses[color]}>
            {icon}
          </div>
        </div>
      </div>

      {customContent ? (
        customContent
      ) : (
        <>
          <div className="mb-4">
            <div className={`mb-1 text-3xl font-bold ${colorClasses[color]}`}>
              {prefix}{total}{suffix}
            </div>
            {today !== undefined && (
              <div className="text-sm text-green-400">
                {today} today
              </div>
            )}
          </div>

          {breakdown && (
            <div className="space-y-2">
              {Object.entries(breakdown).map(([source, count]) => (
                <div key={source} className="flex justify-between items-center text-sm">
                  <span className="capitalize text-slate-400">{source}:</span>
                  <span className="font-medium text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ModernDashboard
