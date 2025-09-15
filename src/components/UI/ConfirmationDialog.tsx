import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import Typography from './Typography'

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <WarningIcon color="warning" sx={{ fontSize: 28 }} />
          <Typography variant="sectionHeader">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <Typography variant="bodyText" sx={{ color: 'text.secondary' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ marginRight: '1rem', borderRadius: '2rem' }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={handleConfirm}
          sx={{ borderRadius: '2rem' }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
