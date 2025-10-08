// Utility functions for handling flag emoji display across different browsers and platforms
import { getCountryCode, createFlagImageElement } from './flagImages.tsx'

// Country code to flag emoji mapping for fallback
const COUNTRY_CODE_TO_FLAG: Record<string, string> = {
  'en': '🇺🇸',
  'es': '🇪🇸', 
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ru': '🇷🇺',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'zh-Hans': '🇨🇳',
  'zh-Hant': '🇹🇼',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
  'nl': '🇳🇱',
  'sv': '🇸🇪',
  'da': '🇩🇰',
  'nb': '🇳🇴',
  'fi': '🇫🇮',
  'pl': '🇵🇱',
  'cs': '🇨🇿',
  'sk': '🇸🇰',
  'hu': '🇭🇺',
  'ro': '🇷🇴',
  'bg': '🇧🇬',
  'hr': '🇭🇷',
  'sr': '🇷🇸',
  'sr-Cyrl': '🇷🇸',
  'sl': '🇸🇮',
  'et': '🇪🇪',
  'lv': '🇱🇻',
  'lt': '🇱🇹',
  'el': '🇬🇷',
  'tr': '🇹🇷',
  'uk': '🇺🇦',
  'be': '🇧🇾',
  'mk': '🇲🇰',
  'sq': '🇦🇱',
  'ca': '🏴󠁥󠁳󠁣󠁴󠁿',
  'eu': '🏴󠁥󠁳󠁰󠁶󠁿',
  'gl': '🏴󠁥󠁳󠁧󠁡󠁿',
  'is': '🇮🇸',
  'fo': '🇫🇴',
  'ga': '🇮🇪',
  'mt': '🇲🇹',
  'cy': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'th': '🇹🇭',
  'vi': '🇻🇳',
  'id': '🇮🇩',
  'ms': '🇲🇾',
  'ta': '🇮🇳',
  'te': '🇮🇳',
  'kn': '🇮🇳',
  'ml': '🇮🇳',
  'bn': '🇧🇩',
  'pa': '🇮🇳',
  'gu': '🇮🇳',
  'mr': '🇮🇳',
  'or': '🇮🇳',
  'as': '🇮🇳',
  'ne': '🇳🇵',
  'si': '🇱🇰',
  'my': '🇲🇲',
  'km': '🇰🇭',
  'lo': '🇱🇦',
  'mn-Cyrl': '🇲🇳',
  'kk': '🇰🇿',
  'ky': '🇰🇬',
  'uz': '🇺🇿',
  'tk': '🇹🇲',
  'tg': '🇹🇯',
  'ps': '🇦🇫',
  'fa': '🇮🇷',
  'ur': '🇵🇰',
  'sd': '🇵🇰',
  'yue': '🇭🇰',
  'lzh': '🇨🇳',
  'af': '🇿🇦',
  'sw': '🇹🇿',
  'so': '🇸🇴',
  'am': '🇪🇹',
  'ha': '🇳🇬',
  'ig': '🇳🇬',
  'yo': '🇳🇬',
  'zu': '🇿🇦',
  'xh': '🇿🇦',
  'st': '🇱🇸',
  'tn': '🇧🇼',
  've': '🇿🇦',
  'ts': '🇿🇦',
  'ss': '🇸🇿',
  'nr': '🇿🇦',
  'nd': '🇿🇼',
  'he': '🇮🇱',
  'ku': '🇮🇶',
  'dv': '🇲🇻',
  'mi': '🇳🇿',
  'sm': '🇼🇸',
  'to': '🇹🇴',
  'fj': '🇫🇯',
  'ty': '🇵🇫',
  'iu': '🇨🇦',
  'ikt': '🇨🇦',
  'iu-Latn': '🇨🇦'
}

