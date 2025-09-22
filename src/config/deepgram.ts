const apiKey = (import.meta as any).env?.VITE_DEEPGRAM_API_KEY || ''

export const DEEPGRAM_CONFIG = {
  // You'll need to set this in your environment variables
  API_KEY: apiKey,
  
  // Model configuration
  MODEL: 'nova-2', // Deepgram's best model
  LANGUAGE: 'en-US',
  
  // Features
  SMART_FORMAT: true,
  INTERIM_RESULTS: true,
  PUNCTUATE: true,
  DIARIZE: false,
  
  // Context settings
  MAX_CONTEXT_HISTORY: 10,
  CONTEXT_BOOST: 0.1,
  
  // Keywords to boost for translation context
  KEYWORDS: [
    'translate', 'translation', 'language', 'speak', 'listen',
    'microphone', 'audio', 'voice', 'speech', 'text',
    'english', 'spanish', 'french', 'german', 'italian',
    'portuguese', 'chinese', 'japanese', 'korean', 'arabic'
  ]
}

export const SUPPORTED_LANGUAGES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'en-AU': 'English (Australia)',
  'en-CA': 'English (Canada)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Mexico)',
  'fr-FR': 'French (France)',
  'fr-CA': 'French (Canada)',
  'de-DE': 'German (Germany)',
  'it-IT': 'Italian (Italy)',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  'zh-CN': 'Chinese (Mandarin)',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'ar-SA': 'Arabic (Saudi Arabia)',
  'hi-IN': 'Hindi (India)',
  'ru-RU': 'Russian',
  'nl-NL': 'Dutch',
  'sv-SE': 'Swedish',
  'no-NO': 'Norwegian',
  'da-DK': 'Danish',
  'fi-FI': 'Finnish',
  'pl-PL': 'Polish',
  'tr-TR': 'Turkish',
  'th-TH': 'Thai',
  'vi-VN': 'Vietnamese',
  'id-ID': 'Indonesian',
  'ms-MY': 'Malay',
  'tl-PH': 'Filipino'
}

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES
