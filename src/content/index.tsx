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
          const block = el.closest(rule.closestSelector ?? '.text-block')
          if (block) (block as HTMLElement).style.display = 'none'
        }
      }
    }
    for (const rule of site.hideItems ?? []) {
      for (const el of root.querySelectorAll(rule.selector)) {
        if (el.textContent?.includes(rule.textContains)) {
          const target = rule.closestSelector
            ? el.closest(rule.closestSelector)
            : el
          if (target) (target as HTMLElement).style.display = 'none'
        }
      }
    }
  }

  let observer: MutationObserver | null = null
  if (site.hideTextBlocks?.length || site.hideItems?.length) {
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

    const cssModulesHref = chrome.runtime.getURL('content_scripts/content-0.css')

    let root: ReactDOM.Root | null = null

    const ensureInjected = () => {
      if (!document.body) return

      // Re-inject CSS in head if lost
      if (!document.getElementById('sold-font-link')) {
        const fl = document.createElement('link')
        fl.id = 'sold-font-link'
        fl.rel = 'stylesheet'
        fl.href = FONT_URL
        document.head.appendChild(fl)
      }
      if (!document.getElementById('sold-css-modules')) {
        const cl = document.createElement('link')
        cl.id = 'sold-css-modules'
        cl.rel = 'stylesheet'
        cl.href = cssModulesHref
        document.head.appendChild(cl)
      }
      if (!document.getElementById('sold-price-hider')) {
        const hider = document.createElement('style')
        hider.id = 'sold-price-hider'
        const rules = site.priceSelectors.map(
          (s) => `${s} { visibility: hidden !important; }`,
        )
        const tRules = (site.priceTextSelectors ?? []).map(
          (s) => `${s} { color: transparent !important; }`,
        )
        hider.textContent = [...rules, ...tRules].join('\n')
        ;(document.head || document.documentElement).appendChild(hider)
      }

      // Re-mount overlay if lost
      if (!document.getElementById('sold-extension-root')) {
        root?.unmount()
        const mp = document.createElement('div')
        mp.id = 'sold-extension-root'
        document.body.prepend(mp)
        root = ReactDOM.createRoot(mp)
        root.render(
          <React.StrictMode>
            <SoldOverlay site={site} />
          </React.StrictMode>,
        )
      }
    }

    ensureInjected()

    // Poll to survive frameworks that replace body content during hydration
    const poll = setInterval(ensureInjected, 500)

    cleanup = () => {
      clearInterval(poll)
      root?.unmount()
      document.getElementById('sold-extension-root')?.remove()
      fontLink.remove()
      cssLink.remove()
    }
  }

  init()

  return () => cleanup()
}
