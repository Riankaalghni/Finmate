import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { FinanceProvider } from './context/FinanceContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FinanceProvider><App /></FinanceProvider>
    </BrowserRouter>
  </React.StrictMode>,
)