import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import SummaryReview from '../components/SummaryReview'
import { dvpAPI, CreateDVPData, aiToolsAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import './Flow.css'

interface DVPFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'aiInput' | 'procedureType' | 'objective' | 'testName' | 'acceptanceCriteria' | 'responsible' | 'parameterRange' | 'confirm' | 'review' | 'complete'

function DVPFlow({ onBack }: DVPFlowProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const hasInitialized = useRef(false)
  
  const [formData, setFormData] = useState<CreateDVPData>({
    procedureId: '',
    procedureType: 'FUNCIONAL',
    performanceObjective: '',
    testName: '',
    acceptanceCriteria: '',
    responsible: '',
    parameterRange: '',
    carPart: ''
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      addAssistantMessage(t('dvp.greeting'))
      setQuickReplies([
        t('dvp.quickReplies.createNew'),
        t('dvp.quickReplies.useAI'),
        t('dvp.quickReplies.viewExisting')
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

  const processStep = (userInput: string) => {
    switch (step) {
      case 'initial':
        // Check for create/criar first (before AI check, since "criar" contains "ia")
        if (userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('new') || userInput.toLowerCase().includes('criar') || userInput.toLowerCase().includes('novo teste') || userInput.toLowerCase().includes('manualmente')) {
          const suggestedId = `${Math.floor(1 + Math.random() * 9)}.${Math.floor(10 + Math.random() * 90)}`
          setFormData({
            procedureId: suggestedId,
            procedureType: 'FUNCIONAL',
            performanceObjective: '',
            testName: '',
            acceptanceCriteria: '',
            responsible: '',
            parameterRange: '',
            carPart: ''
          })
          // Go directly to review screen with blank fields
          setStep('review')
        } else if (userInput.toLowerCase().includes('ferramenta') || userInput.toLowerCase().includes('🤖') || userInput.toLowerCase().match(/\b(ai|ia)\b/)) {
          // Use word boundary regex to match "AI" or "IA" as separate words, not inside "criar"
          addAssistantMessage(t('dvp.aiPrompt'))
          setStep('aiInput')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing') || userInput.toLowerCase().includes('ver')) {
          addAssistantMessage('Fetching existing test procedures...')
          fetchExistingTests()
        } else {
          addAssistantMessage('I can help you create a new test or view existing tests. What would you like to do?')
          setQuickReplies([
            t('dvp.quickReplies.createNew'),
            t('dvp.quickReplies.useAI'),
            t('dvp.quickReplies.viewExisting')
          ])
        }
        break

      case 'aiInput':
        generateWithAI(userInput)
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
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save') || 
            userInput.toLowerCase().includes('sim') || userInput.toLowerCase().includes('revisar') || 
            userInput.toLowerCase().includes('review')) {
          setStep('review')
        } else {
          addAssistantMessage('Test creation cancelled. Would you like to start over?')
          setQuickReplies(['Start over', 'Go back to home'])
          setStep('initial')
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

  const handleSaveFromReview = async () => {
    setIsSaving(true)
    try {
      const response = await dvpAPI.create(formData)
      addAssistantMessage(`${t('dvp.messages.testCreated')} ${response.data.data.id}. ${t('dvp.messages.testCreatedDetail')}`)
      setQuickReplies([t('dvp.messages.yesLinkToDFMEA'), t('dvp.messages.noCreateAnotherTest'), t('common.goBackToHome')])
      setStep('complete')
    } catch (error) {
      addAssistantMessage(t('dvp.messages.errorSaving'))
      setQuickReplies([t('common.retry'), t('common.goBackToHome')])
      setStep('initial')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditFromReview = () => {
    // Go back to home
    onBack()
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

  const parseAIResponse = (aiData: any) => {
    console.log('DVP Raw AI Data:', aiData)
    console.log('DVP AI Data Type:', typeof aiData)
    
    let parsedData = aiData
    if (typeof aiData === 'string') {
      try {
        let cleanedData = aiData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedData = JSON.parse(cleanedData)
      } catch (e) {
        console.warn('Failed to parse DVP AI response as JSON')
        parsedData = { testName: aiData }
      }
    }

    // Handle nested response structure
    if (parsedData.response || parsedData.output || parsedData.result) {
      parsedData = parsedData.response || parsedData.output || parsedData.result
    }

    console.log('Available DVP keys:', Object.keys(parsedData))

    const suggestedId = `${Math.floor(1 + Math.random() * 9)}.${Math.floor(10 + Math.random() * 90)}`
    // AI returns 'number_item' for procedure ID
    const procedureId = parsedData.number_item || parsedData.procedureId || parsedData.procedure_id || parsedData.id || parsedData.numero || suggestedId
    const procedureType = parsedData.procedureType || parsedData.procedure_type || parsedData.tipo || parsedData.type || 'FUNCIONAL'
    // AI returns 'performance_objective' (snake_case)
    const performanceObjective = parsedData.performance_objective || parsedData.performanceObjective || parsedData.objective || parsedData.objetivo || ''
    // AI returns 'teste_name_procedure' for test name
    const testName = parsedData.teste_name_procedure || parsedData.testName || parsedData.test_name || parsedData.nome_do_teste || parsedData.name || parsedData.nome || ''
    // AI returns 'acceptance_criteria' (snake_case)
    const acceptanceCriteria = parsedData.acceptance_criteria || parsedData.acceptanceCriteria || parsedData.criterios || parsedData.criteria || parsedData['criterios_de_aceitacao'] || parsedData['critérios_de_aceitação'] || ''
    // AI returns 'teste_responsabillity' (note the typo with double 'l')
    const responsible = parsedData.teste_responsabillity || parsedData.teste_responsibility || parsedData.responsible || parsedData.responsavel || parsedData.responsável || parsedData.responsable || 'Engineering Team'
    // Extract parameter range from acceptance criteria if not explicitly provided
    const parameterRange = parsedData.parameterRange || parsedData.parameter_range || parsedData.faixa || parsedData.range || parsedData['faixa_de_parametros'] || extractParameterRange(acceptanceCriteria)

    const result = {
      procedureId: procedureId.toString(),
      procedureType,
      performanceObjective,
      testName,
      acceptanceCriteria,
      responsible,
      parameterRange
    }
    
    console.log('DVP Parsed Result:', result)
    return result
  }

  // Helper function to extract parameter range from text
  const extractParameterRange = (text: string): string => {
    if (!text) return ''
    // Look for patterns like "50N - 100N", "50N e 100N", "entre 50N e 100N"
    const rangeMatch = text.match(/(\d+\s*[A-Za-z]+)\s*(?:e|a|-|até)\s*(\d+\s*[A-Za-z]+)/)
    if (rangeMatch) {
      return `${rangeMatch[1]} - ${rangeMatch[2]}`
    }
    return ''
  }

  const generateWithAI = async (description: string) => {
    try {
      addAssistantMessage(t('dvp.messages.aiGenerating'))
      const response = await aiToolsAPI.generateDVP(description)
      
      if (response.data.success) {
        console.log('DVP AI Response:', response.data.data)
        const parsed = parseAIResponse(response.data.data)
        console.log('Parsed DVP Data:', parsed)
        
        addAssistantMessage(`${t('dvp.messages.aiSuccess')}\n\n**${t('dvp.messages.testLabel')}** ${parsed.testName || t('common.empty')}\n**${t('dvp.messages.criteriaLabel')}** ${parsed.acceptanceCriteria || t('common.empty')}\n\n${t('dvp.messages.aiSuccessDetail')}`)
        
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
      addAssistantMessage(`${t('dvp.messages.aiError')} ${error.response?.data?.error || error.message}. ${t('dvp.messages.createManually')}`)
      setQuickReplies([t('common.createManually'), t('common.tryAgain'), t('common.goBack')])
      setStep('initial')
    }
  }

  const resetForm = () => {
    const suggestedId = `${Math.floor(1 + Math.random() * 9)}.${Math.floor(10 + Math.random() * 90)}`
    setFormData({
      procedureId: suggestedId,
      procedureType: 'FUNCIONAL',
      performanceObjective: '',
      testName: '',
      acceptanceCriteria: '',
      responsible: '',
      parameterRange: '',
      carPart: ''
    })
    setStep('review')
  }

  const handleFieldChange = (fieldName: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (step === 'review') {
    const warningMessage = !formData.procedureId || !formData.testName 
      ? 'Você precisa preencher todos os campos em Dados Básicos antes de salvar.'
      : undefined

    // Car parts options
    const carPartOptions = [
      { value: 'WHEEL_ASSEMBLY', label: t('common.carParts.WHEEL_ASSEMBLY') },
      { value: 'ENGINE', label: t('common.carParts.ENGINE') },
      { value: 'BRAKE_SYSTEM', label: t('common.carParts.BRAKE_SYSTEM') },
      { value: 'STEERING_SYSTEM', label: t('common.carParts.STEERING_SYSTEM') },
      { value: 'EXHAUST_SYSTEM', label: t('common.carParts.EXHAUST_SYSTEM') },
      { value: 'TRANSMISSION', label: t('common.carParts.TRANSMISSION') },
      { value: 'SUSPENSION', label: t('common.carParts.SUSPENSION') },
      { value: 'ELECTRICAL_SYSTEM', label: t('common.carParts.ELECTRICAL_SYSTEM') },
      { value: 'COOLING_SYSTEM', label: t('common.carParts.COOLING_SYSTEM') },
      { value: 'FUEL_SYSTEM', label: t('common.carParts.FUEL_SYSTEM') },
      { value: 'BODY_EXTERIOR', label: t('common.carParts.BODY_EXTERIOR') },
      { value: 'BODY_INTERIOR', label: t('common.carParts.BODY_INTERIOR') },
      { value: 'HVAC_SYSTEM', label: t('common.carParts.HVAC_SYSTEM') },
      { value: 'SAFETY_SYSTEMS', label: t('common.carParts.SAFETY_SYSTEMS') },
      { value: 'OTHER', label: t('common.carParts.OTHER') }
    ]

    return (
      <SummaryReview
        title={t('dvp.summary.title')}
        subtitle={t('dvp.summary.subtitle')}
        sections={[
          {
            title: t('dvp.summary.sectionBasicData'),
            fields: [
              { label: t('dvp.fields.procedureId'), value: formData.procedureId, fieldName: 'procedureId', placeholder: 'Ex: 7.27' },
              { label: t('common.createdBy'), value: 'System', fieldName: 'creator', placeholder: 'Nome do criador', readonly: true },
              { label: t('dvp.fields.procedureType'), value: formData.procedureType, fieldName: 'procedureType', placeholder: 'FUNCIONAL' },
              { label: t('dvp.fields.carPart'), value: formData.carPart, fieldName: 'carPart', type: 'select', options: carPartOptions, placeholder: t('dvp.fields.carPart') },
              { label: t('dvp.fields.testName'), value: formData.testName, fullWidth: true, fieldName: 'testName', type: 'text', placeholder: t('dvp.fields.testName') },
              { label: t('dvp.fields.objective'), value: formData.performanceObjective, fullWidth: true, fieldName: 'performanceObjective', type: 'textarea', placeholder: t('dvp.fields.objective') },
              { label: t('dvp.fields.acceptanceCriteria'), value: formData.acceptanceCriteria, fullWidth: true, fieldName: 'acceptanceCriteria', type: 'textarea', placeholder: t('dvp.fields.acceptanceCriteria') },
              { label: t('dvp.fields.responsible'), value: formData.responsible, fieldName: 'responsible', placeholder: t('dvp.fields.responsible') },
              { label: t('dvp.fields.parameterRange'), value: formData.parameterRange, fieldName: 'parameterRange', placeholder: 'Ex: 50N - 100N' }
            ]
          }
        ]}
        metrics={[
          { icon: '🧪', value: 0, label: t('summaryReview.metrics.relatedTests') },
          { icon: '📋', value: 0, label: t('summaryReview.metrics.norms') },
          { icon: '⚠️', value: 0, label: t('summaryReview.metrics.failures') }
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
        <h2>🔬 {t('dvp.title')}</h2>
        <p className="flow-description">{t('dvp.description')}</p>
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

export default DVPFlow




