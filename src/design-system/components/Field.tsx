import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { CircleAlert } from 'lucide-react'
import styles from './Field.module.css'

interface BaseProps {
  label: string
  hint?: string
  /** Say what went wrong and how to fix it. */
  error?: string
}

type InputFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { multiline?: false }
type TextareaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true }

/** Labelled text input with hint and error, wired with aria-describedby. */
export function Field(props: InputFieldProps | TextareaFieldProps) {
  const autoId = useId()
  const { label, hint, error, id = autoId, className, multiline, ...rest } = props
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const inputClass = [styles.input, error && styles.invalid, className].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          id={id}
          className={inputClass}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={inputClass}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
