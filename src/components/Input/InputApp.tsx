import React, { useState, useEffect, useRef } from 'react'
import LanguageSelector from '../../components/LanguageSelector'
import Typography from '../UI/Typography'
import { LanguageCode, getLanguageInfo } from '../../enums/azureLangs'
import { Paper, Chip, Button, Box, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import DownloadIcon from '@mui/icons-material/Download'
import LogoutIcon from '@mui/icons-material/Logout'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AccountBoxIcon from '@mui/icons-material/AccountBox';
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

const MainContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  height: ${props => props.isMobile ? 'calc(100vh - 2rem)' : '100vh'};
  width: ${props => props.isMobile ? 'calc(100vw - 2rem)' : '100vw'};
  padding: ${props => props.isMobile ? '0.5rem' : '0'};
  margin: 0;
  gap: ${props => props.isMobile ? '0.5rem' : '8px'};
  box-sizing: border-box;
`

const MobileHeader = styled(Paper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin: 0;
  border-radius: 1rem !important;
  min-height: 5rem;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
`

const MobileHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const MobileHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const LeftPanel = styled(Paper)`
  max-width: 30%;
  min-width: 20%;
  border-radius: 2rem !important;
  margin: 1rem;
  margin-right: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100% - 2rem);
`

const RightPanel = styled(Paper)<{ isMobile: boolean }>`
  ${props => props.isMobile ? `
    flex: 1;
    width: 100%;
    height: 100%;
    border-radius: 1rem !important;
  ` : `
    flex: 1 1 70%;
    max-width: 80%;
    min-width: 70%;
    height: calc(100% - 2rem);
    border-radius: 2rem !important;
    margin: 1rem;
    margin-left: 0.5rem;
  `}
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
`

const ConnectionDisplay = styled.div<{ isMobile: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 1rem;
  margin-bottom: 1rem;
`

const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
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
  overflow-x: hidden;
  flex: 1;
  padding: 1rem 0;
  gap: 0.5rem;
  box-sizing: border-box;
`

const RightPanelContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${props => props.isMobile ? '1rem' : '1rem'};
  box-sizing: border-box;
  overflow: hidden;
`

function InputApp() {
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(LanguageCode.EN)
  const [connectionCount, setConnectionCount] = useState<{total: number, byLanguage: Record<string, number>}>({total: 0, byLanguage: {}})
  const [isTranslating, setIsTranslating] = useState(false)
  const [shouldBeListening, setShouldBeListening] = useState(false)
  const [transcriptionBubbles, setTranscriptionBubbles] = useState<MessageBubble[]>([])
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [isSocketConnecting, setIsSocketConnecting] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  
  const socketRef = React.useRef<Socket | null>(null)
  const recognitionRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const { user, tokens, logout, updateTokens } = useAuth()
  const { sessionId, generateSessionId, setSessionId, forceNewSessionId } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (tokens && sessionId && user) {
      const registerSession = async () => {
        try {
          const response = await fetch(`${CONFIG.BACKEND_URL}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify({ sessionId })
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('🔗 Session registered with backend:', data.message)
          } else {
            console.error('🔗 Failed to register session with backend')
          }
        } catch (error) {
          console.error('🔗 Error registering session:', error)
        }
      }
      
      registerSession()
    }
  }, [tokens, sessionId, user])

  useEffect(() => {
    if (!tokens || !sessionId) {
      console.log('🔌 Socket: Missing tokens or sessionId, not connecting')
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
      return
    }

    console.log('🔌 Socket: Connecting to', CONFIG.BACKEND_URL, 'with sessionId:', sessionId)
    setIsSocketConnecting(true)
    setIsSocketConnected(false)

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    socketRef.current = io(CONFIG.BACKEND_URL, {
      auth: {
        token: tokens.accessToken,
        sessionId: sessionId
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected successfully')
      setIsSocketConnecting(false)
      setIsSocketConnected(true)
      socketRef.current?.emit('getConnectionCount')
      
      // Set up periodic connection count refresh
      const intervalId = setInterval(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('getConnectionCount')
        } else {
          clearInterval(intervalId)
        }
      }, 5000) // Refresh every 5 seconds
      
      // Store interval ID for cleanup
      ;(socketRef.current as any).connectionCountInterval = intervalId
    })

    socketRef.current.on('transcriptionComplete', (data) => {
      console.log('🔌 Received transcriptionComplete:', data)
      setTranscriptionBubbles(prev => 
        prev.map(bubble => 
          bubble.id === data.bubbleId 
            ? { ...bubble, isComplete: true }
            : bubble
        )
      )
    })

    socketRef.current.on('connectionCount', (data: {total: number, byLanguage: Record<string, number>}) => {
      console.log('🔌 Received connectionCount:', data)
      setConnectionCount(data)
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    })

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      setIsSocketConnecting(false)
      setIsSocketConnected(true)
    })

    socketRef.current.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error)
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    })

    socketRef.current.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts')
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    })

    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    // Handle token expiration
    socketRef.current.on('tokenExpired', (data) => {
      console.log('🔌 Token expired, attempting refresh')
      if (tokens.refreshToken) {
        socketRef.current?.emit('refreshToken', {
          refreshToken: tokens.refreshToken
        })
      }
    })

    // Handle successful token refresh
    socketRef.current.on('tokenRefreshed', (data) => {
      console.log('🔌 Token refreshed successfully')
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
        console.log('🔌 Cleaning up socket connection')
        // Clear the connection count interval
        if ((socketRef.current as any).connectionCountInterval) {
          clearInterval((socketRef.current as any).connectionCountInterval)
        }
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    }
  }, [tokens, sessionId]) // Include dependencies

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognitionClass()

    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = sourceLanguage

    recognitionRef.current.onstart = () => {
      setIsTranslating(true)
      setShouldBeListening(true)
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

      if (finalTranscript.trim()) {
        const newBubble: MessageBubble = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: finalTranscript.trim(),
          timestamp: new Date(),
          isComplete: false
        }
        
        setTranscriptionBubbles(prev => [...prev, newBubble])
        setCurrentTranscription('')
        
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('speechTranscription', {
            transcription: finalTranscript.trim(),
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
        }, 250)
      } else if (interimTranscript.trim()) {
        setCurrentTranscription(interimTranscript.trim())
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error)
      setIsTranslating(false)
      
      // On mobile, some errors are recoverable - try to restart after a short delay
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
        setTimeout(() => {
          if (recognitionRef.current && shouldBeListening && !isTranslating) {
            try {
              recognitionRef.current.start()
            } catch (err) {
              console.error('🎤 Failed to restart speech recognition:', err)
            }
          }
        }, 1000)
      }
    }

    recognitionRef.current.onend = () => {
      setIsTranslating(false)
      
      if (shouldBeListening) {
        setTimeout(() => {
          if (recognitionRef.current && shouldBeListening && !isTranslating) {
            try {
              recognitionRef.current.start()
            } catch (err) {
              console.error('🎤 Failed to restart speech recognition after end:', err)
            }
          }
        }, 100)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
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

  const handleGenerateNewSession = () => {
    const newSessionId = forceNewSessionId()
    console.log('🔗 User requested new session ID:', newSessionId)
  }

  return (
    <MainContainer isMobile={isMobile}>
      {isMobile ? (
        <MobileHeader elevation={3}>
          <MobileHeaderLeft>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ height: '5rem', display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/scribe-logo-name-transparent.png" 
                  alt="Scribe" 
                  style={{ height: '100%', width: 'auto' }}
                />
              </Box>
              <Typography variant="bodyText" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {user?.name}
              </Typography>
            </Box>
          </MobileHeaderLeft>
          
          <MobileHeaderRight>
            {isSocketConnecting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CircularProgress size={16} />
                <Typography variant="captionText" sx={{ fontSize: '0.75rem' }}>
                  Connecting...
                </Typography>
              </Box>
            ) : (
              <Chip
                label={`${connectionCount.total - 1} connection${connectionCount.total - 1 === 1 ? '' : 's'}`}
                color={isSocketConnected ? "primary" : "error"}
                variant="outlined"
                size="small"
              />
            )}
            <IconButton
              onClick={logout}
              color="primary"
              size="small"
              sx={{ 
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(210, 180, 140, 0.1)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </MobileHeaderRight>
        </MobileHeader>
      ) : (
        <LeftPanel elevation={3}>
          <Box sx={{ height: '7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/scribe-logo-name-transparent.png" 
              alt="Scribe" 
              style={{ height: '100%', width: 'auto' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AccountBoxIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="bodyText" sx={{ 
                color: 'text.secondary', 
                fontSize: '1rem', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                {user?.name}
              </Typography>
            </Box>
            <IconButton
              onClick={logout}
              color="primary"
              sx={{ 
                borderRadius: '50%',
                padding: '0.5rem',
                '&:hover': {
                  backgroundColor: 'rgba(210, 180, 140, 0.1)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
          <ConnectionDisplay isMobile={isMobile}>
            <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isSocketConnecting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '10rem' }}>
                  <CircularProgress size={20} />
                  <Typography variant="bodyText" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    Connecting...
                  </Typography>
                </Box>
              ) : (
                <Chip
                  label={`${connectionCount.total - 1} connection${connectionCount.total - 1 === 1 ? '' : 's'}`}
                  color={isSocketConnected ? "primary" : "error"}
                  variant="outlined"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    width: '10rem'
                  }}
                />
              )}
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
                setShouldBeListening(false)
                if (recognitionRef.current) {
                  recognitionRef.current.stop()
                }
              } else {
                console.log('🎤 Starting speech recognition')
                setShouldBeListening(true)
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
              startIcon={<QrCodeIcon />}
              onClick={() => setQrModalOpen(true)}
              sx={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
            >
              Show QR Code
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadQRCode}
              sx={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
            >
              Download QR Code
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleGenerateNewSession}
              sx={{ marginTop: '0.5rem' }}
            >
              New Session
            </Button>
          </QRCodeSection>
        </LeftPanel>
      )}

      <RightPanel elevation={3} isMobile={isMobile}>
        <RightPanelContent isMobile={isMobile}>
          {isMobile && (
            <Box sx={{ marginBottom: '1rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <LanguageSelector
                  label="Source Language"
                  selectedLanguage={sourceLanguage}
                  onLanguageChange={setSourceLanguage}
                />
              </Box>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<QrCodeIcon />}
                onClick={() => setQrModalOpen(true)}
                sx={{
                  borderRadius: '2rem',
                  marginTop: '1rem',
                  padding: '0.75rem'
                }}
              >
                Show QR Code
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: '2rem',
                  marginTop: '1rem',
                  padding: '0.75rem'
                }}
                onClick={() => {
                  if (isTranslating) {
                    console.log('🎤 Stopping speech recognition')
                    setShouldBeListening(false)
                    if (recognitionRef.current) {
                      recognitionRef.current.stop()
                    }
                  } else {
                    console.log('🎤 Starting speech recognition')
                    setShouldBeListening(true)
                    if (recognitionRef.current) {
                      recognitionRef.current.start()
                    }
                  }
                }}
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
            </Box>
          )}
          
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
        </RightPanelContent>
      </RightPanel>
      
      {/* QR Code Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '2rem',
            padding: '1rem'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
          <Typography variant="sectionHeader">
            Audience Access
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <Typography variant="bodyText" sx={{ marginBottom: '1.5rem', color: 'text.secondary' }}>
            Share this QR code with your audience
          </Typography>
          
          <Box ref={qrCodeRef} sx={{ marginBottom: '1.5rem' }}>
            {sessionId ? (
              <QRCode
                value={`${CONFIG.TRANSLATION_URL}?session=${sessionId}`}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            ) : (
              <Box sx={{ 
                width: 200, 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}>
                <Typography variant="bodyText">Generating...</Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="captionText" sx={{ 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            wordBreak: 'break-all',
            marginBottom: '1rem',
            display: 'block'
          }}>
            {sessionId ? (
              <a href={`${CONFIG.TRANSLATION_URL}?session=${sessionId}`} target="_blank" rel="noopener noreferrer">
                {CONFIG.TRANSLATION_URL}?session={sessionId}
              </a>
            ) : (
              'Generating session link...'
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadQRCode}
            sx={{ marginRight: '1rem' }}
          >
            Download QR Code
          </Button>
          <Button
            variant="contained"
            onClick={() => setQrModalOpen(false)}
            sx={{ borderRadius: '2rem' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  )
}

export default InputApp
