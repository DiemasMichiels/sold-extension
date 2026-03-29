import { useState, useEffect } from 'react'
import { sites } from '../sites'
import { loadCurrencies, type CurrencyInfo } from '../currencies'
import * as Flags from 'country-flag-icons/react/3x2'
import * as styles from './PopupApp.module.css'

type FlagMap = typeof Flags
type CountryCode = keyof FlagMap

export default function PopupApp() {
  const [active, setActive] = useState<boolean | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('EUR')
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([])

  useEffect(() => {
    chrome.storage.local.get(
      ['active', 'userCurrency'],
      (result: Record<string, any>) => {
        setActive(!!result.active)
        if (result.userCurrency) setSelectedCurrency(result.userCurrency)
      },
    )
    loadCurrencies().then(setCurrencies)
  }, [])

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code)
    chrome.storage.local.set({ userCurrency: code })
  }

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
        <div className={styles.currencySelector}>
          <select
            className={styles.currencySelect}
            value={selectedCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.logo}>{'\u{1F3E0}'}</div>
        <h1 className={styles.title}>SOLD!</h1>
        <p className={styles.subtitle}>Can you guess the price?</p>
      </div>

      {active ? (
        <>
          <p className={styles.instruction}>Game is active</p>
          <button className={styles.stopButton} onClick={handleStop}>
            Stop game / new country
          </button>
        </>
      ) : (
        <>
          <p className={styles.instruction}>Pick a country to start</p>
          <div className={styles.countries}>
            {sites.map((s) => {
              const Flag = Flags[s.countryCode as CountryCode]

              return (
                <button
                  key={s.id}
                  className={styles.countryCard}
                  onClick={() => handleCountryClick(s.id, s.mapUrl)}
                >
                  <Flag className={styles.countryFlag} />
                  <div className={styles.countryInfo}>
                    <span className={styles.countryName}>{s.country}</span>
                    <span className={styles.countrySite}>{s.name}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
      <footer className={styles.footer}>
        Made by{' '}
        <a href='https://diemas.dev' target='_blank'>
          diemas.dev
        </a>
      </footer>
    </div>
  )
}
