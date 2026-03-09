import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' // 1. Provider import karein
import { store } from './app/store'   // 2. Apna store import karein
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  
    {/* 3. Provider mein store pass karein */}
    <Provider store={store}>
      <App />
    </Provider>
  
  </BrowserRouter>,
)