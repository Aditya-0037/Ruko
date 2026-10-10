import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './BigButton.module.css'

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  subtitle?: string
  icon?: ReactNode
}

/** The giant, one-thumb Ruko button. One per screen at most. */
export function BigButton({ title, subtitle, icon, className, ...rest }: BigButtonProps) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={[styles.button, className].filter(Boolean).join(' ')} {...rest}>
        <span className={styles.label}>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.sub}>{subtitle}</span>}
        </span>
      </button>
    </div>
  )
}
