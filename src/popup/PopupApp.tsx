import { useState, useEffect } from 'react'
import { sites } from '../sites'
import * as styles from './PopupApp.module.css'

export default function PopupApp() {
  const [active, setActive] = useState<boolean | null>(null)

  useEffect(() => {
    chrome.storage.local.get('active', ({ active }) => {
      setActive(!!active)
    })
  }, [])

  const handleCountryClick = (siteId: string, mapUrl: string) => {
    chrome.storage.local.set({ active: true }, () => {
      setActive(true)
      chrome.tabs.create({ url: mapUrl })
    })
  }

  const handleStop = () => {
    chrome.storage.local.remove('active', () => {
      setActive(false)
    })
  }

  if (active === null) return null

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.logo}>{'\u{1F3E0}'}</div>
        <h1 className={styles.title}>SOLD!</h1>
        <p className={styles.subtitle}>Can you guess the price?</p>
      </div>

      {active ? (
        <>
          <p className={styles.instruction}>Game is active</p>
          <button className={styles.stopButton} onClick={handleStop}>
            Stop game
          </button>
        </>
      ) : (
        <>
          <p className={styles.instruction}>Pick a country to start</p>
          <div className={styles.countries}>
            {sites.map((s) => (
              <button
                key={s.id}
                className={styles.countryCard}
                onClick={() => handleCountryClick(s.id, s.mapUrl)}
              >
                <span className={styles.countryFlag}>{s.flag}</span>
                <div className={styles.countryInfo}>
                  <span className={styles.countryName}>{s.country}</span>
                  <span className={styles.countrySite}>{s.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
