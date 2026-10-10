import styles from './CallerIllustration.module.css'

interface CallerIllustrationProps {
  /** 'video' = the whole 4:3 "camera" frame; 'avatar' = head-and-shoulders crop for the ringing screen. */
  variant?: 'video' | 'avatar'
  className?: string
}

/**
 * A deliberately drawn, flat "officer" for the practice call — never a realistic photo, so it
 * reads as a simulation. The uniform-like collar, peaked cap and pinned fake ID badge are the
 * props real scammers use to look official. All colours come from alias tokens (see the CSS),
 * so it adapts to high contrast. Decorative: the caller's identity is always given in text.
 */
export function CallerIllustration({ variant = 'video', className }: CallerIllustrationProps) {
  const viewBox = variant === 'avatar' ? '88 40 144 144' : '0 0 320 240'
  return (
    <svg
      className={[styles.svg, className].filter(Boolean).join(' ')}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Staged "office" backdrop */}
      <rect className={styles.wall} width="320" height="240" />
      <rect className={styles.wallLow} y="170" width="320" height="70" />
      <rect className={styles.frame} x="24" y="34" width="60" height="74" rx="4" />
      <circle className={styles.emblem} cx="54" cy="66" r="16" />
      <path className={styles.emblem} d="M54 56v20M44 66h20" />
      <path className={styles.frameLine} d="M38 94h32" />
      <rect className={styles.shelf} x="238" y="86" width="64" height="6" rx="2" />
      <rect className={styles.binderA} x="244" y="52" width="12" height="34" rx="2" />
      <rect className={styles.binderB} x="258" y="58" width="12" height="28" rx="2" />
      <rect className={styles.binderA} x="272" y="48" width="12" height="38" rx="2" />

      {/* Uniform-like shirt */}
      <path className={styles.uniform} d="M56 240c4-42 30-64 72-72h64c42 8 68 30 72 72Z" />
      <rect className={styles.epaulette} x="84" y="176" width="36" height="9" rx="3" transform="rotate(-14 102 180)" />
      <rect className={styles.epaulette} x="200" y="176" width="36" height="9" rx="3" transform="rotate(14 218 180)" />
      <circle className={styles.shirtButton} cx="160" cy="208" r="3" />
      <circle className={styles.shirtButton} cx="160" cy="226" r="3" />
      <rect className={styles.plate} x="184" y="204" width="38" height="8" rx="2" />

      {/* Neck and collar */}
      <path className={styles.skinShade} d="M145 138h30v30l-15 12-15-12Z" />
      <path className={styles.collar} d="M140 162l20 34-32-16Z" />
      <path className={styles.collar} d="M180 162l-20 34 32-16Z" />

      {/* Pinned "ID" badge — the fake credential */}
      <rect className={styles.badge} x="88" y="190" width="46" height="32" rx="4" />
      <rect className={styles.badgePhoto} x="93" y="195" width="13" height="16" rx="2" />
      <path className={styles.badgeLine} d="M111 199h17M111 205h13M111 211h15" />
      <rect className={styles.badgeStrip} x="88" y="215" width="46" height="7" />

      {/* Head */}
      <ellipse className={styles.skin} cx="125" cy="112" rx="7" ry="11" />
      <ellipse className={styles.skin} cx="195" cy="112" rx="7" ry="11" />
      <ellipse className={styles.skin} cx="160" cy="108" rx="35" ry="42" />

      {/* Peaked cap */}
      <path className={styles.cap} d="M118 84c0-22 19-34 42-34s42 12 42 34Z" />
      <rect className={styles.capBand} x="118" y="78" width="84" height="10" rx="3" />
      <path className={styles.visor} d="M114 88h92c-6 9-24 13-46 13s-40-4-46-13Z" />
      <circle className={styles.capEmblem} cx="160" cy="68" r="7" />

      {/* A stern, simple face */}
      <path className={styles.feature} d="M139 104l14 3M181 104l-14 3" />
      <circle className={styles.eye} cx="147" cy="114" r="3.2" />
      <circle className={styles.eye} cx="173" cy="114" r="3.2" />
      <path className={styles.feature} d="M160 116v11l-4 2" />
      <path className={styles.hair} d="M143 133c6-5 11-5 17-2 6-3 11-3 17 2-6 3-11 3-17 1-6 2-11 2-17-1Z" />
      <path className={styles.feature} d="M152 141c5 1.5 11 1.5 16 0" />
    </svg>
  )
}
