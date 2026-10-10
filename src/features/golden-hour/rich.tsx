import { Fragment, type ReactNode } from 'react'
import type { Lang } from '../../state/types'

const DEVANAGARI = /[ऀ-ॿ]/
const LATIN = /[A-Za-z]/

/** The language a fragment is written in, judged by its script. Digits and symbols have none. */
export function scriptLang(text: string): Lang | undefined {
  if (DEVANAGARI.test(text)) return 'hi'
  if (LATIN.test(text)) return 'en'
  return undefined
}

/**
 * Text that may be in a different script from its surroundings (a name typed in English on a
 * Hindi page). It gets its own `lang` so screen readers switch voice (WCAG 3.1.2).
 */
export function Mixed({ text, lang }: { text: string; lang: Lang }) {
  const own = scriptLang(text)
  if (own && own !== lang) return <span lang={own}>{text}</span>
  return <>{text}</>
}

/** Replace {placeholders} in an already-translated template with React nodes. */
export function rich(template: string, nodes: Record<string, ReactNode>): ReactNode {
  const parts = template.split(/\{(\w+)\}/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <Fragment key={i}>{part in nodes ? nodes[part] : `{${part}}`}</Fragment> : part,
      )}
    </>
  )
}
