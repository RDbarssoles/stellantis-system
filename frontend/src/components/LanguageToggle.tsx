import { useLanguage } from '../contexts/LanguageContext'
import './LanguageToggle.css'

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en')
  }

  return (
    <button className="language-toggle" onClick={toggleLanguage} title="Change Language / Mudar Idioma">
      <span className="flag-icon">{language === 'en' ? '🇧🇷' : '🇺🇸'}</span>
      <span className="language-code">{language === 'en' ? 'PT' : 'EN'}</span>
    </button>
  )
}

export default LanguageToggle

