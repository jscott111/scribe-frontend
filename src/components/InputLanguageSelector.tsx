import React, { useState } from 'react'
import { LanguageCode, getSupportedLanguages } from '../enums/googleLangs'
import { MenuItem, Select } from '@mui/material'

interface InputLanguageSelectorProps {
  label: string
  selectedLanguage: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
}

const InputLanguageSelector: React.FC<InputLanguageSelectorProps> = ({
  label,
  selectedLanguage,
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (language: LanguageCode) => {
    onLanguageChange(language)
    setIsOpen(false)
  }

  return (
    <Select
      value={selectedLanguage}
      onChange={(e) => handleLanguageSelect(e.target.value as LanguageCode)}
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
      {getSupportedLanguages().map((language) => (
        <MenuItem key={language.code} value={language.code} sx={{ fontSize: '1rem' }}>
          <span style={{ marginRight: '0.5rem' }}>{language.flag}</span>
          {language.name}
        </MenuItem>
      ))}
    </Select>
  )
}

export default InputLanguageSelector
