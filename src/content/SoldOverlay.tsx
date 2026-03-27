import { useState, useEffect } from 'react'
import { formatPrice, type SiteConfig } from '../sites'
import { getAccuracyColor, getAccuracyEmoji, getAccuracyLabel } from './utils'
import * as styles from './SoldOverlay.module.css'

type GameState = 'guessing' | 'result'

export default function SoldOverlay({ site }: { site: SiteConfig }) {
  const [isOpen, setIsOpen] = useState(true)
  const [gameState, setGameState] = useState<GameState>('guessing')
  const [guess, setGuess] = useState('')
  const [actualPrice, setActualPrice] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const isListing = site.isListingPage(window.location.href)

  useEffect(() => {
    if (!isListing) return

    const style = document.createElement('style')
    style.id = 'sold-price-hider'
    style.textContent = site.priceSelectors
      .map(
        (s) =>
          `${s} { visibility: hidden !important; position: relative !important; }`,
      )
      .join('\n')
    document.head.appendChild(style)

    const price = site.getPrice(document)
    setActualPrice(price)

    return () => {
      const el = document.getElementById('sold-price-hider')
      if (el) el.remove()
    }
  }, [site, isListing])

  const handleGuess = () => {
    if (!guess || actualPrice === null) return

    const guessNum = parseInt(guess.replace(/[^\d]/g, ''), 10)
    if (isNaN(guessNum)) return

    const diff = Math.abs(guessNum - actualPrice)
    const pct = Math.round((diff / actualPrice) * 100)
    setAccuracy(pct)

    const hider = document.getElementById('sold-price-hider')
    if (hider) hider.remove()

    setGameState('result')
  }

  const handleFindNext = () => {
    window.location.href = site.mapUrl
  }

  if (!isOpen) {
    return (
      <button className={styles.fab} onClick={() => setIsOpen(true)}>
        <span className={styles.fabIcon}>{'\u{1F3E0}'}</span>
        <span className={styles.fabLabel}>SOLD!</span>
      </button>
    )
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <button className={styles.close} onClick={() => setIsOpen(false)}>
          {'\u2715'}
        </button>

        <div className={styles.cardHeader}>
          <div className={styles.logo}>{'\u{1F3E0}'}</div>
          <h2 className={styles.cardTitle}>SOLD!</h2>
        </div>

        <div className={styles.cardBody}>
          {!isListing ? (
            <div className={styles.browseMsg}>
              <div className={styles.emojiBig}>{'\u{1F5FA}\u{FE0F}'}</div>
              <p className={styles.prompt}>Browse around and pick a house!</p>
              <p className={styles.textMuted}>
                Click on a listing to start guessing
              </p>
            </div>
          ) : gameState === 'guessing' ? (
            <div className={styles.guessSection}>
              {actualPrice === null ? (
                <div className={styles.noPrice}>
                  <div className={styles.emojiBig}>{'\u{1F50D}'}</div>
                  <p className={styles.textMuted}>
                    Couldn't find the price on this page
                  </p>
                  <button
                    className={styles.btnSecondary}
                    onClick={handleFindNext}
                  >
                    Try another house
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.emojiBig}>{'\u{1F4B0}'}</div>
                  <p className={styles.prompt}>
                    How much does this house cost?
                  </p>
                  <div className={styles.inputGroup}>
                    <span className={styles.currency}>{site.currency}</span>
                    <input
                      type='text'
                      className={styles.input}
                      placeholder='250,000'
                      value={guess}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        if (raw) {
                          setGuess(parseInt(raw, 10).toLocaleString())
                        } else {
                          setGuess('')
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                      autoFocus
                    />
                  </div>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleGuess}
                    disabled={!guess}
                  >
                    Lock it in!
                  </button>
                </>
              )}
            </div>
          ) : (
            actualPrice !== null &&
            accuracy !== null && (
              <div className={styles.resultSection}>
                <div className={styles.resultEmoji}>
                  {getAccuracyEmoji(accuracy)}
                </div>
                <div className={styles.resultLabel}>
                  {getAccuracyLabel(accuracy)}
                </div>
                <div
                  className={styles.resultPct}
                  style={{ color: getAccuracyColor(accuracy) }}
                >
                  {accuracy === 0 ? '0%' : `${accuracy}%`}
                  <span className={styles.resultPctLabel}>off</span>
                </div>

                <div className={styles.resultPrices}>
                  <div className={styles.resultRow}>
                    <span className={styles.resultRowLabel}>Your guess</span>
                    <span className={styles.resultRowValue}>
                      {site.currency}
                      {guess}
                    </span>
                  </div>
                  <div className={styles.resultDivider}></div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultRowLabel}>Actual price</span>
                    <span className={styles.resultRowValueActual}>
                      {formatPrice(actualPrice, site.currency)}
                    </span>
                  </div>
                </div>

                <button className={styles.btnPrimary} onClick={handleFindNext}>
                  Next house {'\u2192'}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
