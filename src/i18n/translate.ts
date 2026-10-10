import type { Lang } from '../state/types'
import type { Strings } from './types'

export type Vars = Record<string, string | number>

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/**
 * Lookup order: (Easy Read variant in lang) → lang → (Easy Read variant in English) → English → key.
 * Missing keys show the key itself so they are easy to spot in development.
 */
export function translate(
  dicts: Record<Lang, Strings>,
  lang: Lang,
  key: string,
  opts: { easyRead?: boolean; vars?: Vars } = {},
): string {
  const order: [Lang, string][] = []
  if (opts.easyRead) order.push([lang, `${key}.easy`])
  order.push([lang, key])
  if (lang !== 'en') {
    if (opts.easyRead) order.push(['en', `${key}.easy`])
    order.push(['en', key])
  }
  for (const [l, k] of order) {
    const value = dicts[l][k]
    if (value !== undefined) return interpolate(value, opts.vars)
  }
  return key
}
