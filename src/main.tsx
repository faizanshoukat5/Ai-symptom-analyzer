import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppModern from './AppModern.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppModern />
  </StrictMode>,
)
