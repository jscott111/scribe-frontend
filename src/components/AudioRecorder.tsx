import React, { useRef, useEffect, useState } from 'react'
import { LanguageCode } from '../enums/azureLangs'
import { io, Socket } from 'socket.io-client'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface AudioRecorderProps {
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  onTranslation: (text: string) => void
  setIsProcessing: (processing: boolean) => void
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  setIsRecording,
  sourceLanguage,
  targetLanguage,
  onTranslation,
  setIsProcessing
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>('')
  const [currentTranscription, setCurrentTranscription] = useState<string>('')
  const socketRef = useRef<Socket | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      setIsConnected(true)
      setError('')
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current.on('translation', (data) => {
      onTranslation(data.translatedText)
      setIsProcessing(false)
    })

    socketRef.current.on('error', (error) => {
      setError(error.message)
      setIsProcessing(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [onTranslation, setIsProcessing])

  const startRecording = async () => {
    try {
      setError('')
      setIsProcessing(true)
      setCurrentTranscription('')

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser')
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = sourceLanguage
      
      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started')
        setIsRecording(true)
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
        
        setCurrentTranscription(finalTranscript + interimTranscript)
        
        if (finalTranscript && socketRef.current) {
          console.log('🎤 Sending real transcription:', finalTranscript)
          
          socketRef.current.emit('speechTranscription', {
            transcription: finalTranscript,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
          })
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsProcessing(false)
        setIsRecording(false)
      }
      
      recognitionRef.current.onend = () => {
        console.log('🎤 Speech recognition ended')
        setIsRecording(false)
        setIsProcessing(false)
      }
      
      recognitionRef.current.start()
      
    } catch (err) {
      setError('Failed to start speech recognition. Please check browser support.')
      setIsProcessing(false)
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    setIsRecording(false)
    setIsProcessing(false)
    setCurrentTranscription('')
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="audio-recorder">
      <div className="recorder-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </div>
        <span className="status-text">
          {isConnected ? 'Connected to server' : 'Disconnected from server'}
        </span>
      </div>

      <div className="recorder-controls">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={handleToggleRecording}
          disabled={!isConnected}
          type="button"
        >
          {isRecording ? '⏹️ Stop' : '🎤 Start Recording'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {currentTranscription && (
        <div className="transcription-display">
          <h4>🎤 What you said:</h4>
          <p>{currentTranscription}</p>
        </div>
      )}

      <div className="recorder-info">
        <p>Source: <strong>{sourceLanguage}</strong></p>
        <p>Target: <strong>{targetLanguage}</strong></p>
        {isRecording && (
          <p className="recording-info">
            🎵 Listening and transcribing in real-time...
          </p>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder
