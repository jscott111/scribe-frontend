import React, { useState, useEffect, useRef } from 'react'
import LanguageSelector from '../../components/LanguageSelector'
import Typography from '../UI/Typography'
import { LanguageCode, getLanguageInfo } from '../../enums/azureLangs'
import { Paper, Chip, Button, Box, IconButton } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import DownloadIcon from '@mui/icons-material/Download'
import LogoutIcon from '@mui/icons-material/Logout'
import QRCode from 'react-qr-code'
import { io, Socket } from 'socket.io-client'
import styled from 'styled-components'
import { CONFIG } from '../../config/urls'
import { useAuth } from '../../contexts/AuthContext'
import { useSession } from '../../contexts/SessionContext'

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
  border-radius: 2rem!important;
  margin: 1rem;
  margin-right: 0.5rem;
`

const RightPanel = styled(PaperCards)`
  flex: 1 1 70%;
  max-width: 80%;
  min-width: 70%;
  border-radius: 2rem!important;
  margin: 1rem;
  margin-left: 0.5rem;
`

const ConnectionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4rem;
  margin-bottom: 2rem;
`

const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
`

const QRCodeContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MessageBubble = styled(Paper)`
  padding: 0.75rem 1rem;
  border-radius: 4rem!important;
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
  const [connectionCount, setConnectionCount] = useState<{total: number, byLanguage: Record<string, number>}>({total: 0, byLanguage: {}})
  const [isTranslating, setIsTranslating] = useState(false)
  const [transcriptionBubbles, setTranscriptionBubbles] = useState<MessageBubble[]>([])
  const [currentTranscription, setCurrentTranscription] = useState('')
  
  const socketRef = React.useRef<Socket | null>(null)
  const recognitionRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const { user, tokens, logout, updateTokens } = useAuth()
  const { sessionId, generateSessionId, setSessionId, forceNewSessionId } = useSession()

  // Generate session ID immediately when component mounts
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = generateSessionId()
      console.log('🔗 InputApp generated new session ID on mount:', newSessionId)
    } else {
      console.log('🔗 InputApp using existing session ID:', sessionId)
      // Check if the session ID is in the old format and force a new one
      if (sessionId.length > 8) {
        console.log('🔗 InputApp found old format session ID, forcing new one:', sessionId)
        forceNewSessionId()
      }
    }
  }, [sessionId, generateSessionId, forceNewSessionId]) // Include dependencies

  useEffect(() => {
    if (!tokens || !sessionId) {
      return
    }

    socketRef.current = io(CONFIG.BACKEND_URL, {
      auth: {
        token: tokens.accessToken,
        sessionId: sessionId
      }
    })
    
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('getConnectionCount')
    })

    socketRef.current.on('transcriptionComplete', (data) => {
      setTranscriptionBubbles(prev => 
        prev.map(bubble => 
          bubble.id === data.bubbleId 
            ? { ...bubble, isComplete: true }
            : bubble
        )
      )
    })

    socketRef.current.on('connectionCount', (data: {total: number, byLanguage: Record<string, number>}) => {
      setConnectionCount(data)
    })

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
    })

    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    // Handle token expiration
    socketRef.current.on('tokenExpired', (data) => {
      if (tokens.refreshToken) {
        socketRef.current?.emit('refreshToken', {
          refreshToken: tokens.refreshToken
        })
      }
    })

    // Handle successful token refresh
    socketRef.current.on('tokenRefreshed', (data) => {
      if (updateTokens) {
        updateTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        })
      }
    })

    // Handle token refresh error
    socketRef.current.on('tokenRefreshError', (data) => {
      console.error('❌ Token refresh failed:', data)
      if (logout) {
        logout()
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [tokens, sessionId]) // Include dependencies

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported')
      return
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognitionClass()

    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = sourceLanguage

    recognitionRef.current.onstart = () => {
      setIsTranslating(true)
    }

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      console.log('🎤 Speech recognition result:', event.results.length, 'results')

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
          console.log('🎤 Final transcript:', transcript)
        } else {
          interimTranscript += transcript
          console.log('🎤 Interim transcript:', transcript)
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
        } else {
          console.error('❌ Socket not connected, cannot emit transcription')
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
          )
        }, 2000)
      } else {
        setCurrentTranscription(interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsTranslating(false)
    }

    recognitionRef.current.onend = () => {
      setIsTranslating(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [sourceLanguage, tokens, sessionId])

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const svg = qrCodeRef.current.querySelector('svg')
      
      if (svg && ctx) {
        canvas.width = 200
        canvas.height = 200
        
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)
        
        const img = new Image()
        img.onload = () => {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'scribe-translation-qr.png'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }
          })
          
          URL.revokeObjectURL(svgUrl)
        }
        img.src = svgUrl
      }
    }
  }

  return (
    <MainContainer>
      <LeftPanel elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="appTitle" sx={{ margin: 0 }}>Scribe</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Typography variant="bodyText" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              {user?.name}
            </Typography>
            <IconButton
              onClick={logout}
              color="primary"
              sx={{ 
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(210, 180, 140, 0.1)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
        <ConnectionDisplay>
          <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Chip
              label={`${connectionCount.total - 1} connection${connectionCount.total - 1 === 1 ? '' : 's'}`}
              color="primary"
              variant="outlined"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                width: '10rem'
              }}
            />
            {Object.keys(connectionCount.byLanguage).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {Object.entries(connectionCount.byLanguage).sort(([langA, countA], [langB, countB]) => countB - countA).map(([lang, count]) => (
                  <Chip
                    key={lang}
                    label={`${getLanguageInfo(lang as LanguageCode).flag} ${count}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </div>
            )}
          </div>
        </ConnectionDisplay>
        <LanguageSelector
          label="Source Language"
          selectedLanguage={sourceLanguage}
          onLanguageChange={setSourceLanguage}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '2rem',
            marginTop: '2rem'
          }}
          onClick={() => {
            if (isTranslating) {
              console.log('🎤 Stopping speech recognition')
              if (recognitionRef.current) {
                recognitionRef.current.stop()
              }
            } else {
              console.log('🎤 Starting speech recognition')
              if (recognitionRef.current) {
                recognitionRef.current.start()
              }
            }
          }}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
        <QRCodeSection>
          <Typography variant="subsectionHeader" sx={{ textAlign: 'center' }}>
            Audience Access
          </Typography>
          <Typography variant="captionText" sx={{ textAlign: 'center' }}>
            Share this QR code with your audience
          </Typography>
          <QRCodeContainer ref={qrCodeRef}>
            {sessionId ? (
              <QRCode
                value={`${CONFIG.TRANSLATION_URL}?session=${sessionId}`}
                size={120}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            ) : (
              <Box sx={{ 
                width: 120, 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}>
                <Typography variant="captionText">Generating...</Typography>
              </Box>
            )}
          </QRCodeContainer>
          <Typography variant="captionText" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
            {sessionId ? (
              <a href={`${CONFIG.TRANSLATION_URL}?session=${sessionId}`} target="_blank" rel="noopener noreferrer">
                {CONFIG.TRANSLATION_URL}?session={sessionId}
              </a>
            ) : (
              'Generating session link...'
            )}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadQRCode}
            sx={{ marginTop: '0.5rem' }}
          >
            Download QR Code
          </Button>
        </QRCodeSection>
      </LeftPanel>
      <RightPanel elevation={3}>
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
