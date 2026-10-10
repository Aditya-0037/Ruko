import { describe, expect, it } from 'vitest'
import { dictionaries } from './dictionaries'
import { interpolate, translate } from './translate'

const dicts = {
  en: { greet: 'Hello {name}', 'greet.easy': 'Hi {name}', only: 'English only' },
  hi: { greet: 'नमस्ते {name}' },
}

describe('translate', () => {
  it('interpolates variables', () => {
    expect(interpolate('Call {name}', { name: 'Rahul' })).toBe('Call Rahul')
    expect(interpolate('Call {name}', {})).toBe('Call {name}')
  })
  it('falls back to English, then to the key', () => {
    expect(translate(dicts, 'hi', 'only')).toBe('English only')
    expect(translate(dicts, 'hi', 'missing.key')).toBe('missing.key')
  })
  it('prefers the Easy Read variant when on', () => {
    expect(translate(dicts, 'en', 'greet', { easyRead: true, vars: { name: 'Kamla' } })).toBe('Hi Kamla')
    expect(translate(dicts, 'en', 'greet', { easyRead: false, vars: { name: 'Kamla' } })).toBe('Hello Kamla')
  })
  it('uses the Hindi base string before an English Easy Read variant', () => {
    expect(translate(dicts, 'hi', 'greet', { easyRead: true, vars: { name: 'कमला' } })).toBe('नमस्ते कमला')
  })
})

describe('dictionaries', () => {
  it('has a Hindi translation for every English key', () => {
    const missing = Object.keys(dictionaries.en).filter((k) => !(k in dictionaries.hi))
    expect(missing).toEqual([])
  })
  it('has no Hindi keys without an English source', () => {
    const orphan = Object.keys(dictionaries.hi).filter((k) => !(k in dictionaries.en))
    expect(orphan).toEqual([])
  })
  it('keeps the same {placeholders} in both languages', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
    const mismatched = Object.keys(dictionaries.en).filter(
      (k) => k in dictionaries.hi && vars(dictionaries.en[k]) !== vars(dictionaries.hi[k]),
    )
    expect(mismatched).toEqual([])
  })
})
