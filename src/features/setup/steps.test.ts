import { describe, expect, it } from 'vitest'
import { defaultSetup } from '../../state/store'
import { editPath, editReturnPath, isSetupStep, nextStep, prevStep, resumeStep } from './steps'

describe('setup steps', () => {
  it('knows the order and the edges', () => {
    expect(isSetupStep('code-word')).toBe(true)
    expect(isSetupStep('nope')).toBe(false)
    expect(isSetupStep(undefined)).toBe(false)
    expect(prevStep('language')).toBeNull()
    expect(nextStep('language')).toBe('name')
    expect(nextStep('sharing')).toBe('done')
    expect(nextStep('done')).toBeNull()
  })

  it('builds edit links that return to where they started', () => {
    expect(editPath('rules', 'home')).toBe('/setup/rules?from=home')
    expect(editReturnPath('home')).toBe('/')
    expect(editReturnPath('done')).toBe('/setup/done')
    expect(editReturnPath(null)).toBeNull()
  })

  it('resumes at the first unanswered question', () => {
    const person = { id: 'p', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }
    const rule = { id: 'r', enabled: true, payee: 'new' as const, minAmount: 10000, waitMinutes: 60, askPersonId: 'p' }
    expect(resumeStep({ setup: defaultSetup, people: [], rules: [] })).toBe('language')
    const named = { ...defaultSetup, elderName: 'Kamla' }
    expect(resumeStep({ setup: named, people: [], rules: [] })).toBe('person')
    expect(resumeStep({ setup: named, people: [person], rules: [] })).toBe('rules')
    expect(resumeStep({ setup: named, people: [person], rules: [rule] })).toBe('code-word')
    expect(resumeStep({ setup: { ...named, codeWord: 'Imli' }, people: [person], rules: [rule] })).toBe('sharing')
  })
})
