// Configuration for application URLs
const getConfig = () => {
  const isDevelopment = import.meta.env.VITE_NODE_ENV === 'dev'
  const isStaging = import.meta.env.VITE_NODE_ENV === 'staging'
  const isProduction = import.meta.env.VITE_NODE_ENV === 'prod'
  
  if (isDevelopment) {
    return {
      // Development URLs with subdomains (same port)
      TRANSLATION_URL: 'http://listener.localhost:5173',
      INPUT_URL: 'http://speaker.localhost:5173',
      BACKEND_URL: 'http://api.localhost:3001'
    }
  } else if (isStaging) {
    return {
      // Staging URLs - use environment variables if available, otherwise defaults
      TRANSLATION_URL: import.meta.env.VITE_TRANSLATION_URL || 'https://listener-staging.scribe-ai.ca',
      INPUT_URL: import.meta.env.VITE_INPUT_URL || 'https://speaker-staging.scribe-ai.ca',
      BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://api-staging.scribe-ai.ca'
    }
  } else {
    // Production URLs - use environment variables if available, otherwise defaults
    return {
      TRANSLATION_URL: import.meta.env.VITE_TRANSLATION_URL || 'https://listener.scribe-ai.ca',
      INPUT_URL: import.meta.env.VITE_INPUT_URL || 'https://speaker.scribe-ai.ca',
      BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'
    }
  }
}

export const CONFIG = getConfig()
