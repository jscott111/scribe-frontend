// Typography variant constants for easy access
export const TYPOGRAPHY_VARIANTS = {
  APP_TITLE: 'appTitle',
  SECTION_HEADER: 'sectionHeader',
  SUBSECTION_HEADER: 'subsectionHeader',
  BODY_TEXT: 'bodyText',
  CAPTION_TEXT: 'captionText',
  BUTTON_TEXT: 'buttonText',
  STATUS_TEXT: 'statusText',
  ERROR_TEXT: 'errorText',
} as const

// Type for the variants
export type TypographyVariant = typeof TYPOGRAPHY_VARIANTS[keyof typeof TYPOGRAPHY_VARIANTS]

// Helper function to get typography styles
export const getTypographyStyles = (variant: TypographyVariant) => {
  const styles = {
    [TYPOGRAPHY_VARIANTS.APP_TITLE]: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      color: 'primary.main',
      marginBottom: 2,
    },
    [TYPOGRAPHY_VARIANTS.SECTION_HEADER]: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'text.primary',
      marginBottom: 1.5,
    },
    [TYPOGRAPHY_VARIANTS.SUBSECTION_HEADER]: {
      fontSize: '1.25rem',
      fontWeight: '500',
      color: 'text.secondary',
      marginBottom: 1,
    },
    [TYPOGRAPHY_VARIANTS.BODY_TEXT]: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: 'text.primary',
    },
    [TYPOGRAPHY_VARIANTS.CAPTION_TEXT]: {
      fontSize: '0.875rem',
      color: 'text.secondary',
      fontStyle: 'italic',
    },
    [TYPOGRAPHY_VARIANTS.BUTTON_TEXT]: {
      fontSize: '1rem',
      fontWeight: '500',
      textTransform: 'none' as const,
    },
    [TYPOGRAPHY_VARIANTS.STATUS_TEXT]: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'success.main',
    },
    [TYPOGRAPHY_VARIANTS.ERROR_TEXT]: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'error.main',
    },
  }
  
  return styles[variant]
}
