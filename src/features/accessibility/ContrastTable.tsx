import { useId, type CSSProperties } from 'react'
import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { contrastRatio, floorRatio, minimumFor, passesAA, wcagLevel, type Level } from './contrast'
import { TOKEN_PAIRS } from './tokenPairs'
import { useTokenColours } from './useTokenColours'
import styles from './AccessibilityPage.module.css'

const levelIcon: Record<Level, typeof CircleCheck> = {
  aaa: CircleCheck,
  aa: CircleCheck,
  aaLarge: TriangleAlert,
  fail: CircleX,
}

/**
 * Measures Ruko's real alias-token colours with the WCAG luminance formula, at runtime,
 * in whichever contrast mode is active. Switching to high contrast re-measures instantly.
 */
export function ContrastTable({ mode }: { mode: 'standard' | 'high' }) {
  const { t, lang } = useT()
  const { colours, live } = useTokenColours(mode)
  const captionId = useId()
  const number = new Intl.NumberFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  const rows = TOKEN_PAIRS.map((pair) => {
    const ratio = contrastRatio(colours[pair.fg], colours[pair.bg])
    return { ...pair, ratio, level: wcagLevel(ratio, pair.kind), pass: passesAA(ratio, pair.kind) }
  })
  const passed = rows.filter((r) => r.pass).length

  return (
    <div className={styles.contrastBlock}>
      <p className={styles.summary}>
        <CircleCheck aria-hidden="true" />
        <span>{t('accessibility.contrast.summary', { passed, total: rows.length })}</span>
      </p>

      {/* A focusable, labelled scroll region: at 200% text the table may need to scroll sideways
          inside itself (allowed for data tables, WCAG 1.4.10) instead of the whole page. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll this region */}
      <div className={styles.tableRegion} role="region" aria-labelledby={captionId} tabIndex={0}>
        <table className={styles.table}>
          <caption id={captionId} className={styles.caption}>
            {t('accessibility.contrast.caption', { mode: t(`accessibility.contrast.mode.${mode}`) })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('accessibility.contrast.col.pair')}</th>
              <th scope="col">{t('accessibility.contrast.col.ratio')}</th>
              <th scope="col">{t('accessibility.contrast.col.level')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = levelIcon[row.level]
              // Swatches reference the live tokens, so they always show exactly what was measured.
              const swatch: CSSProperties =
                row.kind === 'ui'
                  ? { background: `var(${row.bg})`, borderColor: `var(${row.fg})` }
                  : { background: `var(${row.bg})`, color: `var(${row.fg})` }
              return (
                <tr key={row.id}>
                  <th scope="row" className={styles.pairCell}>
                    <span className={styles.pairInner}>
                      <span
                        className={[styles.swatch, row.kind === 'ui' && styles.swatchUi].filter(Boolean).join(' ')}
                        style={swatch}
                        aria-hidden="true"
                      >
                        {row.kind === 'text' ? t('accessibility.contrast.sample') : null}
                      </span>
                      <span className={styles.pairText}>
                        <span className={styles.pairName}>{t(`accessibility.pair.${row.id}`)}</span>
                        <span className={styles.needs}>
                          {t('accessibility.contrast.needs', { min: number.format(minimumFor(row.kind)) })}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td className={styles.ratio}>
                    {t('accessibility.contrast.ratio', { ratio: number.format(floorRatio(row.ratio)) })}
                  </td>
                  <td>
                    <span className={[styles.level, styles[`level_${row.level}`]].join(' ')}>
                      <Icon aria-hidden="true" />
                      <span>{t(`accessibility.level.${row.level}`)}</span>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.source}>
        {live ? t('accessibility.contrast.source.live') : t('accessibility.contrast.source.file')}
      </p>
    </div>
  )
}
