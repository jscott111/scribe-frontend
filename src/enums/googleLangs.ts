// Language codes for Google Cloud APIs
// Speech-to-Text requires full locale codes (en-US), Translation accepts both
export enum LanguageCode {
  // Major World Languages (Speech-to-Text + Translation)
  EN = 'en-US',     // English (US)
  ES = 'es-ES',     // Spanish (Spain)
  FR = 'fr-FR',     // French (France)
  DE = 'de-DE',     // German (Germany)
  IT = 'it-IT',     // Italian (Italy)
  PT = 'pt-BR',     // Portuguese (Brazil)
  RU = 'ru-RU',     // Russian
  JA = 'ja-JP',     // Japanese
  KO = 'ko-KR',     // Korean
  ZH = 'zh-CN',     // Chinese Simplified
  ZH_TW = 'zh-TW',  // Chinese Traditional
  AR = 'ar-SA',     // Arabic
  HI = 'hi-IN',     // Hindi
  
  // European Languages (Speech-to-Text + Translation)
  NL = 'nl-NL',     // Dutch
  SV = 'sv-SE',     // Swedish
  DA = 'da-DK',     // Danish
  NO = 'nb-NO',     // Norwegian
  FI = 'fi-FI',     // Finnish
  PL = 'pl-PL',     // Polish
  CS = 'cs-CZ',     // Czech
  SK = 'sk-SK',     // Slovak
  HU = 'hu-HU',     // Hungarian
  RO = 'ro-RO',     // Romanian
  BG = 'bg-BG',     // Bulgarian
  HR = 'hr-HR',     // Croatian
  SR = 'sr-RS',     // Serbian
  SL = 'sl-SI',     // Slovenian
  ET = 'et-EE',     // Estonian
  LV = 'lv-LV',     // Latvian
  LT = 'lt-LT',     // Lithuanian
  EL = 'el-GR',     // Greek
  TR = 'tr-TR',     // Turkish
  UK = 'uk-UA',     // Ukrainian
  SQ = 'sq-AL',     // Albanian
  CA = 'ca-ES',     // Catalan
  IS = 'is-IS',     // Icelandic
  GA = 'ga-IE',     // Irish
  CY = 'cy-GB',     // Welsh
  
  // European Languages (Translation only)
  BE = 'be',        // Belarusian
  MK = 'mk',        // Macedonian
  EU = 'eu',        // Basque
  GL = 'gl',        // Galician
  FO = 'fo',        // Faroese
  MT = 'mt',        // Maltese
  
  // Asian Languages (Speech-to-Text + Translation)
  TH = 'th-TH',     // Thai
  VI = 'vi-VN',     // Vietnamese
  ID = 'id-ID',     // Indonesian
  MS = 'ms-MY',     // Malay
  TA = 'ta-IN',     // Tamil
  TE = 'te-IN',     // Telugu
  KN = 'kn-IN',     // Kannada
  ML = 'ml-IN',     // Malayalam
  BN = 'bn-IN',     // Bangla
  PA = 'pa-IN',     // Punjabi
  GU = 'gu-IN',     // Gujarati
  MR = 'mr-IN',     // Marathi
  NE = 'ne-NP',     // Nepali
  SI = 'si-LK',     // Sinhala
  MY = 'my-MM',     // Myanmar
  KM = 'km-KH',     // Khmer
  MN = 'mn-MN',     // Mongolian
  KK = 'kk-KZ',     // Kazakh
  UZ = 'uz-UZ',     // Uzbek
  PS = 'ps-AF',     // Pashto
  FA = 'fa-IR',     // Persian
  UR = 'ur-PK',     // Urdu
  YUE = 'yue-Hant-HK', // Cantonese
  
  // Asian Languages (Translation only)
  OR = 'or',        // Odia
  AS = 'as',        // Assamese
  LO = 'lo',        // Lao
  KY = 'ky',        // Kyrgyz
  TK = 'tk',        // Turkmen
  TJ = 'tg',        // Tajik
  SD = 'sd',        // Sindhi
  
  // African Languages (Speech-to-Text + Translation)
  AF = 'af-ZA',     // Afrikaans
  SW = 'sw-KE',     // Swahili
  AM = 'am-ET',     // Amharic
  ZU = 'zu-ZA',     // Zulu
  XH = 'xh-ZA',     // Xhosa
  
