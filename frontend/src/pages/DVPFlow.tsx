import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import { dvpAPI, CreateDVPData } from '../services/api'
import './Flow.css'

interface DVPFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'procedureType' | 'objective' | 'testName' | 'acceptanceCriteria' | 'responsible' | 'parameterRange' | 'confirm' | 'complete'

function DVPFlow({ onBack }: DVPFlowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const hasInitialized = useRef(false)
  
  const [formData, setFormData] = useState<CreateDVPData>({
    procedureId: '',
    procedureType: 'FUNCIONAL',
    performanceObjective: '',
    testName: '',
    acceptanceCriteria: '',
    responsible: '',
    parameterRange: ''
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      addAssistantMessage('Hello! I can help you create a new DVP test procedure. What would you like to do?')
      setQuickReplies(['Create new test', 'View existing tests'])
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
          addAssistantMessage('Great! What type of procedure would you like to create?')
          setQuickReplies(['FUNCIONAL', 'ESTRUTURAL', 'AMBIENTAL', 'DURABILIDADE'])
          setStep('procedureType')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing')) {
          addAssistantMessage('Fetching existing test procedures...')
          fetchExistingTests()
        } else {
          addAssistantMessage('I can help you create a new test or view existing tests. What would you like to do?')
          setQuickReplies(['Create new test', 'View existing tests'])
        }
        break

      case 'procedureType':
        setFormData(prev => ({ ...prev, procedureType: userInput }))
        const suggestedId = `${Math.floor(1 + Math.random() * 9)}.${Math.floor(10 + Math.random() * 90)}`
        setFormData(prev => ({ ...prev, procedureId: suggestedId }))
        addAssistantMessage(`Procedure type set to: ${userInput}. I've assigned procedure ID: ${suggestedId}. What is the performance objective of this test?`)
        setStep('objective')
        break

      case 'objective':
        setFormData(prev => ({ ...prev, performanceObjective: userInput }))
        addAssistantMessage('Perfect! Now, what is the name of this test procedure?')
        setStep('testName')
        break

      case 'testName':
        setFormData(prev => ({ ...prev, testName: userInput }))
        addAssistantMessage(`Test name set to: "${userInput}". What are the acceptance criteria for this test?`)
        setStep('acceptanceCriteria')
        break

      case 'acceptanceCriteria':
        setFormData(prev => ({ ...prev, acceptanceCriteria: userInput }))
        addAssistantMessage('Great! Who is responsible for this test?')
        setStep('responsible')
        break

      case 'responsible':
        setFormData(prev => ({ ...prev, responsible: userInput }))
        addAssistantMessage('Excellent! What is the parameter range for this test? (e.g., "50N - 100N")')
        setStep('parameterRange')
        break

      case 'parameterRange':
        setFormData(prev => ({ ...prev, parameterRange: userInput }))
        addAssistantMessage(`Perfect! Here's a summary of your new test procedure:\n\n**Procedure ID:** ${formData.procedureId}\n**Type:** ${formData.procedureType}\n**Test Name:** ${formData.testName}\n**Objective:** ${formData.performanceObjective}\n**Acceptance Criteria:** ${formData.acceptanceCriteria}\n**Responsible:** ${userInput}\n**Parameter Range:** ${userInput}\n\nWould you like to save this test?`)
        setQuickReplies(['Yes, save it', 'No, cancel'])
        setStep('confirm')
        break

      case 'confirm':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save')) {
          saveTest()
        } else {
          addAssistantMessage('Test creation cancelled. Would you like to start over?')
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

  const saveTest = async () => {
    try {
      addAssistantMessage('Saving your test procedure...')
      const response = await dvpAPI.create(formData)
      
      addAssistantMessage(`✅ Success! Test procedure ${formData.procedureId} has been created with ID: ${response.data.data.id}. Would you like to link this test to a DFMEA entry?`)
      setQuickReplies(['Yes, link to DFMEA', 'No, create another test', 'Go back to home'])
      setStep('complete')
    } catch (error) {
      addAssistantMessage('❌ Sorry, there was an error saving the test. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const fetchExistingTests = async () => {
    try {
      const response = await dvpAPI.getAll()
      const tests = response.data.data
      
      if (tests.length === 0) {
        addAssistantMessage('No existing tests found. Would you like to create one?')
        setQuickReplies(['Create new test'])
      } else {
        let testsList = `Found ${tests.length} existing test procedures:\n\n`
        tests.slice(0, 5).forEach(test => {
          testsList += `🔬 **${test.procedureId}** - ${test.testName} (${test.procedureType})\n`
        })
        addAssistantMessage(testsList)
        setQuickReplies(['Create new test', 'Go back to home'])
      }
    } catch (error) {
      addAssistantMessage('❌ Error fetching tests. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const resetForm = () => {
    setFormData({
      procedureId: '',
      procedureType: 'FUNCIONAL',
      performanceObjective: '',
      testName: '',
      acceptanceCriteria: '',
      responsible: '',
      parameterRange: ''
    })
    setStep('initial')
    addAssistantMessage('Let\'s create another test! What would you like to do?')
    setQuickReplies(['Create new test', 'View existing tests'])
  }

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h2>🔬 DVP&R - Design Validation Plan & Results</h2>
        <p className="flow-description">Define test procedures and validation criteria</p>
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

export default DVPFlow




