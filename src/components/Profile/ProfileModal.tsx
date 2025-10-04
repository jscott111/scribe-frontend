import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SecurityIcon from '@mui/icons-material/Security'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import Typography from '../UI/Typography'
import TOTPSetupModal from './TOTPSetupModal'
import ConfirmationDialog from '../UI/ConfirmationDialog'
import { useAuth } from '../../contexts/AuthContext'

interface User {
  id: number
  email: string
  name: string
  userCode?: string
  createdAt: string
  updatedAt?: string
  totpEnabled?: boolean
}

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  user: User | null
  isSocketConnected: boolean
  onLogout: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  user,
  isSocketConnected,
  onLogout
}) => {
  const { generateUserCode, setUserCode, clearUserCode } = useAuth()
  const [totpSetupOpen, setTotpSetupOpen] = useState(false)
  const [totpEnabled, setTotpEnabled] = useState(user?.totpEnabled || false)
  const [userCodeError, setUserCodeError] = useState<string | null>(null)
  const [totpError, setTotpError] = useState<string | null>(null)
  const [isEditingUserCode, setIsEditingUserCode] = useState(false)
  const [customUserCode, setCustomUserCode] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isSettingCode, setIsSettingCode] = useState(false)
  const [isClearingCode, setIsClearingCode] = useState(false)

  // Update TOTP status when user data changes
  useEffect(() => {
    setTotpEnabled(user?.totpEnabled || false)
  }, [user?.totpEnabled])
  
  const handleLogout = () => {
    onClose()
    onLogout()
  }

  const handleGenerateUserCode = async () => {
    setIsGeneratingCode(true)
    setUserCodeError(null)
    
    try {
      await generateUserCode()
      setIsEditingUserCode(false)
    } catch (error) {
      setUserCodeError(error instanceof Error ? error.message : 'Failed to generate user code')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleSetCustomUserCode = async () => {
    if (!customUserCode.trim()) return
    
    // Validate user code format
    if (!/^[A-Z0-9]{3,8}$/.test(customUserCode.trim().toUpperCase())) {
      setUserCodeError('User code must be 3-8 alphanumeric characters')
      return
    }
    
    setIsSettingCode(true)
    setUserCodeError(null)
    
    try {
      await setUserCode(customUserCode.trim().toUpperCase())
      setCustomUserCode('')
      setIsEditingUserCode(false)
    } catch (error) {
      setUserCodeError(error instanceof Error ? error.message : 'Failed to set user code')
    } finally {
      setIsSettingCode(false)
    }
  }

  const handleClearUserCode = async () => {
    setIsClearingCode(true)
    setUserCodeError(null)
    
    try {
      await clearUserCode()
      setIsEditingUserCode(false)
    } catch (error) {
      setUserCodeError(error instanceof Error ? error.message : 'Failed to clear user code')
    } finally {
      setIsClearingCode(false)
    }
  }

  const handleCopyUserCode = () => {
    if (user?.userCode) {
      navigator.clipboard.writeText(user.userCode)
    }
  }

  const handleStartEditing = () => {
    setCustomUserCode('')
    setIsEditingUserCode(true)
    setUserCodeError(null)
  }

  const handleCancelEditing = () => {
    setIsEditingUserCode(false)
    setCustomUserCode('')
    setUserCodeError(null)
  }

  return (
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
        <Typography variant="sectionHeader">
          Profile
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Typography variant="sectionHeader" sx={{ fontSize: '1.5rem' }}>
              {user?.name}
            </Typography>
            <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ margin: '1rem 0' }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <Box>
            <Typography variant="subsectionHeader" sx={{ marginBottom: '0.5rem' }}>
              Account Information
            </Typography>
            <Typography variant="bodyText" sx={{ color: 'text.secondary', marginBottom: '0.25rem' }}>
              <strong>Name:</strong> {user?.name}
            </Typography>
            <Typography variant="bodyText" sx={{ color: 'text.secondary', marginBottom: '0.25rem' }}>
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
              <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </Typography>
          </Box>
          
                 <Box>
                   <Typography variant="subsectionHeader" sx={{ marginBottom: '0.5rem' }}>
                     User Code Management
                   </Typography>
                   
                   {!isEditingUserCode ? (
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
                           <strong>Current Code:</strong> {user?.userCode || 'Not set'}
                         </Typography>
                         {user?.userCode && (
                           <Tooltip title="Copy to clipboard">
                             <IconButton size="small" onClick={handleCopyUserCode}>
                               <ContentCopyIcon fontSize="small" />
                             </IconButton>
                           </Tooltip>
                         )}
                       </Box>
                       
                       <Typography variant="bodyText" sx={{ color: 'text.secondary', marginBottom: '0.5rem' }}>
                         <strong>Status:</strong> {isSocketConnected ? 'Connected' : 'Disconnected'}
                       </Typography>
                       
                       <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                         <Button
                           variant="outlined"
                           size="small"
                           startIcon={<RefreshIcon />}
                           onClick={handleGenerateUserCode}
                           disabled={isGeneratingCode}
                           sx={{ borderRadius: '1rem' }}
                         >
                           {isGeneratingCode ? 'Generating...' : 'Generate New'}
                         </Button>
                         
                         <Button
                           variant="outlined"
                           size="small"
                           startIcon={<EditIcon />}
                           onClick={handleStartEditing}
                           sx={{ borderRadius: '1rem' }}
                         >
                           Set Custom
                         </Button>
                         
                         {user?.userCode && (
                           <Button
                             variant="outlined"
                             color="error"
                             size="small"
                             startIcon={<ClearIcon />}
                             onClick={handleClearUserCode}
                             disabled={isClearingCode}
                             sx={{ borderRadius: '1rem' }}
                           >
                             {isClearingCode ? 'Clearing...' : 'Clear'}
                           </Button>
                         )}
                       </Box>
                     </Box>
                   ) : (
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <TextField
                         label="Custom User Code"
                         value={customUserCode}
                         onChange={(e) => setCustomUserCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                         placeholder="ABC123"
                         variant="outlined"
                         size="small"
                         helperText="3-8 alphanumeric characters"
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             borderRadius: '1rem',
                             fontFamily: 'monospace',
                             textAlign: 'center'
                           }
                         }}
                       />
                       
                       <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                         <Button
                           variant="contained"
                           size="small"
                           onClick={handleSetCustomUserCode}
                           disabled={!customUserCode.trim() || isSettingCode}
                           sx={{ borderRadius: '1rem' }}
                         >
                           {isSettingCode ? 'Setting...' : 'Set Code'}
                         </Button>
                         
                         <Button
                           variant="outlined"
                           size="small"
                           onClick={handleCancelEditing}
                           disabled={isSettingCode}
                           sx={{ borderRadius: '1rem' }}
                         >
                           Cancel
                         </Button>
                       </Box>
                     </Box>
                   )}
                   
                   {userCodeError && (
                     <Alert severity="error" sx={{ marginTop: '0.5rem' }}>
                       {userCodeError}
                     </Alert>
                   )}
                 </Box>
                 
                 <Box>
                   <Typography variant="subsectionHeader" sx={{ marginBottom: '0.5rem' }}>
                     Security Settings
                   </Typography>
                   <FormControlLabel
                     control={
                       <Switch
                         checked={totpEnabled}
                         onChange={(e) => {
                           if (e.target.checked) {
                             setTotpSetupOpen(true)
                           } else {
                             // TODO: Add disable TOTP functionality
                             setTotpError('TOTP disable functionality not implemented yet')
                           }
                         }}
                         color="primary"
                       />
                     }
                     label={
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <SecurityIcon sx={{ fontSize: 20 }} />
                         <Typography variant="bodyText">
                           Two-Factor Authentication (TOTP)
                         </Typography>
                       </Box>
                     }
                   />
                   {totpError && (
                     <Alert severity="error" sx={{ marginTop: '0.5rem' }}>
                       {totpError}
                     </Alert>
                   )}
                 </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{ marginRight: '1rem', borderRadius: '2rem' }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: '2rem' }}
        >
          Logout
        </Button>
      </DialogActions>
      
      <TOTPSetupModal
        open={totpSetupOpen}
        onClose={() => setTotpSetupOpen(false)}
        onSuccess={() => {
          setTotpEnabled(true)
          setTotpSetupOpen(false)
          setTotpError(null)
        }}
        user={user}
      />
      
    </Dialog>
  )
}

export default ProfileModal
