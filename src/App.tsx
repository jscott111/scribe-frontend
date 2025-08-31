import { useState, useRef, useEffect } from 'react'
import './App.css'
import AudioRecorder from './components/AudioRecorder'
import LanguageSelector from './components/LanguageSelector'
import TranslationDisplay from './components/TranslationDisplay'

export interface Language {
  code: string
  name: string
  flag: string
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
]

function App() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0])
  const [targetLanguage, setTargetLanguage] = useState<Language>(SUPPORTED_LANGUAGES[1])
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
            languages={SUPPORTED_LANGUAGES}
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
            languages={SUPPORTED_LANGUAGES}
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
