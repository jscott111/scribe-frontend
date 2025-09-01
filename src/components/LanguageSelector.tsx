import React, { useState } from 'react'
import { LanguageCode, getLanguageInfo, getLanguageFlag, getLanguageName, getSupportedLanguages } from '../enums/azureLangs'

interface LanguageSelectorProps {
  label: string
  selectedLanguage: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (language: LanguageCode) => {
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
          <span className="language-flag">{getLanguageFlag(selectedLanguage)}</span>
          <span className="language-name">{getLanguageName(selectedLanguage)}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        {isOpen && (
          <div className="language-options">
            {getSupportedLanguages().map((language) => (
              <button
                key={language.code}
                className={`language-option ${selectedLanguage === language.code ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(language.code as LanguageCode)}
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
