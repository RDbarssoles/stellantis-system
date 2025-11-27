import { useState, useRef, useEffect } from 'react'
import { Page } from '../App'
import { useLanguage } from '../contexts/LanguageContext'
import './Home.css'

interface HomeProps {
  onNavigate: (page: Page, carPart?: string) => void
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (isChatOpen && !hasInitialized.current) {
      hasInitialized.current = true
      addAssistantMessage(t('home.helpBot.greeting'))
    }
  }, [isChatOpen, t])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    addUserMessage(inputValue)
    const userInput = inputValue.toLowerCase()
    setInputValue('')

    // Simple response logic
    setTimeout(() => {
      if (userInput.includes('help') || userInput.includes('ajuda') || userInput.includes('como')) {
        addAssistantMessage(t('home.helpBot.responses.help'))
      } else if (userInput.includes('edps') || userInput.includes('norma') || userInput.includes('norm')) {
        addAssistantMessage(`${t('home.helpBot.responses.default')}\n\n✨ ${t('home.helpBot.quickActions.createNorm')}`)
      } else if (userInput.includes('dvp') || userInput.includes('test') || userInput.includes('teste')) {
        addAssistantMessage(`${t('home.helpBot.responses.default')}\n\n✨ ${t('home.helpBot.quickActions.createTest')}`)
      } else if (userInput.includes('dfmea') || userInput.includes('failure') || userInput.includes('falha')) {
        addAssistantMessage(`${t('home.helpBot.responses.default')}\n\n✨ ${t('home.helpBot.quickActions.createDFMEA')}`)
      } else {
        addAssistantMessage(t('home.helpBot.responses.default'))
      }
    }, 500)
  }

  const handleQuickAction = (action: string) => {
    addUserMessage(action)
    setTimeout(() => {
      if (action.includes('EDPS') || action.includes('norma')) {
        addAssistantMessage('Great! Redirecting you to create a new EDPS norm...')
        setTimeout(() => {
          setIsChatOpen(false)
          onNavigate('edps')
        }, 1000)
      } else if (action.includes('DVP') || action.includes('teste')) {
        addAssistantMessage('Perfect! Redirecting you to create a new DVP test...')
        setTimeout(() => {
          setIsChatOpen(false)
          onNavigate('dvp')
        }, 1000)
      } else if (action.includes('DFMEA')) {
        addAssistantMessage('Excellent! Redirecting you to create a new DFMEA analysis...')
        setTimeout(() => {
          setIsChatOpen(false)
          onNavigate('dfmea')
        }, 1000)
      } else if (action.includes('Search') || action.includes('Buscar')) {
        addAssistantMessage('Opening search page...')
        setTimeout(() => {
          setIsChatOpen(false)
          onNavigate('search')
        }, 1000)
      } else {
        addAssistantMessage(t('home.helpBot.responses.help'))
      }
    }, 500)
  }

  const modules = [
    {
      id: 'edps',
      title: t('home.modules.edps.title'),
      fullName: t('home.modules.edps.fullName'),
      description: t('home.modules.edps.description'),
      icon: '📋',
      color: '#4472C4'
    },
    {
      id: 'dvp',
      title: t('home.modules.dvp.title'),
      fullName: t('home.modules.dvp.fullName'),
      description: t('home.modules.dvp.description'),
      icon: '🔬',
      color: '#70AD47'
    },
    {
      id: 'dfmea',
      title: t('home.modules.dfmea.title'),
      fullName: t('home.modules.dfmea.fullName'),
      description: t('home.modules.dfmea.description'),
      icon: '⚠️',
      color: '#ED7D31'
    }
  ]

  // Car parts options
  const carPartOptions = [
    { value: 'WHEEL_ASSEMBLY', label: t('common.carParts.WHEEL_ASSEMBLY'), icon: '🛞' },
    { value: 'ENGINE', label: t('common.carParts.ENGINE'), icon: '⚙️' },
    { value: 'BRAKE_SYSTEM', label: t('common.carParts.BRAKE_SYSTEM'), icon: '🛑' },
    { value: 'STEERING_SYSTEM', label: t('common.carParts.STEERING_SYSTEM'), icon: '🎯' },
    { value: 'EXHAUST_SYSTEM', label: t('common.carParts.EXHAUST_SYSTEM'), icon: '💨' },
    { value: 'TRANSMISSION', label: t('common.carParts.TRANSMISSION'), icon: '⚡' },
    { value: 'SUSPENSION', label: t('common.carParts.SUSPENSION'), icon: '🔧' },
    { value: 'ELECTRICAL_SYSTEM', label: t('common.carParts.ELECTRICAL_SYSTEM'), icon: '🔌' },
    { value: 'COOLING_SYSTEM', label: t('common.carParts.COOLING_SYSTEM'), icon: '❄️' },
    { value: 'FUEL_SYSTEM', label: t('common.carParts.FUEL_SYSTEM'), icon: '⛽' },
    { value: 'BODY_EXTERIOR', label: t('common.carParts.BODY_EXTERIOR'), icon: '🚗' },
    { value: 'BODY_INTERIOR', label: t('common.carParts.BODY_INTERIOR'), icon: '💺' },
    { value: 'HVAC_SYSTEM', label: t('common.carParts.HVAC_SYSTEM'), icon: '🌡️' },
    { value: 'SAFETY_SYSTEMS', label: t('common.carParts.SAFETY_SYSTEMS'), icon: '🛡️' },
    { value: 'OTHER', label: t('common.carParts.OTHER'), icon: '📦' }
  ]

  const handleCarPartSelect = (carPart: string) => {
    onNavigate('search', carPart)
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h2>{t('home.welcome')}</h2>
        <p className="welcome-text">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="quick-action-section">
        <button 
          className="search-action-btn"
          onClick={() => onNavigate('search')}
        >
          <span className="search-action-icon">🔍</span>
          <div className="search-action-content">
            <h3>{t('home.searchAction.title')}</h3>
            <p>{t('home.searchAction.description')}</p>
          </div>
          <span className="search-action-arrow">→</span>
        </button>
      </div>

      <div className="car-parts-filter-section">
        <h3 className="car-parts-title">🚗 {t('home.carPartsFilter.title')}</h3>
        <p className="car-parts-subtitle">{t('home.carPartsFilter.subtitle')}</p>
        <div className="car-parts-grid">
          {carPartOptions.map((part) => (
            <button
              key={part.value}
              className="car-part-button"
              onClick={() => handleCarPartSelect(part.value)}
            >
              <span className="car-part-icon">{part.icon}</span>
              <span className="car-part-label">{part.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="modules-grid">
        {modules.map((module) => (
          <button
            key={module.id}
            className="module-card"
            onClick={() => onNavigate(module.id as Page)}
            style={{ '--module-color': module.color } as React.CSSProperties}
          >
            <div className="module-icon">{module.icon}</div>
            <h3 className="module-title">{module.title}</h3>
            <p className="module-full-name">{module.fullName}</p>
            <p className="module-description">{module.description}</p>
            <div className="module-arrow">→</div>
          </button>
        ))}
      </div>

      <div className="info-section">
        <h3>{t('home.howItWorks.title')}</h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-number">1</div>
            <h4>{t('home.howItWorks.step1.title')}</h4>
            <p>{t('home.howItWorks.step1.description')}</p>
          </div>
          <div className="info-card">
            <div className="info-number">2</div>
            <h4>{t('home.howItWorks.step2.title')}</h4>
            <p>{t('home.howItWorks.step2.description')}</p>
          </div>
          <div className="info-card">
            <div className="info-number">3</div>
            <h4>{t('home.howItWorks.step3.title')}</h4>
            <p>{t('home.howItWorks.step3.description')}</p>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button 
        className={`floating-help-btn ${isChatOpen ? 'active' : ''}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Help"
      >
        {isChatOpen ? '✕' : '💬'}
        {!isChatOpen && <span className="help-btn-text">{t('home.helpBot.buttonText')}</span>}
      </button>

      {/* Chatbot Window */}
      {isChatOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h4>PD-SmartDoc Assistant</h4>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsChatOpen(false)}>
              ✕
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message ${message.type}`}>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            <button onClick={() => handleQuickAction(t('home.helpBot.quickActions.createNorm'))}>
              📋 {t('home.helpBot.quickActions.createNorm')}
            </button>
            <button onClick={() => handleQuickAction(t('home.helpBot.quickActions.createTest'))}>
              🔬 {t('home.helpBot.quickActions.createTest')}
            </button>
            <button onClick={() => handleQuickAction(t('home.helpBot.quickActions.createDFMEA'))}>
              ⚠️ {t('home.helpBot.quickActions.createDFMEA')}
            </button>
            <button onClick={() => handleQuickAction(t('home.helpBot.quickActions.search'))}>
              🔍 {t('home.helpBot.quickActions.search')}
            </button>
          </div>

          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('home.helpBot.placeholder')}
            />
            <button className="chatbot-send-btn" onClick={handleSendMessage}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home




