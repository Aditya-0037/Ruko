import { Fragment, useCallback, type ReactNode } from 'react'
import { useT } from '../../i18n/useT'
import type { Lang } from '../../state/types'

const DEVANAGARI = /[ऀ-ॿ]/
const LATIN = /[A-Za-z]/

/** The language a fragment is written in, judged by its script. Numbers and symbols have none. */
export function scriptLang(text: string): Lang | undefined {
  if (DEVANAGARI.test(text)) return 'hi'
  if (LATIN.test(text)) return 'en'
  return undefined
}

/**
 * A name or label that may be in a different script from the page, e.g. "RBI Safe Account" on a
 * Hindi screen. It gets its own `lang` so screen readers switch voice (WCAG 3.1.2).
 */
export function Mixed({ text, uiLang }: { text: string; uiLang: Lang }) {
  const own = scriptLang(text)
  if (own && own !== uiLang) return <span lang={own}>{text}</span>
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

/**
 * Like t(), but returns React nodes, and wraps any string value whose script differs from the
 * page language in <span lang>. Use for visible text; use t() for attributes and titles.
 *   const rt = useRichT(); rt('family.callElder', { elder: 'Kamla Devi' })
 */
export function useRichT() {
  const { t, lang } = useT()
  return useCallback(
    (key: string, vars: Record<string, string | number> = {}, nodes: Record<string, ReactNode> = {}) => {
      const all: Record<string, ReactNode> = {}
      for (const [k, v] of Object.entries(vars)) {
        all[k] = typeof v === 'string' ? <Mixed text={v} uiLang={lang} /> : String(v)
      }
      return rich(t(key), { ...all, ...nodes })
    },
    [t, lang],
  )
}
