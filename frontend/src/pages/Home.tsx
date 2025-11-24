import { Page } from '../App'
import './Home.css'

interface HomeProps {
  onNavigate: (page: Page) => void
}

function Home({ onNavigate }: HomeProps) {
  const modules = [
    {
      id: 'edps',
      title: 'EDPS',
      fullName: 'Engineering Design Practices',
      description: 'Create and manage engineering norms and standards',
      icon: '📋',
      color: '#4472C4'
    },
    {
      id: 'dvp',
      title: 'DVP&R',
      fullName: 'Design Validation Plan & Results',
      description: 'Define test procedures and validation criteria',
      icon: '🔬',
      color: '#70AD47'
    },
    {
      id: 'dfmea',
      title: 'DFMEA',
      fullName: 'Design Failure Mode and Effects Analysis',
      description: 'Analyze failure modes and link prevention/detection controls',
      icon: '⚠️',
      color: '#ED7D31'
    }
  ]

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h2>Welcome to PD-SmartDoc</h2>
        <p className="welcome-text">
          Your conversational assistant for engineering document management.
          Select a module below to get started.
        </p>
      </div>

      <div className="quick-action-section">
        <button 
          className="search-action-btn"
          onClick={() => onNavigate('search')}
        >
          <span className="search-action-icon">🔍</span>
          <div className="search-action-content">
            <h3>Search & Browse Documents</h3>
            <p>View all EDPS, DVP&R, and DFMEA documents in one place</p>
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
        <h3>How it works</h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-number">1</div>
            <h4>Create Standards</h4>
            <p>Define EDPS norms with detailed procedures and guidelines</p>
          </div>
          <div className="info-card">
            <div className="info-number">2</div>
            <h4>Define Tests</h4>
            <p>Create DVP test procedures with acceptance criteria</p>
          </div>
          <div className="info-card">
            <div className="info-number">3</div>
            <h4>Link in DFMEA</h4>
            <p>Connect norms and tests to failure modes for complete traceability</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home




