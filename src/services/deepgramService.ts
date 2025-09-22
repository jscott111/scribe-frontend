import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export interface DeepgramConfig {
  apiKey: string
  model?: string
  language?: string
  smartFormat?: boolean
  interimResults?: boolean
}

export interface TranscriptionResult {
  text: string
  isFinal: boolean
  confidence: number
  timestamp: number
}

export interface DeepgramService {
  startListening: (onResult: (result: TranscriptionResult) => void) => Promise<void>
  stopListening: () => void
  isConnected: () => boolean
  updateContext: (context: string[]) => void
}

class DeepgramServiceImpl implements DeepgramService {
  private client: any
  private connection: any = null
  private isListening = false
  private contextHistory: string[] = []
  private config: DeepgramConfig
  private isStopping: boolean = false
  private lastTranscriptionTime: number = 0
  private transcriptionTimeout: NodeJS.Timeout | null = null
  private lastText: string = '' // Track the last text to avoid duplicate timeouts
  private finalizedText: string = '' // Track what we've already finalized
  private lastFinalizedTime: number = 0 // Track when we last finalized text
  private silenceStartTime: number = 0 // Track when silence started
  private lastSentToUI: string = '' // Track what we've actually sent to the UI
  private lastFinalizedBubble: string = '' // Track the last text we sent as a final bubble

  constructor(config: DeepgramConfig) {
    this.config = {
      model: 'nova-2',
      language: 'en-US',
      smartFormat: true,
      interimResults: true,
      ...config
    }
    console.log('Creating Deepgram client with API key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : 'MISSING')
    this.client = createClient(this.config.apiKey)
    console.log('Deepgram client created successfully')
  }

  // Map language codes to Deepgram-compatible format
  private mapLanguageToDeepgram(lang: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh-Hans': 'zh-CN',
      'zh-Hant': 'zh-TW',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'da': 'da-DK',
      'no': 'no-NO',
      'fi': 'fi-FI',
      'pl': 'pl-PL',
      'tr': 'tr-TR',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'id': 'id-ID',
      'ms': 'ms-MY'
    }
    return languageMap[lang] || 'en-US'
  }

