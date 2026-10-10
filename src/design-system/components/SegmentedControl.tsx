import { useId } from 'react'
import styles from './SegmentedControl.module.css'

interface Option<V extends string> {
  value: V
  label: string
  /** Language of the label, e.g. 'hi' for "हिंदी". */
  lang?: string
}

interface SegmentedControlProps<V extends string> {
  legend: string
  options: Option<V>[]
  value: V
  onChange: (value: V) => void
  hideLegend?: boolean
}

/** Compact single choice (language, text size). Native radios underneath. */
export function SegmentedControl<V extends string>({ legend, options, value, onChange, hideLegend }: SegmentedControlProps<V>) {
  const name = useId()
  return (
    <fieldset className={styles.fieldset}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{legend}</legend>
      <div className={styles.group}>
        {options.map((o) => (
          <label key={o.value} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className={styles.pill} lang={o.lang}>
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
