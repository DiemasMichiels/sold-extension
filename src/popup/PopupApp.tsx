import { sites } from '../sites'
import * as styles from './PopupApp.module.css'

export default function PopupApp() {
  // TODO: Open the mapUrl in a new tab and save / pass that we want to play the game. Only when we activate it we want to see the content script on the page. Whenever someone visits the sites when the game isnt activated, we shouldnt show the game.

  const handleCountryClick = (siteId: string, mapUrl: string) => {
    chrome.storage.local.set(
      { soldActive: true, selectedCountry: siteId },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.update(tabs[0].id, { url: mapUrl })
          }
          window.close()
        })
      },
    )
  }

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.logo}>{'\u{1F3E0}'}</div>
        <h1 className={styles.title}>SOLD!</h1>
        <p className={styles.subtitle}>Can you guess the price?</p>
      </div>

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
    </div>
  )
}
