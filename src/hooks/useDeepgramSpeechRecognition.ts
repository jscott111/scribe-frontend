import { useState, useRef, useCallback, useEffect } from 'react'
import { createDeepgramService, DeepgramService, TranscriptionResult } from '../services/deepgramService'
import { DEEPGRAM_CONFIG } from '../config/deepgram'

interface UseDeepgramSpeechRecognitionProps {
  language: string
  selectedDeviceId: string | null
  onTranscription: (text: string, isFinal: boolean, confidence: number) => void
  onError?: (error: Error) => void
}

interface UseDeepgramSpeechRecognitionReturn {
  isListening: boolean
  isConnecting: boolean
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  updateContext: (context: string[]) => void
}

export const useDeepgramSpeechRecognition = ({
  language,
  selectedDeviceId,
  onTranscription,
  onError
}: UseDeepgramSpeechRecognitionProps): UseDeepgramSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const deepgramServiceRef = useRef<DeepgramService | null>(null)
  const contextHistoryRef = useRef<string[]>([])

  // Initialize Deepgram service
  useEffect(() => {
    console.log('🔑 Deepgram API Key:', DEEPGRAM_CONFIG.API_KEY ? 'Set' : 'Not set')
    console.log('🔑 API Key length:', DEEPGRAM_CONFIG.API_KEY?.length || 0)
    if (!DEEPGRAM_CONFIG.API_KEY) {
      setError('Deepgram API key not configured. Please set VITE_DEEPGRAM_API_KEY in your environment variables.')
      return
    }

    try {
      deepgramServiceRef.current = createDeepgramService({
        apiKey: DEEPGRAM_CONFIG.API_KEY,
        model: DEEPGRAM_CONFIG.MODEL,
        language: language,
        smartFormat: DEEPGRAM_CONFIG.SMART_FORMAT,
        interimResults: DEEPGRAM_CONFIG.INTERIM_RESULTS
      })
    } catch (err) {
      setError(`Failed to initialize Deepgram: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [language])

  // Set selected device ID globally for Deepgram service
  useEffect(() => {
    if (selectedDeviceId) {
      ;(window as any).selectedDeviceId = selectedDeviceId
    }
  }, [selectedDeviceId])

  const startListening = useCallback(async () => {
    console.log('useDeepgramSpeechRecognition: startListening called')
    
    if (!deepgramServiceRef.current) {
      console.log('Initializing Deepgram service...')
      if (DEEPGRAM_CONFIG.API_KEY) {
        try {
          deepgramServiceRef.current = createDeepgramService({
            apiKey: DEEPGRAM_CONFIG.API_KEY,
            model: DEEPGRAM_CONFIG.MODEL,
            language: language,
            smartFormat: DEEPGRAM_CONFIG.SMART_FORMAT,
            interimResults: DEEPGRAM_CONFIG.INTERIM_RESULTS
          })
          console.log('Deepgram service initialized successfully')
        } catch (err) {
          console.error('Failed to initialize Deepgram service:', err)
          setError(`Failed to initialize Deepgram: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return
        }
      } else {
        console.error('No Deepgram API key found')
        setError('Deepgram API key not configured. Please set VITE_DEEPGRAM_API_KEY in your environment variables.')
        return
      }
    }

    if (isListening) {
      console.log('Already listening, skipping...')
      return
    }

    console.log('Starting Deepgram listening...')
    setIsConnecting(true)
    setError(null)

    try {
      await deepgramServiceRef.current.startListening((result: TranscriptionResult) => {
        onTranscription(result.text, result.isFinal, result.confidence)
        
        // Add to context history if final
        if (result.isFinal && result.text.trim()) {
          contextHistoryRef.current.push(result.text.trim())
          // Keep only last 10 transcriptions
          if (contextHistoryRef.current.length > DEEPGRAM_CONFIG.MAX_CONTEXT_HISTORY) {
            contextHistoryRef.current = contextHistoryRef.current.slice(-DEEPGRAM_CONFIG.MAX_CONTEXT_HISTORY)
          }
        }
      })

      setIsListening(true)
      setIsConnecting(false)
      console.log('Deepgram listening started successfully')
    } catch (err) {
      console.error('Error starting Deepgram listening:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening'
      setError(errorMessage)
      setIsConnecting(false)
      setIsListening(false)
      onError?.(new Error(errorMessage))
    }
  }, [isListening, onTranscription, onError])

  const stopListening = useCallback(() => {
    if (!deepgramServiceRef.current) {
      return
    }

    try {
      deepgramServiceRef.current.stopListening()
      setIsListening(false)
    } catch (err) {
      console.error('Error stopping Deepgram:', err)
      setError(`Failed to stop listening: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [])

  const updateContext = useCallback((context: string[]) => {
    contextHistoryRef.current = [...context]
    if (deepgramServiceRef.current) {
      deepgramServiceRef.current.updateContext(context)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deepgramServiceRef.current) {
        deepgramServiceRef.current.stopListening()
      }
    }
  }, [])

  return {
    isListening,
    isConnecting,
    error,
    startListening,
    stopListening,
    updateContext
  }
}

export default useDeepgramSpeechRecognition
