import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import { edpsAPI, CreateEDPSData } from '../services/api'
import './Flow.css'

interface EDPSFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'number' | 'title' | 'description' | 'target' | 'images' | 'confirm' | 'complete'

function EDPSFlow({ onBack }: EDPSFlowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const hasInitialized = useRef(false)
  
  const [formData, setFormData] = useState<CreateEDPSData>({
    normNumber: '',
    title: '',
    description: '',
    target: '',
    images: []
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      addAssistantMessage('Hello! I can help you create a new EDPS norm. What would you like to do?')
      setQuickReplies(['Create new norm', 'View existing norms'])
    }
  }, [])

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = async (message: string) => {
    addUserMessage(message)
    setIsProcessing(true)
    setQuickReplies([])

    setTimeout(() => {
      processStep(message)
      setIsProcessing(false)
    }, 800)
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  const processStep = (userInput: string) => {
    switch (step) {
      case 'initial':
        if (userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('new')) {
          const suggestedNumber = Math.floor(10000 + Math.random() * 90000).toString()
          setFormData(prev => ({ ...prev, normNumber: suggestedNumber }))
          addAssistantMessage(`Great! Let's create a new EDPS norm. I suggest the norm number: ${suggestedNumber}. Please provide a title for this norm.`)
          setStep('title')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing')) {
          addAssistantMessage('Fetching existing norms...')
          fetchExistingNorms()
        } else {
          addAssistantMessage('I can help you create a new norm or view existing norms. What would you like to do?')
          setQuickReplies(['Create new norm', 'View existing norms'])
        }
        break

      case 'title':
        setFormData(prev => ({ ...prev, title: userInput }))
        addAssistantMessage(`Perfect! Title set to: "${userInput}". Now, please provide a detailed description of this norm (step-by-step procedure).`)
        setStep('description')
        break

      case 'description':
        setFormData(prev => ({ ...prev, description: userInput }))
        addAssistantMessage('Great description! Now, what is the target or objective for this norm?')
        setStep('target')
        break

      case 'target':
        setFormData(prev => ({ ...prev, target: userInput }))
        addAssistantMessage('Excellent! Would you like to add images related to this norm?')
        setQuickReplies(['Yes, add images', 'No, skip images'])
        setStep('images')
        break

      case 'images':
        if (userInput.toLowerCase().includes('yes')) {
          addAssistantMessage('Please provide image URLs separated by commas, or type "done" when finished.')
        } else {
          addAssistantMessage(`Perfect! Here's a summary of your new norm:\n\n**Norm Number:** ${formData.normNumber}\n**Title:** ${formData.title}\n**Description:** ${formData.description}\n**Target:** ${formData.target}\n\nWould you like to save this norm?`)
          setQuickReplies(['Yes, save it', 'No, cancel'])
          setStep('confirm')
        }
        break

      case 'confirm':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save')) {
          saveNorm()
        } else {
          addAssistantMessage('Norm creation cancelled. Would you like to start over?')
          setQuickReplies(['Start over', 'Go back to home'])
          setStep('initial')
        }
        break

      case 'complete':
        if (userInput.toLowerCase().includes('another')) {
          resetForm()
        } else {
          onBack()
        }
        break

      default:
        break
    }
  }

  const saveNorm = async () => {
    try {
      addAssistantMessage('Saving your norm...')
      const response = await edpsAPI.create(formData)
      
      addAssistantMessage(`✅ Success! Norm ${formData.normNumber} has been created with ID: ${response.data.data.id}. Would you like to link this norm to a DFMEA entry?`)
      setQuickReplies(['Yes, link to DFMEA', 'No, create another norm', 'Go back to home'])
      setStep('complete')
    } catch (error) {
      addAssistantMessage('❌ Sorry, there was an error saving the norm. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const fetchExistingNorms = async () => {
    try {
      const response = await edpsAPI.getAll()
      const norms = response.data.data
      
      if (norms.length === 0) {
        addAssistantMessage('No existing norms found. Would you like to create one?')
        setQuickReplies(['Create new norm'])
      } else {
        let normsList = `Found ${norms.length} existing norms:\n\n`
        norms.slice(0, 5).forEach(norm => {
          normsList += `📋 **${norm.normNumber}** - ${norm.title}\n`
        })
        addAssistantMessage(normsList)
        setQuickReplies(['Create new norm', 'Go back to home'])
      }
    } catch (error) {
      addAssistantMessage('❌ Error fetching norms. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const resetForm = () => {
    setFormData({
      normNumber: '',
      title: '',
      description: '',
      target: '',
      images: []
    })
    setStep('initial')
    addAssistantMessage('Let\'s create another norm! What would you like to do?')
    setQuickReplies(['Create new norm', 'View existing norms'])
  }

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h2>📋 EDPS - Engineering Design Practices</h2>
        <p className="flow-description">Create and manage engineering norms and standards</p>
      </div>
      
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onQuickReply={handleQuickReply}
        quickReplies={quickReplies}
        isProcessing={isProcessing}
        placeholder="Type your response..."
      />
    </div>
  )
}

export default EDPSFlow




