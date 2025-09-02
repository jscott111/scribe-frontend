import React, { useState, useEffect } from 'react'
import './InputApp.css'
import InputClient from './InputClient'
import LanguageSelector from '../LanguageSelector'
import Typography from '../UI/Typography'
import { LanguageCode, getSupportedLanguages } from '../../enums/azureLangs'
import { Paper, Chip, Button } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import { io, Socket } from 'socket.io-client'
import styled from 'styled-components'

interface MessageBubble {
  id: string
  text: string
  timestamp: Date
  isComplete: boolean
}

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
  border-radius: 2rem;
  margin: 1rem;
  margin-right: 0.5rem;
`

const RightPanel = styled(PaperCards)`
  flex: 1 1 70%;
  max-width: 80%;
  min-width: 70%;
  border-radius: 2rem;
  margin: 1rem;
  margin-left: 0.5rem;
`

const ConnectionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
`

const MessageBubble = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 4rem!important;
  margin: 0.25rem 0.25rem;
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

function InputApp() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(LanguageCode.EN)
  const [connectionCount, setConnectionCount] = useState<number>(0)
  const socketRef = React.useRef<Socket | null>(null)
  const recognitionRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionBubbles, setTranscriptionBubbles] = useState<MessageBubble[]>([])
  const [currentTranscription, setCurrentTranscription] = useState('')

  useEffect(() => {
    socketRef.current = io('http://localhost:3001')
    
    socketRef.current.on('transcriptionComplete', (data) => {
      setTranscriptionBubbles(prev => 
        prev.map(bubble => 
          bubble.id === data.bubbleId 
            ? { ...bubble, isComplete: true }
            : bubble
        )
      )
      setIsProcessing(false)
    })

    socketRef.current.on('connectionCount', (count: number) => {
      setConnectionCount(count)
    })

    socketRef.current.emit('getConnectionCount')

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
      setIsTranslating(true)
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
        const newBubble: MessageBubble = {
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
            bubbleId: newBubble.id
          })
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setTranscriptionBubbles((prev) =>
            prev.map((bubble) =>
              bubble.id === newBubble.id
                ? { ...bubble, isComplete: true }
                : bubble
            )
          );
          setIsProcessing(false);
        }, 2000);
      } else {
        setCurrentTranscription(interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsTranslating(false)
      setIsProcessing(false)
    }

    recognitionRef.current.onend = () => {
      setIsTranslating(false)
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

  return (
    <MainContainer>
      <LeftPanel elevation={12}>
        <Typography variant="appTitle">Scribe</Typography>
        
        <ConnectionDisplay>
          <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Chip
            label={`${connectionCount - 1} listening`}
            color="primary"
            variant="outlined"
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          />
        </ConnectionDisplay>

        <LanguageSelector
          label="From"
          selectedLanguage={sourceLanguage}
          onLanguageChange={setSourceLanguage}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '2rem'
          }}
          onClick={() => {
            if (isTranslating) {
              if (recognitionRef.current) {
                recognitionRef.current.stop()
              }
            } else {
              if (recognitionRef.current) {
                recognitionRef.current.start()
              }
            }
          }}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      </LeftPanel>

      <RightPanel elevation={12}>
        <BubblesContainer>
          {currentTranscription && (
            <MessageBubble elevation={1} sx={{ opacity: 0.7 }}>
              <Typography variant="bodyText">{currentTranscription}</Typography>
              <Typography variant="captionText">Listening...</Typography>
            </MessageBubble>
          )}
          {transcriptionBubbles.slice().reverse().map((bubble) => (
            <MessageBubble key={bubble.id} elevation={3}>
              <Typography variant="bodyText">{bubble.text}</Typography>
            </MessageBubble>
          ))}
        </BubblesContainer>
      </RightPanel>
    </MainContainer>
  )
}

export default InputApp
