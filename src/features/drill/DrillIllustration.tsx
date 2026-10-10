import styles from './DrillIllustration.module.css'

/**
 * A friendly, obviously drawn "officer" on a phone video call — never a realistic photo, so the
 * rehearsal never feels like the real fright. Colours come from alias tokens (see the CSS), so it
 * adapts to high contrast. The accessible name is given by the caller (role="img").
 */
export function DrillIllustration({ label }: { label: string }) {
  return (
    <svg className={styles.svg} viewBox="0 0 240 300" role="img" aria-label={label} focusable="false">
      {/* Phone */}
      <rect className={styles.phone} x="40" y="8" width="160" height="284" rx="26" />
      <rect className={styles.screen} x="52" y="30" width="136" height="228" rx="14" />
      <rect className={styles.detail} x="100" y="16" width="40" height="6" rx="3" />

      {/* Staged "office" backdrop */}
      <rect className={styles.frame} x="62" y="46" width="34" height="42" rx="4" />
      <circle className={styles.emblem} cx="79" cy="64" r="9" />
      <rect className={styles.liveDot} x="150" y="40" width="28" height="12" rx="6" />

      {/* Officer */}
      <path className={styles.uniform} d="M68 258c3-40 24-60 52-60s49 20 52 60Z" />
      <path className={styles.collar} d="M107 199l13 18 13-18Z" />
      <circle className={styles.badge} cx="146" cy="226" r="6" />
      <rect className={styles.skin} x="112" y="168" width="16" height="32" rx="6" />
      <circle className={styles.skin} cx="120" cy="148" r="30" />
      <path className={styles.cap} d="M88 134c4-22 18-32 32-32s28 10 32 32Z" />
      <rect className={styles.cap} x="84" y="130" width="72" height="9" rx="4.5" />
      <circle className={styles.badge} cx="120" cy="118" r="5" />
      <circle className={styles.ink} cx="110" cy="151" r="3" />
      <circle className={styles.ink} cx="130" cy="151" r="3" />
      <path className={styles.line} d="M111 163q9 7 18 0" />

      {/* Speech bubble: he is talking at you */}
      <path
        className={styles.bubble}
        d="M156 64h62a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10h-44l-12 10 2-10h-8a10 10 0 0 1-10-10V74a10 10 0 0 1 10-10Z"
      />
      <path className={styles.bubbleLine} d="M162 78h52M162 90h34" />

      {/* Call buttons */}
      <circle className={styles.callButton} cx="98" cy="275" r="9" />
      <circle className={styles.callButtonPrimary} cx="142" cy="275" r="9" />
    </svg>
  )
}
