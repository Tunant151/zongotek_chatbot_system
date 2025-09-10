import React, { useState, useMemo } from 'react'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'
import { createNewStoryCard } from '@/data/enhancedChatFlowUtils'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  BarChart3,
  Layers,
  Clock,
  Users
} from 'lucide-react'

const EnhancedChatFlowList = () => {
  const { 
    chatBotSystem, 
    addStoryCard, 
    setCurrentEditingCard, 
    deleteStoryCard,
    updateStoryCard,
    setActiveCard,
    activeCardId,
    getCardsByCategory,
    getAllCategories
  } = useEnhancedChatFlow()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [newCardDescription, setNewCardDescription] = useState('')
  const [newCardCategory, setNewCardCategory] = useState('general')

  const categories = getAllCategories()
  const cards = chatBotSystem?.cards || []

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        case 'usage':
          return (b.metadata.usage || 0) - (a.metadata.usage || 0)
        case 'priority':
          return a.priority - b.priority
        default:
          return 0
      }
    })

    return filtered
  }, [cards, searchQuery, selectedCategory, sortBy])

  const handleCreateCard = () => {
    if (!newCardName.trim()) return

    const newCard = createNewStoryCard(
      newCardName.trim(),
      newCardDescription.trim(),
      newCardCategory
    )

    addStoryCard(newCard)
    setShowCreateModal(false)
    setNewCardName('')
    setNewCardDescription('')
    setNewCardCategory('general')
  }

  const handleEditCard = (card) => {
    setCurrentEditingCard(card)
  }

  const handleToggleCardStatus = (card) => {
    const updatedCard = {
      ...card,
      status: card.status === 'active' ? 'inactive' : 'active',
      updatedAt: new Date().toISOString()
    }
    updateStoryCard(updatedCard)
  }

  const handleSetActiveCard = (card) => {
    setActiveCard(card.id)
  }

  const handleDeleteCard = (card) => {
    if (confirm(`Are you sure you want to delete "${card.name}"? This action cannot be undone.`)) {
      deleteStoryCard(card.id)
    }
  }

  const handleDuplicateCard = (card) => {
    const duplicatedCard = {
      ...card,
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${card.name} (Copy)`,
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        ...card.metadata,
        usage: 0,
        successRate: 0
      }
    }
    addStoryCard(duplicatedCard)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success badge-sm">Active</span>
      case 'inactive':
        return <span className="badge badge-ghost badge-sm">Inactive</span>
      case 'draft':
        return <span className="badge badge-warning badge-sm">Draft</span>
      default:
        return <span className="badge badge-ghost badge-sm">Unknown</span>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 1:
        return <span className="badge badge-error badge-sm">High</span>
      case 2:
        return <span className="badge badge-warning badge-sm">Medium</span>
      case 3:
        return <span className="badge badge-info badge-sm">Low</span>
      default:
        return null
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales': return '💰'
      case 'support': return '🔧'
      case 'technical': return '⚙️'
      case 'general': return '💬'
      default: return '📋'
    }
  }

  return (
    <div className="h-full bg-base-100">
      {/* Header */}
      <div className="p-6 border-b border-base-300 bg-base-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content">Story Cards</h1>
            <p className="text-base-content/60 mt-1">
              Manage your multi-card conversation flows
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={16} />
            Create New Card
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search cards by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select select-bordered"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="usage">Usage</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6">
        {filteredAndSortedCards.length === 0 ? (
          <div className="text-center py-12">
            <Layers size={48} className="mx-auto text-base-content/30 mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
              {searchQuery || selectedCategory !== 'all' ? 'No matching cards found' : 'No story cards yet'}
            </h3>
            <p className="text-base-content/60 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first story card to get started with multi-card conversations'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary gap-2"
              >
                <Plus size={16} />
                Create First Card
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCards.map(card => (
              <div
                key={card.id}
                className={`card bg-base-100 border-2 transition-all duration-200 hover:shadow-lg ${
                  activeCardId === card.id ? 'border-primary shadow-lg' : 'border-base-300'
                }`}
              >
                <div className="card-body p-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(card.category)}</span>
                      <div>
                        <h3 className="card-title text-base">{card.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {getStatusBadge(card.status)}
                          {getPriorityBadge(card.priority)}
                          {activeCardId === card.id && (
                            <span className="badge badge-primary badge-sm">Default</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                    {card.description || 'No description provided'}
                  </p>

                  {/* Tags */}
                  {card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-outline badge-xs">
                          {tag}
                        </span>
                      ))}
                      {card.tags.length > 3 && (
                        <span className="badge badge-outline badge-xs">
                          +{card.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-base-content/60 mb-4">
                    <div className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      <span>{card.questions.length} Q</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{card.metadata.usage || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{card.metadata.estimatedDuration}m</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="btn btn-sm btn-ghost"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicateCard(card)}
                        className="btn btn-sm btn-ghost"
                        title="Duplicate"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="btn btn-sm btn-ghost text-error hover:bg-error hover:text-error-content"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleCardStatus(card)}
                        className={`btn btn-sm ${
                          card.status === 'active' ? 'btn-warning' : 'btn-success'
                        }`}
                        title={card.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {card.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      
                      {card.status === 'active' && activeCardId !== card.id && (
                        <button
                          onClick={() => handleSetActiveCard(card)}
                          className="btn btn-sm btn-primary"
                          title="Set as Default"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-base-content/50 mt-2 pt-2 border-t border-base-300">
                    Updated {new Date(card.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Story Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Card Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter card name..."
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="input input-bordered w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Describe what this card is for..."
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="general">General</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCard}
                disabled={!newCardName.trim()}
                className="btn btn-primary"
              >
                Create Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedChatFlowList
