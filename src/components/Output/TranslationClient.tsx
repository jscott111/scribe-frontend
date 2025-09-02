import React, { useRef, useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Paper, Typography, Button, IconButton } from '@mui/material'
import { VolumeUp, ContentCopy } from '@mui/icons-material'
import { LanguageCode, getLanguageInfo } from '../../enums/azureLangs'
import { io, Socket } from 'socket.io-client'

const MessageBubble = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 4rem !important;
  margin: 0.5rem 1rem;
  width: fit-content;
  max-width: 80%;
  align-self: flex-end;
`

const BubblesContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  flex: 1;
  padding: 1rem 0;
  gap: 0.5rem;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #b0b0b0;
  text-align: center;
  padding: 2rem;
`

const BubbleActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: flex-end;
`

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
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Translation Client connected to backend')
      setIsConnected(true)
    })
    
    socketRef.current.on('disconnect', () => {
      console.log('🔌 Translation Client disconnected from backend')
      setIsConnected(false)
    })
    
    socketRef.current.on('transcription', async (data) => {
      console.log('📝 Received transcription:', data)
      
      const newBubble: TranslationBubble = {
        id: data.bubbleId || Date.now().toString(),
        originalText: data.originalText || 'Unknown',
        translatedText: 'Translating...', // Will be updated after translation
        sourceLanguage: data.sourceLanguage,
        targetLanguage: targetLanguage, // Use this client's target language
        timestamp: new Date(data.timestamp || Date.now()),
        isComplete: false
      }
      
      setTranslationBubbles(prev => [...prev, newBubble])
      
      // Translate the text using Azure Translator
      try {
        const translatedText = await translateText(data.originalText, data.sourceLanguage, targetLanguage)
        
        // Update the bubble with the translation
        setTranslationBubbles(prev => 
          prev.map(bubble => 
            bubble.id === newBubble.id 
              ? { ...bubble, translatedText, isComplete: true }
              : bubble
          )
        )
      } catch (error) {
        console.error('Translation error:', error)
        setTranslationBubbles(prev => 
          prev.map(bubble => 
            bubble.id === newBubble.id 
              ? { ...bubble, translatedText: 'Translation failed', isComplete: true }
              : bubble
          )
        )
      }
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

  // Translation function using Azure Translator
  const translateText = async (text: string, fromLang: LanguageCode, toLang: LanguageCode): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          from: fromLang,
          to: toLang
        })
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.translatedText
    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          🌍 Translation Client
        </Typography>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: isConnected ? '#4caf50' : '#f44336' 
        }} />
        <Typography variant="captionText" sx={{ color: 'text.secondary' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Typography>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Typography variant="bodyText">{getSourceLanguageInfo().flag}</Typography>
          <Typography variant="bodyText">{getSourceLanguageInfo().name}</Typography>
        </div>
        <Typography variant="bodyText">→</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Typography variant="bodyText">{getTargetLanguageInfo().flag}</Typography>
          <Typography variant="bodyText">{getTargetLanguageInfo().name}</Typography>
        </div>
      </div>

      <Button
        variant="outlined"
        color="secondary"
        onClick={clearBubbles}
        disabled={translationBubbles.length === 0}
        sx={{ alignSelf: 'flex-start', marginBottom: '1rem' }}
      >
        🗑️ Clear All
      </Button>

      <BubblesContainer>
        {translationBubbles.length === 0 ? (
          <EmptyState>
            <Typography variant="h4" sx={{ marginBottom: '1rem' }}>🌍</Typography>
            <Typography variant="h6" sx={{ marginBottom: '0.5rem' }}>Waiting for translations...</Typography>
            <Typography variant="bodyText">Start speaking in the Input Client to see translations appear here</Typography>
          </EmptyState>
        ) : (
          translationBubbles.slice().reverse().map((bubble) => (
            <MessageBubble key={bubble.id} elevation={3}>
              <Typography variant="bodyText" sx={{ marginBottom: '0.5rem' }}>
                {bubble.translatedText}
              </Typography>
              <BubbleActions>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(bubble.translatedText)}
                  title="Copy translation"
                  sx={{ color: 'primary.main' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => speakText(bubble.translatedText, bubble.targetLanguage)}
                  title="Speak translation"
                  sx={{ color: 'primary.main' }}
                >
                  <VolumeUp fontSize="small" />
                </IconButton>
              </BubbleActions>
            </MessageBubble>
          ))
        )}
      </BubblesContainer>
    </div>
  )
}

export default TranslationClient
