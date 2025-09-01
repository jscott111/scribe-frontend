import React, { useRef, useEffect, useState } from 'react'
import { LanguageCode, getLanguageInfo } from '../enums/azureLangs'
import { io, Socket } from 'socket.io-client'
import './TranslationClient.css'

interface TranslationBubble {
  id: string
  originalText: string
  translatedText: string
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  timestamp: Date
  isComplete: boolean
}

interface TranslationClientProps {
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
}

const TranslationClient: React.FC<TranslationClientProps> = ({
  sourceLanguage,
  targetLanguage
}) => {
  const [translationBubbles, setTranslationBubbles] = useState<TranslationBubble[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Translation Client connected to backend')
      setIsConnected(true)
    })
    
    socketRef.current.on('disconnect', () => {
      console.log('🔌 Translation Client disconnected from backend')
      setIsConnected(false)
    })
    
    socketRef.current.on('translation', (data) => {
      console.log('📝 Received translation:', data)
      
      // Create new translation bubble
      const newBubble: TranslationBubble = {
        id: data.bubbleId || Date.now().toString(),
        originalText: data.originalText || 'Unknown',
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        timestamp: new Date(data.timestamp || Date.now()),
        isComplete: true
      }
      
      setTranslationBubbles(prev => [...prev, newBubble])
    })
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const clearBubbles = () => {
    setTranslationBubbles([])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard')
    })
  }

  const speakText = (text: string, language: LanguageCode) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const getSourceLanguageInfo = () => getLanguageInfo(sourceLanguage)
  const getTargetLanguageInfo = () => getLanguageInfo(targetLanguage)

  return (
    <div className="translation-client">
      <div className="translation-header">
        <h2>🌍 Translation Client</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      <div className="language-info">
        <div className="language-pair">
          <div className="language-item">
            <span className="language-flag">{getSourceLanguageInfo().flag}</span>
            <span className="language-name">{getSourceLanguageInfo().name}</span>
          </div>
          <div className="arrow">→</div>
          <div className="language-item">
            <span className="language-flag">{getTargetLanguageInfo().flag}</span>
            <span className="language-name">{getTargetLanguageInfo().name}</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <button
          className="clear-button"
          onClick={clearBubbles}
          disabled={translationBubbles.length === 0}
        >
          🗑️ Clear All
        </button>
      </div>

      <div className="translation-bubbles">
        {translationBubbles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <h3>Waiting for translations...</h3>
            <p>Start speaking in the Input Client to see translations appear here</p>
          </div>
        ) : (
          translationBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className={`translation-bubble ${bubble.isComplete ? 'complete' : 'incomplete'}`}
            >
              <div className="bubble-header">
                <span className="bubble-time">
                  {bubble.timestamp.toLocaleTimeString()}
                </span>
                <span className="bubble-status">
                  {bubble.isComplete ? '✅ Complete' : '🔄 Processing...'}
                </span>
              </div>
              
              <div className="bubble-content">
                <div className="original-text">
                  <div className="text-label">
                    <span className="language-flag">{getLanguageInfo(bubble.sourceLanguage).flag}</span>
                    <span>Original ({getLanguageInfo(bubble.sourceLanguage).name})</span>
                  </div>
                  <p className="text-content">{bubble.originalText}</p>
                  <div className="text-actions">
                    <button
                      className="action-button"
                      onClick={() => copyToClipboard(bubble.originalText)}
                      title="Copy original text"
                    >
                      📋 Copy
                    </button>
                    <button
                      className="action-button"
                      onClick={() => speakText(bubble.originalText, bubble.sourceLanguage)}
                      title="Speak original text"
                    >
                      🔊 Speak
                    </button>
                  </div>
                </div>
                
                <div className="translation-arrow">↓</div>
                
                <div className="translated-text">
                  <div className="text-label">
                    <span className="language-flag">{getLanguageInfo(bubble.targetLanguage).flag}</span>
                    <span>Translation ({getLanguageInfo(bubble.targetLanguage).name})</span>
                  </div>
                  <p className="text-content">{bubble.translatedText}</p>
                  <div className="text-actions">
                    <button
                      className="action-button"
                      onClick={() => copyToClipboard(bubble.translatedText)}
                      title="Copy translation"
                    >
                      📋 Copy
                    </button>
                    <button
                      className="action-button"
                      onClick={() => speakText(bubble.translatedText, bubble.targetLanguage)}
                      title="Speak translation"
                    >
                      🔊 Speak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TranslationClient
