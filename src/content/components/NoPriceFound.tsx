import * as shared from './shared.module.css'
import * as styles from './NoPriceFound.module.css'

export default function NoPriceFound({ onFindNext }: { onFindNext: () => void }) {
  return (
    <div className={styles.noPrice}>
      <div className={shared.emojiBig}>{'\u{1F50D}'}</div>
      <p className={shared.textMuted}>
        Couldn't find the price on this page
      </p>
      <button className={shared.btnSecondary} onClick={onFindNext}>
        Try another house
      </button>
    </div>
  )
}
