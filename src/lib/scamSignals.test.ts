import { describe, expect, it } from 'vitest'
import { assessAnswers } from './scamSignals'

describe('assessAnswers', () => {
  it('flags a scam on any yes', () => {
    const a = assessAnswers({ secrecy: 'yes', moneyMove: 'no', videoHold: 'no' })
    expect(a.level).toBe('scam')
    expect(a.matched).toEqual(['secrecy'])
  })
  it('treats not-sure as unsure, never as clear', () => {
    expect(assessAnswers({ secrecy: 'no', moneyMove: 'unsure', videoHold: 'no' }).level).toBe('unsure')
  })
  it('treats unanswered questions as unsure', () => {
    const a = assessAnswers({ secrecy: 'no' })
    expect(a.level).toBe('unsure')
    expect(a.missing).toEqual(['moneyMove', 'videoHold'])
  })
  it('is clear only with three no answers', () => {
    expect(assessAnswers({ secrecy: 'no', moneyMove: 'no', videoHold: 'no' }).level).toBe('clear')
  })
  it('lists every matched signal in question order', () => {
    expect(assessAnswers({ videoHold: 'yes', secrecy: 'yes', moneyMove: 'yes' }).matched).toEqual([
      'secrecy',
      'moneyMove',
      'videoHold',
    ])
  })
})