  async startListening(onResult: (result: TranscriptionResult) => void): Promise<void> {
    if (this.isListening) {
      console.warn('Deepgram is already listening')
      return
    }

    this.isStopping = false

    try {
      const deepgramLanguage = this.mapLanguageToDeepgram(this.config.language || 'en-US')
      console.log('Deepgram API Key:', this.config.apiKey ? `Present (${this.config.apiKey.substring(0, 8)}...)` : 'Missing')
      console.log('Deepgram Config:', {
        model: this.config.model,
        language: this.config.language,
        deepgramLanguage: deepgramLanguage,
        smartFormat: this.config.smartFormat,
        interimResults: this.config.interimResults
      })

      // Get user media stream
      const deviceId = this.getSelectedDeviceId()
      console.log('Requesting microphone access for device:', deviceId)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          deviceId: deviceId,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      console.log('Microphone access granted')

      // Create Deepgram connection with explicit interim results
      console.log('Creating Deepgram connection...')
      const connectionOptions = {
        model: this.config.model,
        language: deepgramLanguage,
        smart_format: this.config.smartFormat,
        interim_results: true, // Force interim results
        punctuate: true, // Add punctuation to help with final detection
        diarize: false
      }
      console.log('Deepgram connection options:', connectionOptions)
      
      try {
        this.connection = this.client.listen.live(connectionOptions)
        console.log('✅ Deepgram connection object created')
      } catch (error) {
        console.error('❌ Failed to create Deepgram connection:', error)
        throw error
      }
      console.log('Deepgram connection created successfully')

      // Handle connection events
      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened - ready to receive audio')
        this.isListening = true
        this.lastText = '' // Reset for new session
        this.finalizedText = '' // Reset finalized text
        this.lastFinalizedTime = 0 // Reset finalized time
        this.silenceStartTime = 0 // Reset silence tracking
        this.lastSentToUI = '' // Reset UI tracking
        this.lastFinalizedBubble = '' // Reset finalized bubble tracking
      })

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        console.log('📝 Raw transcript data received:', data)
        const result = data.channel?.alternatives?.[0]
        if (result) {
          console.log('📝 Result details:', {
            transcript: result.transcript,
            is_final: result.is_final,
            confidence: result.confidence,
            type: typeof result.is_final,
            words: result.words?.length || 0,
            raw_result: result
          })
          
          // Debug: Check if we're getting any final results at all
          if (result.is_final === true) {
            console.log('🎯 DEEPGRAM SAYS FINAL!', result.transcript)
          } else {
            console.log('🔄 DEEPGRAM SAYS INTERIM:', result.transcript)
          }
          
          // Store the current text
          const currentText = result.transcript || ''
          
          // Check if Deepgram says this is final
          const isDeepgramFinal = result.is_final === true
          
          console.log('📝 Deepgram result:', { 
            text: currentText, 
            is_final: result.is_final, 
            confidence: result.confidence,
            finalizedText: this.finalizedText
          })
          
          console.log('📝 Text analysis:', {
            current: currentText,
            lastSentToUI: this.lastSentToUI,
            finalizedText: this.finalizedText,
            isDeepgramFinal
          })
          
          // If Deepgram says it's final, calculate what's new and send as final
          if (isDeepgramFinal && currentText.trim()) {
            // Calculate what's new since the last finalized bubble
            let newText = currentText
            if (this.lastFinalizedBubble && currentText.startsWith(this.lastFinalizedBubble)) {
              newText = currentText.substring(this.lastFinalizedBubble.length).trim()
              console.log('🔄 Text continues from last bubble - new part:', newText)
            } else if (this.lastFinalizedBubble && this.lastFinalizedBubble.length > 0) {
              // Deepgram is revising - find the common part and extract what's truly new
              const commonPrefix = this.findCommonPrefix(this.lastFinalizedBubble, currentText)
              if (commonPrefix.length > 0) {
                newText = currentText.substring(commonPrefix.length).trim()
                console.log('🔄 Deepgram revision detected - common prefix:', commonPrefix, 'new part:', newText)
              } else {
                // No common prefix - treat as completely new text
                newText = currentText
                console.log('🔄 No common prefix found - treating as new text:', newText)
              }
            }
            
            if (newText.trim()) {
              console.log('🎯 Deepgram says final - creating bubble immediately:', newText)
              console.log('🎯 Full context - currentText:', currentText, 'lastFinalizedBubble:', this.lastFinalizedBubble, 'newText:', newText)
              const finalResult: TranscriptionResult = {
                text: newText,
                isFinal: true,
                confidence: result.confidence || 0,
                timestamp: Date.now()
              }
              onResult(finalResult)
              
              // Update tracking variables
              this.finalizedText = currentText
              this.lastSentToUI = currentText
              this.lastFinalizedBubble = currentText // Track what we sent as a final bubble
              this.lastFinalizedTime = Date.now()
              console.log('📝 Updated tracking - lastFinalizedBubble:', this.lastFinalizedBubble)
              
              // Add to context history
              this.addToContext(finalResult.text.trim())
              
              // Clear any pending timeout since we got a final result
              if (this.transcriptionTimeout) {
                clearTimeout(this.transcriptionTimeout)
                this.transcriptionTimeout = null
                console.log('⏰ Cleared timeout due to final result')
              }
            }
          } else if (currentText.trim()) {
            // If not final, send the full current text as interim (for the listening bubble)
            const transcriptionResult: TranscriptionResult = {
              text: currentText, // Send the full current text for interim display
              isFinal: false,
              confidence: result.confidence || 0,
              timestamp: Date.now()
            }
            
            console.log('📝 Sending to UI as interim (full text):', currentText)
            onResult(transcriptionResult)
            
            // Update what we've sent to UI for interim results
            this.lastSentToUI = currentText
            
            // Update silence tracking
            this.silenceStartTime = 0 // Reset silence timer since we have new text
            
            // Set a timeout as fallback with improved timing
            if (currentText !== this.lastText) {
              // Clear previous timeout
              if (this.transcriptionTimeout) {
                clearTimeout(this.transcriptionTimeout)
                console.log('⏰ Cleared previous timeout')
              }
              
              // Use shorter timeout for better responsiveness (1.5 seconds)
              console.log('⏰ Setting 1500ms timeout for:', currentText)
              this.transcriptionTimeout = setTimeout(() => {
                // Calculate what's new for timeout finalization
                let newText = currentText
                if (this.lastFinalizedBubble && currentText.startsWith(this.lastFinalizedBubble)) {
                  newText = currentText.substring(this.lastFinalizedBubble.length).trim()
                } else if (this.lastFinalizedBubble && this.lastFinalizedBubble.length > 0) {
                  const commonPrefix = this.findCommonPrefix(this.lastFinalizedBubble, currentText)
                  if (commonPrefix.length > 0) {
                    newText = currentText.substring(commonPrefix.length).trim()
                  } else {
                    newText = currentText
                  }
                }
                
                if (newText.trim()) {
                  console.log('⏰ Timeout fallback - making final:', newText)
                  const finalResult: TranscriptionResult = {
                    text: newText,
                    isFinal: true,
                    confidence: result.confidence || 0,
                    timestamp: Date.now()
                  }
                  onResult(finalResult)
                  
                  // Update tracking variables
                  this.finalizedText = currentText
                  this.lastSentToUI = currentText
                  this.lastFinalizedBubble = currentText // Track what we sent as a final bubble
                  this.lastFinalizedTime = Date.now()
                  console.log('📝 Updated tracking - lastFinalizedBubble:', this.lastFinalizedBubble)
                  
                  // Add to context history
                  this.addToContext(finalResult.text.trim())
                }
                
                // Clear the timeout
                this.transcriptionTimeout = null
              }, 1500)
              
              // Update the last text
              this.lastText = currentText
            }
          } else {
            // No new text - start tracking silence
            if (this.silenceStartTime === 0) {
              this.silenceStartTime = Date.now()
              console.log('🔇 Started tracking silence')
            }
          }
          
          this.lastTranscriptionTime = Date.now()
          
        } else {
          console.log('⚠️ No transcript data in result:', data)
        }
      })

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('❌ Deepgram error:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        this.isListening = false
      })

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔌 Deepgram connection closed unexpectedly')
        console.log('🔌 Close event details:', {
          isListening: this.isListening,
          connection: !!this.connection,
          connectionState: this.connection?.readyState,
          timestamp: new Date().toISOString()
        })
        this.isListening = false
      })

      // Connection is established automatically when created
      // No need to call start() method
      
      // Add a timeout to check connection state
      setTimeout(() => {
        console.log('🔍 Connection state after 2 seconds:', {
          isListening: this.isListening,
          connection: !!this.connection,
          connectionState: this.connection?.readyState
        })
        
        // Try to send a test message to see if connection is working
        if (this.connection) {
          console.log('🧪 Testing connection by sending empty data...')
          try {
            this.connection.send(new Uint8Array(0))
            console.log('✅ Test data sent successfully')
          } catch (error) {
            console.error('❌ Failed to send test data:', error)
          }
        }
      }, 2000)

      // Add another timeout to check if we're still connected after 5 seconds
      setTimeout(() => {
        console.log('🔍 Connection state after 5 seconds:', {
          isListening: this.isListening,
          connection: !!this.connection,
          connectionState: this.connection?.readyState
        })
      }, 5000)

      // Add a timeout to check if we're still connected after 10 seconds
      setTimeout(() => {
        console.log('🔍 Connection state after 10 seconds:', {
          isListening: this.isListening,
          connection: !!this.connection,
          connectionState: this.connection?.readyState
        })
      }, 10000)

      // Add a timeout to check if we're still connected after 15 seconds
      setTimeout(() => {
        console.log('🔍 Connection state after 15 seconds:', {
          isListening: this.isListening,
          connection: !!this.connection,
          connectionState: this.connection?.readyState
        })
        
        // If we still haven't received any transcriptions, there might be an issue
        if (this.isListening && this.connection) {
          console.log('⚠️ No transcriptions received after 15 seconds - possible audio format issue')
        }
      }, 15000)

      // Send audio data to Deepgram
      let mediaRecorder: MediaRecorder
      
      // Try different MIME types for better compatibility with Deepgram
      const mimeTypes = [
        'audio/wav',
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm'
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }
      
      console.log('🎵 Audio MIME type selected:', selectedMimeType || 'default')
      console.log('🎵 Supported MIME types:', mimeTypes.filter(mt => MediaRecorder.isTypeSupported(mt)))
      
      if (!selectedMimeType) {
        mediaRecorder = new MediaRecorder(stream)
        console.log('🎵 Using default MediaRecorder')
      } else {
        mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType })
        console.log('🎵 Using MediaRecorder with MIME type:', selectedMimeType)
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.connection && !this.isStopping && this.isListening) {
          console.log('Sending audio data to Deepgram:', event.data.size, 'bytes, type:', event.data.type)
          
          // Try sending as ArrayBuffer for better compatibility
          const reader = new FileReader()
          reader.onload = () => {
            if (reader.result && this.connection && reader.result instanceof ArrayBuffer) {
              console.log('Sending ArrayBuffer to Deepgram:', reader.result.byteLength, 'bytes')
              this.connection.send(reader.result)
            }
          }
          reader.readAsArrayBuffer(event.data)
        } else if (this.isStopping) {
          console.log('Skipping audio data send - stopping in progress')
        } else if (!this.isListening) {
          console.log('Skipping audio data send - not listening')
        } else if (!this.connection) {
          console.log('Skipping audio data send - no connection')
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
      }

      mediaRecorder.start(100) // Send data every 100ms

      // Store media recorder for cleanup
      ;(this.connection as any).mediaRecorder = mediaRecorder
      ;(this.connection as any).stream = stream

      // Add keep-alive mechanism to prevent connection timeout
      const keepAliveInterval = setInterval(() => {
        if (this.connection && this.isListening) {
          console.log('💓 Sending keep-alive to Deepgram')
          this.connection.keepAlive()
        } else {
          clearInterval(keepAliveInterval)
        }
      }, 30000) // Send keep-alive every 30 seconds

      // Store interval for cleanup
      ;(this.connection as any).keepAliveInterval = keepAliveInterval

    } catch (error) {
      console.error('Error starting Deepgram:', error)
      throw error
    }
  }

  stopListening(): void {
    if (typeof console !== 'undefined' && console.log) {
      console.log('Stopping Deepgram listening...')
    }
    
    if (!this.isListening || !this.connection) {
      if (typeof console !== 'undefined' && console.log) {
        console.log('Not listening or no connection, skipping stop')
      }
      return
    }

    this.isStopping = true

    // Clear any pending transcription timeout
    if (this.transcriptionTimeout) {
      clearTimeout(this.transcriptionTimeout)
      this.transcriptionTimeout = null
    }

    try {
      // Stop media recorder first
      if ((this.connection as any).mediaRecorder) {
        if (typeof console !== 'undefined' && console.log) {
          console.log('Stopping MediaRecorder...')
        }
        const mediaRecorder = (this.connection as any).mediaRecorder
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }

      // Stop stream tracks
      if ((this.connection as any).stream) {
        if (typeof console !== 'undefined' && console.log) {
          console.log('Stopping audio stream tracks...')
        }
        (this.connection as any).stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop()
        })
      }

      // Clear keep-alive interval
      if ((this.connection as any).keepAliveInterval) {
        if (typeof console !== 'undefined' && console.log) {
          console.log('Clearing keep-alive interval...')
        }
        clearInterval((this.connection as any).keepAliveInterval)
      }

      // Close Deepgram connection using the correct method
      if (typeof console !== 'undefined' && console.log) {
        console.log('Closing Deepgram connection...')
      }
      this.connection.requestClose()
      this.connection = null
      this.isListening = false
      this.isStopping = false

      if (typeof console !== 'undefined' && console.log) {
        console.log('🎤 Deepgram stopped')
      }
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('❌ Error stopping Deepgram:', error)
      }
      this.isStopping = false
    }
  }

  isConnected(): boolean {
    return this.isListening && this.connection !== null
  }

  updateContext(context: string[]): void {
    this.contextHistory = [...context]
  }

  private addToContext(text: string): void {
    this.contextHistory.push(text)
    // Keep only last 10 transcriptions to avoid context getting too long
    if (this.contextHistory.length > 10) {
      this.contextHistory = this.contextHistory.slice(-10)
    }
  }

  private findCommonPrefix(str1: string, str2: string): string {
    let commonPrefix = ''
    const minLength = Math.min(str1.length, str2.length)
    
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) {
        commonPrefix += str1[i]
      } else {
        break
      }
    }
    
    return commonPrefix
  }


  private getSelectedDeviceId(): string | undefined {
    // This will be set by the parent component
    return (window as any).selectedDeviceId
  }
}

// Factory function to create Deepgram service
export const createDeepgramService = (config: DeepgramConfig): DeepgramService => {
  return new DeepgramServiceImpl(config)
}

export default DeepgramServiceImpl