// Language code to country code mapping for fallback
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  'en': 'US',
  'es': 'ES',
  'fr': 'FR', 
  'de': 'DE',
  'it': 'IT',
  'pt': 'PT',
  'ru': 'RU',
  'ja': 'JP',
  'ko': 'KR',
  'zh-Hans': 'CN',
  'zh-Hant': 'TW',
  'ar': 'SA',
  'hi': 'IN',
  'nl': 'NL',
  'sv': 'SE',
  'da': 'DK',
  'nb': 'NO',
  'fi': 'FI',
  'pl': 'PL',
  'cs': 'CZ',
  'sk': 'SK',
  'hu': 'HU',
  'ro': 'RO',
  'bg': 'BG',
  'hr': 'HR',
  'sr': 'RS',
  'sr-Cyrl': 'RS',
  'sl': 'SI',
  'et': 'EE',
  'lv': 'LV',
  'lt': 'LT',
  'el': 'GR',
  'tr': 'TR',
  'uk': 'UA',
  'be': 'BY',
  'mk': 'MK',
  'sq': 'AL',
  'ca': 'ES',
  'eu': 'ES',
  'gl': 'ES',
  'is': 'IS',
  'fo': 'FO',
  'ga': 'IE',
  'mt': 'MT',
  'cy': 'GB',
  'th': 'TH',
  'vi': 'VN',
  'id': 'ID',
  'ms': 'MY',
  'ta': 'IN',
  'te': 'IN',
  'kn': 'IN',
  'ml': 'IN',
  'bn': 'BD',
  'pa': 'IN',
  'gu': 'IN',
  'mr': 'IN',
  'or': 'IN',
  'as': 'IN',
  'ne': 'NP',
  'si': 'LK',
  'my': 'MM',
  'km': 'KH',
  'lo': 'LA',
  'mn-Cyrl': 'MN',
  'kk': 'KZ',
  'ky': 'KG',
  'uz': 'UZ',
  'tk': 'TM',
  'tg': 'TJ',
  'ps': 'AF',
  'fa': 'IR',
  'ur': 'PK',
  'sd': 'PK',
  'yue': 'HK',
  'lzh': 'CN',
  'af': 'ZA',
  'sw': 'TZ',
  'so': 'SO',
  'am': 'ET',
  'ha': 'NG',
  'ig': 'NG',
  'yo': 'NG',
  'zu': 'ZA',
  'xh': 'ZA',
  'st': 'LS',
  'tn': 'BW',
  've': 'ZA',
  'ts': 'ZA',
  'ss': 'SZ',
  'nr': 'ZA',
  'nd': 'ZW',
  'he': 'IL',
  'ku': 'IQ',
  'dv': 'MV',
  'mi': 'NZ',
  'sm': 'WS',
  'to': 'TO',
  'fj': 'FJ',
  'ty': 'PF',
  'iu': 'CA',
  'ikt': 'CA',
  'iu-Latn': 'CA'
}

// Cache for flag emoji support detection
let flagEmojiSupported: boolean | null = null

/**
 * Detects if flag emojis are supported by the current browser/platform
 */
export function detectFlagEmojiSupport(): boolean {
  if (flagEmojiSupported !== null) {
    return flagEmojiSupported
  }

  // Create a test element with a flag emoji
  const testElement = document.createElement('div')
  testElement.style.fontFamily = 'Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji'
  testElement.style.position = 'absolute'
  testElement.style.visibility = 'hidden'
  testElement.style.fontSize = '16px'
  testElement.textContent = '🇺🇸' // US flag emoji
  
  document.body.appendChild(testElement)
  
  // Check if the flag emoji rendered as a single character (supported) or multiple characters (not supported)
  const width = testElement.offsetWidth
  document.body.removeChild(testElement)
  
  // If width is very small, it likely means the flag didn't render properly
  flagEmojiSupported = width > 20 // Approximate width for a properly rendered flag emoji
  
  return flagEmojiSupported
}

/**
 * Gets a fallback representation for a language code when flag emojis aren't supported
 */
export function getLanguageFallback(languageCode: string): string {
  const countryCode = LANGUAGE_TO_COUNTRY[languageCode]
  if (countryCode && countryCode !== 'WHITE') {
    return countryCode
  }
  
  // If no country mapping or white flag, return the first two characters of the language code in uppercase
  return languageCode.substring(0, 2).toUpperCase()
}

/**
 * Gets the appropriate flag emoji or fallback for a language code
 */
export function getFlagEmojiOrFallback(languageCode: string): { emoji: string; fallback: string; useFallback: boolean } {
  // First try to get the country code for this language
  const countryCode = getCountryCode(languageCode)
  
  // If we got a white flag, use white flag emoji
  if (countryCode === 'WHITE') {
    return {
      emoji: '🏳️',
      fallback: languageCode.substring(0, 2).toUpperCase(),
      useFallback: !detectFlagEmojiSupport()
    }
  }
  
  // Otherwise try to get the flag emoji for the country
  const flagEmoji = COUNTRY_CODE_TO_FLAG[countryCode] || '🏳️'
  const fallback = getLanguageFallback(languageCode)
  const useFallback = !detectFlagEmojiSupport()
  
  return {
    emoji: flagEmoji,
    fallback,
    useFallback
  }
}

/**
 * Creates a React element with proper flag emoji handling
 */
export function createFlagElement(languageCode: string): React.ReactElement {
  const { emoji, fallback, useFallback } = getFlagEmojiOrFallback(languageCode)
  
  return (
    <span 
      className={`flag-emoji ${useFallback ? 'fallback' : ''}`}
      data-fallback={fallback}
    >
      {useFallback ? fallback : emoji}
    </span>
  )
}

/**
 * Creates a hybrid flag element that tries emoji first, then falls back to images
 */
export function createHybridFlagElement(languageCode: string, size: number = 20): React.ReactElement {
  // For Chrome Windows, use images directly since emoji fonts are unreliable
  const isChromeWindows = /Chrome/.test(navigator.userAgent) && /Windows/.test(navigator.userAgent)
  
  if (isChromeWindows) {
    return createFlagImageElement(languageCode, size)
  }
  
  // For other browsers, try emoji first
  const { emoji, fallback, useFallback } = getFlagEmojiOrFallback(languageCode)
  
  if (useFallback) {
    return createFlagImageElement(languageCode, size)
  }
  
  return (
    <span className="flag-emoji">
      {emoji}
    </span>
  )
}
