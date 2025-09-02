// Configuration for application URLs
export const CONFIG = {
  // Translation Client URL - where audience members go to see translations
  TRANSLATION_URL: import.meta.env.VITE_TRANSLATION_URL || 'http://localhost:5174',
  
  // Input Client URL - where the speaker goes to input speech
  INPUT_URL: import.meta.env.VITE_INPUT_URL || 'http://localhost:5173',
  
  // Backend URL - where the API and WebSocket server runs
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
}
