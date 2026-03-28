import * as shared from './shared.module.css'
import * as styles from './GuessInput.module.css'

interface GuessInputProps {
  currency: string
  guess: string
  onGuessChange: (value: string) => void
  onSubmit: () => void
}

export default function GuessInput({ currency, guess, onGuessChange, onSubmit }: GuessInputProps) {
  return (
    <div className={styles.guessSection}>
      <div className={shared.emojiBig}>{'\u{1F4B0}'}</div>
      <p className={shared.prompt}>How much does this house cost?</p>
      <div className={styles.inputGroup}>
        <span className={styles.currency}>{currency}</span>
        <input
          type='text'
          className={styles.input}
          placeholder='250,000'
          value={guess}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, '')
            if (raw) {
              onGuessChange(parseInt(raw, 10).toLocaleString())
            } else {
              onGuessChange('')
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          autoFocus
        />
      </div>
      <button
        className={shared.btnPrimary}
        onClick={onSubmit}
        disabled={!guess}
      >
        Lock it in!
      </button>
    </div>
  )
}
