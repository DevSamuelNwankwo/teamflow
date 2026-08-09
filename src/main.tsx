import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Route-level React.lazy chunks are content-hashed per deploy. If a tab has been open across a
// new deploy (or loaded right as one lands — Vercel's Git integration deploys on every push to
// main), a chunk it references may no longer exist on the CDN. Vite's production build wraps
// every dynamic import to detect exactly this and fires `vite:preloadError` — reload once to
// pick up the current build rather than showing the user a broken "module not found" screen.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
