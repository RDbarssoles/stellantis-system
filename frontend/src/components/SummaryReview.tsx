import { useLanguage } from '../contexts/LanguageContext'
import './SummaryReview.css'

interface SummaryField {
  label: string
  value: string | number | null | undefined | string[]
  fullWidth?: boolean
  fieldName: string
  type?: 'text' | 'textarea' | 'number' | 'image-upload' | 'select'
  placeholder?: string
  readonly?: boolean
  options?: Array<{ value: string; label: string }>
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
  onFieldChange?: (fieldName: string, value: string | number | string[]) => void
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
  
  const handleFieldChange = (fieldName: string, value: string | number | string[]) => {
    if (onFieldChange) {
      onFieldChange(fieldName, value)
    }
  }

  const handleImageUpload = (fieldName: string, currentImages: string[], event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // For now, we'll convert images to base64 strings
    // In production, you'd want to upload to a file server
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        const newImages = [...currentImages, base64String]
        handleFieldChange(fieldName, newImages)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageRemove = (fieldName: string, currentImages: string[], index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    handleFieldChange(fieldName, newImages)
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
                  ) : field.type === 'select' ? (
                    <select
                      className="summary-field-input"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                    >
                      <option value="">{field.placeholder || `Select ${field.label}`}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'image-upload' ? (
                    <div className="summary-image-upload">
                      <input
                        type="file"
                        id={`image-upload-${fieldIndex}`}
                        className="summary-image-input"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(field.fieldName, (field.value as string[]) || [], e)}
                      />
                      <label htmlFor={`image-upload-${fieldIndex}`} className="summary-image-upload-btn">
                        📷 {t('summaryReview.uploadImages')}
                      </label>
                      <div className="summary-image-preview-container">
                        {((field.value as string[]) || []).map((image, imgIndex) => (
                          <div key={imgIndex} className="summary-image-preview">
                            <img src={image} alt={`Preview ${imgIndex + 1}`} />
                            <button
                              type="button"
                              className="summary-image-remove"
                              onClick={() => handleImageRemove(field.fieldName, (field.value as string[]) || [], imgIndex)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className={`summary-field-input ${field.readonly ? 'readonly' : ''}`}
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                      placeholder={field.placeholder || field.label}
                      readOnly={field.readonly}
                      disabled={field.readonly}
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

