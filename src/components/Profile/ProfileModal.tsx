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
  Alert
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import SecurityIcon from '@mui/icons-material/Security'
import Typography from '../UI/Typography'
import TOTPSetupModal from './TOTPSetupModal'

interface User {
  id: number
  email: string
  name: string
  createdAt: string
  updatedAt?: string
  totpEnabled?: boolean
}

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  user: User | null
  sessionId: string | null
  isSocketConnected: boolean
  onLogout: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  user,
  sessionId,
  isSocketConnected,
  onLogout
}) => {
  const [totpSetupOpen, setTotpSetupOpen] = useState(false)
  const [totpEnabled, setTotpEnabled] = useState(user?.totpEnabled || false)
  const [error, setError] = useState<string | null>(null)

  // Update TOTP status when user data changes
  useEffect(() => {
    setTotpEnabled(user?.totpEnabled || false)
  }, [user?.totpEnabled])
  const handleLogout = () => {
    onClose()
    onLogout()
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
                     Session Information
                   </Typography>
                   <Typography variant="bodyText" sx={{ color: 'text.secondary', marginBottom: '0.25rem' }}>
                     <strong>Current Session:</strong> {sessionId}
                   </Typography>
                   <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
                     <strong>Status:</strong> {isSocketConnected ? 'Connected' : 'Disconnected'}
                   </Typography>
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
                             setError('TOTP disable functionality not implemented yet')
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
                   {error && (
                     <Alert severity="error" sx={{ marginTop: '0.5rem' }}>
                       {error}
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
          setError(null)
        }}
        user={user}
      />
    </Dialog>
  )
}

export default ProfileModal
