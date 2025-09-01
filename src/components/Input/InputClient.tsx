import React, { useRef, useEffect, useState } from 'react'
import { LanguageCode } from '../../enums/azureLangs'
import { io, Socket } from 'socket.io-client'
import './InputClient.css'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface TranscriptionBubble {
  id: string
  text: string
  timestamp: Date
  isComplete: boolean
}

interface InputClientProps {
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  onLanguageChange: (source: LanguageCode, target: LanguageCode) => void
}

const InputClient: React.FC<InputClientProps> = ({
  sourceLanguage,
  targetLanguage,
  onLanguageChange
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptionBubbles, setTranscriptionBubbles] = useState<TranscriptionBubble[]>([])
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const socketRef = useRef<Socket | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Input Client connected to backend')
    })
    
    socketRef.current.on('transcriptionComplete', (data) => {
      console.log('✅ Transcription complete:', data)
      
      setTranscriptionBubbles(prev => 
        prev.map(bubble => 
          bubble.id === data.bubbleId 
            ? { ...bubble, isComplete: true }
            : bubble
        )
      )
      setIsProcessing(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = sourceLanguage

    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsRecording(true)
      setIsProcessing(true)
    }

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        const newBubble: TranscriptionBubble = {
          id: Date.now().toString(),
          text: finalTranscript,
          timestamp: new Date(),
          isComplete: false
        }
        
        setTranscriptionBubbles(prev => [...prev, newBubble])
        setCurrentTranscription('')
        
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('speechTranscription', {
            transcription: finalTranscript,
            sourceLanguage,
            targetLanguage,
            bubbleId: newBubble.id
          })
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setTranscriptionBubbles(prev => 
            prev.map(bubble => 
              bubble.id === newBubble.id 
                ? { ...bubble, isComplete: true }
                : bubble
            )
          )
          setIsProcessing(false)
        }, 2000)
      } else {
        setCurrentTranscription(interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      setIsProcessing(false)
    }

    recognitionRef.current.onend = () => {
      console.log('🎤 Speech recognition ended')
      setIsRecording(false)
      setIsProcessing(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [sourceLanguage])

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const clearBubbles = () => {
    setTranscriptionBubbles([])
  }

  return (
    <div className="input-client">
      <div className="input-header">
        <h2>🎤 Input Client</h2>
        <div className="language-display">
          <span className="language-badge">
            {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="recording-controls">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? '⏹️ Stop' : '🎤 Start Recording'}
        </button>
        
        <button
          className="clear-button"
          onClick={clearBubbles}
          disabled={transcriptionBubbles.length === 0}
        >
          🗑️ Clear All
        </button>
      </div>

      <div className="transcription-bubbles">
        {transcriptionBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`transcription-bubble ${bubble.isComplete ? 'complete' : 'incomplete'}`}
          >
            <div className="bubble-content">
              <p className="bubble-text">{bubble.text}</p>
              <div className="bubble-meta">
                <span className="bubble-time">
                  {bubble.timestamp.toLocaleTimeString()}
                </span>
                <span className="bubble-status">
                  {bubble.isComplete ? '✅ Complete' : '🔄 Processing...'}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {currentTranscription && (
          <div className="transcription-bubble interim">
            <div className="bubble-content">
              <p className="bubble-text">{currentTranscription}</p>
              <div className="bubble-meta">
                <span className="bubble-status">🎯 Listening...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Processing transcription...</span>
        </div>
      )}
    </div>
  )
}

export default InputClient
