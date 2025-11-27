import { Page } from '../App'
import { useLanguage } from '../contexts/LanguageContext'
import './Home.css'

interface HomeProps {
  onNavigate: (page: Page) => void
}

function Home({ onNavigate }: HomeProps) {
  const { t } = useLanguage()

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
    </div>
  )
}

export default Home




