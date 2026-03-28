import React from 'react'
import ReactDOM from 'react-dom/client'
import { getCurrentSite } from '../sites'
import SoldOverlay from './SoldOverlay'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap'

// Extension.js content script entry point.
export default () => {
  const site = getCurrentSite()
  if (!site) return () => {}

  const fontLink = document.createElement('link')
  fontLink.id = 'sold-font-link'
  fontLink.rel = 'stylesheet'
  fontLink.href = FONT_URL
  document.head.appendChild(fontLink)

  // Manually inject CSS modules — rspack's runtime doesn't do this for content scripts
  const cssLink = document.createElement('link')
  cssLink.id = 'sold-css-modules'
  cssLink.rel = 'stylesheet'
  cssLink.href = chrome.runtime.getURL('content_scripts/content-0.css')
  document.head.appendChild(cssLink)

  const mountPoint = document.createElement('div')
  mountPoint.id = 'sold-extension-root'
  document.body.appendChild(mountPoint)

  const root = ReactDOM.createRoot(mountPoint)

  root.render(
    <React.StrictMode>
      <SoldOverlay site={site} />
    </React.StrictMode>,
  )

  return () => {
    root.unmount()
    mountPoint.remove()
    fontLink.remove()
    cssLink.remove()
  }
}
