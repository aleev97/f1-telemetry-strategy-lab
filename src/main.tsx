import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/800.css'
import '@fontsource/barlow-condensed/800-italic.css'
import '@fontsource/barlow-condensed/900-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)