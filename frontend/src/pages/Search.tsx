import { useState, useEffect } from 'react'
import { edpsAPI, dvpAPI, dfmeaAPI, EDPS, DVP, DFMEA } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import './Search.css'

interface SearchProps {
  onBack: () => void
  initialCarPart?: string
}

type DocumentType = 'all' | 'edps' | 'dvp' | 'dfmea'

interface SearchResult {
  id: string
  type: 'edps' | 'dvp' | 'dfmea'
  title: string
  subtitle: string
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: string
  data: EDPS | DVP | DFMEA
}

function Search({ onBack, initialCarPart }: SearchProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<DocumentType>('all')
  const [carPartFilter, setCarPartFilter] = useState<string>(initialCarPart || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState({ edps: 0, dvp: 0, dfmea: 0 })

  useEffect(() => {
    loadAllDocuments()
  }, [])

  useEffect(() => {
    if (initialCarPart) {
      setCarPartFilter(initialCarPart)
    }
  }, [initialCarPart])

  const loadAllDocuments = async () => {
    setIsLoading(true)
    try {
      const [edpsRes, dvpRes, dfmeaRes] = await Promise.all([
        edpsAPI.getAll(),
        dvpAPI.getAll(),
        dfmeaAPI.getAll()
      ])

      const edpsResults: SearchResult[] = edpsRes.data.data.map(item => ({
        id: item.id,
        type: 'edps',
        title: `${item.normNumber} - ${item.title}`,
        subtitle: item.normNumber,
        description: item.description,
        createdBy: 'System', // Could be enhanced with user data
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        data: item
      }))

      const dvpResults: SearchResult[] = dvpRes.data.data.map(item => ({
        id: item.id,
        type: 'dvp',
        title: `${item.procedureId} - ${item.testName}`,
        subtitle: item.procedureId,
        description: `${item.procedureType} - ${item.acceptanceCriteria}`,
        createdBy: item.responsible || 'System',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        data: item
      }))

      const dfmeaResults: SearchResult[] = dfmeaRes.data.data.map(item => ({
        id: item.id,
        type: 'dfmea',
        title: `${item.genericFailure} - ${item.failureMode}`,
        subtitle: `RPN: ${item.rpn}`,
        description: item.cause,
        createdBy: 'System',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        data: item
      }))

      const allResults = [...edpsResults, ...dvpResults, ...dfmeaResults]
      setResults(allResults)
      setCounts({
        edps: edpsResults.length,
        dvp: dvpResults.length,
        dfmea: dfmeaResults.length
      })
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filter === 'all' || result.type === filter

    // Check car part filter
    const matchesCarPart = carPartFilter === '' || 
      (result.data as any).carPart === carPartFilter

    return matchesSearch && matchesFilter && matchesCarPart
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'edps': return '📋'
      case 'dvp': return '🔬'
      case 'dfmea': return '⚠️'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'edps': return 'EDPS'
      case 'dvp': return 'DVP&R'
      case 'dfmea': return 'DFMEA'
      default: return 'Document'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'edps': return '#4472C4'
      case 'dvp': return '#70AD47'
      case 'dfmea': return '#ED7D31'
      default: return '#666'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <button className="back-button" onClick={onBack}>
          ← {t('common.backToHome')}
        </button>
        <h2>{t('search.title')}</h2>
        <p className="search-description">{t('search.description')}</p>
      </div>

      <div className="search-controls">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as DocumentType)}
            className="filter-select"
          >
            <option value="all">{t('search.filters.all')}</option>
            <option value="edps">{t('search.filters.edps')}</option>
            <option value="dvp">{t('search.filters.dvp')}</option>
            <option value="dfmea">{t('search.filters.dfmea')}</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select 
            value={carPartFilter} 
            onChange={(e) => setCarPartFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('search.filters.allCarParts')}</option>
            <option value="WHEEL_ASSEMBLY">{t('common.carParts.WHEEL_ASSEMBLY')}</option>
            <option value="ENGINE">{t('common.carParts.ENGINE')}</option>
            <option value="BRAKE_SYSTEM">{t('common.carParts.BRAKE_SYSTEM')}</option>
            <option value="STEERING_SYSTEM">{t('common.carParts.STEERING_SYSTEM')}</option>
            <option value="EXHAUST_SYSTEM">{t('common.carParts.EXHAUST_SYSTEM')}</option>
            <option value="TRANSMISSION">{t('common.carParts.TRANSMISSION')}</option>
            <option value="SUSPENSION">{t('common.carParts.SUSPENSION')}</option>
            <option value="ELECTRICAL_SYSTEM">{t('common.carParts.ELECTRICAL_SYSTEM')}</option>
            <option value="COOLING_SYSTEM">{t('common.carParts.COOLING_SYSTEM')}</option>
            <option value="FUEL_SYSTEM">{t('common.carParts.FUEL_SYSTEM')}</option>
            <option value="BODY_EXTERIOR">{t('common.carParts.BODY_EXTERIOR')}</option>
            <option value="BODY_INTERIOR">{t('common.carParts.BODY_INTERIOR')}</option>
            <option value="HVAC_SYSTEM">{t('common.carParts.HVAC_SYSTEM')}</option>
            <option value="SAFETY_SYSTEMS">{t('common.carParts.SAFETY_SYSTEMS')}</option>
            <option value="OTHER">{t('common.carParts.OTHER')}</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card" style={{ '--card-color': '#ED7D31' } as React.CSSProperties}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">DFMEA</div>
            <div className="stat-value">{counts.dfmea}</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#4472C4' } as React.CSSProperties}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">EDPS</div>
            <div className="stat-value">{counts.edps}</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#70AD47' } as React.CSSProperties}>
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <div className="stat-label">DVP&R</div>
            <div className="stat-value">{counts.dvp}</div>
          </div>
        </div>
      </div>

      <div className="results-section">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('search.loading')}</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>{t('search.noResults.title')}</h3>
            <p>{t('search.noResults.description')}</p>
          </div>
        ) : (
          <div className="results-list">
            <div className="results-header">
              <h3>{t('search.results')} ({filteredResults.length})</h3>
            </div>
            {filteredResults.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-header">
                  <div className="result-type-badge" style={{ 
                    backgroundColor: getTypeColor(result.type),
                    color: 'white'
                  }}>
                    {getTypeIcon(result.type)} {getTypeLabel(result.type)}
                  </div>
                  <div className="result-id">{result.subtitle}</div>
                  <div className={`result-status status-${result.status}`}>
                    <span className="status-indicator"></span>
                    {result.status === 'active' ? t('common.active') : result.status}
                  </div>
                  <button className="result-menu-btn">⋮</button>
                </div>

                <h3 className="result-title">{result.title}</h3>
                <p className="result-description">{result.description}</p>

                <div className="result-footer">
                  <div className="result-meta">
                    <span className="meta-item">
                      <strong>{t('search.createdBy')}</strong> {result.createdBy}
                    </span>
                    <span className="meta-item">
                      <strong>{t('search.creationDate')}</strong> {formatDate(result.createdAt)}
                    </span>
                    <span className="meta-item">
                      <strong>{t('search.lastEdited')}</strong> {formatDate(result.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search

