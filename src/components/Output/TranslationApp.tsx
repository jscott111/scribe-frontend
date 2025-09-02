import React, { useState, useRef, useEffect } from 'react'
import Typography from '../UI/Typography'
import { Paper, Chip } from '@mui/material'
import LanguageSelector from '../LanguageSelector'
import { LanguageCode } from '../../enums/azureLangs'
import { io, Socket } from 'socket.io-client'
import styled from 'styled-components'

const MainContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  gap: 8px;
`

const PaperCards = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  margin: 1rem;
  border-radius: 2rem;
  height: calc(100% - 2rem);
`

const LeftPanel = styled(PaperCards)`
  max-width: 30%;
  min-width: 20%;
  border-radius: 2rem!important;
  margin: 1rem;
  margin-right: 0.5rem;
  padding: 2rem;
`

const RightPanel = styled(PaperCards)`
  flex: 1 1 70%;
  max-width: 80%;
  min-width: 70%;
  border-radius: 1rem!important;
  margin: 1rem;
  margin-left: 0.5rem;
`

const MessageBubble = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 4rem !important;
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

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 4rem;
  margin-bottom: 2rem;
`

const ConnectionStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const RightPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
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

function TranslationApp() {
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(LanguageCode.ES)
  const [translationBubbles, setTranslationBubbles] = useState<TranslationBubble[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Translation Client connected to backend')
      setIsConnected(true)
      socketRef.current?.emit('setTargetLanguage', { targetLanguage })
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
        translatedText: 'Translating...',
        sourceLanguage: data.sourceLanguage,
        targetLanguage: targetLanguage,
        timestamp: new Date(data.timestamp || Date.now()),
        isComplete: false
      }
      
      setTranslationBubbles(prev => [...prev, newBubble])
      
      try {
        const translatedText = await translateText(data.originalText, data.sourceLanguage, targetLanguage)
        
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
  }, [targetLanguage])

  useEffect(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('setTargetLanguage', { targetLanguage })
    }
  }, [targetLanguage, isConnected])

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
    <MainContainer>
      <LeftPanel elevation={3}>
        <Typography variant="appTitle">Scribe</Typography>

        <LanguageSelector
          label="Target Language"
          selectedLanguage={targetLanguage}
          onLanguageChange={setTargetLanguage}
        />
      </LeftPanel>

      <RightPanel elevation={3}>
        <RightPanelContent>
          <ConnectionStatusContainer>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="outlined"
            />
          </ConnectionStatusContainer>

          <BubblesContainer>
            {translationBubbles.length === 0 ? (
              <EmptyState>
                <Typography variant="sectionHeader" sx={{ marginBottom: '0.5rem' }}>Waiting for translation...</Typography>
              </EmptyState>
            ) : (
              translationBubbles.slice().reverse().map((bubble) => (
                <MessageBubble key={bubble.id} elevation={3}>
                  <Typography variant="bodyText">
                    {bubble.translatedText}
                  </Typography>
                </MessageBubble>
              ))
            )}
          </BubblesContainer>
        </RightPanelContent>
      </RightPanel>
    </MainContainer>
  )
}

export default TranslationApp
