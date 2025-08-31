import { useRef, useEffect, useState } from 'react'
import { Language } from '../App'
import { io, Socket } from 'socket.io-client'

interface AudioRecorderProps {
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  sourceLanguage: Language
  targetLanguage: Language
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)

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

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })

      // Set up audio context for real-time processing
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      microphoneRef.current.connect(analyserRef.current)
      
      // Configure analyser for real-time audio
      analyserRef.current.fftSize = 2048
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Start real-time audio streaming
      const streamAudio = () => {
        if (!isRecording || !analyserRef.current || !socketRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Convert audio data to base64 and send via WebSocket
        const audioData = Array.from(dataArray)
        socketRef.current?.emit('audioStream', {
          audioData,
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLanguage.code
        })

        requestAnimationFrame(streamAudio)
      }

      streamAudio()
      setIsRecording(true)
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.')
      setIsProcessing(false)
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsProcessing(false)
    
    // Stop all audio streams
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Notify backend to stop processing
    socketRef.current?.emit('stopStreaming')
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

      <div className="recorder-info">
        <p>Source: <strong>{sourceLanguage.name}</strong></p>
        <p>Target: <strong>{targetLanguage.name}</strong></p>
        {isRecording && (
          <p className="recording-info">
            🎵 Recording and streaming audio in real-time...
          </p>
        )}
      </div>
    </div>
  )
}

export default AudioRecorder
