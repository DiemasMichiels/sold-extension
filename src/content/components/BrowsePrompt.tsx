import * as shared from './shared.module.css'
import * as styles from './BrowsePrompt.module.css'

export default function BrowsePrompt() {
  return (
    <div className={styles.browseMsg}>
      <div className={shared.emojiBig}>{'\u{1F5FA}\u{FE0F}'}</div>
      <p className={shared.prompt}>Browse around and pick a house!</p>
      <p className={shared.textMuted}>
        Click on a listing to start guessing
      </p>
    </div>
  )
}
