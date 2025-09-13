import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Typography,
  InputAdornment,
  Paper,
  Divider
} from '@mui/material'
import {
  Security,
  QrCode,
  CheckCircle,
  Smartphone,
  ContentCopy
} from '@mui/icons-material'
import styled from 'styled-components'
import CustomTypography from '../UI/Typography'
import { CONFIG } from '../../config/urls'

const SetupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
`

const QRCodeContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px dashed #ccc;
  border-radius: 1rem;
  margin: 1rem 0;
`

const SecretKeyContainer = styled(Box)`
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  word-break: break-all;
  margin: 1rem 0;
  position: relative;
`

const CopyButton = styled(Button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  min-width: auto;
  padding: 0.25rem;
`

interface User {
  id: number
  email: string
  name: string
}

interface TOTPSetupModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
}

const TOTPSetupModal: React.FC<TOTPSetupModalProps> = ({
  open,
  onClose,
  onSuccess,
  user
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const steps = ['Generate Secret', 'Scan QR Code', 'Verify Setup', 'Save Backup Codes']

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setActiveStep(0)
      setQrCodeUrl(null)
      setSecretKey(null)
      setVerificationCode('')
      setError(null)
      setBackupCodes([])
    }
  }, [open])

  const generateTOTPSecret = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/setup-totp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')!).accessToken : ''}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate TOTP secret')
      }

      const data = await response.json()
      setQrCodeUrl(data.qrCodeUrl)
      setSecretKey(data.secretKey)
      setActiveStep(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate TOTP secret')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTOTPCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/verify-totp-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')!).accessToken : ''}`
        },
        body: JSON.stringify({ code: verificationCode })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Invalid verification code')
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setActiveStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
    if (error) setError(null)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SetupContainer>
            <CustomTypography variant="sectionHeader" sx={{ textAlign: 'center' }}>
              Setting up Two-Factor Authentication
            </CustomTypography>
            
            <CustomTypography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              We'll generate a secret key and QR code for your authenticator app.
            </CustomTypography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: '1rem' }}>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Typography>Generating secret...</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={generateTOTPSecret}
                startIcon={<Security />}
                sx={{ borderRadius: '2rem' }}
              >
                Generate Secret
              </Button>
            )}
          </SetupContainer>
        )

      case 1:
        return (
          <SetupContainer>
            <CustomTypography variant="sectionHeader" sx={{ textAlign: 'center' }}>
              Scan QR Code
            </CustomTypography>
            
            <CustomTypography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </CustomTypography>

            <QRCodeContainer>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
              ) : (
                <Box sx={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                  <QrCode sx={{ fontSize: 60, color: '#ccc' }} />
                </Box>
              )}
              
              {secretKey && (
                <Box sx={{ width: '100%' }}>
                  <CustomTypography variant="bodyText" sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Or enter this secret key manually:
                  </CustomTypography>
                  <SecretKeyContainer>
                    {secretKey}
                    <CopyButton
                      size="small"
                      onClick={() => copyToClipboard(secretKey)}
                      startIcon={<ContentCopy />}
                    >
                      Copy
                    </CopyButton>
                  </SecretKeyContainer>
                </Box>
              )}
            </QRCodeContainer>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveStep(2)}
              startIcon={<Smartphone />}
              sx={{ borderRadius: '2rem' }}
            >
              I've Added the Account
            </Button>
          </SetupContainer>
        )

      case 2:
        return (
          <SetupContainer>
            <CustomTypography variant="sectionHeader" sx={{ textAlign: 'center' }}>
              Verify Setup
            </CustomTypography>
            
            <CustomTypography variant="bodyText" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Enter the 6-digit code from your authenticator app to verify the setup.
            </CustomTypography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: '1rem' }}>
                {error}
              </Alert>
            )}

            <TextField
              label="6-Digit Code"
              value={verificationCode}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="000000"
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: '300px' }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={verifyTOTPCode}
              disabled={verificationCode.length !== 6 || isLoading}
              startIcon={<CheckCircle />}
              sx={{ borderRadius: '2rem' }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </SetupContainer>
        )

      case 3:
        return (
          <SetupContainer>
            <Box sx={{ textAlign: 'center', marginBottom: '1rem' }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', marginBottom: '1rem' }} />
              <CustomTypography variant="sectionHeader" sx={{ marginBottom: '1rem' }}>
                Setup Complete!
              </CustomTypography>
              
              <CustomTypography variant="bodyText" sx={{ color: 'text.secondary', marginBottom: '1.5rem' }}>
                Two-factor authentication has been enabled for your account.
              </CustomTypography>
            </Box>

            <Paper sx={{ padding: '1.5rem', width: '100%', backgroundColor: '#f5f5f5' }}>
              <CustomTypography 
                className="backup-codes-title"
                variant="subsectionHeader" 
                sx={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: '#000', fontWeight: 'bold' }}
              >
                Backup Codes
              </CustomTypography>
              <CustomTypography 
                className="backup-codes-instructions"
                variant="bodyText" 
                sx={{ color: '#333', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '500' }}
              >
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </CustomTypography>
              
              <Box 
                className="backup-codes-container"
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1rem', 
                  marginBottom: '1.5rem',
                  maxWidth: '600px',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                {backupCodes.map((code, index) => (
                  <Box
                    key={index}
                    className="backup-codes-print"
                    sx={{
                      padding: '1rem',
                      backgroundColor: '#fff',
                      color: '#000',
                      borderRadius: '0.75rem',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      border: '2px solid #333',
                      fontSize: '1.4rem',
                      fontWeight: '900',
                      letterSpacing: '0.15em',
                      minHeight: '3.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    {code}
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  startIcon={<ContentCopy />}
                  sx={{ borderRadius: '1rem', padding: '0.5rem 1rem' }}
                >
                  Copy All Codes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.print()}
                  sx={{ borderRadius: '1rem', padding: '0.5rem 1rem' }}
                >
                  Print Codes
                </Button>
              </Box>
            </Paper>
          </SetupContainer>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style>
        {`
          @media print {
            .backup-codes-print {
              font-size: 20px !important;
              font-weight: 900 !important;
              letter-spacing: 0.3em !important;
              padding: 1.5rem !important;
              margin: 0.75rem !important;
              border: 4px solid #000 !important;
              background: #fff !important;
              color: #000 !important;
              min-height: 4rem !important;
            }
            .backup-codes-container {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 1.5rem !important;
              max-width: none !important;
              margin: 2rem 0 !important;
            }
            .backup-codes-title {
              font-size: 24px !important;
              font-weight: bold !important;
              color: #000 !important;
              margin-bottom: 1rem !important;
            }
            .backup-codes-instructions {
              font-size: 16px !important;
              color: #333 !important;
              margin-bottom: 2rem !important;
            }
          }
        `}
      </style>
      <Dialog
        open={open}
        onClose={onClose}
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
        <CustomTypography variant="sectionHeader">
          Two-Factor Authentication Setup
        </CustomTypography>
      </DialogTitle>
      
      <DialogContent sx={{ paddingTop: '0.5rem' }}>
        <Box sx={{ width: '100%', marginBottom: '2rem' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStepContent()}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
        {activeStep < 3 ? (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ marginRight: '1rem', borderRadius: '2rem' }}
            >
              Cancel
            </Button>
            {activeStep === 0 && !isLoading && (
              <Button
                variant="contained"
                color="primary"
                onClick={generateTOTPSecret}
                startIcon={<Security />}
                sx={{ borderRadius: '2rem' }}
              >
                Generate Secret
              </Button>
            )}
            {activeStep === 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={verifyTOTPCode}
                disabled={verificationCode.length !== 6 || isLoading}
                sx={{ borderRadius: '2rem' }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Complete'}
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onSuccess}
            sx={{ borderRadius: '2rem' }}
          >
            Complete Setup
          </Button>
        )}
      </DialogActions>
      </Dialog>
    </>
  )
}

export default TOTPSetupModal
