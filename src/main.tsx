import React from 'react'
import ReactDOM from 'react-dom/client'
import { ENABLE_MIRAGE } from './mocks/config'
import { makeServer } from './mocks/server'
import App from './App.tsx'
import './index.css'

// Initialize Mirage JS in development for API mocking
if (ENABLE_MIRAGE) {
  makeServer();
  console.log('🎭 Mirage JS Mock Server is running');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
