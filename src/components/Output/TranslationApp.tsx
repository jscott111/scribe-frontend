import React, { useState } from 'react'
import './TranslationApp.css'
import TranslationClient from './TranslationClient'
import LanguageSelector from '../LanguageSelector'
import { LanguageCode, getSupportedLanguages } from '../../enums/azureLangs'

function TranslationApp() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(LanguageCode.EN)
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(LanguageCode.ES)

  const handleLanguageSwap = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
  }

  return (
    <div className="translation-app">
      <header className="translation-app-header">
        <h1>🌍 Tongues</h1>
        <p>View real-time translations from the Input Client</p>
      </header>

      <main className="translation-app-main">
        <div className="language-section">
          <LanguageSelector
            label="From"
            selectedLanguage={sourceLanguage}
            onLanguageChange={setSourceLanguage}
            languages={getSupportedLanguages()}
          />
          
          <button 
            className="swap-button"
            onClick={handleLanguageSwap}
            title="Swap languages"
          >
            🔄
          </button>

          <LanguageSelector
            label="To"
            selectedLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            languages={getSupportedLanguages()}
          />
        </div>

        <TranslationClient
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      </main>
    </div>
  )
}

export default TranslationApp
