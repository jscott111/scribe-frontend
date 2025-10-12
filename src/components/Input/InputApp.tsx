import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import InputLanguageSelector from '../InputLanguageSelector'
import DeviceSelector from './DeviceSelector'
import Typography from '../UI/Typography'
import { LanguageCode, getLanguageInfo } from '../../enums/googleLangs'
import { Paper, Chip, Button, Box, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip } from '@mui/material'
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
import { useUserCode } from '../../contexts/SessionContext'
import ProfileModal from '../Profile/ProfileModal'
import googleSpeechService from '../../services/googleSpeechService'
import { setCookie, getCookie } from '../../utils/cookieUtils'
import { createHybridFlagElement } from '../../utils/flagEmojiUtils.tsx'

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
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  border-radius: 2rem !important;
  margin: 1rem;
  margin-right: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: calc(100% - 2rem);
`

const RightPanel = styled(Paper)<{ isMobile: boolean }>`
  ${props => props.isMobile ? `
    flex: 1;
    width: 100%;
    height: 100%;
    border-radius: 1rem !important;
  ` : `
    flex: 1;
    min-width: 250px;
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
  align-items: flex-start;
  gap: 16px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: 0.2I think rem;
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
  // Initialize source language from cookie or default
  const getInitialSourceLanguage = (): LanguageCode => {
    const savedLanguage = getCookie('scribe-source-language')
    if (savedLanguage && Object.values(LanguageCode).includes(savedLanguage as LanguageCode)) {
      return savedLanguage as LanguageCode
    }
    return LanguageCode.EN_CA
  }

  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>(getInitialSourceLanguage())
  const [connectionCount, setConnectionCount] = useState<{total: number, byLanguage: Record<string, number>}>({total: 0, byLanguage: {}})

  // Handle source language change and save to cookie
  const handleSourceLanguageChange = (language: LanguageCode) => {
    setSourceLanguage(language)
    setCookie('scribe-source-language', language, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax'
    })
  }
  const [isTranslating, setIsTranslating] = useState(false)
  const [shouldBeListening, setShouldBeListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState<number>(0) // Audio level from 0 to 1
  const [transcriptionBubbles, setTranscriptionBubbles] = useState<MessageBubble[]>([])
  const [currentTranscription, setCurrentTranscription] = useState('')

  // Calculate button color based on audio level
  const getButtonColor = () => {
    if (!isTranslating) {
      return undefined // Use default Material-UI primary color (#9BB5D1)
    }
    
    // Set a threshold - only start changing color above this level
    const audioThreshold = 0.20 // Only react to audio levels above 15%
    const adjustedLevel = Math.max(0, audioLevel - audioThreshold)
    
    // Normalize the adjusted level to 0-1 range
    const normalizedLevel = Math.min(1, adjustedLevel / (1 - audioThreshold))
    
    // Apply sensitivity to the normalized level
    const intensity = Math.min(normalizedLevel * 2, 1) // Reduced from 3 to 2 for smoother transition
    
    // Start with your brand's primary color (#9BB5D1) and scale towards a neutral warm tone
    const brandRed = 155   // #9BB5D1 red component
    const brandGreen = 181 // #9BB5D1 green component  
    const brandBlue = 209  // #9BB5D1 blue component
    
    // End with a neutral warm color (muted orange/brown)
    const endRed = 180    // Neutral warm red
    const endGreen = 120  // Neutral warm green
    const endBlue = 80    // Neutral warm blue
    
    // Scale from brand color to neutral warm color based on intensity
    const red = Math.floor(brandRed + ((endRed - brandRed) * intensity))
    const green = Math.floor(brandGreen + ((endGreen - brandGreen) * intensity))
    const blue = Math.floor(brandBlue + ((endBlue - brandBlue) * intensity))
    
    return `rgb(${red}, ${green}, ${blue})`
  }
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [isSocketConnecting, setIsSocketConnecting] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState<{userCode: string, connectionUrl: string, qrCodeUrl: string, shareText: string} | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [speechConfig, setSpeechConfig] = useState({
    speechEndTimeout: 1, // Balanced timeout for natural speech patterns
    maxWordsPerBubble: 15,
    speechStartTimeout: 5.0
  })
  const socketRef = React.useRef<Socket | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const { user, tokens, logout, updateTokens, getConnectionInfo } = useAuth()
  const { userCode, setUserCode, clearUserCode } = useUserCode()
  const theme = useTheme()
  const isMobile = useMediaQuery('(max-width: 850px)')

  useEffect(() => {
    if (tokens && user && user.userCode) {
      // Always sync the userCode from AuthContext to UserCodeContext
      if (userCode !== user.userCode) {
        console.log('🔗 Syncing user code from', userCode, 'to', user.userCode)
        setUserCode(user.userCode)
      }
    }
  }, [tokens, user, userCode, setUserCode])

  useEffect(() => {
    if (tokens && userCode) {
      const fetchConnectionInfo = async () => {
        try {
          const info = await getConnectionInfo()
          setConnectionInfo(info)
        } catch (error) {
          console.error('Failed to fetch connection info:', error)
        }
      }
      fetchConnectionInfo()
    }
  }, [tokens, userCode, getConnectionInfo])

  useEffect(() => {
    if (!tokens || !userCode) {
      console.log('🔌 Socket: Missing tokens or userCode, not connecting')
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
      return
    }

    console.log('🔌 Socket: Connecting to', CONFIG.BACKEND_URL, 'with userCode:', userCode, '(tokens available:', !!tokens, ')')
    setIsSocketConnecting(true)
    setIsSocketConnected(false)

    if (socketRef.current) {
      // Remove all event listeners before disconnecting
      socketRef.current.removeAllListeners()
      if ((socketRef.current as any).connectionCountInterval) {
        clearInterval((socketRef.current as any).connectionCountInterval)
      }
      if ((socketRef.current as any).heartbeatInterval) {
        clearInterval((socketRef.current as any).heartbeatInterval)
      }
      socketRef.current.disconnect()
      socketRef.current = null
    }

    socketRef.current = io(CONFIG.BACKEND_URL, {
      auth: {
        token: tokens.accessToken,
        userCode: userCode
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    
    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected successfully with userCode:', userCode)
      setIsSocketConnecting(false)
      setIsSocketConnected(true)
      socketRef.current?.emit('getConnectionCount')
      
      const intervalId = setInterval(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('getConnectionCount')
        } else {
          clearInterval(intervalId)
        }
      }, 5000)
      
      ;(socketRef.current as any).connectionCountInterval = intervalId
      
      // Set up heartbeat mechanism
      const heartbeatInterval = setInterval(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('ping')
        } else {
          clearInterval(heartbeatInterval)
        }
      }, 15000) // Send ping every 15 seconds
      
      ;(socketRef.current as any).heartbeatInterval = heartbeatInterval
    })

    socketRef.current.on('interimTranscription', (data) => {
      setCurrentTranscription(data.transcript)
    })


    socketRef.current.on('connectionCount', (data: {total: number, byLanguage: Record<string, number>}) => {
      setConnectionCount(data)
    })

    socketRef.current.on('disconnect', (reason) => {
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

    socketRef.current.on('tokenExpired', (data) => {
      console.log('🔌 Token expired, attempting refresh')
      if (tokens.refreshToken) {
        socketRef.current?.emit('refreshToken', {
          refreshToken: tokens.refreshToken
        })
      }
    })

    socketRef.current.on('tokenRefreshed', (data) => {
      console.log('🔌 Socket token refreshed successfully')
      if (updateTokens) {
        updateTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        })
      }
    })

    socketRef.current.on('tokenRefreshError', (data) => {
      console.error('❌ Token refresh failed:', data)
      if (logout) {
        logout()
      }
    })

    socketRef.current.on('pong', () => {
      console.log('💓 Received pong from server')
    })

    return () => {
      if (socketRef.current) {
        console.log('🔌 Cleaning up socket connection')
        if ((socketRef.current as any).connectionCountInterval) {
          clearInterval((socketRef.current as any).connectionCountInterval)
        }
        if ((socketRef.current as any).heartbeatInterval) {
          clearInterval((socketRef.current as any).heartbeatInterval)
        }
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsSocketConnecting(false)
      setIsSocketConnected(false)
    }
  }, [tokens, userCode])

  // Initialize Google Cloud Speech-to-Text service when socket is connected
  useEffect(() => {
    if (isSocketConnected && socketRef.current) {
      googleSpeechService.initialize(socketRef.current).catch(error => {
        console.error('❌ Failed to initialize Google Speech Service:', error)
      })
    }
  }, [isSocketConnected])

  // Cleanup Google Speech Service on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        if ((socketRef.current as any).connectionCountInterval) {
          clearInterval((socketRef.current as any).connectionCountInterval)
        }
        socketRef.current.disconnect()
      }
      googleSpeechService.cleanup()
    }
  }, [])

  // Google Cloud Speech-to-Text handlers
  const startGoogleSpeechRecognition = useCallback(async () => {
    console.log('🎤 startGoogleSpeechRecognition called, shouldBeListening:', shouldBeListening);

    try {
      // Check if Google Speech Service is ready
      if (!googleSpeechService.isReady()) {
        console.error('❌ Google Speech Service not ready');
        alert('Google Cloud Speech-to-Text is not configured. Please check the setup guide and configure your API credentials.');
        setIsTranslating(false)
        return
      }

      // Update Google Speech Service configuration
      googleSpeechService.updateConfig({
        languageCode: sourceLanguage,
        speechStartTimeout: speechConfig.speechStartTimeout,
        maxWordsPerBubble: speechConfig.maxWordsPerBubble
      })

      await googleSpeechService.startRecognition({
        onStart: () => {
          setIsTranslating(true)
        },
        onEnd: () => {
          setIsTranslating(false)
          setAudioLevel(0) // Reset audio level when recording ends
        },
        onInterimResult: (result) => {
          setCurrentTranscription(result.transcript)
        },
        onFinalResult: (result) => {
          const uniqueId = `${result.bubbleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newBubble: MessageBubble = {
            id: uniqueId,
            text: result.transcript,
            timestamp: new Date(),
            isComplete: false
          }
          
          setTranscriptionBubbles(prev => [...prev, newBubble])
          setCurrentTranscription('')
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          timeoutRef.current = setTimeout(() => {
            setTranscriptionBubbles((prev) =>
              prev.map((bubble) =>
                bubble.id === uniqueId
                  ? { ...bubble, isComplete: true }
                  : bubble
              )
            )
          }, 250)
        },
        onError: (error) => {
          console.error('❌ Google Speech recognition error:', error)
          alert('Speech recognition error: ' + error.message);
          setIsTranslating(false)
        },
        onAudioLevel: (level) => {
          setAudioLevel(level)
        }
      })
    } catch (error) {
      console.error('❌ Failed to start Google Speech recognition:', error)
      alert('Failed to start speech recognition: ' + error.message);
      setIsTranslating(false)
    }
  }, [sourceLanguage, speechConfig])

  const stopGoogleSpeechRecognition = useCallback(() => {
    // If there's current interim transcription, submit it as final
    if (currentTranscription.trim()) {
      const uniqueId = `interim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newBubble: MessageBubble = {
        id: uniqueId,
        text: currentTranscription,
        timestamp: new Date(),
        isComplete: false
      }
      
      setTranscriptionBubbles(prev => [...prev, newBubble])
      
      // Send to backend for translation and distribution to listeners
      if (socketRef.current && isSocketConnected) {
        socketRef.current.emit('speechTranscription', {
          transcription: currentTranscription,
          sourceLanguage: sourceLanguage,
          bubbleId: uniqueId
        })
      }
      
      // Mark as complete after a short delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setTranscriptionBubbles((prev) =>
          prev.map((bubble) =>
            bubble.id === uniqueId
              ? { ...bubble, isComplete: true }
              : bubble
          )
        )
      }, 250)
    }
    
    // Reset current transcription
    setCurrentTranscription('')
    
    googleSpeechService.stopRecognition()
    setIsTranslating(false)
  }, [currentTranscription, socketRef, isSocketConnected, sourceLanguage])

  // Handle Google Cloud Speech-to-Text
  useEffect(() => {
    if (isSocketConnected) {
      if (shouldBeListening) {
        startGoogleSpeechRecognition()
      } else {
        stopGoogleSpeechRecognition()
      }
    }
  }, [shouldBeListening, isSocketConnected, startGoogleSpeechRecognition, stopGoogleSpeechRecognition])


  const downloadQRCode = () => {
    if (connectionInfo?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = connectionInfo.qrCodeUrl
      link.download = 'scribe-translation-qr.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
              <Tooltip title="View Profile" arrow placement="bottom">
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.5rem',
                    '&:hover': {
                      backgroundColor: 'rgba(210, 180, 140, 0.1)',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => setProfileModalOpen(true)}
                >
                  <AccountBoxIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="bodyText" sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.8rem',
                    display: 'flex', 
                    alignItems: 'center'
                  }}>
                    {user?.name}
                  </Typography>
                </Box>
              </Tooltip>
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
                label={`${connectionCount.total - 1 < 0 ? 'No' : connectionCount.total - 1} connection${connectionCount.total - 1 === 1 ? '' : 's'}`}
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
            <Tooltip title="View Profile" arrow placement="bottom">
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: 'rgba(210, 180, 140, 0.1)',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => setProfileModalOpen(true)}
              >
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
            </Tooltip>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
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
              </div>
              {Object.keys(connectionCount.byLanguage).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginLeft: '3rem' }}>
                  {Object.entries(connectionCount.byLanguage).sort(([langA, countA], [langB, countB]) => countB - countA).map(([lang, count]) => (
                    <Chip
                      key={lang}
                      color="primary"
                      label={
                        <span>
                          {createHybridFlagElement(lang as LanguageCode, 16)} {count}
                        </span>
                      }
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </ConnectionDisplay>
          <InputLanguageSelector
            label="Source Language"
            selectedLanguage={sourceLanguage}
            onLanguageChange={handleSourceLanguageChange}
          />
          <Box sx={{ marginTop: '1rem' }}>
            <DeviceSelector
              selectedDeviceId={selectedDeviceId}
              onDeviceChange={setSelectedDeviceId}
              disabled={isTranslating}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '2rem',
              marginTop: '2rem',
              backgroundColor: getButtonColor(),
              transition: 'background-color 0.1s ease-out'
            }}
            onClick={() => {
              if (isTranslating) {
                setShouldBeListening(false)
              } else {
                setShouldBeListening(true)
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
              {connectionInfo ? (
                <img 
                  src={connectionInfo.qrCodeUrl} 
                  alt="QR Code" 
                  style={{ width: 120, height: 120 }}
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
              {connectionInfo ? (
                <a href={connectionInfo.connectionUrl} target="_blank" rel="noopener noreferrer">
                  {connectionInfo.connectionUrl}
                </a>
              ) : (
                'Generating connection link...'
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
      )}

      <RightPanel elevation={3} isMobile={isMobile}>
        <RightPanelContent isMobile={isMobile}>
          {isMobile && (
            <Box sx={{ marginBottom: '1rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <InputLanguageSelector
                  label="Source Language"
                  selectedLanguage={sourceLanguage}
                  onLanguageChange={handleSourceLanguageChange}
                />
              </Box>
              <Box sx={{ marginTop: '1rem', width: '100%' }}>
                <DeviceSelector
                  selectedDeviceId={selectedDeviceId}
                  onDeviceChange={setSelectedDeviceId}
                  disabled={isTranslating}
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
                  padding: '0.75rem',
                  backgroundColor: getButtonColor(),
                  transition: 'background-color 0.1s ease-out'
                }}
                onClick={() => {
                  if (isTranslating) {
                    setShouldBeListening(false)
                  } else {
                    setShouldBeListening(true)
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
            {connectionInfo ? (
              <img 
                src={connectionInfo.qrCodeUrl} 
                alt="QR Code" 
                style={{ width: 200, height: 200 }}
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
            {connectionInfo ? (
              <a href={connectionInfo.connectionUrl} target="_blank" rel="noopener noreferrer">
                {connectionInfo.connectionUrl}
              </a>
            ) : (
              'Generating connection link...'
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
      
      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        isSocketConnected={isSocketConnected}
        onLogout={logout}
      />
    </MainContainer>
  )
}

export default InputApp

