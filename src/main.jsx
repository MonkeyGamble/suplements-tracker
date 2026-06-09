import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { StoreProvider } from './store/StoreContext.jsx'
import './styles.css'

// Реєстрація service worker (PWA): автооновлення кешу.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
)
