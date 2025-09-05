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
      // Staging URLs (replace with your actual staging domain)
      TRANSLATION_URL: 'https://listener-staging.yourdomain.com',
      INPUT_URL: 'https://speaker-staging.yourdomain.com',
      BACKEND_URL: 'https://api-staging.yourdomain.com'
    }
  } else {
    // Production URLs (replace with your actual production domain)
    return {
      TRANSLATION_URL: 'https://listener.yourdomain.com',
      INPUT_URL: 'https://speaker.yourdomain.com',
      BACKEND_URL: 'https://api.yourdomain.com'
    }
  }
}

export const CONFIG = getConfig()
