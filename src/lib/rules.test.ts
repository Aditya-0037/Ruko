import { describe, expect, it } from 'vitest'
import { evaluateTransfer, ruleMatches } from './rules'
import type { CalmRule, TrustedPerson } from '../state/types'

const rahul: TrustedPerson = { id: 'p1', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }
const base: CalmRule = { id: 'r1', enabled: true, payee: 'new', minAmount: 10000, waitMinutes: 60, askPersonId: 'p1' }

describe('ruleMatches', () => {
  it('matches a new payee above the threshold', () => {
    expect(ruleMatches(base, { amount: 200000, payeeIsNew: true })).toBe(true)
  })
  it('ignores known payees for a new-payee rule', () => {
    expect(ruleMatches(base, { amount: 200000, payeeIsNew: false })).toBe(false)
  })
  it('requires the amount to be over the threshold, not equal', () => {
    expect(ruleMatches(base, { amount: 10000, payeeIsNew: true })).toBe(false)
    expect(ruleMatches(base, { amount: 10001, payeeIsNew: true })).toBe(true)
  })
  it('never matches a disabled rule', () => {
    expect(ruleMatches({ ...base, enabled: false }, { amount: 999999, payeeIsNew: true })).toBe(false)
  })
  it('matches any payee when payee is "any"', () => {
    expect(ruleMatches({ ...base, payee: 'any' }, { amount: 50000, payeeIsNew: false })).toBe(true)
  })
})

describe('evaluateTransfer', () => {
  it('allows when no rule matches', () => {
    expect(evaluateTransfer({ amount: 500, payeeIsNew: true }, [base], [rahul])).toEqual({ action: 'allow' })
  })
  it('pauses and names the person to ask', () => {
    const d = evaluateTransfer({ amount: 200000, payeeIsNew: true }, [base], [rahul])
    expect(d.action).toBe('pause')
    if (d.action === 'pause') {
      expect(d.waitMinutes).toBe(60)
      expect(d.askPerson?.name).toBe('Rahul')
    }
  })
  it('picks the most protective rule when several match', () => {
    const short: CalmRule = { ...base, id: 'r2', payee: 'any', minAmount: 5000, waitMinutes: 15 }
    const long: CalmRule = { ...base, id: 'r3', minAmount: 50000, waitMinutes: 240 }
    const d = evaluateTransfer({ amount: 200000, payeeIsNew: true }, [short, base, long], [rahul])
    expect(d.action === 'pause' && d.rule.id).toBe('r3')
  })
  it('falls back to the first trusted person if the rule has none', () => {
    const d = evaluateTransfer({ amount: 200000, payeeIsNew: true }, [{ ...base, askPersonId: null }], [rahul])
    expect(d.action === 'pause' && d.askPerson?.id).toBe('p1')
  })
})
