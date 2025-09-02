import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Box, CircularProgress, Typography } from '@mui/material'
import styled from 'styled-components'

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  gap: 2rem;
`

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </LoadingContainer>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

export default ProtectedRoute
