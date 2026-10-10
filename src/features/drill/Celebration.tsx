import type { CSSProperties } from 'react'
import styles from './Celebration.module.css'

/** Hand-placed confetti around the badge: [left %, top %, rotation deg, tone]. Never over the tick. */
const PIECES: [number, number, number, 'a' | 'b' | 'c' | 'd'][] = [
  [8, 18, -20, 'a'],
  [18, 62, 35, 'b'],
  [26, 10, 60, 'c'],
  [14, 86, -45, 'd'],
  [30, 40, 15, 'a'],
  [70, 14, -30, 'b'],
  [80, 58, 50, 'c'],
  [88, 24, 10, 'd'],
  [74, 88, -15, 'a'],
  [92, 76, 70, 'b'],
  [66, 36, -60, 'c'],
  [36, 92, 25, 'd'],
]

/**
 * A growing tick in a circle with a little confetti. Decorative (the heading carries the meaning).
 * Durations come from motion tokens, and `still` (reduced motion) renders the final frame with no
 * animation at all.
 */
export function Celebration({ still }: { still: boolean }) {
  return (
    <div className={[styles.wrap, still && styles.still].filter(Boolean).join(' ')} aria-hidden="true">
      {PIECES.map(([x, y, r, tone], i) => (
        <span
          key={i}
          className={styles.piece}
          data-tone={tone}
          style={{ left: `${x}%`, top: `${y}%`, '--r': `${r}deg`, '--i': i } as CSSProperties}
        />
      ))}
      <svg className={styles.badge} viewBox="0 0 120 120" focusable="false">
        <circle className={styles.halo} cx="60" cy="60" r="57" />
        <circle className={styles.disc} cx="60" cy="60" r="45" />
        <path className={styles.tick} d="M38 62l15 15 30-32" pathLength={1} />
      </svg>
    </div>
  )
}
