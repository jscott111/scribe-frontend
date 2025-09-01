import React from 'react'
import { LanguageCode, getLanguageInfo } from '../enums/azureLangs'

interface TranslationDisplayProps {
  translatedText: string
  isProcessing: boolean
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
}

const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  translatedText,
  isProcessing,
  sourceLanguage,
  targetLanguage
}) => {
  const sourceLanguageInfo = getLanguageInfo(sourceLanguage)
  const targetLanguageInfo = getLanguageInfo(targetLanguage)

  return (
    <div className="translation-display">
      <div className="translation-header">
        <h3>Translation</h3>
        <div className="language-flow">
          <span className="language-badge source">
            {sourceLanguageInfo.flag} {sourceLanguageInfo.name}
          </span>
          <span className="arrow">→</span>
          <span className="language-badge target">
            {targetLanguageInfo.flag} {targetLanguageInfo.name}
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
              utterance.lang = targetLanguage
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
