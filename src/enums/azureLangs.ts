export enum LanguageCode {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  RU = 'ru',
  JA = 'ja',
  KO = 'ko',
  ZH = 'zh',
  AR = 'ar',
  HI = 'hi'
}

export const LANGUAGE_METADATA = {
  [LanguageCode.EN]: { name: 'English', flag: '🇺🇸' },
  [LanguageCode.ES]: { name: 'Spanish', flag: '🇪🇸' },
  [LanguageCode.FR]: { name: 'French', flag: '🇫🇷' },
  [LanguageCode.DE]: { name: 'German', flag: '🇩🇪' },
  [LanguageCode.IT]: { name: 'Italian', flag: '🇮🇹' },
  [LanguageCode.PT]: { name: 'Portuguese', flag: '🇵🇹' },
  [LanguageCode.RU]: { name: 'Russian', flag: '🇷🇺' },
  [LanguageCode.JA]: { name: 'Japanese', flag: '🇯🇵' },
  [LanguageCode.KO]: { name: 'Korean', flag: '🇰🇷' },
  [LanguageCode.ZH]: { name: 'Chinese', flag: '🇨🇳' },
  [LanguageCode.AR]: { name: 'Arabic', flag: '🇸🇦' },
  [LanguageCode.HI]: { name: 'Hindi', flag: '🇮🇳' }
} as const

// Helper functions to get language information
export const getLanguageName = (code: LanguageCode): string => {
  return LANGUAGE_METADATA[code]?.name || 'Unknown'
}

export const getLanguageFlag = (code: LanguageCode): string => {
  return LANGUAGE_METADATA[code]?.flag || '🏳️'
}

export const getLanguageInfo = (code: LanguageCode) => {
  return {
    code,
    name: getLanguageName(code),
    flag: getLanguageFlag(code)
  }
}

// Get all supported languages as an array
export const getSupportedLanguages = () => {
  return Object.values(LanguageCode).map(code => getLanguageInfo(code));
}