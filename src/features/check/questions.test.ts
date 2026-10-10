import { describe, expect, it } from 'vitest'
import { dictionaries } from '../../i18n/dictionaries'
import {
  answerLabelKey,
  backPath,
  nextPath,
  parseStep,
  QUESTIONS,
  signalAt,
  stepOf,
  TOTAL_QUESTIONS,
} from './questions'
import { strings } from './strings'

describe('script check navigation', () => {
  it('asks the three signals in order', () => {
    expect(QUESTIONS).toEqual(['secrecy', 'moneyMove', 'videoHold'])
    expect(TOTAL_QUESTIONS).toBe(3)
    expect(signalAt(2)).toBe('moneyMove')
    expect(stepOf('videoHold')).toBe(3)
  })

  it('accepts only steps 1 to 3', () => {
    expect(parseStep('1')).toBe(1)
    expect(parseStep('3')).toBe(3)
    for (const bad of [undefined, '', '0', '4', '01', '1.5', 'abc', '-1']) {
      expect(parseStep(bad)).toBeNull()
    }
  })

  it('continues to the next question, then the result; back goes to the previous one, then the calm card', () => {
    expect(nextPath(1)).toBe('/check/2')
    expect(nextPath(3)).toBe('/check/result')
    expect(backPath(2)).toBe('/check/1')
    expect(backPath(1)).toBe('/pause')
  })

  it('labels every kind of answer', () => {
    expect(answerLabelKey('yes')).toBe('common.yes')
    expect(answerLabelKey('no')).toBe('common.no')
    expect(answerLabelKey('unsure')).toBe('common.notSure')
    expect(answerLabelKey(undefined)).toBe('check.answer.notAnswered')
  })
})

describe('check strings', () => {
  it('has every documented key for every signal, in both languages', () => {
    for (const id of QUESTIONS) {
      for (const key of [`check.q.${id}`, `check.q.${id}.help`, `check.reason.${id}`, `check.fact.${id}`, `check.unsure.${id}`, `check.missing.${id}`, `check.topic.${id}`]) {
        expect(strings.en[key], key).toBeTruthy()
        expect(strings.hi[key], key).toBeTruthy()
      }
    }
  })

  it('keeps English and Hindi in step, with the same placeholders', () => {
    expect(Object.keys(strings.hi).sort()).toEqual(Object.keys(strings.en).sort())
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
    for (const key of Object.keys(strings.en)) {
      expect(vars(strings.hi[key]), key).toBe(vars(strings.en[key]))
    }
  })

  it('writes Hindi in Devanagari', () => {
    for (const [key, value] of Object.entries(strings.hi)) {
      expect(/[ऀ-ॿ]/.test(value), key).toBe(true)
    }
  })

  it('every Easy Read variant has a base string', () => {
    for (const key of Object.keys(strings.en).filter((k) => k.endsWith('.easy'))) {
      expect(strings.en[key.slice(0, -'.easy'.length)], key).toBeTruthy()
    }
  })

  it('uses the shared Yes / No / Not sure labels that exist in the dictionary', () => {
    for (const key of ['common.yes', 'common.no', 'common.notSure', 'common.continue']) {
      expect(dictionaries.en[key]).toBeTruthy()
      expect(dictionaries.hi[key]).toBeTruthy()
    }
  })
})
