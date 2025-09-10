import React, { useState, useCallback, useRef, useMemo } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEnhancedChatFlow } from '@/context/EnhancedChatFlowContext'
import { 
  createEnhancedQuestion, 
  createEnhancedAnswer, 
  createEnhancedAction,
  ACTION_TYPES 
} from '@/data/enhancedChatFlowModel'
import { Plus, Save, MessageSquare, ArrowLeft, Layers, Search, Link } from 'lucide-react'

// Custom node components
import EnhancedQuestionNode from './nodes/EnhancedQuestionNode'
import EnhancedAnswerNode from './nodes/EnhancedAnswerNode'
import CardLinkNode from './nodes/CardLinkNode'

const EnhancedChatFlowEditor = () => {
  const { 
    currentEditingCard, 
    updateStoryCard, 
    clearCurrentEditingCard,
    chatBotSystem,
    findCardById,
    searchCards
  } = useEnhancedChatFlow()
  
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showCardLinks, setShowCardLinks] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [availableCards, setAvailableCards] = useState([])

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({
    enhancedQuestion: EnhancedQuestionNode,
    enhancedAnswer: EnhancedAnswerNode,
    cardLink: CardLinkNode
  }), [])

  const edgeTypes = useMemo(() => ({}), [])

  // Initialize nodes and edges from currentEditingCard
  React.useEffect(() => {
    if (currentEditingCard && currentEditingCard.questions && Array.isArray(currentEditingCard.questions)) {
      const flowNodes = []
      const flowEdges = []
      
      currentEditingCard.questions.forEach((question) => {
        // Add question node
        flowNodes.push({
          id: question.id,
          type: 'enhancedQuestion',
          position: question.position,
          data: { 
            label: question.text, 
            question,
            cardId: currentEditingCard.id,
            cardName: currentEditingCard.name
          }
        })
        
        // Add answer nodes and edges
        if (question.answers && Array.isArray(question.answers)) {
          question.answers.forEach((answer, index) => {
            const answerId = answer.id
            const answerPosition = {
              x: question.position.x + 400,
              y: question.position.y + (index * 180) // Increased spacing from 120 to 180
            }
            
            flowNodes.push({
              id: answerId,
              type: 'enhancedAnswer',
              position: answerPosition,
              data: { 
                label: answer.text, 
                answer,
                questionId: question.id,
                cardId: currentEditingCard.id
              }
            })
            
            // Add edge from question to answer
            flowEdges.push({
              id: `edge-${question.id}-${answerId}`,
              source: question.id,
              target: answerId,
              animated: false,
              style: { stroke: '#e1a00e', strokeWidth: 2 }
            })
            
            // Add edges for various action types
            if (answer.actions && Array.isArray(answer.actions)) {
              answer.actions.forEach(action => {
                switch (action.type) {
                  case ACTION_TYPES.NAVIGATE_TO_QUESTION:
                    if (action.payload?.questionId) {
                      flowEdges.push({
                        id: `edge-${answerId}-${action.payload.questionId}`,
                        source: answerId,
                        target: action.payload.questionId,
                        animated: true,
                        style: { stroke: '#10b981', strokeWidth: 2 },
                        label: 'Navigate'
                      })
                    }
                    break
                    
                  case ACTION_TYPES.NAVIGATE_TO_CARD:
                    if (action.payload?.cardId) {
                      // Add card link node
                      const cardLinkId = `cardlink-${answerId}-${action.payload.cardId}`
                      const targetCard = findCardById(action.payload.cardId)
                      
                      flowNodes.push({
                        id: cardLinkId,
                        type: 'cardLink',
                        position: {
                          x: answerPosition.x + 350,
                          y: answerPosition.y
                        },
                        data: {
                          targetCardId: action.payload.cardId,
                          targetCardName: targetCard?.name || 'Unknown Card',
                          sourceAnswerId: answerId
                        }
                      })
                      
                      flowEdges.push({
                        id: `edge-${answerId}-${cardLinkId}`,
                        source: answerId,
                        target: cardLinkId,
                        animated: true,
                        style: { stroke: '#8b5cf6', strokeWidth: 2 },
                        label: 'Go to Card'
                      })
                    }
                    break
                    
                  case ACTION_TYPES.SEARCH_AND_LOAD_CARD:
                    // Add search node
                    const searchNodeId = `search-${answerId}`
                    flowNodes.push({
                      id: searchNodeId,
                      type: 'cardLink',
                      position: {
                        x: answerPosition.x + 350,
                        y: answerPosition.y
                      },
                      data: {
                        searchQuery: action.payload.query,
                        sourceAnswerId: answerId,
                        isSearch: true
                      }
                    })
                    
                    flowEdges.push({
                      id: `edge-${answerId}-${searchNodeId}`,
                      source: answerId,
                      target: searchNodeId,
                      animated: true,
                      style: { stroke: '#f59e0b', strokeWidth: 2 },
                      label: 'Search Cards'
                    })
                    break
                }
              })
            }
          })
        }
      })
      
      setNodes(flowNodes)
      setEdges(flowEdges)
    } else {
      setNodes([])
      setEdges([])
    }
  }, [currentEditingCard, setNodes, setEdges, findCardById])

  // Update available cards for linking
  React.useEffect(() => {
    if (chatBotSystem && searchQuery) {
      const results = searchCards(searchQuery)
      setAvailableCards(results.filter(card => card.id !== currentEditingCard?.id))
    } else if (chatBotSystem) {
      setAvailableCards(chatBotSystem.cards.filter(card => card.id !== currentEditingCard?.id))
    }
  }, [chatBotSystem, searchQuery, currentEditingCard, searchCards])

  const onConnect = useCallback(
    (params) => {
      // Add the edge to the visual flow
      setEdges((eds) => addEdge({
        ...params,
        style: { stroke: '#e1a00e', strokeWidth: 2 }
      }, eds))
      
      // Update the flow data to create the navigation action
      const updatedCard = { ...currentEditingCard }
      
      // Find the source answer and target question
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      
      if (sourceNode && targetNode && sourceNode.type === 'enhancedAnswer' && targetNode.type === 'enhancedQuestion') {
        // Find the answer in the card
        let questionIndex = -1
        let answerIndex = -1
        
        updatedCard.questions.forEach((question, qIndex) => {
          const aIndex = question.answers.findIndex(a => a.id === params.source)
          if (aIndex !== -1) {
            questionIndex = qIndex
            answerIndex = aIndex
          }
        })
        
        if (questionIndex !== -1 && answerIndex !== -1) {
          // Create or update the navigate action
          const navigateAction = createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_QUESTION, { 
            questionId: params.target 
          })
          
          // Remove any existing navigate actions and add the new one
          updatedCard.questions[questionIndex].answers[answerIndex].actions = 
            updatedCard.questions[questionIndex].answers[answerIndex].actions.filter(
              action => action.type !== ACTION_TYPES.NAVIGATE_TO_QUESTION
            )
          updatedCard.questions[questionIndex].answers[answerIndex].actions.push(navigateAction)
          
          updateStoryCard(updatedCard)
        }
      }
    },
    [setEdges, currentEditingCard, nodes, updateStoryCard]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      let newNode = null

      if (type === 'enhancedQuestion') {
        const newQuestion = createEnhancedQuestion('New Question', 'multiple_choice', position)
        newNode = {
          id: newQuestion.id,
          type,
          position,
          data: { 
            label: newQuestion.text, 
            question: newQuestion,
            cardId: currentEditingCard.id,
            cardName: currentEditingCard.name
          }
        }
        
        // Add question to the card
        const updatedCard = { ...currentEditingCard }
        updatedCard.questions.push(newQuestion)
        updateStoryCard(updatedCard)
        
      } else if (type === 'enhancedAnswer') {
        // Only allow answers to be created from question nodes
        if (!selectedNode || selectedNode.type !== 'enhancedQuestion') {
          alert('Please select a question node first to add an answer')
          return
        }
        
        const newAnswer = createEnhancedAnswer('New Answer')
        // Adjust position to prevent overlapping
        const adjustedPosition = {
          x: Math.max(position.x, selectedNode.position.x + 400),
          y: position.y
        }
        newNode = {
          id: newAnswer.id,
          type,
          position: adjustedPosition,
          data: { 
            label: newAnswer.text, 
            answer: newAnswer,
            questionId: selectedNode.id,
            cardId: currentEditingCard.id
          }
        }
        
        // Add edge from selected question to new answer
        const newEdge = {
          id: `edge-${selectedNode.id}-${newAnswer.id}`,
          source: selectedNode.id,
          target: newAnswer.id,
          animated: false,
          style: { stroke: '#e1a00e', strokeWidth: 2 }
        }
        
        setEdges((eds) => eds.concat(newEdge))
        
        // Update the card with the new answer
        const updatedCard = { ...currentEditingCard }
        const questionIndex = updatedCard.questions.findIndex(q => q.id === selectedNode.id)
        
        if (questionIndex !== -1) {
          updatedCard.questions[questionIndex].answers.push(newAnswer)
          updateStoryCard(updatedCard)
        }
      }

      if (newNode) {
        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, selectedNode, currentEditingCard, updateStoryCard, setNodes, setEdges]
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    
    // Update node positions in the card
    const updatedCard = { ...currentEditingCard }
    
    nodes.forEach(node => {
      if (node.type === 'enhancedQuestion') {
        const questionIndex = updatedCard.questions.findIndex(q => q.id === node.id)
        if (questionIndex !== -1) {
          updatedCard.questions[questionIndex].position = node.position
        }
      }
    })
    
    updateStoryCard(updatedCard)
    setIsSaving(false)
  }

  const handleBack = () => {
    clearCurrentEditingCard()
  }

  const handleCardLink = (targetCardId) => {
    if (!selectedNode || selectedNode.type !== 'enhancedAnswer') {
      alert('Please select an answer node first to create a card link')
      return
    }

    // Create card navigation action
    const cardAction = createEnhancedAction(ACTION_TYPES.NAVIGATE_TO_CARD, {
      cardId: targetCardId
    })

    // Update the answer with the card navigation action
    const updatedCard = { ...currentEditingCard }
    let questionIndex = -1
    let answerIndex = -1
    
    updatedCard.questions.forEach((question, qIndex) => {
      const aIndex = question.answers.findIndex(a => a.id === selectedNode.id)
      if (aIndex !== -1) {
        questionIndex = qIndex
        answerIndex = aIndex
      }
    })
    
    if (questionIndex !== -1 && answerIndex !== -1) {
      // Remove existing card navigation actions and add the new one
      updatedCard.questions[questionIndex].answers[answerIndex].actions = 
        updatedCard.questions[questionIndex].answers[answerIndex].actions.filter(
          action => action.type !== ACTION_TYPES.NAVIGATE_TO_CARD
        )
      updatedCard.questions[questionIndex].answers[answerIndex].actions.push(cardAction)
      
      updateStoryCard(updatedCard)
      
      // Add visual card link node
      const targetCard = findCardById(targetCardId)
      const cardLinkId = `cardlink-${selectedNode.id}-${targetCardId}`
      
      const newNode = {
        id: cardLinkId,
        type: 'cardLink',
        position: {
          x: selectedNode.position.x + 350,
          y: selectedNode.position.y
        },
        data: {
          targetCardId: targetCardId,
          targetCardName: targetCard?.name || 'Unknown Card',
          sourceAnswerId: selectedNode.id
        }
      }
      
      const newEdge = {
        id: `edge-${selectedNode.id}-${cardLinkId}`,
        source: selectedNode.id,
        target: cardLinkId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
        label: 'Go to Card'
      }
      
      setNodes((nds) => nds.concat(newNode))
      setEdges((eds) => eds.concat(newEdge))
    }
  }

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  if (!currentEditingCard) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-base-100">
      <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-base-300 rounded-full transition-colors text-base-content"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-base-content">
            {currentEditingCard.name} - Enhanced Flow Editor
          </h2>
          <span className="badge badge-primary">{currentEditingCard.category}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCardLinks(!showCardLinks)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showCardLinks 
                ? 'bg-secondary text-secondary-content' 
                : 'bg-base-300 text-base-content hover:bg-base-200'
            }`}
          >
            <Link size={16} />
            Card Links
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-base-200 border-r border-base-300 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-base-content mb-2">Drag to add:</h3>
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 p-3 bg-primary text-primary-content rounded-lg cursor-move hover:bg-primary-focus transition-colors"
                  onDragStart={(event) => onDragStart(event, 'enhancedQuestion')}
                  draggable
                >
                  <MessageSquare size={16} />
                  <span className="text-sm">Question</span>
                </div>
                
                <div
                  className="flex items-center gap-2 p-3 bg-secondary text-secondary-content rounded-lg cursor-move hover:bg-secondary-focus transition-colors"
                  onDragStart={(event) => onDragStart(event, 'enhancedAnswer')}
                  draggable
                >
                  <Plus size={16} />
                  <span className="text-sm">Answer</span>
                </div>
              </div>
            </div>
            
            {showCardLinks && (
              <div>
                <h3 className="text-sm font-semibold text-base-content mb-2">Link to Cards:</h3>
                
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-sm input-bordered w-full"
                  />
                </div>
                
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {availableCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleCardLink(card.id)}
                      className="w-full text-left p-2 text-xs bg-base-100 hover:bg-base-300 rounded border transition-colors"
                      disabled={!selectedNode || selectedNode.type !== 'enhancedAnswer'}
                    >
                      <div className="font-medium">{card.name}</div>
                      <div className="text-base-content/60">{card.category}</div>
                    </button>
                  ))}
                </div>
                
                {selectedNode?.type !== 'enhancedAnswer' && (
                  <p className="text-xs text-warning mt-2">
                    Select an answer node to create card links
                  </p>
                )}
              </div>
            )}
            
            {selectedNode && (
              <div>
                <h3 className="text-sm font-semibold text-base-content mb-2">Selected Node:</h3>
                <div className="p-2 bg-base-100 rounded border text-xs">
                  <div className="font-medium">{selectedNode.type}</div>
                  <div className="text-base-content/60 truncate">
                    {selectedNode.data.label}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* ReactFlow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-base-100"
          >
            <Controls className="bg-base-200 border-base-300" />
            <MiniMap 
              className="bg-base-200 border-base-300"
              nodeColor="#e1a00e"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Background color="#e1a00e" gap={16} />
            
            <Panel position="top-right" className="bg-base-200 border border-base-300 rounded-lg p-2">
              <div className="text-xs text-base-content">
                <div>Questions: {currentEditingCard.questions.length}</div>
                <div>Total Answers: {currentEditingCard.questions.reduce((sum, q) => sum + q.answers.length, 0)}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default EnhancedChatFlowEditor
