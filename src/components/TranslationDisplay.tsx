import React from 'react'
import { Language } from '../App'

interface TranslationDisplayProps {
  translatedText: string
  isProcessing: boolean
  sourceLanguage: Language
  targetLanguage: Language
}

const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  translatedText,
  isProcessing,
  sourceLanguage,
  targetLanguage
}) => {
  return (
    <div className="translation-display">
      <div className="translation-header">
        <h3>Translation</h3>
        <div className="language-flow">
          <span className="language-badge source">
            {sourceLanguage.flag} {sourceLanguage.name}
          </span>
          <span className="arrow">→</span>
          <span className="language-badge target">
            {targetLanguage.flag} {targetLanguage.name}
          </span>
        </div>
      </div>

      <div className="translation-content">
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing audio and translating...</p>
          </div>
        ) : translatedText ? (
          <div className="translated-text">
            <p>{translatedText}</p>
          </div>
        ) : (
          <div className="placeholder">
            <p>🎤 Start recording to see live translations</p>
            <p className="hint">Speak clearly into your microphone</p>
          </div>
        )}
      </div>

      {translatedText && !isProcessing && (
        <div className="translation-actions">
          <button 
            className="action-button"
            onClick={() => navigator.clipboard.writeText(translatedText)}
            type="button"
          >
            📋 Copy
          </button>
          <button 
            className="action-button"
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(translatedText)
              utterance.lang = targetLanguage.code
              speechSynthesis.speak(utterance)
            }}
            type="button"
          >
            🔊 Speak
          </button>
        </div>
      )}
    </div>
  )
}

export default TranslationDisplay
