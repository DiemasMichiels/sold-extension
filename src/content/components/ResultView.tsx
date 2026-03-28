import { formatPrice } from '../../sites'
import { getAccuracyColor, getAccuracyEmoji, getAccuracyLabel } from '../utils'
import * as shared from './shared.module.css'
import * as styles from './ResultView.module.css'

interface ResultViewProps {
  accuracy: number
  guess: string
  actualPrice: number
  currency: string
  onFindNext: () => void
}

export default function ResultView({ accuracy, guess, actualPrice, currency, onFindNext }: ResultViewProps) {
  return (
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
            {currency}
            {guess}
          </span>
        </div>
        <div className={styles.resultDivider}></div>
        <div className={styles.resultRow}>
          <span className={styles.resultRowLabel}>Actual price</span>
          <span className={styles.resultRowValueActual}>
            {formatPrice(actualPrice, currency)}
          </span>
        </div>
      </div>

      <button className={shared.btnPrimary} onClick={onFindNext}>
        Next house {'\u2192'}
      </button>
    </div>
  )
}
