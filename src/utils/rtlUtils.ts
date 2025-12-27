/**
 * Utility functions for Right-to-Left (RTL) language support
 */

/**
 * List of RTL language codes
 * Common RTL languages: Arabic, Hebrew, Persian/Farsi, Urdu, Uyghur
 * Based on Google Cloud Translation supported languages
 */
const RTL_LANGUAGE_CODES = [
  'ar',      // Arabic (all variants)
  'he',      // Hebrew
  'iw',      // Hebrew (alternative code)
  'fa',      // Persian/Farsi
  'ur',      // Urdu
  'yi',      // Yiddish
  'ku',      // Kurdish
  'sd',      // Sindhi
  'ug',      // Uyghur (uses Arabic script)
]

/**
 * Check if a language code is Right-to-Left (RTL)
 * @param languageCode - Language code (e.g., 'ar', 'ar-SA', 'he-IL')
 * @returns true if the language is RTL, false otherwise
 */
export function isRTLLanguage(languageCode: string | undefined): boolean {
  if (!languageCode) return false
  
  // Extract base language code (e.g., 'ar' from 'ar-SA')
  const baseCode = languageCode.split('-')[0].toLowerCase()
  
  return RTL_LANGUAGE_CODES.includes(baseCode)
}

