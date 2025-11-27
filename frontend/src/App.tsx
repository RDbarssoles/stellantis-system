import { useState } from 'react'
import Home from './pages/Home'
import EDPSFlow from './pages/EDPSFlow'
import DVPFlow from './pages/DVPFlow'
import DFMEAFlow from './pages/DFMEAFlow'
import Search from './pages/Search'
import LanguageToggle from './components/LanguageToggle'
import './App.css'

export type Page = 'home' | 'edps' | 'dvp' | 'dfmea' | 'search'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />
      case 'edps':
        return <EDPSFlow onBack={() => setCurrentPage('home')} />
      case 'dvp':
        return <DVPFlow onBack={() => setCurrentPage('home')} />
      case 'dfmea':
        return <DFMEAFlow onBack={() => setCurrentPage('home')} />
      case 'search':
        return <Search onBack={() => setCurrentPage('home')} />
      default:
        return <Home onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="app">
      <LanguageToggle />
      <header className="app-header">
        <div className="header-content">
          <h1>🔧 PD-SmartDoc</h1>
          <p className="header-subtitle">Engineering Document Management Assistant</p>
        </div>
      </header>
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}

export default App




