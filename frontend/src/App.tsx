import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import EDPSFlow from './pages/EDPSFlow'
import DVPFlow from './pages/DVPFlow'
import DFMEAFlow from './pages/DFMEAFlow'
import Search from './pages/Search'
import LanguageToggle from './components/LanguageToggle'
import { useAuth } from './contexts/AuthContext'
import './App.css'

export type Page = 'home' | 'edps' | 'dvp' | 'dfmea' | 'search'

function App() {
  const { isAuthenticated, logout, user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [searchCarPart, setSearchCarPart] = useState<string | undefined>()
  const [pageData, setPageData] = useState<any>(null)

  const handleNavigate = (page: Page, param?: string | any) => {
    setCurrentPage(page)
    
    // Handle search with car part filter
    if (page === 'search' && typeof param === 'string') {
      setSearchCarPart(param)
      setPageData(null)
    }
    // Handle navigation with data (view/edit mode)
    else if (param && typeof param === 'object') {
      setPageData(param)
      setSearchCarPart(undefined)
    } 
    // Default navigation
    else {
      setSearchCarPart(undefined)
      setPageData(null)
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LanguageToggle />
        <Login />
      </>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'edps':
        return <EDPSFlow onBack={() => handleNavigate('home')} initialData={pageData} />
      case 'dvp':
        return <DVPFlow onBack={() => handleNavigate('home')} initialData={pageData} />
      case 'dfmea':
        return <DFMEAFlow onBack={() => handleNavigate('home')} initialData={pageData} />
      case 'search':
        return <Search onBack={() => handleNavigate('home')} onNavigate={handleNavigate} initialCarPart={searchCarPart} />
      default:
        return <Home onNavigate={handleNavigate} />
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
        <button className="logout-button" onClick={logout} title="Logout">
          <span className="user-name">👤 {user}</span>
          <span className="logout-icon">🚪</span>
        </button>
      </header>
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  )
}

export default App




