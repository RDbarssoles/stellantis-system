import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import SummaryReview from '../components/SummaryReview'
import { dfmeaAPI, edpsAPI, dvpAPI, CreateDFMEAData, EDPS, DVP, exportAPI, aiToolsAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import './Flow.css'

interface DFMEAFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'aiInput' | 'genericFailure' | 'failureMode' | 'cause' | 'prevention' | 'selectEdps' | 'detection' | 'selectDvp' | 'ratings' | 'confirm' | 'review' | 'export' | 'complete'

function DFMEAFlow({ onBack }: DFMEAFlowProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [availableEdps, setAvailableEdps] = useState<EDPS[]>([])
  const [availableDvp, setAvailableDvp] = useState<DVP[]>([])
  const [createdDfmeaId, setCreatedDfmeaId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
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
      addAssistantMessage(t('dfmea.greeting'))
      setQuickReplies([
        t('dfmea.quickReplies.createNew'),
        t('dfmea.quickReplies.useAI'),
        t('dfmea.quickReplies.viewExisting')
      ])
    }
  }, [t])

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
        if (userInput.toLowerCase().includes('ai') || userInput.toLowerCase().includes('🤖') || userInput.toLowerCase().includes('ia')) {
          addAssistantMessage(t('dfmea.aiPrompt'))
          setStep('aiInput')
        } else if (userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('new') || userInput.toLowerCase().includes('criar')) {
          addAssistantMessage('Great! Let\'s create a new DFMEA entry. Please describe the generic failure or system.')
          setStep('genericFailure')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing') || userInput.toLowerCase().includes('ver')) {
          addAssistantMessage('Fetching existing DFMEA entries...')
          await fetchExistingDFMEA()
        } else {
          addAssistantMessage('I can help you create a new DFMEA or view existing entries. What would you like to do?')
          setQuickReplies([
            t('dfmea.quickReplies.createNew'),
            t('dfmea.quickReplies.useAI'),
            t('dfmea.quickReplies.viewExisting')
          ])
        }
        break

      case 'aiInput':
        await generateWithAI(userInput)
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
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('link') || 
            userInput.toLowerCase().includes('sim') || userInput.toLowerCase().includes('vincular')) {
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
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('link') || 
            userInput.toLowerCase().includes('sim') || userInput.toLowerCase().includes('vincular')) {
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
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save') || 
            userInput.toLowerCase().includes('sim') || userInput.toLowerCase().includes('revisar') || 
            userInput.toLowerCase().includes('review')) {
          setStep('review')
        } else {
          addAssistantMessage('DFMEA creation cancelled. Would you like to start over?')
          setQuickReplies(['Start over', 'Go back to home'])
          setStep('initial')
        }
        break

      case 'export':
        if (userInput.toLowerCase().includes('excel')) {
          exportAPI.exportDFMEAToExcel(createdDfmeaId)
          addAssistantMessage(`✅ ${t('common.downloadingExcel')}`)
          setQuickReplies([`${t('common.createAnother')} DFMEA`, t('common.goBackToHome')])
          setStep('complete')
        } else if (userInput.toLowerCase().includes('pdf')) {
          exportAPI.exportDFMEAToPDF(createdDfmeaId)
          addAssistantMessage(`✅ ${t('common.downloadingPDF')}`)
          setQuickReplies([`${t('common.createAnother')} DFMEA`, t('common.goBackToHome')])
          setStep('complete')
        } else {
          setQuickReplies([`${t('common.createAnother')} DFMEA`, t('common.goBackToHome')])
          setStep('complete')
        }
        break

      case 'complete':
        if (userInput.toLowerCase().includes('another') || userInput.toLowerCase().includes('outro') || 
            userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('criar')) {
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

  const handleSaveFromReview = async () => {
    setIsSaving(true)
    try {
      const response = await dfmeaAPI.create(formData)
      setCreatedDfmeaId(response.data.data.id)
      addAssistantMessage(`✅ ${t('common.successCreatedWithId')} ${response.data.data.id}. ${t('common.wouldYouLikeToExport')}`)
      setQuickReplies([t('common.exportAsExcel'), t('common.exportAsPDF'), t('common.noContinue')])
      setStep('export')
    } catch (error) {
      addAssistantMessage(`❌ ${t('common.errorSaving')}`)
      setQuickReplies([t('common.retry'), t('common.goBack')])
      setStep('initial')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditFromReview = () => {
    setStep('genericFailure')
    addAssistantMessage('Let\'s edit the DFMEA. Please describe the generic failure or system.')
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

  const parseAIResponse = (aiData: any) => {
    console.log('Raw AI Data:', aiData)
    console.log('AI Data Type:', typeof aiData)
    
    let parsedData = aiData
    
    // If it's a string, try to parse it
    if (typeof aiData === 'string') {
      try {
        let cleanedData = aiData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedData = JSON.parse(cleanedData)
      } catch (e) {
        console.warn('Failed to parse AI response as JSON, using as-is')
        parsedData = { failureMode: aiData }
      }
    }

    // Handle nested response structure (SAI Library might wrap the response)
    if (parsedData.response || parsedData.output || parsedData.result) {
      parsedData = parsedData.response || parsedData.output || parsedData.result
    }

    // Extract fields - SAI Library uses these specific field names:
    // Generic_failure, Potencial_failure_modes, Potencial_effect(s)_of_failure
    // Note: "Potencial" is Portuguese spelling (1 't'), not "Potential" English (2 't's)
    
    // Generic Failure
    const genericFailure = parsedData['Generic_failure'] || parsedData['generic_failure'] || 
                          parsedData['genericFailure'] ||
                          parsedData['falha_generica'] || parsedData['falha_genérica'] ||
                          parsedData['system'] || parsedData['sistema'] || 
                          parsedData['component'] || parsedData['componente'] || ''
    
    // Failure Mode - SAI uses "Potencial" (Portuguese - 1 't')
    const failureMode = parsedData['Potencial_failure_modes'] || parsedData['Potential_failure_modes'] || 
                       parsedData['potential_failure_modes'] ||
                       parsedData['failureMode'] || parsedData['failure_mode'] || 
                       parsedData['modo_de_falha'] || parsedData['mode'] || 
                       parsedData['falha'] || ''
    
    // Cause / Effects - SAI uses "Potencial" (Portuguese - 1 't')
    const cause = parsedData['Potencial_effect(s)_of_failure'] || 
                 parsedData['Potential_effect(s)_of_failure'] || 
                 parsedData['Potential_effects_of_failure'] ||
                 parsedData['potential_effects_of_failure'] ||
                 parsedData['cause'] || parsedData['causa'] || 
                 parsedData['rootCause'] || parsedData['root_cause'] ||
                 parsedData['causa_raiz'] || parsedData['effects'] || parsedData['effect'] || ''
                 
    const severity = parseInt(parsedData.severity || parsedData.severidade || parsedData.severidad || '5') || 5
    const occurrence = parseInt(parsedData.occurrence || parsedData.ocorrencia || parsedData.ocorrência || parsedData.ocurrencia || '5') || 5
    const detection = parseInt(parsedData.detection || parsedData.deteccao || parsedData.detecção || parsedData.deteccion || '5') || 5

    const result = {
      genericFailure,
      failureMode,
      cause,
      severity,
      occurrence,
      detection
    }
    
    console.log('Parsed Result:', result)
    return result
  }

  const generateWithAI = async (description: string) => {
    try {
      addAssistantMessage(t('dfmea.messages.aiGenerating'))
      const response = await aiToolsAPI.generateDFMEA(description)
      
      if (response.data.success) {
        console.log('DFMEA AI Response:', response.data.data)
        const parsed = parseAIResponse(response.data.data)
        console.log('Parsed DFMEA Data:', parsed)
        
        const rpn = parsed.severity * parsed.occurrence * parsed.detection
        
        // Show more details in the message
        addAssistantMessage(`${t('dfmea.messages.aiSuccess')}\n\n**${t('dfmea.messages.genericFailureLabel')}** ${parsed.genericFailure || t('common.empty')}\n**${t('dfmea.messages.failureModeLabel')}** ${parsed.failureMode || t('common.empty')}\n**${t('dfmea.messages.causeLabel')}** ${parsed.cause || t('common.empty')}\n**${t('dfmea.messages.rpnLabel')}** ${rpn}\n\n${t('dfmea.messages.aiSuccessDetail')}`)
        
        setFormData(prev => ({
          ...prev,
          ...parsed
        }))
        setQuickReplies([t('common.yesReviewIt'), t('common.noStartOver')])
        setStep('confirm')
      } else {
        throw new Error((response.data as any).error || 'AI generation failed')
      }
    } catch (error: any) {
      console.error('AI Tool Error:', error)
      addAssistantMessage(`${t('dfmea.messages.aiError')} ${error.response?.data?.error || error.message}. ${t('dfmea.messages.createManually')}`)
      setQuickReplies([t('common.createManually'), t('common.tryAgain'), t('common.goBack')])
      setStep('initial')
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
    setQuickReplies(['Create new DFMEA', 'Use AI Tool 🤖', 'View existing DFMEAs'])
  }

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (step === 'review') {
    const warningMessage = !formData.genericFailure || !formData.failureMode 
      ? 'Você precisa preencher todos os campos em Dados Básicos antes de salvar.'
      : undefined

    const rpn = (formData.severity || 0) * (formData.occurrence || 0) * (formData.detection || 0)

    return (
      <SummaryReview
        title={t('dfmea.summary.title')}
        subtitle={t('dfmea.summary.subtitle')}
        sections={[
          {
            title: t('dfmea.summary.sectionBasicData'),
            fields: [
              { label: t('dfmea.fields.genericFailure'), value: formData.genericFailure, fullWidth: true, fieldName: 'genericFailure', type: 'text', placeholder: t('dfmea.fields.genericFailure') },
              { label: t('dfmea.fields.failureMode'), value: formData.failureMode, fullWidth: true, fieldName: 'failureMode', type: 'textarea', placeholder: t('dfmea.fields.failureMode') },
              { label: t('dfmea.fields.cause'), value: formData.cause, fullWidth: true, fieldName: 'cause', type: 'textarea', placeholder: t('dfmea.fields.cause') }
            ]
          },
          {
            title: 'Controles',
            fields: [
              { label: 'Controle de Prevenção (EDPS)', value: formData.preventionControl?.description || 'Não vinculado', fullWidth: true, fieldName: 'preventionDescription', type: 'text', placeholder: 'Norma de prevenção' },
              { label: 'Controle de Detecção (DVP)', value: formData.detectionControl?.description || 'Não vinculado', fullWidth: true, fieldName: 'detectionDescription', type: 'text', placeholder: 'Teste de detecção' }
            ]
          },
          {
            title: t('dfmea.summary.sectionRatings'),
            fields: [
              { label: t('dfmea.fields.severity'), value: formData.severity, fieldName: 'severity', type: 'number', placeholder: '1-10' },
              { label: t('dfmea.fields.occurrence'), value: formData.occurrence, fieldName: 'occurrence', type: 'number', placeholder: '1-10' },
              { label: t('dfmea.fields.detection'), value: formData.detection, fieldName: 'detection', type: 'number', placeholder: '1-10' },
              { label: t('dfmea.fields.rpn'), value: rpn, fieldName: 'rpn', type: 'number', placeholder: 'Auto-calculado' }
            ]
          }
        ]}
        metrics={[
          { icon: '⚠️', value: formData.severity || 0, label: t('dfmea.fields.severity') },
          { icon: '🔄', value: formData.occurrence || 0, label: t('dfmea.fields.occurrence') },
          { icon: '🔍', value: formData.detection || 0, label: t('dfmea.fields.detection') }
        ]}
        statusBadge={{ label: t('common.draft'), type: 'draft' }}
        onSave={handleSaveFromReview}
        onEdit={handleEditFromReview}
        onFieldChange={handleFieldChange}
        isSaving={isSaving}
        warningMessage={warningMessage}
      />
    )
  }

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-button" onClick={onBack}>
          ← {t('common.backToHome')}
        </button>
        <h2>⚠️ {t('dfmea.title')}</h2>
        <p className="flow-description">{t('dfmea.description')}</p>
      </div>
      
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        onQuickReply={handleQuickReply}
        quickReplies={quickReplies}
        isProcessing={isProcessing}
        placeholder={t('chat.placeholder')}
      />
    </div>
  )
}

export default DFMEAFlow




