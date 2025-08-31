import { useState } from 'react'
import { Language } from '../App'

interface LanguageSelectorProps {
  label: string
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  languages: Language[]
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onLanguageChange,
  languages
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  return (
    <div className="language-selector">
      <label className="language-label">{label}</label>
      <div className="language-dropdown">
        <button
          className="language-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="language-flag">{selectedLanguage.flag}</span>
          <span className="language-name">{selectedLanguage.name}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        {isOpen && (
          <div className="language-options">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${selectedLanguage.code === language.code ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(language)}
                type="button"
              >
                <span className="language-flag">{language.flag}</span>
                <span className="language-name">{language.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LanguageSelector
