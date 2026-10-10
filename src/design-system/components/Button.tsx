import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'quiet'

interface StyleProps {
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  fullWidth?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
}

export function buttonClass({ variant = 'secondary', size = 'md', fullWidth }: StyleProps, extra?: string) {
  return [styles.button, styles[variant], size === 'lg' && styles.lg, fullWidth && styles.full, extra]
    .filter(Boolean)
    .join(' ')
}

function Inner({ icon, iconEnd, children }: { icon?: ReactNode; iconEnd?: ReactNode; children: ReactNode }) {
  return (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {iconEnd && (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </>
  )
}

export interface ButtonProps extends StyleProps, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows this text instead of a spinner while busy (e.g. "Telling Rahul…"). */
  loading?: boolean
  loadingText?: string
}

export function Button({
  variant,
  size,
  fullWidth,
  icon,
  iconEnd,
  loading,
  loadingText,
  className,
  children,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, fullWidth }, className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner icon={icon} iconEnd={iconEnd}>
        {loading && loadingText ? loadingText : children}
      </Inner>
    </button>
  )
}

export interface ButtonLinkProps extends StyleProps, Omit<LinkProps, 'className'> {
  className?: string
}

/** A router link that looks like a button. Use for navigation, never for actions. */
export function ButtonLink({ variant, size, fullWidth, icon, iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, fullWidth }, className)} {...rest}>
      <Inner icon={icon} iconEnd={iconEnd}>
        {children as ReactNode}
      </Inner>
    </Link>
  )
}

export interface ButtonAnchorProps extends StyleProps, AnchorHTMLAttributes<HTMLAnchorElement> {}

/** A plain anchor (e.g. tel:1930) styled as a button. */
export function ButtonAnchor({ variant, size, fullWidth, icon, iconEnd, className, children, ...rest }: ButtonAnchorProps) {
  return (
    <a className={buttonClass({ variant, size, fullWidth }, className)} {...rest}>
      <Inner icon={icon} iconEnd={iconEnd}>
        {children}
      </Inner>
    </a>
  )
}
