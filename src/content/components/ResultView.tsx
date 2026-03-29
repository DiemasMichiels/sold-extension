import { convertCurrency, type Rates } from '../../currencies'
import { getAccuracyColor, getAccuracyEmoji, getAccuracyLabel } from '../utils'
import * as shared from './shared.module.css'
import * as styles from './ResultView.module.css'

interface ResultViewProps {
  accuracy: number
  guess: string
  actualPrice: number
  siteCurrencyCode: string
  userCurrencyCode: string
  rates: Rates
  onFindNext: () => void
}

function formatWithCode(amount: number, code: string): string {
  return `${code} ${amount.toLocaleString()}`
}

export default function ResultView({
  accuracy,
  guess,
  actualPrice,
  siteCurrencyCode,
  userCurrencyCode,
  rates,
  onFindNext,
}: ResultViewProps) {
  const isSameCurrency = userCurrencyCode === siteCurrencyCode
  const actualInUserCurrency = isSameCurrency
    ? actualPrice
    : convertCurrency(actualPrice, siteCurrencyCode, userCurrencyCode, rates)

  return (
    <div className={styles.resultSection}>
      <div className={styles.resultEmoji}>{getAccuracyEmoji(accuracy)}</div>
      <div className={styles.resultLabel}>{getAccuracyLabel(accuracy)}</div>
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
            {userCurrencyCode} {guess}
          </span>
        </div>
        <div className={styles.resultDivider}></div>
        <div className={styles.resultRow}>
          <span className={styles.resultRowLabel}>Actual price</span>
          <span className={styles.resultRowValueActual}>
            {isSameCurrency
              ? formatWithCode(actualPrice, siteCurrencyCode)
              : `${formatWithCode(actualInUserCurrency, userCurrencyCode)} (${formatWithCode(actualPrice, siteCurrencyCode)})`}
          </span>
        </div>
      </div>

      <button className={shared.btnPrimary} onClick={onFindNext}>
        Next house {'\u2192'}
      </button>
    </div>
  )
}
