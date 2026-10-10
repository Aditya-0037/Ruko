import { describe, expect, it } from 'vitest'
import { DEMO_PERSON_ID, useStore } from './store'

const s = () => useStore.getState()

describe('store', () => {
  it('loads the demo profile', () => {
    s().loadDemoProfile()
    expect(s().setup.elderName).toBe('Kamla Devi')
    expect(s().people[0].id).toBe(DEMO_PERSON_ID)
    expect(s().rules).toHaveLength(1)
  })

  it('pauses a large transfer to a new person under the default rule', () => {
    s().loadDemoProfile()
    const t = s().requestTransfer({ amount: 200000, payeeName: 'RBI Safe Account', payeeIsNew: true })
    expect(t.status).toBe('paused')
    expect(t.unlockAt! - t.requestedAt).toBe(60 * 60_000)
    expect(t.askPersonId).toBe(DEMO_PERSON_ID)
  })

  it('lets a small transfer through', () => {
    s().loadDemoProfile()
    expect(s().requestTransfer({ amount: 500, payeeName: 'Sabzi wala', payeeIsNew: true }).status).toBe('sent')
  })

  it('family block and approve resolve a paused transfer', () => {
    s().loadDemoProfile()
    s().requestTransfer({ amount: 200000, payeeName: 'X', payeeIsNew: true })
    s().familyDecide('block')
    expect(s().incident.transfer?.status).toBe('blocked')
    expect(s().incident.familyDecision).toBe('block')
  })

  it('"calling" does not change the transfer', () => {
    s().loadDemoProfile()
    s().requestTransfer({ amount: 200000, payeeName: 'X', payeeIsNew: true })
    s().familyDecide('calling')
    expect(s().incident.transfer?.status).toBe('paused')
  })

  it('removing a person can be undone at the same position', () => {
    s().loadDemoProfile()
    s().addPerson({ name: 'Priya', relation: 'Daughter', phone: '+91 90000 00000' })
    const removed = s().removePerson(DEMO_PERSON_ID)!
    expect(s().people.map((p) => p.name)).toEqual(['Priya'])
    s().restorePerson(removed.person, removed.index)
    expect(s().people.map((p) => p.name)).toEqual(['Rahul', 'Priya'])
  })

  it('startCall begins a fresh incident', () => {
    s().sendAlert()
    s().startCall('CBI Mumbai')
    expect(s().incident.callActive).toBe(true)
    expect(s().incident.alertSentAt).toBeNull()
    expect(s().incident.callerLabel).toBe('CBI Mumbai')
  })

  it('resetAll keeps accessibility preferences', () => {
    s().setPrefs({ textScale: 1.5, lang: 'hi' })
    s().loadDemoProfile()
    s().resetAll()
    expect(s().prefs.textScale).toBe(1.5)
    expect(s().prefs.lang).toBe('hi')
    expect(s().people).toEqual([])
  })
})
