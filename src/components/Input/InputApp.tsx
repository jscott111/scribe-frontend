import React, { useState } from 'react'
import './InputApp.css'
import InputClient from './InputClient'
import LanguageSelector from '../LanguageSelector'
import { LanguageCode, getSupportedLanguages } from '../../enums/azureLangs'

function InputApp() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(LanguageCode.EN)
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(LanguageCode.ES)

  const handleLanguageSwap = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
  }

  const handleLanguageChange = (source: LanguageCode, target: LanguageCode) => {
    setSourceLanguage(source)
    setTargetLanguage(target)
  }

  return (
    <div className="input-app">
      <header className="input-app-header">
        <h1>🎤 Tongues Input Client</h1>
        <p>Record audio and see transcriptions in real-time</p>
      </header>

      <main className="input-app-main">
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

        <InputClient
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </main>

      <footer className="input-app-footer">
        <p>🌍 Translation Client available at <strong>http://localhost:5174</strong></p>
      </footer>
    </div>
  )
}

export default InputApp
