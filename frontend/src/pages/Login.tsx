import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      const success = login(username, password)
      if (!success) {
        setError(t('login.error'))
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🔧</div>
          <h1 className="login-title">PD-SmartDoc</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              {t('login.username')}
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('login.password')}
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? t('login.loggingIn') : t('login.loginButton')}
          </button>
        </form>

        <div className="login-footer">
          <p>{t('login.footer')}</p>
        </div>
      </div>
    </div>
  )
}

export default Login

