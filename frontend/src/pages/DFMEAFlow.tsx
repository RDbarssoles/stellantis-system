import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import { dfmeaAPI, edpsAPI, dvpAPI, CreateDFMEAData, EDPS, DVP, exportAPI } from '../services/api'
import './Flow.css'

interface DFMEAFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'genericFailure' | 'failureMode' | 'cause' | 'prevention' | 'selectEdps' | 'detection' | 'selectDvp' | 'ratings' | 'confirm' | 'export' | 'complete'

function DFMEAFlow({ onBack }: DFMEAFlowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [availableEdps, setAvailableEdps] = useState<EDPS[]>([])
  const [availableDvp, setAvailableDvp] = useState<DVP[]>([])
  const [createdDfmeaId, setCreatedDfmeaId] = useState<string>('')
  const hasInitialized = useRef(false)
  
  const [formData, setFormData] = useState<CreateDFMEAData>({
    genericFailure: '',
    failureMode: '',
    cause: '',
    severity: 5,
    occurrence: 5,
    detection: 5
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      addAssistantMessage('Hello! I can help you create a new DFMEA entry. What would you like to do?')
      setQuickReplies(['Create new DFMEA', 'View existing DFMEAs'])
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

  const processStep = async (userInput: string) => {
    switch (step) {
      case 'initial':
        if (userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('new')) {
          addAssistantMessage('Great! Let\'s create a new DFMEA entry. Please describe the generic failure or system.')
          setStep('genericFailure')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing')) {
          addAssistantMessage('Fetching existing DFMEA entries...')
          await fetchExistingDFMEA()
        } else {
          addAssistantMessage('I can help you create a new DFMEA or view existing entries. What would you like to do?')
          setQuickReplies(['Create new DFMEA', 'View existing DFMEAs'])
        }
        break

      case 'genericFailure':
        setFormData(prev => ({ ...prev, genericFailure: userInput }))
        addAssistantMessage(`Generic failure set to: "${userInput}". Now, what is the specific failure mode?`)
        setStep('failureMode')
        break

      case 'failureMode':
        setFormData(prev => ({ ...prev, failureMode: userInput }))
        addAssistantMessage('Good! What is the cause of this failure mode?')
        setStep('cause')
        break

      case 'cause':
        setFormData(prev => ({ ...prev, cause: userInput }))
        addAssistantMessage('Perfect! Now, would you like to add a prevention control (EDPS norm)?')
        setQuickReplies(['Yes, link EDPS norm', 'No, skip prevention control'])
        setStep('prevention')
        break

      case 'prevention':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('link')) {
          await fetchEDPSNorms()
        } else {
          addAssistantMessage('Would you like to add a detection control (DVP test)?')
          setQuickReplies(['Yes, link DVP test', 'No, skip detection control'])
          setStep('detection')
        }
        break

      case 'selectEdps':
        const selectedNorm = availableEdps.find(norm => 
          userInput.includes(norm.normNumber) || userInput.includes(norm.id)
        )
        
        if (selectedNorm) {
          setFormData(prev => ({
            ...prev,
            preventionControl: {
              type: 'EDPS',
              edpsId: selectedNorm.id,
              description: selectedNorm.title
            }
          }))
          addAssistantMessage(`✅ Linked EDPS norm: ${selectedNorm.normNumber} - ${selectedNorm.title}. Would you like to add a detection control (DVP test)?`)
          setQuickReplies(['Yes, link DVP test', 'No, skip detection control'])
          setStep('detection')
        } else {
          addAssistantMessage('Could not find that norm. Please try again or skip.')
          setQuickReplies(['Skip prevention control'])
        }
        break

      case 'detection':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('link')) {
          await fetchDVPTests()
        } else {
          addAssistantMessage('Now, let\'s rate the failure. On a scale of 1-10, what is the Severity?')
          setStep('ratings')
        }
        break

      case 'selectDvp':
        const selectedTest = availableDvp.find(test => 
          userInput.includes(test.procedureId) || userInput.includes(test.id)
        )
        
        if (selectedTest) {
          setFormData(prev => ({
            ...prev,
            detectionControl: {
              type: 'DVP',
              dvpId: selectedTest.id,
              description: selectedTest.testName
            }
          }))
          addAssistantMessage(`✅ Linked DVP test: ${selectedTest.procedureId} - ${selectedTest.testName}. Now, let's rate the failure. On a scale of 1-10, what is the Severity?`)
          setStep('ratings')
        } else {
          addAssistantMessage('Could not find that test. Please try again or skip.')
          setQuickReplies(['Skip detection control'])
        }
        break

      case 'ratings':
        const severity = parseInt(userInput)
        if (!isNaN(severity) && severity >= 1 && severity <= 10) {
          setFormData(prev => ({ ...prev, severity }))
          addAssistantMessage(`Severity set to ${severity}. What is the Occurrence rating (1-10)?`)
        } else if (formData.severity && !formData.occurrence) {
          const occurrence = parseInt(userInput)
          if (!isNaN(occurrence) && occurrence >= 1 && occurrence <= 10) {
            setFormData(prev => ({ ...prev, occurrence }))
            addAssistantMessage(`Occurrence set to ${occurrence}. What is the Detection rating (1-10)?`)
          }
        } else if (formData.occurrence) {
          const detection = parseInt(userInput)
          if (!isNaN(detection) && detection >= 1 && detection <= 10) {
            setFormData(prev => ({ ...prev, detection }))
            const rpn = (formData.severity || 0) * (formData.occurrence || 0) * detection
            addAssistantMessage(`Detection set to ${detection}. RPN calculated: ${rpn}.\n\nHere's a summary:\n**Generic Failure:** ${formData.genericFailure}\n**Failure Mode:** ${formData.failureMode}\n**Cause:** ${formData.cause}\n**RPN:** ${rpn}\n\nWould you like to save this DFMEA entry?`)
            setQuickReplies(['Yes, save it', 'No, cancel'])
            setStep('confirm')
          }
        }
        break

      case 'confirm':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save')) {
          await saveDFMEA()
        } else {
          addAssistantMessage('DFMEA creation cancelled. Would you like to start over?')
          setQuickReplies(['Start over', 'Go back to home'])
          setStep('initial')
        }
        break

      case 'export':
        if (userInput.toLowerCase().includes('excel')) {
          exportAPI.exportDFMEAToExcel(createdDfmeaId)
          addAssistantMessage('✅ Downloading Excel file...')
          setQuickReplies(['Create another DFMEA', 'Go back to home'])
          setStep('complete')
        } else if (userInput.toLowerCase().includes('pdf')) {
          exportAPI.exportDFMEAToPDF(createdDfmeaId)
          addAssistantMessage('✅ Downloading PDF file...')
          setQuickReplies(['Create another DFMEA', 'Go back to home'])
          setStep('complete')
        } else {
          setQuickReplies(['Create another DFMEA', 'Go back to home'])
          setStep('complete')
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

  const fetchEDPSNorms = async () => {
    try {
      const response = await edpsAPI.getAll()
      setAvailableEdps(response.data.data)
      
      if (response.data.data.length === 0) {
        addAssistantMessage('No EDPS norms found. Would you like to skip this step?')
        setQuickReplies(['Skip prevention control'])
      } else {
        let normsList = 'Available EDPS norms:\n\n'
        response.data.data.slice(0, 5).forEach(norm => {
          normsList += `📋 **${norm.normNumber}** - ${norm.title}\n`
        })
        normsList += '\nPlease type the norm number you want to link.'
        addAssistantMessage(normsList)
        setStep('selectEdps')
      }
    } catch (error) {
      addAssistantMessage('❌ Error fetching EDPS norms.')
      setQuickReplies(['Skip prevention control'])
    }
  }

  const fetchDVPTests = async () => {
    try {
      const response = await dvpAPI.getAll()
      setAvailableDvp(response.data.data)
      
      if (response.data.data.length === 0) {
        addAssistantMessage('No DVP tests found. Would you like to skip this step?')
        setQuickReplies(['Skip detection control'])
      } else {
        let testsList = 'Available DVP test procedures:\n\n'
        response.data.data.slice(0, 5).forEach(test => {
          testsList += `🔬 **${test.procedureId}** - ${test.testName}\n`
        })
        testsList += '\nPlease type the procedure ID you want to link.'
        addAssistantMessage(testsList)
        setStep('selectDvp')
      }
    } catch (error) {
      addAssistantMessage('❌ Error fetching DVP tests.')
      setQuickReplies(['Skip detection control'])
    }
  }

  const saveDFMEA = async () => {
    try {
      addAssistantMessage('Saving your DFMEA entry...')
      const response = await dfmeaAPI.create(formData)
      setCreatedDfmeaId(response.data.data.id)
      
      addAssistantMessage(`✅ Success! DFMEA entry created with ID: ${response.data.data.id}. Would you like to export it?`)
      setQuickReplies(['Export as Excel', 'Export as PDF', 'No, continue'])
      setStep('export')
    } catch (error) {
      addAssistantMessage('❌ Sorry, there was an error saving the DFMEA entry. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const fetchExistingDFMEA = async () => {
    try {
      const response = await dfmeaAPI.getAll()
      const entries = response.data.data
      
      if (entries.length === 0) {
        addAssistantMessage('No existing DFMEA entries found. Would you like to create one?')
        setQuickReplies(['Create new DFMEA'])
      } else {
        let dfmeaList = `Found ${entries.length} existing DFMEA entries:\n\n`
        entries.slice(0, 5).forEach(entry => {
          dfmeaList += `⚠️ **${entry.genericFailure}** - ${entry.failureMode} (RPN: ${entry.rpn})\n`
        })
        addAssistantMessage(dfmeaList)
        setQuickReplies(['Create new DFMEA', 'Export all to Excel', 'Go back to home'])
      }
    } catch (error) {
      addAssistantMessage('❌ Error fetching DFMEA entries. Please try again.')
      setQuickReplies(['Retry', 'Go back to home'])
    }
  }

  const resetForm = () => {
    setFormData({
      genericFailure: '',
      failureMode: '',
      cause: '',
      severity: 5,
      occurrence: 5,
      detection: 5
    })
    setStep('initial')
    addAssistantMessage('Let\'s create another DFMEA entry! What would you like to do?')
    setQuickReplies(['Create new DFMEA', 'View existing DFMEAs'])
  }

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h2>⚠️ DFMEA - Design Failure Mode and Effects Analysis</h2>
        <p className="flow-description">Analyze failure modes and link prevention/detection controls</p>
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

export default DFMEAFlow




