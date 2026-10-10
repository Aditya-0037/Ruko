import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li' | 'aside'
  tone?: 'default' | 'sunken' | 'primary'
  compact?: boolean
  children: ReactNode
}

export function Card({ as: Tag = 'div', tone = 'default', compact, className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={[styles.card, tone !== 'default' && styles[tone], compact && styles.compact, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
