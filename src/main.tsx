import React from 'react'
import ReactDOM from 'react-dom/client'
import InputApp from './components/Input/InputApp.tsx'
import TranslationApp from './components/Output/TranslationApp.tsx'
import './index.css'

const getAppComponent = () => {
  const port = window.location.port
  
  if (port === '5173') {
    return <InputApp />
  } else {
    return <TranslationApp />
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {getAppComponent()}
  </React.StrictMode>,
)
