import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from 'lucide-react'
import styles from './Callout.module.css'

export type CalloutTone = 'info' | 'caution' | 'danger' | 'success'

const defaultIcons: Record<CalloutTone, ReactNode> = {
  info: <Info />,
  caution: <AlertTriangle />,
  danger: <OctagonAlert />,
  success: <CheckCircle2 />,
}

interface CalloutProps {
  tone?: CalloutTone
  title?: ReactNode
  icon?: ReactNode
  children?: ReactNode
  /** Use 'alert' only for urgent messages that appear without user action. */
  role?: 'status' | 'alert' | 'note'
  className?: string
}

/** Message box. Meaning is carried by icon + words, never colour alone. */
export function Callout({ tone = 'info', title, icon, children, role, className }: CalloutProps) {
  return (
    <div className={[styles.callout, styles[tone], className].filter(Boolean).join(' ')} role={role}>
      <span className={styles.icon} aria-hidden="true">
        {icon ?? defaultIcons[tone]}
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}
