import { useLanguage } from '../contexts/LanguageContext'
import './SummaryReview.css'

interface SummaryField {
  label: string
  value: string | number | null | undefined
  fullWidth?: boolean
  fieldName: string
  type?: 'text' | 'textarea' | 'number'
  placeholder?: string
}

interface SummarySection {
  title: string
  fields: SummaryField[]
}

interface SummaryMetric {
  icon: string
  value: number
  label: string
}

interface SummaryReviewProps {
  title: string
  subtitle?: string
  sections: SummarySection[]
  metrics?: SummaryMetric[]
  onSave: () => void
  onEdit: () => void
  onFieldChange?: (fieldName: string, value: string | number) => void
  isSaving?: boolean
  warningMessage?: string
  statusBadge?: {
    label: string
    type: 'draft' | 'active' | 'inactive'
  }
}

function SummaryReview({
  title,
  subtitle,
  sections,
  metrics = [],
  onSave,
  onEdit,
  onFieldChange,
  isSaving = false,
  warningMessage,
  statusBadge
}: SummaryReviewProps) {
  const { t } = useLanguage()
  
  const handleFieldChange = (fieldName: string, value: string | number) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value)
    }
  }

  const defaultSubtitle = subtitle || t('summaryReview.subtitle')

  return (
    <div className="summary-review">
      <div className="summary-header">
        <button className="summary-back-btn" onClick={onEdit}>
          ← 
        </button>
        <div className="summary-title-section">
          <h1 className="summary-main-title">{title}</h1>
          <p className="summary-subtitle">{defaultSubtitle}</p>
        </div>
        <button 
          className="summary-save-btn" 
          onClick={onSave}
          disabled={isSaving || !!warningMessage}
        >
          {t('summaryReview.save')}
        </button>
      </div>

      <div className="summary-content">
        <div className="summary-review-header">
          <h2>{t('summaryReview.title')}</h2>
          <p>{t('summaryReview.subtitle')}</p>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="summary-section">
            <h3 className="summary-section-title">{section.title}</h3>
            <div className="summary-fields-grid">
              {section.fields.map((field, fieldIndex) => (
                <div 
                  key={fieldIndex} 
                  className={`summary-field ${field.fullWidth ? 'full-width' : ''}`}
                >
                  <label className="summary-field-label">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="summary-field-input summary-field-textarea"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                      placeholder={field.placeholder || field.label}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="summary-field-input"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                      placeholder={field.placeholder || field.label}
                    />
                  )}
                </div>
              ))}
            </div>

            {statusBadge && index === 0 && (
              <div className="summary-status-section">
                <label className="summary-field-label">{t('summaryReview.status')}</label>
                <span className={`summary-status-badge status-${statusBadge.type}`}>
                  {statusBadge.label}
                </span>
              </div>
            )}
          </div>
        ))}

        {metrics.length > 0 && (
          <div className="summary-metrics">
            {metrics.map((metric, index) => (
              <div key={index} className="summary-metric-card">
                <div className="summary-metric-icon">{metric.icon}</div>
                <div className="summary-metric-content">
                  <div className="summary-metric-value">{metric.value}</div>
                  <div className="summary-metric-label">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {warningMessage && (
          <div className="summary-warning">
            <span className="summary-warning-icon">⚠️</span>
            <div className="summary-warning-content">
              <strong>{t('summaryReview.warningTitle')}</strong>
              <p>{warningMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryReview

