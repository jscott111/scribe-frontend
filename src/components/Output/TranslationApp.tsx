import React, { useState, useRef, useEffect } from 'react'
import Typography from '../UI/Typography'
import { Paper, Chip, Button, Box, useMediaQuery, useTheme, CircularProgress, TextField } from '@mui/material'
import OutputLanguageSelector from '../OutputLanguageSelector'
import { LanguageCode, getLanguageInfo } from '../../enums/azureLangs'
import { io, Socket } from 'socket.io-client'
import styled from 'styled-components'
import { CONFIG } from '../../config/urls'
import { useSession } from '../../contexts/SessionContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 2rem;
  gap: 3rem;
`

const LandingCard = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 3rem;
  border-radius: 2rem;
  max-width: 95%;
  width: 30rem;
  max-height: 90%;
  height: 40rem;
  gap: 2.5rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 2rem!important;
`

const LanguageSelectionSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
`

const StartButton = styled(Button)`
  padding: 1rem 3rem;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: none;
  min-width: 200px;
`

const MainContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  height: ${props => props.isMobile ? 'calc(100vh - 2rem)' : '100%'};
  width: ${props => props.isMobile ? 'calc(100vw - 2rem)' : '100%'};
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
  padding: 2rem;
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
  overflow-x: hidden;
  flex: 1;
  padding: 1rem 0;
  gap: 0.5rem;
  box-sizing: border-box;
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

const HeaderSection = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: ${props => props.isMobile ? '1rem' : '4rem'};
  margin-bottom: 2rem;
`

const ConnectionStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`

const RightPanelContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${props => props.isMobile ? '1rem' : '1rem'};
  box-sizing: border-box;
  overflow: hidden;
`

