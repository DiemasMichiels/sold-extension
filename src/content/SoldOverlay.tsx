import { useState, useEffect } from 'react'
import type { SiteConfig } from '../sites'
import { convertCurrency, loadRates, type Rates } from '../currencies'
import BrowsePrompt from './components/BrowsePrompt'
import NoPriceFound from './components/NoPriceFound'
import GuessInput from './components/GuessInput'
import ResultView from './components/ResultView'
import * as styles from './SoldOverlay.module.css'

type GameState = 'guessing' | 'result'

export default function SoldOverlay({ site }: { site: SiteConfig }) {
  const [isOpen, setIsOpen] = useState(true)
  const [gameState, setGameState] = useState<GameState>('guessing')
  const [guess, setGuess] = useState('')
  const [actualPrice, setActualPrice] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [userCurrencyCode, setUserCurrencyCode] = useState(site.currencyCode)
  const [rates, setRates] = useState<Rates | null>(null)

  const isListing = site.isListingPage(window.location.href)

  useEffect(() => {
    chrome.storage.local.get(
      'userCurrency',
      ({ userCurrency }: { userCurrency: string }) => {
        if (userCurrency) setUserCurrencyCode(userCurrency)
      },
    )
    loadRates().then(setRates)

    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.userCurrency?.newValue && typeof changes.userCurrency.newValue === 'string') {
        setUserCurrencyCode(changes.userCurrency.newValue)
      }
    }
    chrome.storage.local.onChanged.addListener(listener)
    return () => chrome.storage.local.onChanged.removeListener(listener)
  }, [])

  useEffect(() => {
    if (!isListing) return
    const price = site.getPrice(document)
    setActualPrice(price)
  }, [site, isListing])

  const handleGuess = () => {
    if (!guess || actualPrice === null || !rates) return

    const guessNum = parseInt(guess.replace(/[^\d]/g, ''), 10)
    if (isNaN(guessNum)) return

    const guessInSiteCurrency = convertCurrency(
      guessNum,
      userCurrencyCode,
      site.currencyCode,
      rates,
    )
    const diff = Math.abs(guessInSiteCurrency - actualPrice)
    const pct = Math.round((diff / actualPrice) * 100)
    setAccuracy(pct)

    const hider = document.getElementById('sold-price-hider')
    if (hider) hider.remove()

    setGameState('result')
  }

  const handleFindNext = () => {
    window.location.href = site.mapUrl
  }

  const renderBody = () => {
    if (!isListing) {
      return <BrowsePrompt />
    }

    if (gameState === 'guessing') {
      if (actualPrice === null) {
        return <NoPriceFound onFindNext={handleFindNext} />
      }
      return (
        <GuessInput
          currency={userCurrencyCode}
          guess={guess}
          onGuessChange={setGuess}
          onSubmit={handleGuess}
        />
      )
    }

    if (actualPrice !== null && accuracy !== null && rates) {
      return (
        <ResultView
          accuracy={accuracy}
          guess={guess}
          actualPrice={actualPrice}
          siteCurrencyCode={site.currencyCode}
          userCurrencyCode={userCurrencyCode}
          rates={rates}
          onFindNext={handleFindNext}
        />
      )
    }

    return null
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.fab} onClick={() => setIsOpen(!isOpen)}>
        <span
          className={`${styles.fabChevron} ${isOpen ? styles.fabChevronOpen : ''}`}
        >
          ◀
        </span>
        <span className={styles.fabLabel}>SOLD!</span>
        <span className={styles.fabIcon}>{'\u{1F3E0}'}</span>
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.card}>
          <div className={styles.cardBody}>{renderBody()}</div>
        </div>
      </div>
    </div>
  )
}
