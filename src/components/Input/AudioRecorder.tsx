import React, { useRef, useEffect, useState } from 'react'
import { LanguageCode } from '../../enums/googleLangs'
import { io, Socket } from 'socket.io-client'
import GoogleSpeechService from '../../services/googleSpeechService'

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
  accessToken?: string
  sessionId?: string
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  setIsRecording,
  sourceLanguage,
  targetLanguage,
  onTranslation,
  setIsProcessing,
  accessToken,
  sessionId
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>('')
  const [currentTranscription, setCurrentTranscription] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState<number>(0) // Audio level from 0 to 1
  const socketRef = useRef<Socket | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    socketRef.current = io((import.meta as any).env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca', {
      auth: {
        token: accessToken,
        sessionId: sessionId
      }
    })
    
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
      setAudioLevel(0)

      // Initialize Google Speech Service if not already done
      if (!GoogleSpeechService.isInitializedWithSocket(socketRef.current)) {
        await GoogleSpeechService.initialize(socketRef.current)
      }

      // Start recognition with callbacks including audio level monitoring
      await GoogleSpeechService.startRecognition({
        onInterimResult: (result) => {
          setCurrentTranscription(result.transcript)
        },
        onFinalResult: (result) => {
          setCurrentTranscription(result.transcript)
          if (socketRef.current) {
            console.log('🎤 Sending final transcription:', result.transcript)
            socketRef.current.emit('speechTranscription', {
              transcription: result.transcript,
              sourceLanguage: sourceLanguage,
              targetLanguage: targetLanguage
            })
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error)
          setError(`Speech recognition error: ${error.message}`)
          setIsProcessing(false)
          setIsRecording(false)
        },
        onStart: () => {
          console.log('🎤 Speech recognition started')
          setIsRecording(true)
        },
        onEnd: () => {
          console.log('🎤 Speech recognition ended')
          setIsRecording(false)
          setIsProcessing(false)
          setAudioLevel(0)
        },
        onAudioLevel: (level) => {
          setAudioLevel(level)
        }
      })
      
    } catch (err) {
      setError('Failed to start speech recognition. Please check browser support.')
      setIsProcessing(false)
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    GoogleSpeechService.stopRecognition()
    setIsRecording(false)
    setIsProcessing(false)
    setCurrentTranscription('')
    setAudioLevel(0)
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Calculate button color based on audio level
  const getButtonColor = () => {
    if (!isRecording) {
      return '#3b82f6' // Default blue
    }
    
    // Create a gradient from blue (quiet) to red (loud)
    const intensity = Math.min(audioLevel * 2, 1) // Amplify the effect
    const red = Math.floor(59 + (196 * intensity)) // 59 to 255
    const green = Math.floor(130 - (130 * intensity)) // 130 to 0
    const blue = Math.floor(246 - (246 * intensity)) // 246 to 0
    
    return `rgb(${red}, ${green}, ${blue})`
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
          style={{
            backgroundColor: getButtonColor(),
            transition: 'background-color 0.1s ease-out'
          }}
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
          <div className="recording-info">
            <p>🎵 Listening and transcribing in real-time...</p>
            <div className="audio-level-indicator">
              <span>Audio Level: </span>
              <div className="audio-level-bar">
                <div 
                  className="audio-level-fill"
                  style={{ 
                    width: `${audioLevel * 100}%`,
                    backgroundColor: getButtonColor(),
                    transition: 'width 0.1s ease-out, background-color 0.1s ease-out'
                  }}
                />
              </div>
              <span className="audio-level-text">{Math.round(audioLevel * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder
