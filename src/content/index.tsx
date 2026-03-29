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

  // Inject price-hiding CSS synchronously at document_start — before first paint
  const priceHider = document.createElement('style')
  priceHider.id = 'sold-price-hider'
  const hiddenRules = site.priceSelectors.map(
    (s) => `${s} { visibility: hidden !important; }`,
  )
  const textRules = (site.priceTextSelectors ?? []).map(
    (s) => `${s} { color: transparent !important;}`,
  )
  priceHider.textContent = [...hiddenRules, ...textRules].join('\n')
  ;(document.head || document.documentElement).appendChild(priceHider)

  // Hide sections matched by text content (CSS can't do this)
  const hideByText = (root: Element | Document = document) => {
    for (const rule of site.hideTextBlocks ?? []) {
      for (const el of root.querySelectorAll(rule.selector)) {
        if (el.textContent?.trim() === rule.text) {
          const block = el.closest('.text-block')
          if (block) (block as HTMLElement).style.display = 'none'
        }
      }
    }
  }

  let observer: MutationObserver | null = null
  if (site.hideTextBlocks?.length) {
    observer = new MutationObserver(() => hideByText())
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })
  }

  let cleanup = () => {
    priceHider.remove()
    observer?.disconnect()
  }

  const init = async () => {
    const { active } = await chrome.storage.local.get('active')
    if (!active) {
      priceHider.remove()
      observer?.disconnect()
      return
    }

    // Wait for body to exist if we're running at document_start
    if (!document.body) {
      await new Promise<void>((r) =>
        document.addEventListener('DOMContentLoaded', () => r()),
      )
    }

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
    document.body.prepend(mountPoint)

    const root = ReactDOM.createRoot(mountPoint)

    root.render(
      <React.StrictMode>
        <SoldOverlay site={site} />
      </React.StrictMode>,
    )

    cleanup = () => {
      root.unmount()
      mountPoint.remove()
      fontLink.remove()
      cssLink.remove()
    }
  }

  init()

  return () => cleanup()
}
