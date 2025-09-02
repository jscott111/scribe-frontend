import React from 'react'
import { Box, Paper, Divider } from '@mui/material'
import CustomTypography from '../components/UI/Typography'
import { TYPOGRAPHY_VARIANTS } from '../theme/typography'

/**
 * Example component showing how to use the CustomTypography system
 * This demonstrates all available typography variants
 */
const TypographyExamples: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <CustomTypography variant="appTitle">
          Typography System Examples
        </CustomTypography>
        
        <Divider sx={{ my: 2 }} />
        
        <CustomTypography variant="sectionHeader">
          Section Headers
        </CustomTypography>
        <CustomTypography variant="bodyText">
          This is how section headers look with consistent styling.
        </CustomTypography>
        
        <CustomTypography variant="subsectionHeader">
          Subsection Headers
        </CustomTypography>
        <CustomTypography variant="bodyText">
          Subsection headers are smaller and use secondary text color.
        </CustomTypography>
        
        <Divider sx={{ my: 2 }} />
        
        <CustomTypography variant="sectionHeader">
          Text Variants
        </CustomTypography>
        
        <CustomTypography variant="bodyText">
          This is regular body text with consistent line height and spacing.
        </CustomTypography>
        
        <CustomTypography variant="captionText">
          This is caption text - smaller, italic, and secondary color.
        </CustomTypography>
        
        <CustomTypography variant="statusText">
          This is status text - typically used for success messages.
        </CustomTypography>
        
        <CustomTypography variant="errorText">
          This is error text - typically used for error messages.
        </CustomTypography>
        
        <Divider sx={{ my: 2 }} />
        
        <CustomTypography variant="sectionHeader">
          Usage Examples
        </CustomTypography>
        
        <CustomTypography variant="bodyText">
          Instead of writing:
        </CustomTypography>
        <Box component="pre" sx={{ 
          backgroundColor: 'grey.100', 
          p: 2, 
          borderRadius: 1, 
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
{`<Typography sx={{ 
  textAlign: 'center', 
  fontSize: '2rem', 
  fontWeight: 'bold' 
}}>
  Scribe
</Typography>`}
        </Box>
        
        <CustomTypography variant="bodyText">
          You can now simply write:
        </CustomTypography>
        <Box component="pre" sx={{ 
          backgroundColor: 'grey.100', 
          p: 2, 
          borderRadius: 1, 
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
{`<CustomTypography variant="appTitle">
  Scribe
</CustomTypography>`}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <CustomTypography variant="sectionHeader">
          Available Variants
        </CustomTypography>
        
        <Box sx={{ display: 'grid', gap: 1, mt: 2 }}>
          {Object.entries(TYPOGRAPHY_VARIANTS).map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CustomTypography variant="captionText" sx={{ minWidth: 120 }}>
                {key}:
              </CustomTypography>
              <CustomTypography variant={value as any}>
                Example text using {value} variant
              </CustomTypography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}

export default TypographyExamples
