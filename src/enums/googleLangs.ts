export enum LanguageCode {
    // Major World Languages - English Variants
    EN_US = 'en-US',    // English (United States)
    EN_GB = 'en-GB',    // English (United Kingdom)
    EN_AU = 'en-AU',    // English (Australia)
    EN_CA = 'en-CA',    // English (Canada)
    EN_IN = 'en-IN',    // English (India)
    EN_IE = 'en-IE',    // English (Ireland)
    EN_NZ = 'en-NZ',    // English (New Zealand)
    EN_ZA = 'en-ZA',    // English (South Africa)
    EN_GH = 'en-GH',    // English (Ghana)
    EN_KE = 'en-KE',    // English (Kenya)
    EN_NG = 'en-NG',    // English (Nigeria)
    EN_PH = 'en-PH',    // English (Philippines)
    EN_TZ = 'en-TZ',    // English (Tanzania)
    
    // Spanish Variants
    ES_ES = 'es-ES',    // Spanish (Spain)
    ES_MX = 'es-MX',    // Spanish (Mexico)
    ES_AR = 'es-AR',    // Spanish (Argentina)
    ES_BO = 'es-BO',    // Spanish (Bolivia)
    ES_CL = 'es-CL',    // Spanish (Chile)
    ES_CO = 'es-CO',    // Spanish (Colombia)
    ES_CR = 'es-CR',    // Spanish (Costa Rica)
    ES_DO = 'es-DO',    // Spanish (Dominican Republic)
    ES_EC = 'es-EC',    // Spanish (Ecuador)
    ES_SV = 'es-SV',    // Spanish (El Salvador)
    ES_GT = 'es-GT',    // Spanish (Guatemala)
    ES_HN = 'es-HN',    // Spanish (Honduras)
    ES_NI = 'es-NI',    // Spanish (Nicaragua)
    ES_PA = 'es-PA',    // Spanish (Panama)
    ES_PY = 'es-PY',    // Spanish (Paraguay)
    ES_PE = 'es-PE',    // Spanish (Peru)
    ES_PR = 'es-PR',    // Spanish (Puerto Rico)
    ES_UY = 'es-UY',    // Spanish (Uruguay)
    ES_VE = 'es-VE',    // Spanish (Venezuela)
    
    // French Variants
    FR_FR = 'fr-FR',    // French (France)
    FR_CA = 'fr-CA',    // French (Canada)
    
    // German Variants
    DE_DE = 'de-DE',    // German (Germany)
    
    // Italian Variants
    IT_IT = 'it-IT',    // Italian (Italy)
    
    // Portuguese Variants
    PT_BR = 'pt-BR',    // Portuguese (Brazil)
    PT_PT = 'pt-PT',    // Portuguese (Portugal)
    
    // Russian Variants
    RU_RU = 'ru-RU',    // Russian (Russia)
    
    // Japanese Variants
    JA_JP = 'ja-JP',    // Japanese (Japan)
    
    // Korean Variants
    KO_KR = 'ko-KR',    // Korean (South Korea)
    
    // Chinese Variants
    ZH_CN = 'zh-CN',    // Chinese (Mandarin, Simplified)
    ZH_TW = 'zh-TW',    // Chinese (Mandarin, Traditional)
    ZH_HK = 'yue-Hant-HK', // Chinese (Cantonese, Traditional Hong Kong)
    
    // Arabic Variants
    AR_XA = 'ar-XA',    // Arabic (Generic)
    AR_SA = 'ar-SA',    // Arabic (Saudi Arabia)
    AR_EG = 'ar-EG',    // Arabic (Egypt)
    AR_AE = 'ar-AE',    // Arabic (United Arab Emirates)
    AR_JO = 'ar-JO',    // Arabic (Jordan)
    AR_KW = 'ar-KW',    // Arabic (Kuwait)
    AR_LB = 'ar-LB',    // Arabic (Lebanon)
    AR_MA = 'ar-MA',    // Arabic (Morocco)
    AR_QA = 'ar-QA',    // Arabic (Qatar)
    AR_TN = 'ar-TN',    // Arabic (Tunisia)
    AR_DZ = 'ar-DZ',    // Arabic (Algeria)
    
    // Hindi Variants
    HI_IN = 'hi-IN',    // Hindi (India)
    
    // European Languages - Regional Variants
    NL_NL = 'nl-NL',    // Dutch (Netherlands)
    SV_SE = 'sv-SE',    // Swedish (Sweden)
    DA_DK = 'da-DK',    // Danish (Denmark)
    NB_NO = 'nb-NO',    // Norwegian Bokmål (Norway)
    FI_FI = 'fi-FI',    // Finnish (Finland)
    PL_PL = 'pl-PL',    // Polish (Poland)
    CS_CZ = 'cs-CZ',    // Czech (Czech Republic)
    SK_SK = 'sk-SK',    // Slovak (Slovakia)
    HU_HU = 'hu-HU',    // Hungarian (Hungary)
    RO_RO = 'ro-RO',    // Romanian (Romania)
    BG_BG = 'bg-BG',    // Bulgarian (Bulgaria)
    HR_HR = 'hr-HR',    // Croatian (Croatia)
    SR_RS = 'sr-RS',    // Serbian (Cyrillic, Serbia)
    SL_SI = 'sl-SI',    // Slovenian (Slovenia)
    ET_EE = 'et-EE',    // Estonian (Estonia)
    LV_LV = 'lv-LV',    // Latvian (Latvia)
    LT_LT = 'lt-LT',    // Lithuanian (Lithuania)
    EL_GR = 'el-GR',    // Greek (Greece)
    TR_TR = 'tr-TR',    // Turkish (Turkey)
    UK_UA = 'uk-UA',    // Ukrainian (Ukraine)
    MK_MK = 'mk-MK',    // Macedonian (North Macedonia)
    SQ_AL = 'sq-AL',    // Albanian (Albania)
    CA_ES = 'ca-ES',    // Catalan (Spain)
    EU_ES = 'eu-ES',    // Basque (Spain)
    GL_ES = 'gl-ES',    // Galician (Spain)
    IS_IS = 'is-IS',    // Icelandic (Iceland)
    MT_MT = 'mt-MT',    // Maltese (Malta)
    
    // Asian Languages - Regional Variants
    TH_TH = 'th-TH',    // Thai (Thailand)
    VI_VN = 'vi-VN',    // Vietnamese (Vietnam)
    ID_ID = 'id-ID',    // Indonesian (Indonesia)
    MS_MY = 'ms-MY',    // Malay (Malaysia)
    TA_IN = 'ta-IN',    // Tamil (India)
    TE_IN = 'te-IN',    // Telugu (India)
    KN_IN = 'kn-IN',    // Kannada (India)
    ML_IN = 'ml-IN',    // Malayalam (India)
    BN_BD = 'bn-BD',    // Bengali (Bangladesh)
    BN_IN = 'bn-IN',    // Bengali (India)
    PA_GURU_IN = 'pa-Guru-IN', // Punjabi (Gurmukhi, India)
    GU_IN = 'gu-IN',    // Gujarati (India)
    MR_IN = 'mr-IN',    // Marathi (India)
    NE_NP = 'ne-NP',    // Nepali (Nepal)
    SI_LK = 'si-LK',    // Sinhala (Sri Lanka)
    KM_KH = 'km-KH',    // Khmer (Cambodia)
    LO_LA = 'lo-LA',    // Lao (Laos)
    MN_MN = 'mn-MN',    // Mongolian (Mongolia)
    KK_KZ = 'kk-KZ',    // Kazakh (Kazakhstan)
    KY_KG = 'ky-KG',    // Kyrgyz (Kyrgyzstan)
    UZ_UZ = 'uz-UZ',    // Uzbek (Uzbekistan)
    PS_AF = 'ps-AF',    // Pashto (Afghanistan)
    FA_IR = 'fa-IR',    // Persian (Iran)
    UR_PK = 'ur-PK',    // Urdu (Pakistan)
    JV_ID = 'jv-ID',    // Javanese (Indonesia)
    FIL_PH = 'fil-PH',  // Filipino (Philippines)
    
    // African Languages - Regional Variants
    AF_ZA = 'af-ZA',    // Afrikaans (South Africa)
    SW_KE = 'sw-KE',    // Swahili (Kenya)
    SW_TZ = 'sw-TZ',    // Swahili (Tanzania)
    AM_ET = 'am-ET',    // Amharic (Ethiopia)
    
    // Middle Eastern Languages - Regional Variants
    HE_IL = 'he-IL',    // Hebrew (Israel)
    KU_TR = 'ku-TR',    // Kurdish (Kurmanji, Turkey)
    
    // Pacific Languages - Regional Variants
    MI_NZ = 'mi-NZ',    // Maori (New Zealand)
    
    // Additional Languages
    BS_BA = 'bs-BA',    // Bosnian (Bosnia and Herzegovina)
    HY_AM = 'hy-AM',    // Armenian (Armenia)
    AZ_AZ = 'az-AZ',    // Azerbaijani (Azerbaijan)
    KA_GE = 'ka-GE',    // Georgian (Georgia)
  }
  
  export const LANGUAGE_METADATA = {
    // Major World Languages - English Variants
    [LanguageCode.EN_US]: { name: 'English (US)', flag: '🇺🇸' },
    [LanguageCode.EN_GB]: { name: 'English (UK)', flag: '🇬🇧' },
    [LanguageCode.EN_AU]: { name: 'English (Australia)', flag: '🇦🇺' },
    [LanguageCode.EN_CA]: { name: 'English (Canada)', flag: '🇨🇦' },
    [LanguageCode.EN_IN]: { name: 'English (India)', flag: '🇮🇳' },
    [LanguageCode.EN_IE]: { name: 'English (Ireland)', flag: '🇮🇪' },
    [LanguageCode.EN_NZ]: { name: 'English (New Zealand)', flag: '🇳🇿' },
    [LanguageCode.EN_ZA]: { name: 'English (South Africa)', flag: '🇿🇦' },
    [LanguageCode.EN_GH]: { name: 'English (Ghana)', flag: '🇬🇭' },
    [LanguageCode.EN_KE]: { name: 'English (Kenya)', flag: '🇰🇪' },
    [LanguageCode.EN_NG]: { name: 'English (Nigeria)', flag: '🇳🇬' },
    [LanguageCode.EN_PH]: { name: 'English (Philippines)', flag: '🇵🇭' },
    [LanguageCode.EN_TZ]: { name: 'English (Tanzania)', flag: '🇹🇿' },
    
    // Spanish Variants
    [LanguageCode.ES_ES]: { name: 'Spanish (Spain)', flag: '🇪🇸' },
    [LanguageCode.ES_MX]: { name: 'Spanish (Mexico)', flag: '🇲🇽' },
    [LanguageCode.ES_AR]: { name: 'Spanish (Argentina)', flag: '🇦🇷' },
    [LanguageCode.ES_BO]: { name: 'Spanish (Bolivia)', flag: '🇧🇴' },
    [LanguageCode.ES_CL]: { name: 'Spanish (Chile)', flag: '🇨🇱' },
    [LanguageCode.ES_CO]: { name: 'Spanish (Colombia)', flag: '🇨🇴' },
    [LanguageCode.ES_CR]: { name: 'Spanish (Costa Rica)', flag: '🇨🇷' },
    [LanguageCode.ES_DO]: { name: 'Spanish (Dominican Republic)', flag: '🇩🇴' },
    [LanguageCode.ES_EC]: { name: 'Spanish (Ecuador)', flag: '🇪🇨' },
    [LanguageCode.ES_SV]: { name: 'Spanish (El Salvador)', flag: '🇸🇻' },
    [LanguageCode.ES_GT]: { name: 'Spanish (Guatemala)', flag: '🇬🇹' },
    [LanguageCode.ES_HN]: { name: 'Spanish (Honduras)', flag: '🇭🇳' },
    [LanguageCode.ES_NI]: { name: 'Spanish (Nicaragua)', flag: '🇳🇮' },
    [LanguageCode.ES_PA]: { name: 'Spanish (Panama)', flag: '🇵🇦' },
    [LanguageCode.ES_PY]: { name: 'Spanish (Paraguay)', flag: '🇵🇾' },
    [LanguageCode.ES_PE]: { name: 'Spanish (Peru)', flag: '🇵🇪' },
    [LanguageCode.ES_PR]: { name: 'Spanish (Puerto Rico)', flag: '🇵🇷' },
    [LanguageCode.ES_UY]: { name: 'Spanish (Uruguay)', flag: '🇺🇾' },
    [LanguageCode.ES_VE]: { name: 'Spanish (Venezuela)', flag: '🇻🇪' },
    
    // French Variants
    [LanguageCode.FR_FR]: { name: 'French (France)', flag: '🇫🇷' },
    [LanguageCode.FR_CA]: { name: 'French (Canada)', flag: '🇨🇦' },
    
    // German Variants
    [LanguageCode.DE_DE]: { name: 'German (Germany)', flag: '🇩🇪' },
    
    // Italian Variants
    [LanguageCode.IT_IT]: { name: 'Italian (Italy)', flag: '🇮🇹' },
    
    // Portuguese Variants
    [LanguageCode.PT_BR]: { name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    [LanguageCode.PT_PT]: { name: 'Portuguese (Portugal)', flag: '🇵🇹' },
    
    // Russian Variants
    [LanguageCode.RU_RU]: { name: 'Russian (Russia)', flag: '🇷🇺' },
    
    // Japanese Variants
    [LanguageCode.JA_JP]: { name: 'Japanese (Japan)', flag: '🇯🇵' },
    
    // Korean Variants
    [LanguageCode.KO_KR]: { name: 'Korean (South Korea)', flag: '🇰🇷' },
    
    // Chinese Variants
    [LanguageCode.ZH_CN]: { name: 'Chinese (Mandarin, Simplified)', flag: '🇨🇳' },
    [LanguageCode.ZH_TW]: { name: 'Chinese (Mandarin, Traditional)', flag: '🇹🇼' },
    [LanguageCode.ZH_HK]: { name: 'Chinese (Cantonese, Hong Kong)', flag: '🇭🇰' },
    
    // Arabic Variants
    [LanguageCode.AR_XA]: { name: 'Arabic (Generic)', flag: '🇸🇦' },
    [LanguageCode.AR_SA]: { name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
    [LanguageCode.AR_EG]: { name: 'Arabic (Egypt)', flag: '🇪🇬' },
    [LanguageCode.AR_AE]: { name: 'Arabic (UAE)', flag: '🇦🇪' },
    [LanguageCode.AR_JO]: { name: 'Arabic (Jordan)', flag: '🇯🇴' },
    [LanguageCode.AR_KW]: { name: 'Arabic (Kuwait)', flag: '🇰🇼' },
    [LanguageCode.AR_LB]: { name: 'Arabic (Lebanon)', flag: '🇱🇧' },
    [LanguageCode.AR_MA]: { name: 'Arabic (Morocco)', flag: '🇲🇦' },
    [LanguageCode.AR_QA]: { name: 'Arabic (Qatar)', flag: '🇶🇦' },
    [LanguageCode.AR_TN]: { name: 'Arabic (Tunisia)', flag: '🇹🇳' },
    [LanguageCode.AR_DZ]: { name: 'Arabic (Algeria)', flag: '🇩🇿' },
    
    // Hindi Variants
    [LanguageCode.HI_IN]: { name: 'Hindi (India)', flag: '🇮🇳' },
    
    // European Languages - Regional Variants
    [LanguageCode.NL_NL]: { name: 'Dutch (Netherlands)', flag: '🇳🇱' },
    [LanguageCode.SV_SE]: { name: 'Swedish (Sweden)', flag: '🇸🇪' },
    [LanguageCode.DA_DK]: { name: 'Danish (Denmark)', flag: '🇩🇰' },
    [LanguageCode.NB_NO]: { name: 'Norwegian (Norway)', flag: '🇳🇴' },
    [LanguageCode.FI_FI]: { name: 'Finnish (Finland)', flag: '🇫🇮' },
    [LanguageCode.PL_PL]: { name: 'Polish (Poland)', flag: '🇵🇱' },
    [LanguageCode.CS_CZ]: { name: 'Czech (Czech Republic)', flag: '🇨🇿' },
    [LanguageCode.SK_SK]: { name: 'Slovak (Slovakia)', flag: '🇸🇰' },
    [LanguageCode.HU_HU]: { name: 'Hungarian (Hungary)', flag: '🇭🇺' },
    [LanguageCode.RO_RO]: { name: 'Romanian (Romania)', flag: '🇷🇴' },
    [LanguageCode.BG_BG]: { name: 'Bulgarian (Bulgaria)', flag: '🇧🇬' },
    [LanguageCode.HR_HR]: { name: 'Croatian (Croatia)', flag: '🇭🇷' },
    [LanguageCode.SR_RS]: { name: 'Serbian (Serbia)', flag: '🇷🇸' },
    [LanguageCode.SL_SI]: { name: 'Slovenian (Slovenia)', flag: '🇸🇮' },
    [LanguageCode.ET_EE]: { name: 'Estonian (Estonia)', flag: '🇪🇪' },
    [LanguageCode.LV_LV]: { name: 'Latvian (Latvia)', flag: '🇱🇻' },
    [LanguageCode.LT_LT]: { name: 'Lithuanian (Lithuania)', flag: '🇱🇹' },
    [LanguageCode.EL_GR]: { name: 'Greek (Greece)', flag: '🇬🇷' },
    [LanguageCode.TR_TR]: { name: 'Turkish (Turkey)', flag: '🇹🇷' },
    [LanguageCode.UK_UA]: { name: 'Ukrainian (Ukraine)', flag: '🇺🇦' },
    [LanguageCode.MK_MK]: { name: 'Macedonian (North Macedonia)', flag: '🇲🇰' },
    [LanguageCode.SQ_AL]: { name: 'Albanian (Albania)', flag: '🇦🇱' },
    [LanguageCode.CA_ES]: { name: 'Catalan (Spain)', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    [LanguageCode.EU_ES]: { name: 'Basque (Spain)', flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
    [LanguageCode.GL_ES]: { name: 'Galician (Spain)', flag: '🏴󠁥󠁳󠁧󠁡󠁿' },
    [LanguageCode.IS_IS]: { name: 'Icelandic (Iceland)', flag: '🇮🇸' },
    [LanguageCode.MT_MT]: { name: 'Maltese (Malta)', flag: '🇲🇹' },
    
    // Asian Languages - Regional Variants
    [LanguageCode.TH_TH]: { name: 'Thai (Thailand)', flag: '🇹🇭' },
    [LanguageCode.VI_VN]: { name: 'Vietnamese (Vietnam)', flag: '🇻🇳' },
    [LanguageCode.ID_ID]: { name: 'Indonesian (Indonesia)', flag: '🇮🇩' },
    [LanguageCode.MS_MY]: { name: 'Malay (Malaysia)', flag: '🇲🇾' },
    [LanguageCode.TA_IN]: { name: 'Tamil (India)', flag: '🇮🇳' },
    [LanguageCode.TE_IN]: { name: 'Telugu (India)', flag: '🇮🇳' },
    [LanguageCode.KN_IN]: { name: 'Kannada (India)', flag: '🇮🇳' },
    [LanguageCode.ML_IN]: { name: 'Malayalam (India)', flag: '🇮🇳' },
    [LanguageCode.BN_BD]: { name: 'Bengali (Bangladesh)', flag: '🇧🇩' },
    [LanguageCode.BN_IN]: { name: 'Bengali (India)', flag: '🇮🇳' },
    [LanguageCode.PA_GURU_IN]: { name: 'Punjabi (India)', flag: '🇮🇳' },
    [LanguageCode.GU_IN]: { name: 'Gujarati (India)', flag: '🇮🇳' },
    [LanguageCode.MR_IN]: { name: 'Marathi (India)', flag: '🇮🇳' },
    [LanguageCode.NE_NP]: { name: 'Nepali (Nepal)', flag: '🇳🇵' },
    [LanguageCode.SI_LK]: { name: 'Sinhala (Sri Lanka)', flag: '🇱🇰' },
    [LanguageCode.KM_KH]: { name: 'Khmer (Cambodia)', flag: '🇰🇭' },
    [LanguageCode.LO_LA]: { name: 'Lao (Laos)', flag: '🇱🇦' },
    [LanguageCode.MN_MN]: { name: 'Mongolian (Mongolia)', flag: '🇲🇳' },
    [LanguageCode.KK_KZ]: { name: 'Kazakh (Kazakhstan)', flag: '🇰🇿' },
    [LanguageCode.KY_KG]: { name: 'Kyrgyz (Kyrgyzstan)', flag: '🇰🇬' },
    [LanguageCode.UZ_UZ]: { name: 'Uzbek (Uzbekistan)', flag: '🇺🇿' },
    [LanguageCode.PS_AF]: { name: 'Pashto (Afghanistan)', flag: '🇦🇫' },
    [LanguageCode.FA_IR]: { name: 'Persian (Iran)', flag: '🇮🇷' },
    [LanguageCode.UR_PK]: { name: 'Urdu (Pakistan)', flag: '🇵🇰' },
    [LanguageCode.JV_ID]: { name: 'Javanese (Indonesia)', flag: '🇮🇩' },
    [LanguageCode.FIL_PH]: { name: 'Filipino (Philippines)', flag: '🇵🇭' },
    
    // African Languages - Regional Variants
    [LanguageCode.AF_ZA]: { name: 'Afrikaans (South Africa)', flag: '🇿🇦' },
    [LanguageCode.SW_KE]: { name: 'Swahili (Kenya)', flag: '🇰🇪' },
    [LanguageCode.SW_TZ]: { name: 'Swahili (Tanzania)', flag: '🇹🇿' },
    [LanguageCode.AM_ET]: { name: 'Amharic (Ethiopia)', flag: '🇪🇹' },
    
    // Middle Eastern Languages - Regional Variants
    [LanguageCode.HE_IL]: { name: 'Hebrew (Israel)', flag: '🇮🇱' },
    [LanguageCode.KU_TR]: { name: 'Kurdish (Turkey)', flag: '🇹🇷' },
    
    // Pacific Languages - Regional Variants
    [LanguageCode.MI_NZ]: { name: 'Maori (New Zealand)', flag: '🇳🇿' },
    
    // Additional Languages
    [LanguageCode.BS_BA]: { name: 'Bosnian (Bosnia and Herzegovina)', flag: '🇧🇦' },
    [LanguageCode.HY_AM]: { name: 'Armenian (Armenia)', flag: '🇦🇲' },
    [LanguageCode.AZ_AZ]: { name: 'Azerbaijani (Azerbaijan)', flag: '🇦🇿' },
    [LanguageCode.KA_GE]: { name: 'Georgian (Georgia)', flag: '🇬🇪' },
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