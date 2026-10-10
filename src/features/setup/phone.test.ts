import { describe, expect, it } from 'vitest'
import { checkPhone, formatPhone, phoneErrorMessage } from './phone'

describe('checkPhone', () => {
  it.each([
    ['9876543210', '9876543210'],
    ['98765 43210', '9876543210'],
    ['98765-43210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['+91-98765-43210', '9876543210'],
    ['919876543210', '9876543210'],
    ['09876543210', '9876543210'],
    [' (+91) 98765.43210 ', '9876543210'],
  ])('accepts %s', (input, digits) => {
    expect(checkPhone(input)).toEqual({ ok: true, digits })
  })

  it('explains what is wrong', () => {
    expect(checkPhone('')).toEqual({ ok: false, reason: 'empty' })
    expect(checkPhone('   ')).toEqual({ ok: false, reason: 'empty' })
    expect(checkPhone('98765 4321')).toEqual({ ok: false, reason: 'length', count: 9 })
    expect(checkPhone('98765 432101')).toEqual({ ok: false, reason: 'length', count: 11 })
    expect(checkPhone('12345 67890')).toEqual({ ok: false, reason: 'start' })
    expect(checkPhone('98765 abcde')).toEqual({ ok: false, reason: 'chars' })
    expect(checkPhone('98765+43210')).toEqual({ ok: false, reason: 'chars' })
    expect(checkPhone('+44 7700 900123')).toEqual({ ok: false, reason: 'country' })
  })
})

describe('formatPhone / phoneErrorMessage', () => {
  it('groups digits the way people read them aloud', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765 43210')
  })
  it('maps each failure to a message key with the digit count', () => {
    expect(phoneErrorMessage({ ok: false, reason: 'length', count: 8 })).toEqual({
      key: 'setup.person.phoneError.length',
      vars: { count: 8 },
    })
    expect(phoneErrorMessage({ ok: false, reason: 'empty' }).key).toBe('setup.person.phoneError.empty')
  })
})
