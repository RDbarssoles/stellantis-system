import { useState, useEffect, useRef } from 'react'
import ChatInterface, { Message } from '../components/ChatInterface'
import SummaryReview from '../components/SummaryReview'
import { edpsAPI, CreateEDPSData, aiToolsAPI } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import './Flow.css'

interface EDPSFlowProps {
  onBack: () => void
}

type Step = 'initial' | 'aiInput' | 'number' | 'title' | 'description' | 'target' | 'images' | 'confirm' | 'review' | 'complete'

function EDPSFlow({ onBack }: EDPSFlowProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('initial')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
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
      addAssistantMessage(t('edps.greeting'))
      setQuickReplies([
        t('edps.quickReplies.createNew'),
        t('edps.quickReplies.useAI'),
        t('edps.quickReplies.viewExisting')
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
        if (userInput.toLowerCase().includes('ai') || userInput.toLowerCase().includes('🤖') || userInput.toLowerCase().includes('ia')) {
          addAssistantMessage(t('edps.aiPrompt'))
          setStep('aiInput')
        } else if (userInput.toLowerCase().includes('create') || userInput.toLowerCase().includes('new') || userInput.toLowerCase().includes('criar')) {
          const suggestedNumber = Math.floor(10000 + Math.random() * 90000).toString()
          setFormData(prev => ({ ...prev, normNumber: suggestedNumber }))
          addAssistantMessage(`Great! Let's create a new EDPS norm. I suggest the norm number: ${suggestedNumber}. Please provide a title for this norm.`)
          setStep('title')
        } else if (userInput.toLowerCase().includes('view') || userInput.toLowerCase().includes('existing') || userInput.toLowerCase().includes('ver')) {
          addAssistantMessage('Fetching existing norms...')
          fetchExistingNorms()
        } else {
          addAssistantMessage('I can help you create a new norm or view existing norms. What would you like to do?')
          setQuickReplies([
            t('edps.quickReplies.createNew'),
            t('edps.quickReplies.useAI'),
            t('edps.quickReplies.viewExisting')
          ])
        }
        break

      case 'aiInput':
        generateWithAI(userInput)
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
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('save') || 
            userInput.toLowerCase().includes('sim') || userInput.toLowerCase().includes('revisar') || 
            userInput.toLowerCase().includes('review')) {
          setStep('review')
        } else {
          addAssistantMessage('Norm creation cancelled. Would you like to start over?')
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
      const response = await edpsAPI.create(formData)
      addAssistantMessage(`${t('edps.messages.normCreated')} ${response.data.data.id}. ${t('edps.messages.normCreatedDetail')}`)
      setQuickReplies([t('edps.messages.yesLinkToDFMEA'), t('edps.messages.noCreateAnother'), t('common.goBackToHome')])
      setStep('complete')
    } catch (error) {
      addAssistantMessage(t('edps.messages.errorSaving'))
      setQuickReplies([t('common.retry'), t('common.goBackToHome')])
      setStep('initial')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditFromReview = () => {
    setStep('title')
    addAssistantMessage('Let\'s edit the norm. Please provide a new title or continue with the existing information.')
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

  const parseAIResponse = (aiData: any) => {
    console.log('EDPS Raw AI Data:', aiData)
    console.log('EDPS AI Data Type:', typeof aiData)
    
    let parsedData = aiData

    // If the response is a string that looks like JSON, try to parse it
    if (typeof aiData === 'string') {
      try {
        // Clean up the string - remove markdown code blocks if present
        let cleanedData = aiData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedData = JSON.parse(cleanedData)
      } catch (e) {
        console.warn('Failed to parse EDPS AI response as JSON')
        // If parsing fails, treat the whole string as description
        parsedData = { description: aiData }
      }
    }

    // Handle nested response structure
    if (parsedData.response || parsedData.output || parsedData.result) {
      parsedData = parsedData.response || parsedData.output || parsedData.result
    }

    // Extract fields with various possible naming conventions
    const normNumber = parsedData.normNumber || parsedData.numero_da_norma || parsedData.number || parsedData.numero || Math.floor(10000 + Math.random() * 90000).toString()
    const title = parsedData.title || parsedData.titulo || parsedData.nome_da_norma || parsedData.name || parsedData.nome || ''
    const description = parsedData.description || parsedData.descricao || parsedData.descrição_da_norma || parsedData.procedimento || parsedData.content || parsedData.conteudo || parsedData.conteúdo || ''
    const target = parsedData.target || parsedData.objetivo || parsedData.target_da_norma || parsedData.objective || parsedData.meta || ''

    const result = {
      normNumber: normNumber.toString(),
      title,
      description,
      target,
      images: []
    }
    
    console.log('EDPS Parsed Result:', result)
    return result
  }

  const generateWithAI = async (description: string) => {
    try {
      addAssistantMessage(t('edps.messages.aiGenerating'))
      const response = await aiToolsAPI.generateEDPS(description)
      
      if (response.data.success) {
        console.log('EDPS AI Response:', response.data.data)
        const parsed = parseAIResponse(response.data.data)
        console.log('Parsed EDPS Data:', parsed)
        
        addAssistantMessage(`${t('edps.messages.aiSuccess')}\n\n**${t('edps.messages.titleLabel')}** ${parsed.title || t('common.empty')}\n**${t('edps.messages.descriptionLabel')}** ${parsed.description ? parsed.description.substring(0, 200) + (parsed.description.length > 200 ? '...' : '') : t('common.empty')}\n\n${t('edps.messages.aiSuccessDetail')}`)
        
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
      addAssistantMessage(`${t('edps.messages.aiError')} ${error.response?.data?.error || error.message}. ${t('edps.messages.createManually')}`)
      setQuickReplies([t('common.createManually'), t('common.tryAgain'), t('common.goBack')])
      setStep('initial')
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
    setQuickReplies(['Create new norm', 'Use AI Tool 🤖', 'View existing norms'])
  }

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (step === 'review') {
    const warningMessage = !formData.normNumber || !formData.title 
      ? 'Você precisa preencher todos os campos em Dados Básicos antes de salvar.'
      : undefined

    return (
      <SummaryReview
        title={t('edps.summary.title')}
        subtitle={t('edps.summary.subtitle')}
        sections={[
          {
            title: t('edps.summary.sectionBasicData'),
            fields: [
              { label: t('edps.fields.normNumber'), value: formData.normNumber, fieldName: 'normNumber', placeholder: 'Ex: NP-2024-001' },
              { label: 'Criado por', value: 'System', fieldName: 'creator', placeholder: 'Nome do criador' },
              { label: t('edps.fields.title'), value: formData.title, fullWidth: true, fieldName: 'title', placeholder: t('edps.fields.title'), type: 'text' },
              { label: t('edps.fields.description'), value: formData.description, fullWidth: true, fieldName: 'description', placeholder: t('edps.fields.description'), type: 'textarea' },
              { label: t('edps.fields.target'), value: formData.target, fullWidth: true, fieldName: 'target', placeholder: t('edps.fields.target'), type: 'textarea' }
            ]
          }
        ]}
        metrics={[
          { icon: '🧪', value: 0, label: t('summaryReview.metrics.relatedTests') },
          { icon: '⚠️', value: 0, label: t('summaryReview.metrics.failures') },
          { icon: '💡', value: 0, label: 'Soluções' }
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
        <h2>📋 {t('edps.title')}</h2>
        <p className="flow-description">{t('edps.description')}</p>
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

export default EDPSFlow




