import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import InputApp from './InputApp.tsx'
import TranslationApp from './TranslationApp.tsx'
import './index.css'

const getAppComponent = () => {
  const port = window.location.port
  
  if (port === '5173') {
    return <InputApp />
  } else if (port === '5174') {
    return <TranslationApp />
  } else {
    return <App />
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {getAppComponent()}
  </React.StrictMode>,
)