  // African Languages (Translation only)
  SO = 'so',        // Somali
  HA = 'ha',        // Hausa
  IG = 'ig',        // Igbo
  YO = 'yo',        // Yoruba
  ST = 'st',        // Southern Sotho
  TN = 'tn',        // Tswana
  VE = 've',        // Venda
  TS = 'ts',        // Tsonga
  SS = 'ss',        // Swati
  NR = 'nr',        // Southern Ndebele
  ND = 'nd',        // Northern Ndebele
  
  // Middle Eastern Languages
  HE = 'he-IL',     // Hebrew (Speech-to-Text + Translation)
  KU = 'ku',        // Kurdish (Translation only)
  DV = 'dv',        // Divehi (Translation only)
  
  // Pacific Languages
  MI = 'mi-NZ',     // Maori (Speech-to-Text + Translation)
  SM = 'sm',        // Samoan (Translation only)
  TO = 'to',        // Tongan (Translation only)
  FJ = 'fj',        // Fijian (Translation only)
  TY = 'ty',        // Tahitian (Translation only)
  
  // Indigenous Languages
  IU = 'iu',        // Inuktitut (Translation only)
}

// Metadata about language support for different Google services
export const LANGUAGE_METADATA = {
  // Major World Languages
  [LanguageCode.EN]: { name: 'English', flag: '🇺🇸', speechToText: true, translation: true },
  [LanguageCode.ES]: { name: 'Spanish', flag: '🇪🇸', speechToText: true, translation: true },
  [LanguageCode.FR]: { name: 'French', flag: '🇫🇷', speechToText: true, translation: true },
  [LanguageCode.DE]: { name: 'German', flag: '🇩🇪', speechToText: true, translation: true },
  [LanguageCode.IT]: { name: 'Italian', flag: '🇮🇹', speechToText: true, translation: true },
  [LanguageCode.PT]: { name: 'Portuguese', flag: '🇧🇷', speechToText: true, translation: true },
  [LanguageCode.RU]: { name: 'Russian', flag: '🇷🇺', speechToText: true, translation: true },
  [LanguageCode.JA]: { name: 'Japanese', flag: '🇯🇵', speechToText: true, translation: true },
  [LanguageCode.KO]: { name: 'Korean', flag: '🇰🇷', speechToText: true, translation: true },
  [LanguageCode.ZH]: { name: 'Chinese (Simplified)', flag: '🇨🇳', speechToText: true, translation: true },
  [LanguageCode.ZH_TW]: { name: 'Chinese (Traditional)', flag: '🇹🇼', speechToText: true, translation: true },
  [LanguageCode.AR]: { name: 'Arabic', flag: '🇸🇦', speechToText: true, translation: true },
  [LanguageCode.HI]: { name: 'Hindi', flag: '🇮🇳', speechToText: true, translation: true },
  
  // European Languages
  [LanguageCode.NL]: { name: 'Dutch', flag: '🇳🇱', speechToText: true, translation: true },
  [LanguageCode.SV]: { name: 'Swedish', flag: '🇸🇪', speechToText: true, translation: true },
  [LanguageCode.DA]: { name: 'Danish', flag: '🇩🇰', speechToText: true, translation: true },
  [LanguageCode.NO]: { name: 'Norwegian', flag: '🇳🇴', speechToText: true, translation: true },
  [LanguageCode.FI]: { name: 'Finnish', flag: '🇫🇮', speechToText: true, translation: true },
  [LanguageCode.PL]: { name: 'Polish', flag: '🇵🇱', speechToText: true, translation: true },
  [LanguageCode.CS]: { name: 'Czech', flag: '🇨🇿', speechToText: true, translation: true },
  [LanguageCode.SK]: { name: 'Slovak', flag: '🇸🇰', speechToText: true, translation: true },
  [LanguageCode.HU]: { name: 'Hungarian', flag: '🇭🇺', speechToText: true, translation: true },
  [LanguageCode.RO]: { name: 'Romanian', flag: '🇷🇴', speechToText: true, translation: true },
  [LanguageCode.BG]: { name: 'Bulgarian', flag: '🇧🇬', speechToText: true, translation: true },
  [LanguageCode.HR]: { name: 'Croatian', flag: '🇭🇷', speechToText: true, translation: true },
  [LanguageCode.SR]: { name: 'Serbian', flag: '🇷🇸', speechToText: true, translation: true },
  [LanguageCode.SL]: { name: 'Slovenian', flag: '🇸🇮', speechToText: true, translation: true },
  [LanguageCode.ET]: { name: 'Estonian', flag: '🇪🇪', speechToText: true, translation: true },
  [LanguageCode.LV]: { name: 'Latvian', flag: '🇱🇻', speechToText: true, translation: true },
  [LanguageCode.LT]: { name: 'Lithuanian', flag: '🇱🇹', speechToText: true, translation: true },
  [LanguageCode.EL]: { name: 'Greek', flag: '🇬🇷', speechToText: true, translation: true },
  [LanguageCode.TR]: { name: 'Turkish', flag: '🇹🇷', speechToText: true, translation: true },
  [LanguageCode.UK]: { name: 'Ukrainian', flag: '🇺🇦', speechToText: true, translation: true },
  [LanguageCode.BE]: { name: 'Belarusian', flag: '🇧🇾', speechToText: false, translation: true },
  [LanguageCode.MK]: { name: 'Macedonian', flag: '🇲🇰', speechToText: false, translation: true },
  [LanguageCode.SQ]: { name: 'Albanian', flag: '🇦🇱', speechToText: true, translation: true },
  [LanguageCode.CA]: { name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿', speechToText: true, translation: true },
  [LanguageCode.EU]: { name: 'Basque', flag: '🏴󠁥󠁳󠁰󠁶󠁿', speechToText: false, translation: true },
  [LanguageCode.GL]: { name: 'Galician', flag: '🏴󠁥󠁳󠁧󠁡󠁿', speechToText: false, translation: true },
  [LanguageCode.IS]: { name: 'Icelandic', flag: '🇮🇸', speechToText: true, translation: true },
  [LanguageCode.FO]: { name: 'Faroese', flag: '🇫🇴', speechToText: false, translation: true },
  [LanguageCode.GA]: { name: 'Irish', flag: '🇮🇪', speechToText: true, translation: true },
  [LanguageCode.MT]: { name: 'Maltese', flag: '🇲🇹', speechToText: false, translation: true },
  [LanguageCode.CY]: { name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', speechToText: true, translation: true },
  
  // Asian Languages
  [LanguageCode.TH]: { name: 'Thai', flag: '🇹🇭', speechToText: true, translation: true },
  [LanguageCode.VI]: { name: 'Vietnamese', flag: '🇻🇳', speechToText: true, translation: true },
  [LanguageCode.ID]: { name: 'Indonesian', flag: '🇮🇩', speechToText: true, translation: true },
  [LanguageCode.MS]: { name: 'Malay', flag: '🇲🇾', speechToText: true, translation: true },
  [LanguageCode.TA]: { name: 'Tamil', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.TE]: { name: 'Telugu', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.KN]: { name: 'Kannada', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.ML]: { name: 'Malayalam', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.BN]: { name: 'Bangla', flag: '🇧🇩', speechToText: true, translation: true },
  [LanguageCode.PA]: { name: 'Punjabi', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.GU]: { name: 'Gujarati', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.MR]: { name: 'Marathi', flag: '🇮🇳', speechToText: true, translation: true },
  [LanguageCode.OR]: { name: 'Odia', flag: '🇮🇳', speechToText: false, translation: true },
  [LanguageCode.AS]: { name: 'Assamese', flag: '🇮🇳', speechToText: false, translation: true },
  [LanguageCode.NE]: { name: 'Nepali', flag: '🇳🇵', speechToText: true, translation: true },
  [LanguageCode.SI]: { name: 'Sinhala', flag: '🇱🇰', speechToText: true, translation: true },
  [LanguageCode.MY]: { name: 'Myanmar', flag: '🇲🇲', speechToText: true, translation: true },
  [LanguageCode.KM]: { name: 'Khmer', flag: '🇰🇭', speechToText: true, translation: true },
  [LanguageCode.LO]: { name: 'Lao', flag: '🇱🇦', speechToText: false, translation: true },
  [LanguageCode.MN]: { name: 'Mongolian', flag: '🇲🇳', speechToText: true, translation: true },
  [LanguageCode.KK]: { name: 'Kazakh', flag: '🇰🇿', speechToText: true, translation: true },
  [LanguageCode.KY]: { name: 'Kyrgyz', flag: '🇰🇬', speechToText: false, translation: true },
  [LanguageCode.UZ]: { name: 'Uzbek', flag: '🇺🇿', speechToText: true, translation: true },
  [LanguageCode.TK]: { name: 'Turkmen', flag: '🇹🇲', speechToText: false, translation: true },
  [LanguageCode.TJ]: { name: 'Tajik', flag: '🇹🇯', speechToText: false, translation: true },
  [LanguageCode.PS]: { name: 'Pashto', flag: '🇦🇫', speechToText: true, translation: true },
  [LanguageCode.FA]: { name: 'Persian', flag: '🇮🇷', speechToText: true, translation: true },
  [LanguageCode.UR]: { name: 'Urdu', flag: '🇵🇰', speechToText: true, translation: true },
  [LanguageCode.SD]: { name: 'Sindhi', flag: '🇵🇰', speechToText: false, translation: true },
  [LanguageCode.YUE]: { name: 'Cantonese', flag: '🇭🇰', speechToText: true, translation: true },
  
  // African Languages
  [LanguageCode.AF]: { name: 'Afrikaans', flag: '🇿🇦', speechToText: true, translation: true },
  [LanguageCode.SW]: { name: 'Swahili', flag: '🇹🇿', speechToText: true, translation: true },
  [LanguageCode.SO]: { name: 'Somali', flag: '🇸🇴', speechToText: false, translation: true },
  [LanguageCode.AM]: { name: 'Amharic', flag: '🇪🇹', speechToText: true, translation: true },
  [LanguageCode.HA]: { name: 'Hausa', flag: '🇳🇬', speechToText: false, translation: true },
  [LanguageCode.IG]: { name: 'Igbo', flag: '🇳🇬', speechToText: false, translation: true },
  [LanguageCode.YO]: { name: 'Yoruba', flag: '🇳🇬', speechToText: false, translation: true },
  [LanguageCode.ZU]: { name: 'Zulu', flag: '🇿🇦', speechToText: true, translation: true },
  [LanguageCode.XH]: { name: 'Xhosa', flag: '🇿🇦', speechToText: true, translation: true },
  [LanguageCode.ST]: { name: 'Southern Sotho', flag: '🇱🇸', speechToText: false, translation: true },
  [LanguageCode.TN]: { name: 'Tswana', flag: '🇧🇼', speechToText: false, translation: true },
  [LanguageCode.VE]: { name: 'Venda', flag: '🇿🇦', speechToText: false, translation: true },
  [LanguageCode.TS]: { name: 'Tsonga', flag: '🇿🇦', speechToText: false, translation: true },
  [LanguageCode.SS]: { name: 'Swati', flag: '🇸🇿', speechToText: false, translation: true },
  [LanguageCode.NR]: { name: 'Southern Ndebele', flag: '🇿🇦', speechToText: false, translation: true },
  [LanguageCode.ND]: { name: 'Northern Ndebele', flag: '🇿🇼', speechToText: false, translation: true },
  
  // Middle Eastern Languages
  [LanguageCode.HE]: { name: 'Hebrew', flag: '🇮🇱', speechToText: true, translation: true },
  [LanguageCode.KU]: { name: 'Kurdish', flag: '🇮🇶', speechToText: false, translation: true },
  [LanguageCode.DV]: { name: 'Divehi', flag: '🇲🇻', speechToText: false, translation: true },
  
  // Pacific Languages
  [LanguageCode.MI]: { name: 'Maori', flag: '🇳🇿', speechToText: true, translation: true },
  [LanguageCode.SM]: { name: 'Samoan', flag: '🇼🇸', speechToText: false, translation: true },
  [LanguageCode.TO]: { name: 'Tongan', flag: '🇹🇴', speechToText: false, translation: true },
  [LanguageCode.FJ]: { name: 'Fijian', flag: '🇫🇯', speechToText: false, translation: true },
  [LanguageCode.TY]: { name: 'Tahitian', flag: '🇵🇫', speechToText: false, translation: true },
  
  // Indigenous Languages
  [LanguageCode.IU]: { name: 'Inuktitut', flag: '🇨🇦', speechToText: false, translation: true },
} as const

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

export const getSupportedLanguages = () => {
  return Object.values(LanguageCode).map(code => getLanguageInfo(code))
}

// Get languages supported by Google Speech-to-Text API (for input/speaker)
export const getSpeechToTextLanguages = () => {
  return Object.values(LanguageCode)
    .filter(code => LANGUAGE_METADATA[code]?.speechToText === true)
    .map(code => getLanguageInfo(code))
}

// Get languages supported by Google Cloud Translation API (for output/listener)
export const getTranslationLanguages = () => {
  return Object.values(LanguageCode)
    .filter(code => LANGUAGE_METADATA[code]?.translation === true)
    .map(code => getLanguageInfo(code))
}

// Extract base language code for translation (en-US -> en)
export const getBaseLanguageCode = (code: string): string => {
  return code.split('-')[0]
}
