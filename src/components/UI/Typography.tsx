import React from 'react'
import { Typography, TypographyProps } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Define the available typography variants
type CustomTypographyVariant = 
  | 'appTitle'
  | 'sectionHeader'
  | 'subsectionHeader'
  | 'bodyText'
  | 'captionText'
  | 'buttonText'
  | 'statusText'
  | 'errorText'

interface CustomTypographyProps extends Omit<TypographyProps, 'variant'> {
  variant?: CustomTypographyVariant
  children: React.ReactNode
}

const CustomTypography: React.FC<CustomTypographyProps> = ({ 
  variant = 'bodyText', 
  children, 
  sx, 
  ...props 
}) => {
  const theme = useTheme()
  
  // Define the style mappings
  const getVariantStyles = (variant: CustomTypographyVariant) => {
    switch (variant) {
      case 'appTitle':
        return {
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center' as const,
          color: theme.palette.primary.main,
          marginBottom: 2,
        }
      case 'sectionHeader':
        return {
          fontSize: '1.5rem',
          fontWeight: '600',
          color: theme.palette.text.primary,
          marginBottom: 1.5,
        }
      case 'subsectionHeader':
        return {
          fontSize: '1.25rem',
          fontWeight: '500',
          color: theme.palette.text.secondary,
          marginBottom: 1,
        }
      case 'bodyText':
        return {
          fontSize: '1rem',
          lineHeight: 1.6,
          color: theme.palette.text.primary,
        }
      case 'captionText':
        return {
          fontSize: '0.875rem',
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
        }
      case 'buttonText':
        return {
          fontSize: '1rem',
          fontWeight: '500',
          textTransform: 'none' as const,
        }
      case 'statusText':
        return {
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme.palette.success.main,
        }
      case 'errorText':
        return {
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme.palette.error.main,
        }
      default:
        return {}
    }
  }
  
  const variantStyles = getVariantStyles(variant)
  
  return (
    <Typography
      {...props}
      sx={{
        ...variantStyles,
        ...sx,
      }}
    >
      {children}
    </Typography>
  )
}

export default CustomTypography
