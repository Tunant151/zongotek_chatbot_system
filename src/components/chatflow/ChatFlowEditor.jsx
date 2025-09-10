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
import { useChatFlow } from '@/context/ChatFlowContext'
import { createQuestion, createAnswer, createAction, addQuestionToChatFlow } from '@/data/chatFlowModel'
import { Plus, Save, MessageSquare, ArrowLeft, Layers } from 'lucide-react'

// Custom node components
import QuestionNode from './nodes/QuestionNode'
import AnswerNode from './nodes/AnswerNode'

const ChatFlowEditor = () => {
  const { currentEditingFlow, updateChatFlow, clearCurrentEditingFlow } = useChatFlow()
  
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => ({
    question: QuestionNode,
    answer: AnswerNode
  }), [])

  const edgeTypes = useMemo(() => ({}), [])

  // Initialize nodes and edges from currentEditingFlow
  React.useEffect(() => {
    if (currentEditingFlow && currentEditingFlow.questions && Array.isArray(currentEditingFlow.questions)) {
      // Convert questions to nodes
      const flowNodes = []
      const flowEdges = []
      
      currentEditingFlow.questions.forEach((question) => {
        // Add question node
        flowNodes.push({
          id: question.id,
          type: 'question',
          position: question.position,
          data: { label: question.text, question }
        })
        
        // Add answer nodes and edges
        if (question.answers && Array.isArray(question.answers)) {
          question.answers.forEach((answer, index) => {
          const answerId = answer.id
          const answerPosition = {
            x: question.position.x + 500,
            y: question.position.y - ((question.answers.length - 1) * 100) + (index * 200)
          }
          
          flowNodes.push({
            id: answerId,
            type: 'answer',
            position: answerPosition,
            data: { label: answer.text, answer }
          })
          
          // Add edge from question to answer
          flowEdges.push({
            id: `edge-${question.id}-${answerId}`,
            source: question.id,
            target: answerId,
            animated: false
          })
          
          // Add edges for navigate actions
          if (answer.actions && Array.isArray(answer.actions)) {
            answer.actions.forEach(action => {
              if (action.type === 'navigate_to_question' && action.payload?.questionId) {
                flowEdges.push({
                  id: `edge-${answerId}-${action.payload.questionId}`,
                  source: answerId,
                  target: action.payload.questionId,
                  animated: true,
                  style: { stroke: '#FFD700' }
                })
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
  }, [currentEditingFlow, setNodes, setEdges])

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
        
        // Calculate proper position to avoid overlapping
        const existingAnswers = selectedNode.data.question.answers || []
        const totalAnswers = existingAnswers.length + 1 // Including the new one
        const answerPosition = {
          x: selectedNode.position.x + 500,
          y: selectedNode.position.y - ((totalAnswers - 1) * 100) + (existingAnswers.length * 200)
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

  const handleAutoLayout = () => {
    if (!currentEditingFlow || !currentEditingFlow.questions) return
    
    // Simple left-to-right flowchart layout
    const organizedNodes = []
    const organizedEdges = []
    
    // Find the main/starting question
    const startQuestion = currentEditingFlow.questions.find(q => q.isInitial) || currentEditingFlow.questions[0]
    if (!startQuestion) return
    
    // Position the starting question on the left center
    const questionPosition = { x: 100, y: 300 }
    
    organizedNodes.push({
      id: startQuestion.id,
      type: 'question',
      position: questionPosition,
      data: { label: startQuestion.text, question: startQuestion }
    })
    
    // Position answers in a straight vertical line to the right
    if (startQuestion.answers && Array.isArray(startQuestion.answers)) {
      startQuestion.answers.forEach((answer, index) => {
        const answerPosition = {
          x: 600, // Fixed position to the right
          y: 100 + (index * 180) // Start from top and space them out
        }
        
        organizedNodes.push({
          id: answer.id,
          type: 'answer',
          position: answerPosition,
          data: { label: answer.text, answer }
        })
        
        // Add edge from question to answer
        organizedEdges.push({
          id: `edge-${startQuestion.id}-${answer.id}`,
          source: startQuestion.id,
          target: answer.id,
          animated: false,
          style: { stroke: '#e1a00e', strokeWidth: 2 }
        })
        
        // Add navigation edges if they exist
        if (answer.actions && Array.isArray(answer.actions)) {
          answer.actions.forEach(action => {
            if (action.type === 'navigate_to_question' && action.payload?.questionId) {
              organizedEdges.push({
                id: `edge-${answer.id}-${action.payload.questionId}`,
                source: answer.id,
                target: action.payload.questionId,
                animated: true,
                style: { stroke: '#10b981', strokeWidth: 2 }
              })
            }
          })
        }
      })
    }
    
    // Position any other questions in a second column
    const otherQuestions = currentEditingFlow.questions.filter(q => q.id !== startQuestion.id)
    otherQuestions.forEach((question, index) => {
      const questionPos = {
        x: 1100, // Second column for additional questions
        y: 200 + (index * 300)
      }
      
      organizedNodes.push({
        id: question.id,
        type: 'question',
        position: questionPos,
        data: { label: question.text, question }
      })
      
      // Position answers for other questions
      if (question.answers && Array.isArray(question.answers)) {
        question.answers.forEach((answer, answerIndex) => {
          const answerPos = {
            x: 1600, // Third column for their answers
            y: questionPos.y + (answerIndex * 150) - 75
          }
          
          organizedNodes.push({
            id: answer.id,
            type: 'answer',
            position: answerPos,
            data: { label: answer.text, answer }
          })
          
          organizedEdges.push({
            id: `edge-${question.id}-${answer.id}`,
            source: question.id,
            target: answer.id,
            animated: false,
            style: { stroke: '#e1a00e', strokeWidth: 2 }
          })
        })
      }
    })
    
    setNodes(organizedNodes)
    setEdges(organizedEdges)
  }

  const handleBack = () => {
    clearCurrentEditingFlow()
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
        
        <div className="flex gap-2">
          <button
            onClick={handleAutoLayout}
            className="flex gap-2 items-center px-4 py-2 rounded-lg transition-colors bg-secondary text-secondary-content hover:bg-secondary-focus"
          >
            <Layers size={16} />
            Auto Layout
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex gap-2 items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-content hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
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
        
        <div className="flex-1 bg-base-100" ref={reactFlowWrapper}>
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
              className="bg-base-100"
            >
              <Controls className="bg-base-200 border-base-300" />
              <MiniMap 
                className="bg-base-200 border-base-300"
                nodeColor={(node) => {
                  if (node.type === 'question') return 'hsl(var(--p))'
                  if (node.type === 'answer') return 'hsl(var(--s))'
                  return 'hsl(var(--b3))'
                }}
                maskColor="hsl(var(--b1) / 0.8)"
              />
              <Background 
                variant="dots" 
                gap={12} 
                size={1} 
                color="hsl(var(--bc) / 0.1)"
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  )
}

export default ChatFlowEditor