/**
 * Indian mobile numbers, typed the way people actually type them:
 * "98765 43210", "+91 98765-43210", "09876543210", "91 9876543210".
 */
export type PhoneCheck =
  | { ok: true; digits: string }
  | { ok: false; reason: 'empty' | 'chars' | 'country' | 'start' }
  | { ok: false; reason: 'length'; count: number }

export function checkPhone(input: string): PhoneCheck {
  // Drop the separators people use: spaces, dashes, dots and brackets.
  const compact = input.replace(/[\s().-]/g, '')
  if (!compact) return { ok: false, reason: 'empty' }
  // Only digits, with an optional "+" at the very start.
  if (!/^\+?\d+$/.test(compact)) return { ok: false, reason: 'chars' }

  let digits = compact.replace('+', '')
  if (compact.startsWith('+')) {
    if (!digits.startsWith('91')) return { ok: false, reason: 'country' }
    digits = digits.slice(2)
  } else if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (digits.length !== 10) return { ok: false, reason: 'length', count: digits.length }
  if (!/^[6-9]/.test(digits)) return { ok: false, reason: 'start' }
  return { ok: true, digits }
}

/** "+91 98765 43210" — the same grouping people read aloud. */
export function formatPhone(digits: string): string {
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

/** Message key + variables for a failed check, so errors re-translate if the language changes. */
export function phoneErrorMessage(check: Exclude<PhoneCheck, { ok: true }>): { key: string; vars?: Record<string, number> } {
  switch (check.reason) {
    case 'empty':
      return { key: 'setup.person.phoneError.empty' }
    case 'chars':
      return { key: 'setup.person.phoneError.chars' }
    case 'country':
      return { key: 'setup.person.phoneError.country' }
    case 'start':
      return { key: 'setup.person.phoneError.start' }
    case 'length':
      return { key: 'setup.person.phoneError.length', vars: { count: check.count } }
  }
}
