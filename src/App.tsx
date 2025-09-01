import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import AudioRecorder from './components/AudioRecorder'
import LanguageSelector from './components/LanguageSelector'
import TranslationDisplay from './components/TranslationDisplay'
import { LanguageCode, getSupportedLanguages } from './enums/azureLangs'

function App() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(LanguageCode.EN)
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(LanguageCode.ES)
  const [isRecording, setIsRecording] = useState(false)
  const [translatedText, setTranslatedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLanguageSwap = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
  }

  const handleTranslation = (text: string) => {
    setTranslatedText(text)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 Tongues</h1>
        <p>Real-time audio translation powered by AI</p>
      </header>

      <main className="app-main">
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
          />
        </div>

        <div className="audio-section">
          <AudioRecorder
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onTranslation={handleTranslation}
            setIsProcessing={setIsProcessing}
          />
        </div>

        <div className="translation-section">
          <TranslationDisplay
            translatedText={translatedText}
            isProcessing={isProcessing}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by AI Translation APIs</p>
      </footer>
    </div>
  )
}

export default App
