import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserSettingsProvider } from '@/context/UserSettingsContext'
import './styles/global.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserSettingsProvider>
      <App />
    </UserSettingsProvider>
  </StrictMode>,
)
