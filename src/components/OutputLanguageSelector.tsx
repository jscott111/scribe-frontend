import React, { useState } from 'react'
import { GoogleCTLanguageCode, getAvailableTargetLanguages, getCTLanguageInfo } from '../enums/googleCTLangs'
import { MenuItem, Select } from '@mui/material'
import { createHybridFlagElement } from '../utils/flagEmojiUtils.tsx'

interface OutputLanguageSelectorProps {
  label: string
  selectedLanguage: GoogleCTLanguageCode
  onLanguageChange: (language: GoogleCTLanguageCode) => void
  sourceLanguage?: string // Optional source language to filter available targets
}

const OutputLanguageSelector: React.FC<OutputLanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onLanguageChange,
  sourceLanguage
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (language: GoogleCTLanguageCode) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  // Get available target languages, filtering out the source language if provided
  const availableLanguages = sourceLanguage 
    ? getAvailableTargetLanguages(sourceLanguage)
    : getAvailableTargetLanguages()

  return (
    <Select
      value={selectedLanguage}
      onChange={(e) => handleLanguageSelect(e.target.value as GoogleCTLanguageCode)}
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      label={label}
      sx={{ 
        width: '100%',
        maxWidth: '300px',
        minWidth: '200px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '1rem',
          fontSize: '1.1rem',
        },
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }
      }}
    >
      {availableLanguages.map((code) => {
        const language = getCTLanguageInfo(code)
        return (
          <MenuItem key={code} value={code} sx={{ fontSize: '1rem' }}>
            <span style={{ marginRight: '0.5rem' }}>{createHybridFlagElement(code, 18)}</span>
            {language.name}
            {language.isExperimental && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>(Experimental)</span>}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default OutputLanguageSelector
