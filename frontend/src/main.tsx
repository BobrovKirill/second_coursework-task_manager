import { StyledEngineProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import AlertModal from './components/AlertModal'
import './styles/general.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <AlertModal>
        <App />
      </AlertModal>
    </StyledEngineProvider>
  </StrictMode>,
)
