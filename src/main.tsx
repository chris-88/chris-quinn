import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { greetTheCurious } from './easter-eggs/console'
import { restoreRetro } from './easter-eggs/retro'
import './index.css'

restoreRetro()
greetTheCurious()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