const BackButton = styled(Button)`
  margin-bottom: 1rem;
  border-radius: 2rem;
  text-transform: none;
  align-self: flex-start;
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
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(LanguageCode.FR)
  const [translationBubbles, setTranslationBubbles] = useState<TranslationBubble[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showLanguageSelection, setShowLanguageSelection] = useState(true)
  const [sessionInput, setSessionInput] = useState('')
  const [isValidatingSession, setIsValidatingSession] = useState(false)
  const [sessionValidationError, setSessionValidationError] = useState('')
  const [attemptedSessionId, setAttemptedSessionId] = useState('')
  
  const socketRef = useRef<Socket | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { sessionId, setSessionId, clearSessionId } = useSession()

  // Function to validate session ID
  const validateSessionId = async (sessionIdToValidate: string): Promise<boolean> => {
    if (!sessionIdToValidate || !/^[A-Z0-9]{8}$/.test(sessionIdToValidate)) {
      setSessionValidationError('Session ID must be 8 characters (letters and numbers)')
      clearSessionId() // Clear any existing session ID
      return false
    }

    setIsValidatingSession(true)
    setSessionValidationError('')

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/sessions/${sessionIdToValidate}/validate`)
      const data = await response.json()

      if (data.valid) {
        setSessionId(sessionIdToValidate)
        return true
      } else {
        setSessionValidationError(data.error || 'Session not found or inactive')
        clearSessionId() // Clear any existing session ID
        return false
      }
    } catch (error) {
      console.error('Session validation error:', error)
      setSessionValidationError('Failed to validate session. Please try again.')
      clearSessionId() // Clear any existing session ID
      return false
    } finally {
      setIsValidatingSession(false)
    }
  }
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionFromUrl = urlParams.get('session')
    console.log('🔗 TranslationApp - Session from URL:', sessionFromUrl)
    console.log('🔗 TranslationApp - Current sessionId:', sessionId)
    
    if (sessionFromUrl) {
      setAttemptedSessionId(sessionFromUrl.toUpperCase())
      setSessionInput(sessionFromUrl.toUpperCase())
      validateSessionId(sessionFromUrl)
    } else {
      console.log('🔗 TranslationApp - No session ID in URL, clearing session and showing blank page')
      clearSessionId() // Clear any existing session ID
    }
  }, []) // Remove dependencies to avoid infinite loop

  useEffect(() => {
    console.log('🔗 TranslationApp - Connecting with sessionId:', sessionId, 'targetLanguage:', targetLanguage)
    
    // Only connect if we have both a session ID and target language
    if (!targetLanguage || !sessionId) {
      console.log('🔗 TranslationApp - Not connecting: missing sessionId or targetLanguage')
      setIsConnecting(false)
      setIsConnected(false)
      return
    }

    setIsConnecting(true)
    setIsConnected(false)

    socketRef.current = io(CONFIG.BACKEND_URL, {
      auth: {
        sessionId: sessionId
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })
    
    socketRef.current.on('connect', () => {
      setIsConnecting(false)
      setIsConnected(true)
    })
    
    socketRef.current.on('disconnect', (reason) => {
      setIsConnecting(false)
      setIsConnected(false)
    })
    
    socketRef.current.on('connect_error', (error) => {
      console.error('🔗 TranslationApp - Connection error:', error)
      setIsConnecting(false)
      setIsConnected(false)
    })
    
    socketRef.current.on('translationComplete', (data) => {
      const newBubble: TranslationBubble = {
        id: data.bubbleId || Date.now().toString(),
        originalText: data.originalText || 'Unknown',
        translatedText: data.translatedText || 'Translation failed',
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        timestamp: new Date(),
        isComplete: true
      }
      
      setTranslationBubbles(prev => [...prev, newBubble])
    })
    
    socketRef.current.on('translationError', (data) => {
      const newBubble: TranslationBubble = {
        id: data.bubbleId || Date.now().toString(),
        originalText: 'Unknown',
        translatedText: 'Translation failed',
        sourceLanguage: 'en' as LanguageCode,
        targetLanguage: targetLanguage,
        timestamp: new Date(),
        isComplete: true
      }
      
      setTranslationBubbles(prev => [...prev, newBubble])
    })
    
    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      setIsConnecting(false)
      setIsConnected(false)
    })

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`🔄 TranslationApp reconnected after ${attemptNumber} attempts`)
      setIsConnecting(false)
      setIsConnected(true)
    })

    socketRef.current.on('reconnect_error', (error) => {
      console.error('❌ TranslationApp reconnection error:', error)
      setIsConnecting(false)
      setIsConnected(false)
    })

    socketRef.current.on('reconnect_failed', () => {
      console.error('❌ TranslationApp reconnection failed after all attempts')
      setIsConnecting(false)
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      setIsConnecting(false)
      setIsConnected(false)
    }
  }, [targetLanguage, sessionId])

  useEffect(() => {
    if (socketRef.current && isConnected && targetLanguage && !showLanguageSelection) {
      socketRef.current.emit('setTargetLanguage', { targetLanguage })
    }
  }, [targetLanguage, isConnected, showLanguageSelection])


  const handleBackToLanguageSelection = () => {
    setShowLanguageSelection(true)
    setTargetLanguage(LanguageCode.FR)
    setTranslationBubbles([])
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  if (!sessionId || sessionValidationError) {
    return (
      <LandingPageContainer>
        <LandingCard elevation={3} sx={{ gap: '1rem', padding: '1rem' }}>
          <Box sx={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
            <img 
              src="/scribe-logo-name-transparent.png" 
              alt="Scribe" 
              style={{ height: '100%', width: 'auto' }}
            />
          </Box>
          
          <Typography variant="sectionHeader" sx={{ fontSize: '1.25rem', textAlign: 'center' }}>
            Join Translation Session
          </Typography>
          
          <Typography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            {attemptedSessionId ? 
              `The session ID "${attemptedSessionId}" is not valid. Please enter a different session ID.` :
              'Enter the session ID provided by the speaker to join their live translation session.'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
            <TextField
              label="Session ID"
              value={sessionInput}
              onChange={(e) => {
                setSessionInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
                setSessionValidationError('')
                setAttemptedSessionId('')
              }}
              placeholder="ABC12345"
              variant="outlined"
              fullWidth
              error={!!sessionValidationError}
              helperText={sessionValidationError || 'Enter the 8-character session ID'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '1rem',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace'
                }
              }}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => validateSessionId(sessionInput)}
              disabled={!sessionInput || sessionInput.length !== 8 || isValidatingSession}
              sx={{
                borderRadius: '1rem',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {isValidatingSession ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CircularProgress size={20} />
                  Validating...
                </Box>
              ) : (
                'Join Session'
              )}
            </Button>
          </Box>
          
          <Typography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.9rem' }}>
            Or scan the QR code from the speaker's device to join automatically.
          </Typography>
        </LandingCard>
      </LandingPageContainer>
    )
  }

  if (showLanguageSelection) {
    return (
      <LandingPageContainer>
        <LandingCard elevation={3} sx={{ gap: '1rem', padding: '1rem' }}>
          <Box sx={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
            <img 
              src="/scribe-logo-name-transparent.png" 
              alt="Scribe" 
              style={{ height: '100%', width: 'auto' }}
            />
          </Box>
          
          <Typography variant="sectionHeader" sx={{ fontSize: '1.25rem', textAlign: 'center' }}>
            Real-time Translation
          </Typography>
          
          <Typography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Choose your preferred language to receive live translations from the speaker
          </Typography>
          
          <LanguageSelectionSection>
            <Typography variant="subsectionHeader" sx={{ textAlign: 'center', marginTop: '1rem' }}>
              Select Target Language
            </Typography>
            
            <OutputLanguageSelector
              label="Language"
              selectedLanguage={targetLanguage || LanguageCode.EN}
              onLanguageChange={setTargetLanguage}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
              <Typography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.9rem' }}>
                Session: <strong>{sessionId}</strong>
              </Typography>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  clearSessionId()
                  setSessionInput('')
                  setSessionValidationError('')
                  setAttemptedSessionId('')
                }}
                sx={{
                  borderRadius: '1rem',
                  padding: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                Change Session
              </Button>
            </Box>
            
            <StartButton
              variant="contained"
              color="primary"
              onClick={() => {
                if (targetLanguage) {
                  // Set the target language on the server when user starts listening
                  socketRef.current?.emit('setTargetLanguage', { targetLanguage })
                  setShowLanguageSelection(false)
                }
              }}
              disabled={!targetLanguage}
              sx={{
                marginTop: '1rem',
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              Start Listening
            </StartButton>
          </LanguageSelectionSection>
        </LandingCard>
      </LandingPageContainer>
    )
  }

  return (
    <MainContainer isMobile={isMobile}>
      {isMobile ? (
        <MobileHeader elevation={3}>
          <MobileHeaderLeft>
            <BackButton
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLanguageSelection}
              size="small"
              sx={{
                borderRadius: '1rem',
                minWidth: 'auto',
                padding: '0.5rem 1rem'
              }}
            >
              Back
            </BackButton>
            <Typography variant="subsectionHeader" sx={{ fontSize: '1rem', fontWeight: '600' }}>
              {getLanguageInfo(targetLanguage).name} {getLanguageInfo(targetLanguage).flag}
            </Typography>
          </MobileHeaderLeft>
          
          <MobileHeaderRight>
            {isConnecting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CircularProgress size={16} />
                <Typography variant="captionText" sx={{ fontSize: '0.75rem' }}>
                  Connecting...
                </Typography>
              </Box>
            ) : (
              <Chip
                label={isConnected ? 'Connected' : 'Disconnected'}
                color={isConnected ? 'success' : 'error'}
                variant="outlined"
                size="small"
              />
            )}
          </MobileHeaderRight>
        </MobileHeader>
      ) : (
        // Desktop Left Panel
        <LeftPanel elevation={3}>
          <BackButton
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToLanguageSelection}
            sx={{
              borderRadius: '2rem',
              marginBottom: '1rem'
            }}
          >
            Change Language
          </BackButton>

          <HeaderSection isMobile={isMobile}>
            <Box sx={{ height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/scribe-logo-name-transparent.png" 
                alt="Scribe" 
                style={{ height: '100%', width: 'auto' }}
              />
            </Box>
            <Typography variant="subsectionHeader" sx={{ textAlign: 'center' }}>
              Translating to {getLanguageInfo(targetLanguage).name} {getLanguageInfo(targetLanguage).flag}
            </Typography>
          </HeaderSection>

          <ConnectionStatusContainer>
            {isConnecting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CircularProgress size={20} />
                <Typography variant="bodyText" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  Connecting...
                </Typography>
              </Box>
            ) : (
              <Chip
                label={isConnected ? 'Connected' : 'Disconnected'}
                color={isConnected ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </ConnectionStatusContainer>
        </LeftPanel>
      )}

      <RightPanel elevation={3} isMobile={isMobile}>
        <RightPanelContent isMobile={isMobile}>
          <BubblesContainer>
            {translationBubbles.length === 0 ? (
              <EmptyState>
                <Typography variant="sectionHeader" sx={{ marginBottom: '0.5rem' }}>
                  Waiting for translation...
                </Typography>
                <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
                  Translations will appear here when the speaker starts talking
                </Typography>
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
