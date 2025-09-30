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
import dagre from 'dagre'
import { useChatFlow } from '@/context/ChatFlowContext'
import { useTheme } from '@/context/ThemeContext'
import { createQuestion, createAnswer, createAction, addQuestionToChatFlow } from '@/data/chatFlowModel'
import { Plus, Save, MessageSquare, ArrowLeft, Layers } from 'lucide-react'

// Custom node components
import QuestionNode from './nodes/QuestionNode'
import AnswerNode from './nodes/AnswerNode'

const ChatFlowEditor = () => {
  const { currentEditingFlow, updateChatFlow, clearCurrentEditingFlow } = useChatFlow()
  const { theme, isDarkMode } = useTheme()
  
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [editingNode, setEditingNode] = useState(null)

  // Dynamic color schemes based on theme
  const getThemeColors = useCallback(() => {
    if (isDarkMode) {
      return {
        // Dark theme colors
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        backgroundDots: 'rgba(148, 163, 184, 0.1)',
        questionGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        answerPrimaryGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        answerSecondaryGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        otherQuestionGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        primaryEdge: '#ec4899',
        secondaryEdge: '#06b6d4',
        navigationEdge: '#10b981',
        controlsBg: 'rgba(30, 41, 59, 0.9)',
        controlsBorder: '#334155',
        minimapBg: 'rgba(30, 41, 59, 0.9)',
        minimapBorder: '#334155',
        questionColor: '#f8fafc',
        answerColor: '#f8fafc',
        otherQuestionColor: '#f8fafc'
      }
    } else {
      return {
        // Light theme colors
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        backgroundDots: 'rgba(148, 163, 184, 0.2)',
        questionGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        answerPrimaryGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        answerSecondaryGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        otherQuestionGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        primaryEdge: '#f5576c',
        secondaryEdge: '#4facfe',
        navigationEdge: '#10b981',
        controlsBg: 'rgba(255, 255, 255, 0.9)',
        controlsBorder: '#e2e8f0',
        minimapBg: 'rgba(255, 255, 255, 0.9)',
        minimapBorder: '#e2e8f0',
        questionColor: '#ffffff',
        answerColor: '#ffffff',
        otherQuestionColor: '#333333'
      }
    }
  }, [isDarkMode])

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({
    question: QuestionNode,
    answer: AnswerNode
  }), [])

  const edgeTypes = useMemo(() => ({}), [])

  // Advanced Layout function with multiple layout options
  const applyAutoLayout = useCallback((flow, layoutType = 'hierarchical') => {
    if (!flow || !flow.questions) return { nodes: [], edges: [] }
    
    if (layoutType === 'hierarchical') {
      return applyHierarchicalLayout(flow)
    } else if (layoutType === 'radial') {
      return applyRadialLayout(flow)
    } else {
      return applyGridLayout(flow)
    }
  }, [])

  // Ultra-Clean Hierarchical Layout - Professional tree structure with dynamic theming
  const applyHierarchicalLayout = useCallback((flow) => {
    const colors = getThemeColors()
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ 
      rankdir: 'TB', // Top to Bottom for better vertical flow
      ranksep: 400,  // Much more space between levels for ultra-clean look
      nodesep: 200,  // Generous space between nodes
      marginx: 100,  // More margin for breathing room
      marginy: 100,  // More margin for breathing room
      align: 'UL',   // Alignment
      acyclicer: 'greedy', // Better cycle handling
      ranker: 'tight-tree' // Optimized ranking
    })

      const flowNodes = []
      const flowEdges = []
      
    // Build the flow structure with dynamic theme styling
    flow.questions.forEach(question => {
      const isInitial = question.isInitial
      flowNodes.push({
        id: question.id,
        type: 'question',
        data: { 
          label: question.text, 
          question,
          isInitial,
          style: {
            background: isInitial 
              ? (isDarkMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)')
              : colors.questionGradient,
            color: colors.questionColor,
            border: isInitial ? '3px solid #f59e0b' : 'none',
            borderRadius: '12px',
            boxShadow: isInitial 
              ? (isDarkMode ? '0 6px 20px rgba(245, 158, 11, 0.4)' : '0 6px 20px rgba(245, 158, 11, 0.3)')
              : (isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)'),
            fontSize: '14px',
            fontWeight: isInitial ? '600' : '500'
          }
        }
      })
      
        if (question.answers && Array.isArray(question.answers)) {
          question.answers.forEach((answer, index) => {
          flowNodes.push({
            id: answer.id,
            type: 'answer',
            data: { 
              label: answer.text, 
              answer,
              style: {
                background: answer.isPrimary 
                  ? colors.answerPrimaryGradient
                  : colors.answerSecondaryGradient,
                color: colors.answerColor,
                border: 'none',
                borderRadius: '10px',
                boxShadow: isDarkMode ? '0 3px 10px rgba(0,0,0,0.25)' : '0 3px 10px rgba(0,0,0,0.12)',
                fontSize: '13px',
                fontWeight: '400'
              }
            }
          })
          
          flowEdges.push({
            id: `edge-${question.id}-${answer.id}`,
            source: question.id,
            target: answer.id,
            animated: false,
            style: { 
              stroke: answer.isPrimary ? colors.primaryEdge : colors.secondaryEdge, 
              strokeWidth: 3,
              strokeDasharray: '0'
            },
            type: 'smoothstep'
          })
          
          if (answer.actions && Array.isArray(answer.actions)) {
            answer.actions.forEach(action => {
              if (action.type === 'navigate_to_question' && action.payload?.questionId) {
                flowEdges.push({
                  id: `edge-${answer.id}-${action.payload.questionId}`,
                  source: answer.id,
                  target: action.payload.questionId,
                  animated: true,
                  style: { 
                    stroke: colors.navigationEdge, 
                    strokeWidth: 2,
                    strokeDasharray: '5,5'
                  },
                  type: 'smoothstep'
                })
              }
            })
          }
          })
        }
      })
      
    // Add nodes with larger, more generous dimensions
    flowNodes.forEach(node => {
      const width = node.type === 'question' ? 400 : 320
      const height = node.type === 'question' ? 160 : 120
      
      dagreGraph.setNode(node.id, { width, height })
    })

    // Add edges
    flowEdges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    // Run layout
    dagre.layout(dagreGraph)

    // Convert positions with perfect centering
    const positionedNodes = flowNodes.map(node => {
      const dagreNode = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: dagreNode.x - (dagreNode.width / 2),
          y: dagreNode.y - (dagreNode.height / 2)
        }
      }
    })

    return { nodes: positionedNodes, edges: flowEdges }
  }, [getThemeColors, isDarkMode])

  // Ultra-Clean Radial Layout - Central hub with branches and dynamic theming
  const applyRadialLayout = useCallback((flow) => {
    const colors = getThemeColors()
    const nodes = []
    const edges = []
    
    const startQuestion = flow.questions.find(q => q.isInitial) || flow.questions[0]
    if (!startQuestion) return { nodes: [], edges: [] }
    
    // Place start question in center with dynamic theme styling
    nodes.push({
      id: startQuestion.id,
      type: 'question',
      position: { x: 600, y: 500 },
      data: { 
        label: startQuestion.text, 
        question: startQuestion,
        style: {
          background: colors.questionGradient,
          color: colors.questionColor,
          border: 'none',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.2)',
          fontSize: '16px',
          fontWeight: '600',
          width: '450px',
          height: '180px'
        }
      }
    })
    
    // Place answers in a larger circle around the center
    if (startQuestion.answers && Array.isArray(startQuestion.answers)) {
      const radius = 450 // Increased radius for better spacing
      const angleStep = (2 * Math.PI) / startQuestion.answers.length
      
      startQuestion.answers.forEach((answer, index) => {
        const angle = index * angleStep
        const x = 600 + radius * Math.cos(angle)
        const y = 500 + radius * Math.sin(angle)
        
        nodes.push({
          id: answer.id,
          type: 'answer',
          position: { x, y },
          data: { 
            label: answer.text, 
            answer,
            style: {
              background: answer.isPrimary 
                ? colors.answerPrimaryGradient
                : colors.answerSecondaryGradient,
              color: colors.answerColor,
              border: 'none',
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.15)',
              fontSize: '14px',
              fontWeight: '500',
              width: '350px',
              height: '140px'
            }
          }
        })
        
        edges.push({
          id: `edge-${startQuestion.id}-${answer.id}`,
          source: startQuestion.id,
          target: answer.id,
          animated: false,
          style: { 
            stroke: answer.isPrimary ? colors.primaryEdge : colors.secondaryEdge, 
            strokeWidth: 4,
            strokeDasharray: '0'
          },
          type: 'smoothstep'
        })
        
        // Add navigation edges
        if (answer.actions && Array.isArray(answer.actions)) {
          answer.actions.forEach(action => {
            if (action.type === 'navigate_to_question' && action.payload?.questionId) {
              edges.push({
                id: `edge-${answer.id}-${action.payload.questionId}`,
                source: answer.id,
                target: action.payload.questionId,
                animated: true,
                style: { 
                  stroke: colors.navigationEdge, 
                  strokeWidth: 3,
                  strokeDasharray: '8,4'
                },
                type: 'smoothstep'
              })
            }
          })
        }
      })
    }
    
    // Place other questions in outer ring with more spacing
    const otherQuestions = flow.questions.filter(q => q.id !== startQuestion.id)
    const outerRadius = 800 // Increased outer radius
    const outerAngleStep = (2 * Math.PI) / otherQuestions.length
    
    otherQuestions.forEach((question, index) => {
      const angle = index * outerAngleStep
      const x = 600 + outerRadius * Math.cos(angle)
      const y = 500 + outerRadius * Math.sin(angle)
      
      nodes.push({
        id: question.id,
        type: 'question',
        position: { x, y },
        data: { 
          label: question.text, 
          question,
          style: {
            background: colors.otherQuestionGradient,
            color: colors.otherQuestionColor,
            border: 'none',
            borderRadius: '14px',
            boxShadow: isDarkMode ? '0 5px 18px rgba(0,0,0,0.3)' : '0 5px 18px rgba(0,0,0,0.12)',
            fontSize: '15px',
            fontWeight: '500',
            width: '380px',
            height: '160px'
          }
        }
      })
    })
    
    return { nodes, edges }
  }, [getThemeColors, isDarkMode])

  // Ultra-Clean Grid Layout - Organized grid structure with dynamic theming
  const applyGridLayout = useCallback((flow) => {
    const colors = getThemeColors()
    const nodes = []
    const edges = []
    
    const startQuestion = flow.questions.find(q => q.isInitial) || flow.questions[0]
    if (!startQuestion) return { nodes: [], edges: [] }
    
    // Place start question at top center with professional styling
    nodes.push({
      id: startQuestion.id,
      type: 'question',
      position: { x: 500, y: 150 },
      data: { 
        label: startQuestion.text, 
        question: startQuestion,
        style: {
          background: colors.questionGradient,
          color: colors.questionColor,
          border: 'none',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 6px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.2)',
          fontSize: '16px',
          fontWeight: '600',
          width: '450px',
          height: '180px'
        }
      }
    })
    
    // Place answers in a clean row below with generous spacing
    if (startQuestion.answers && Array.isArray(startQuestion.answers)) {
      const startX = 150
      const spacing = 350 // Much more spacing between answers
      
      startQuestion.answers.forEach((answer, index) => {
        const x = startX + (index * spacing)
        const y = 450
        
        nodes.push({
          id: answer.id,
          type: 'answer',
          position: { x, y },
          data: { 
            label: answer.text, 
            answer,
            style: {
              background: answer.isPrimary 
                ? colors.answerPrimaryGradient
                : colors.answerSecondaryGradient,
              color: colors.answerColor,
              border: 'none',
              borderRadius: '12px',
              boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.15)',
              fontSize: '14px',
              fontWeight: '500',
              width: '320px',
              height: '140px'
            }
          }
        })
        
        edges.push({
          id: `edge-${startQuestion.id}-${answer.id}`,
          source: startQuestion.id,
          target: answer.id,
          animated: false,
          style: { 
            stroke: answer.isPrimary ? colors.primaryEdge : colors.secondaryEdge, 
            strokeWidth: 4,
            strokeDasharray: '0'
          },
          type: 'smoothstep'
        })
        
        // Add navigation edges
        if (answer.actions && Array.isArray(answer.actions)) {
          answer.actions.forEach(action => {
            if (action.type === 'navigate_to_question' && action.payload?.questionId) {
              edges.push({
                id: `edge-${answer.id}-${action.payload.questionId}`,
                source: answer.id,
                target: action.payload.questionId,
                animated: true,
                style: { 
                  stroke: colors.navigationEdge, 
                  strokeWidth: 3,
                  strokeDasharray: '8,4'
                },
                type: 'smoothstep'
              })
            }
          })
        }
      })
    }
    
    // Place other questions in a clean grid below with generous spacing
    const otherQuestions = flow.questions.filter(q => q.id !== startQuestion.id)
    const cols = Math.ceil(Math.sqrt(otherQuestions.length))
    const cellWidth = 400 // Increased cell width
    const cellHeight = 300 // Increased cell height
    
    otherQuestions.forEach((question, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = 200 + (col * cellWidth)
      const y = 700 + (row * cellHeight)
      
      nodes.push({
        id: question.id,
        type: 'question',
        position: { x, y },
        data: { 
          label: question.text, 
          question,
          style: {
            background: colors.otherQuestionGradient,
            color: colors.otherQuestionColor,
            border: 'none',
            borderRadius: '14px',
            boxShadow: isDarkMode ? '0 5px 18px rgba(0,0,0,0.3)' : '0 5px 18px rgba(0,0,0,0.12)',
            fontSize: '15px',
            fontWeight: '500',
            width: '380px',
            height: '160px'
          }
        }
      })
    })
    
    return { nodes, edges }
  }, [getThemeColors, isDarkMode])

  // Initialize nodes and edges from currentEditingFlow with Auto Layout
  React.useEffect(() => {
    if (currentEditingFlow && currentEditingFlow.questions && Array.isArray(currentEditingFlow.questions)) {
      // Apply auto layout automatically when flow loads
      const { nodes: layoutNodes, edges: layoutEdges } = applyAutoLayout(currentEditingFlow)
      setNodes(layoutNodes)
      setEdges(layoutEdges)
      
      // Fit view after a short delay to ensure nodes are rendered
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.1 })
        }
      }, 100)
    } else {
      setNodes([])
      setEdges([])
    }
  }, [currentEditingFlow, setNodes, setEdges, applyAutoLayout, reactFlowInstance])

  const onConnect = useCallback(
    (params) => {
      // Add the edge to the visual flow
      setEdges((eds) => addEdge(params, eds))
      
      // Update the flow data to create the navigation action
      const updatedFlow = { ...currentEditingFlow }
      
      // Find the source answer and target question
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      
      if (sourceNode && targetNode && sourceNode.type === 'answer' && targetNode.type === 'question') {
        // Find the answer in the flow
        let questionIndex = -1
        let answerIndex = -1
        
        updatedFlow.questions.forEach((question, qIndex) => {
          const aIndex = question.answers.findIndex(a => a.id === params.source)
          if (aIndex !== -1) {
            questionIndex = qIndex
            answerIndex = aIndex
          }
        })
        
        if (questionIndex !== -1 && answerIndex !== -1) {
          // Create or update the navigate action
          const navigateAction = createAction('navigate_to_question', { 
            questionId: params.target 
          })
          
          // Remove any existing navigate actions and add the new one
          updatedFlow.questions[questionIndex].answers[answerIndex].actions = 
            updatedFlow.questions[questionIndex].answers[answerIndex].actions.filter(
              action => action.type !== 'navigate_to_question'
            )
          updatedFlow.questions[questionIndex].answers[answerIndex].actions.push(navigateAction)
          
          updateChatFlow(updatedFlow)
        }
      }
    },
    [setEdges, currentEditingFlow, nodes, updateChatFlow]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      
      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      let newNode

      if (type === 'question') {
        const newQuestion = createQuestion('New Question', position)
        newNode = {
          id: newQuestion.id,
          type,
          position,
          data: { label: newQuestion.text, question: newQuestion }
        }
        
        // Update the flow with the new question
        const updatedFlow = addQuestionToChatFlow(currentEditingFlow, newQuestion)
        updateChatFlow(updatedFlow)
      } else if (type === 'answer') {
        // Only allow answers to be created from question nodes
        if (!selectedNode || selectedNode.type !== 'question') {
          alert('Please select a question node first to add an answer')
          return
        }
        
        const newAnswer = createAnswer('New Answer')
        
        // Calculate proper position for new answer (will be repositioned by Dagre on next layout)
        const existingAnswers = selectedNode.data.question.answers || []
        const answerPosition = {
          x: selectedNode.position.x + 400, // Temporary position, Dagre will optimize
          y: selectedNode.position.y + (existingAnswers.length * 100)
        }
        
        newNode = {
          id: newAnswer.id,
          type,
          position: answerPosition,
          data: { label: newAnswer.text, answer: newAnswer }
        }
        
        // Add edge from selected question to new answer
        const newEdge = {
          id: `edge-${selectedNode.id}-${newAnswer.id}`,
          source: selectedNode.id,
          target: newAnswer.id,
          animated: false
        }
        
        setEdges((eds) => eds.concat(newEdge))
        
        // Update the flow with the new answer
        const updatedFlow = { ...currentEditingFlow }
        const questionIndex = updatedFlow.questions.findIndex(q => q.id === selectedNode.id)
        
        if (questionIndex !== -1) {
          updatedFlow.questions[questionIndex].answers.push(newAnswer)
          updateChatFlow(updatedFlow)
        }
      }

      if (newNode) {
        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, selectedNode, currentEditingFlow, updateChatFlow, setNodes, setEdges]
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setEditingNode(node)
    setShowPropertiesPanel(true)
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    
    // Update node positions in the flow
    const updatedFlow = { ...currentEditingFlow }
    
    nodes.forEach(node => {
      if (node.type === 'question') {
        const questionIndex = updatedFlow.questions.findIndex(q => q.id === node.id)
        if (questionIndex !== -1) {
          updatedFlow.questions[questionIndex].position = node.position
        }
      }
    })
    
    updateChatFlow(updatedFlow)
    setIsSaving(false)
  }

  // Advanced layout controls
  const [currentLayout, setCurrentLayout] = useState('hierarchical')
  
  const handleAutoLayout = (layoutType = currentLayout) => {
    if (!currentEditingFlow || !currentEditingFlow.questions) return
    
    setCurrentLayout(layoutType)
    const { nodes: layoutNodes, edges: layoutEdges } = applyAutoLayout(currentEditingFlow, layoutType)
    setNodes(layoutNodes)
    setEdges(layoutEdges)
    
    // Ultra-smooth fit view with professional animation
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ 
          padding: 0.15,
          duration: 1200,
          minZoom: 0.2,
          maxZoom: 1.5,
          includeHiddenNodes: false
        })
      }
    }, 150)
  }

  // Advanced zoom controls
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 300 })
    }
  }

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 300 })
    }
  }

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ 
        padding: 0.15,
        duration: 1000,
        minZoom: 0.2,
        maxZoom: 1.5,
        includeHiddenNodes: false
      })
    }
  }

  const handleZoomToSelection = () => {
    if (reactFlowInstance && selectedNode) {
      reactFlowInstance.fitView({ 
        padding: 0.3,
        duration: 600,
        nodes: [selectedNode.id]
      })
    }
  }

  const handleResetZoom = () => {
    if (reactFlowInstance) {
      reactFlowInstance.setZoom(1)
      reactFlowInstance.setCenter(0, 0, { duration: 600 })
    }
  }

  const handleBack = () => {
    clearCurrentEditingFlow()
  }

  // Properties panel functions
  const handleClosePropertiesPanel = () => {
    setShowPropertiesPanel(false)
    setEditingNode(null)
    setSelectedNode(null)
  }

  const handleUpdateNodeText = (newText) => {
    if (!editingNode) return
    
    setNodes(nodes => nodes.map(node => 
      node.id === editingNode.id 
        ? { ...node, data: { ...node.data, label: newText } }
        : node
    ))
    
    setEditingNode(prev => ({ ...prev, data: { ...prev.data, label: newText } }))
  }

  const handleUpdateAnswerText = (answerId, newText) => {
    if (!editingNode || editingNode.type !== 'question') return
    
    setNodes(nodes => nodes.map(node => {
      if (node.id === editingNode.id) {
        const updatedQuestion = { ...node.data.question }
        if (updatedQuestion.answers) {
          updatedQuestion.answers = updatedQuestion.answers.map(answer =>
            answer.id === answerId ? { ...answer, text: newText } : answer
          )
        }
        return { ...node, data: { ...node.data, question: updatedQuestion } }
      }
      return node
    }))
  }

  const handleAddAnswer = () => {
    if (!editingNode || editingNode.type !== 'question') return
    
    const newAnswer = createAnswer('New Answer')
    const updatedQuestion = { ...editingNode.data.question }
    updatedQuestion.answers = [...(updatedQuestion.answers || []), newAnswer]
    
    setNodes(nodes => nodes.map(node => 
      node.id === editingNode.id 
        ? { ...node, data: { ...node.data, question: updatedQuestion } }
        : node
    ))
    
    setEditingNode(prev => ({ ...prev, data: { ...prev.data, question: updatedQuestion } }))
  }

  const handleDeleteAnswer = (answerId) => {
    if (!editingNode || editingNode.type !== 'question') return
    
    const updatedQuestion = { ...editingNode.data.question }
    updatedQuestion.answers = updatedQuestion.answers?.filter(answer => answer.id !== answerId) || []
    
    setNodes(nodes => nodes.map(node => 
      node.id === editingNode.id 
        ? { ...node, data: { ...node.data, question: updatedQuestion } }
        : node
    ))
    
    setEditingNode(prev => ({ ...prev, data: { ...prev.data, question: updatedQuestion } }))
  }

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  if (!currentEditingFlow) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-base-100">
      <div className="flex justify-between items-center p-4 border-b border-base-300 bg-base-200">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleBack}
            className="p-2 rounded-full transition-colors hover:bg-base-300 text-base-content"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-base-content">{currentEditingFlow.name} - Flow Editor</h2>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Layout Controls */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => handleAutoLayout('hierarchical')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentLayout === 'hierarchical' 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300 text-base-content hover:bg-base-400'
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => handleAutoLayout('radial')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentLayout === 'radial' 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300 text-base-content hover:bg-base-400'
              }`}
            >
              Radial
            </button>
            <button
              onClick={() => handleAutoLayout('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                currentLayout === 'grid' 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300 text-base-content hover:bg-base-400'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded transition-colors bg-base-300 text-base-content hover:bg-base-400"
              title="Zoom Out"
            >
              <span className="text-lg font-bold">−</span>
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded transition-colors bg-base-300 text-base-content hover:bg-base-400"
              title="Zoom In"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button
              onClick={handleFitView}
              className="px-3 py-2 rounded text-sm transition-colors bg-base-300 text-base-content hover:bg-base-400"
              title="Fit View"
            >
              Fit
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-2 rounded text-sm transition-colors bg-base-300 text-base-content hover:bg-base-400"
              title="Reset Zoom"
            >
              1:1
            </button>
          </div>

          {/* Main Actions */}
          <button
            onClick={handleAutoLayout}
            className="flex gap-2 items-center px-4 py-2 rounded-lg transition-colors bg-secondary text-secondary-content hover:bg-secondary-focus"
          >
            <Layers size={16} />
            Layout
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex gap-2 items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-content hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="p-4 w-64 border-r border-base-300 bg-base-200">
          <h3 className="mb-4 font-medium text-base-content">Elements</h3>
          
          <div className="mb-4">
            <div
              className="flex gap-2 items-center p-3 mb-2 rounded border transition-colors cursor-move border-base-300 bg-base-100 text-base-content hover:bg-base-300"
              onDragStart={(event) => onDragStart(event, 'question')}
              draggable
            >
              <MessageSquare size={16} />
              <span>Question</span>
            </div>
            
            <div
              className="flex gap-2 items-center p-3 rounded border transition-colors cursor-move border-base-300 bg-base-100 text-base-content hover:bg-base-300"
              onDragStart={(event) => onDragStart(event, 'answer')}
              draggable
            >
              <Plus size={16} />
              <span>Answer</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="mb-2 font-medium text-base-content">Instructions</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li>• Drag elements from the sidebar to the canvas</li>
              <li>• Connect nodes by dragging from the handles</li>
              <li>• Click on nodes to edit their properties</li>
              <li>• Save changes when you're done</li>
            </ul>
          </div>
        </div>
        
        <div className={`flex-1 bg-base-100 ${showPropertiesPanel ? 'flex' : ''}`} ref={reactFlowWrapper}>
          <div className={`${showPropertiesPanel ? 'flex-1' : 'w-full'} h-full`}>
            <ReactFlowProvider>
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
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
                style={{ width: '100%', height: '100%' }}
                minZoom={0.1}
                maxZoom={4}
                zoomOnScroll={true}
                zoomOnPinch={true}
                panOnDrag={true}
                panOnScroll={false}
                selectNodesOnDrag={false}
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode={['Meta', 'Ctrl']}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  animated: false,
                  style: {
                    strokeWidth: 3,
                    stroke: '#64748b'
                  }
                }}
              >
                <Controls 
                  className={`${isDarkMode ? 'bg-slate-800/90 border-slate-600' : 'bg-white/90 border-slate-200'} backdrop-blur-sm shadow-lg rounded-lg`}
                  showZoom={true}
                  showFitView={true}
                  showInteractive={true}
                />
                <MiniMap 
                  className={`${isDarkMode ? 'bg-slate-800/90 border-slate-600' : 'bg-white/90 border-slate-200'} backdrop-blur-sm shadow-lg rounded-lg`}
                  nodeColor={(node) => {
                    if (node.type === 'question') return isDarkMode ? '#3b82f6' : '#667eea'
                    if (node.type === 'answer') return isDarkMode ? '#06b6d4' : '#4facfe'
                    return isDarkMode ? '#64748b' : '#94a3b8'
                  }}
                  maskColor={isDarkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)"}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Background 
                  variant="dots" 
                  gap={20} 
                  size={1.5} 
                  color={isDarkMode ? "rgba(148, 163, 184, 0.1)" : "rgba(148, 163, 184, 0.2)"}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}
                />
                
                {/* Flow Origin Indicator */}
                {nodes.length > 0 && (
                  <Panel position="top-left" className="bg-transparent">
                    <button
                      onClick={() => {
                        const initialNode = nodes.find(n => n.data.isInitial)
                        if (initialNode && reactFlowInstance) {
                          reactFlowInstance.fitView({ 
                            nodes: [initialNode.id],
                            padding: 0.3,
                            duration: 800
                          })
                        }
                      }}
                      className="flex items-center gap-2 bg-warning/90 hover:bg-warning text-warning-content px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 cursor-pointer hover:scale-105"
                      title="Click to focus on starting node"
                    >
                      <div className="w-2 h-2 bg-warning-content rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Origin</span>
                      <div className="text-xs">
                        {nodes.filter(n => n.data.isInitial).length > 0 ? '🌟' : '📍'}
                      </div>
                    </button>
                  </Panel>
                )}
                
                {/* Flow Direction Indicator with Quick Switcher */}
                <Panel position="top-right" className="bg-transparent">
                  <div className="flex items-center gap-1 bg-base-200/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-base-300/50">
                    <div className="text-xs text-base-content/60 px-2 font-medium">Layout:</div>
                    <button
                      onClick={() => handleAutoLayout('hierarchical')}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 cursor-pointer ${
                        currentLayout === 'hierarchical' 
                          ? 'bg-primary text-primary-content scale-105 shadow-md' 
                          : 'bg-base-300/60 hover:bg-base-300 text-base-content hover:scale-105'
                      }`}
                      title="Hierarchical Layout - Top to Bottom"
                    >
                      <span className="text-xs font-bold">↑</span>
                    </button>
                    
                    <button
                      onClick={() => handleAutoLayout('radial')}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 cursor-pointer ${
                        currentLayout === 'radial' 
                          ? 'bg-primary text-primary-content scale-105 shadow-md' 
                          : 'bg-base-300/60 hover:bg-base-300 text-base-content hover:scale-105'
                      }`}
                      title="Radial Layout - Center Outward"
                    >
                      <span className="text-xs font-bold">⊙</span>
                    </button>
                    
                    <button
                      onClick={() => handleAutoLayout('grid')}
                      className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 cursor-pointer ${
                        currentLayout === 'grid' 
                          ? 'bg-primary text-primary-content scale-105 shadow-md' 
                          : 'bg-base-300/60 hover:bg-base-300 text-base-content hover:scale-105'
                      }`}
                      title="Grid Layout - Organized Grid"
                    >
                      <span className="text-xs font-bold">⊞</span>
                    </button>
                  </div>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </div>
          
          {/* Properties Panel */}
          {showPropertiesPanel && editingNode && (
            <div className="w-80 bg-base-200 border-l border-base-300 flex flex-col">
              <div className="p-4 border-b border-base-300 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-base-content">
                  {editingNode.type === 'question' ? 'Question Properties' : 'Answer Properties'}
                </h3>
                <button
                  onClick={handleClosePropertiesPanel}
                  className="p-1 rounded hover:bg-base-300 text-base-content"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Node Text Editor */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-base-content mb-2">
                    {editingNode.type === 'question' ? 'Question Text' : 'Answer Text'}
                  </label>
                  <textarea
                    value={editingNode.data.label}
                    onChange={(e) => handleUpdateNodeText(e.target.value)}
                    className="w-full p-3 border border-base-300 rounded-lg bg-base-100 text-base-content resize-none"
                    rows={4}
                    placeholder="Enter text..."
                  />
                </div>
                
                {/* Answer Management for Questions */}
                {editingNode.type === 'question' && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-base-content">Answers</h4>
                      <button
                        onClick={handleAddAnswer}
                        className="px-3 py-1 bg-primary text-primary-content rounded text-sm hover:bg-primary-focus"
                      >
                        + Add Answer
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {editingNode.data.question?.answers?.map((answer, index) => (
                        <div key={answer.id} className="p-3 bg-base-100 rounded-lg border border-base-300">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-base-content/70">Answer {index + 1}</span>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="text-error hover:text-error-focus text-sm"
                            >
                              Delete
                            </button>
                          </div>
                          <textarea
                            value={answer.text}
                            onChange={(e) => handleUpdateAnswerText(answer.id, e.target.value)}
                            className="w-full p-2 border border-base-300 rounded bg-base-200 text-base-content resize-none text-sm"
                            rows={2}
                            placeholder="Enter answer text..."
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-base-content/70">
                              <input
                                type="checkbox"
                                checked={answer.isPrimary || false}
                                onChange={(e) => {
                                  // Handle primary answer toggle
                                }}
                                className="rounded"
                              />
                              Primary
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Node Info */}
                <div className="mt-6 p-3 bg-base-100 rounded-lg border border-base-300">
                  <h4 className="text-sm font-medium text-base-content mb-2">Node Info</h4>
                  <div className="space-y-1 text-xs text-base-content/70">
                    <div>Type: {editingNode.type}</div>
                    <div>ID: {editingNode.id}</div>
                    {editingNode.data.isInitial && (
                      <div className="text-warning font-medium">🌟 Starting Node</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatFlowEditor