import { useState, useEffect } from 'react'
import { edpsAPI, dvpAPI, dfmeaAPI, EDPS, DVP, DFMEA } from '../services/api'
import './Search.css'

interface SearchProps {
  onBack: () => void
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

function Search({ onBack }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<DocumentType>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState({ edps: 0, dvp: 0, dfmea: 0 })

  useEffect(() => {
    loadAllDocuments()
  }, [])

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

    return matchesSearch && matchesFilter
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
          ← Back to Home
        </button>
        <h2>🔍 Search Documents</h2>
        <p className="search-description">Search and browse all engineering documents</p>
      </div>

      <div className="search-controls">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar normas por número ou título..."
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
            <option value="all">Todas</option>
            <option value="edps">EDPS</option>
            <option value="dvp">DVP&R</option>
            <option value="dfmea">DFMEA</option>
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
            <p>Loading documents...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No documents found</h3>
            <p>Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="results-list">
            <div className="results-header">
              <h3>Results ({filteredResults.length})</h3>
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
                    {result.status === 'active' ? 'Ativa' : result.status}
                  </div>
                  <button className="result-menu-btn">⋮</button>
                </div>

                <h3 className="result-title">{result.title}</h3>
                <p className="result-description">{result.description}</p>

                <div className="result-footer">
                  <div className="result-meta">
                    <span className="meta-item">
                      <strong>Criado por:</strong> {result.createdBy}
                    </span>
                    <span className="meta-item">
                      <strong>Data de criação:</strong> {formatDate(result.createdAt)}
                    </span>
                    <span className="meta-item">
                      <strong>Última edição:</strong> {formatDate(result.updatedAt)}
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

