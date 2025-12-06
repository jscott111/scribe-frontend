import React, { useState } from 'react'
import { GoogleSTTLanguageCode, getAllSTTLanguages } from '../enums/googleSTTLangs'
import { MenuItem, Select } from '@mui/material'
import { createHybridFlagElement } from '../utils/flagEmojiUtils.tsx'

interface InputLanguageSelectorProps {
  label: string
  selectedLanguage: GoogleSTTLanguageCode
  onLanguageChange: (language: GoogleSTTLanguageCode) => void
}

const InputLanguageSelector: React.FC<InputLanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (language: GoogleSTTLanguageCode) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  return (
    <Select
      value={selectedLanguage}
      onChange={(e) => handleLanguageSelect(e.target.value as GoogleSTTLanguageCode)}
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
      {getAllSTTLanguages().map((language) => (
        <MenuItem key={language.code} value={language.code} sx={{ fontSize: '1rem' }}>
          <span style={{ marginRight: '0.5rem' }}>{createHybridFlagElement(language.code, 18)}</span>
          {language.name}
        </MenuItem>
      ))}
    </Select>
  )
}

export default InputLanguageSelector
