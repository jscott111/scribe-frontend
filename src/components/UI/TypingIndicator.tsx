import React from 'react'
import { Box, useTheme } from '@mui/material'
import { keyframes } from '@emotion/react'

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`

interface TypingIndicatorProps {
  visible?: boolean
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible = true }) => {
  const theme = useTheme()
  
  if (!visible) return null

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem 1rem'
      }}
    >
      <Box
        sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          animation: `${bounce} 1.4s infinite ease-in-out`,
          animationDelay: '0s'
        }}
      />
      <Box
        sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          animation: `${bounce} 1.4s infinite ease-in-out`,
          animationDelay: '0.2s'
        }}
      />
      <Box
        sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          animation: `${bounce} 1.4s infinite ease-in-out`,
          animationDelay: '0.4s'
        }}
      />
    </Box>
  )
}

export default TypingIndicator

