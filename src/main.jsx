import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-load Gemini API key from Vercel / environment variable if present
if (typeof window !== 'undefined' && import.meta.env.VITE_GEMINI_API_KEY) {
  if (!localStorage.getItem('gemini_api_key')) {
    localStorage.setItem('gemini_api_key', import.meta.env.VITE_GEMINI_API_KEY);
  }
}

// Register PWA Service Worker for mobile caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('Service Worker registration skipped:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

