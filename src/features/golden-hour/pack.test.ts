import { describe, expect, it } from 'vitest'
import { emptyGoldenHour, emptyIncident } from '../../state/store'
import type { GoldenHourState, IncidentState, TrustedPerson } from '../../state/types'
import { amountInWords, countDone, elapsedText, parseLocalInput, statusState, toLocalInputValue } from './model'
import { buildPack, packFileName, packToText, packTranslator, type PackInput } from './pack'

const rahul: TrustedPerson = { id: 'person_rahul', name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }
const at = (h: number, m: number) => new Date(2026, 9, 10, h, m).getTime()
const NOW = at(11, 0)

function input(patch: { incident?: Partial<IncidentState>; goldenHour?: Partial<GoldenHourState> } = {}): PackInput {
  return {
    elderName: 'Kamla Devi',
    person: rahul,
    people: [rahul],
    incident: { ...emptyIncident, ...patch.incident },
    goldenHour: { ...emptyGoldenHour, ...patch.goldenHour, evidence: { ...emptyGoldenHour.evidence, ...patch.goldenHour?.evidence } },
  }
}

describe('buildPack', () => {
  it('says "Not known yet" for every empty field instead of leaving blanks', () => {
    const pack = buildPack(input(), 'en', NOW)
    const rows = [...pack.payment.rows, ...pack.caller.rows]
    expect(rows.every((r) => r.value === null)).toBe(true)
    expect(pack.notKnown).toBe('Not known yet')
    expect(pack.timeline).toEqual([])
    const text = packToText(pack)
    expect(text).toContain('Amount: Not known yet')
    expect(text).toContain('Transaction ID (UTR): Not known yet')
    expect(text).toContain('No events recorded on this phone yet.')
    expect(text).not.toMatch(/: $/m)
  })

  it('builds a first-person summary, payment rows and a sorted timeline from the evidence and incident', () => {
    const pack = buildPack(
      input({
        incident: {
          callStartedAt: at(10, 2),
          callerLabel: 'CBI Mumbai',
          pauseOpenedAt: at(10, 20),
          alertSentAt: at(10, 21),
          alertPersonId: 'person_rahul',
        },
        goldenHour: {
          startedAt: at(10, 40),
          called1930: true,
          called1930At: at(10, 42),
          ackNumber: '31410240012345',
          evidence: {
            amount: '2,00,000',
            transactionId: '412345678901',
            paidAt: '2026-10-10T10:15',
            paidTo: 'safe.rbi@okaxis',
            bankName: 'State Bank of India',
            scammerNumber: '+91 90000 11111',
            notes: '',
          },
        },
      }),
      'en',
      NOW,
    )
    expect(pack.title).toBe('Cyber fraud complaint — details')
    expect(pack.summary).toBe(
      'I got a video call from someone who said they were from CBI Mumbai. They said I was under “digital arrest” and pressured me to send money. I paid ₹2,00,000 on 10 Oct 2026, 10:15 am.',
    )
    const value = (id: string) => [...pack.person.rows, ...pack.payment.rows, ...pack.caller.rows].find((r) => r.id === id)?.value
    expect(value('name')).toBe('Kamla Devi')
    expect(value('family')).toBe('Rahul (Son), +91 98765 43210')
    expect(value('ack')).toBe('31410240012345')
    expect(value('amount')).toBe('₹2,00,000')
    expect(value('paidTo')).toBe('safe.rbi@okaxis')
    expect(value('claimed')).toBe('CBI Mumbai')
    expect(value('notes')).toBeNull()

    expect(pack.timeline.map((e) => e.text)).toEqual([
      'Call from “CBI Mumbai” started',
      'Money paid (as written in the evidence)',
      'Pressed Ruko to pause',
      'Alert sent to Rahul',
      'Started the golden-hour steps in Ruko',
      'Called 1930',
    ])
    expect(pack.timeline[0].time).toMatch(/10:02/)
  })

  it('names a transfer Ruko paused differently from one that went through', () => {
    const transfer = {
      amount: 200000,
      payeeName: 'RBI Safe Account',
      payeeIsNew: true,
      requestedAt: at(10, 30),
      ruleId: null,
      unlockAt: null,
      askPersonId: null,
    }
    const paused = buildPack(input({ incident: { transfer: { ...transfer, status: 'cancelled' } } }), 'en', NOW)
    expect(paused.timeline[0].text).toBe('Tried to send ₹2,00,000 to “RBI Safe Account”; Ruko paused it')
    const sent = buildPack(input({ incident: { transfer: { ...transfer, status: 'sent' } } }), 'en', NOW)
    expect(sent.timeline[0].text).toBe('Sent ₹2,00,000 to “RBI Safe Account”')
  })

  it('can be made in Hindi regardless of the screen language', () => {
    const pack = buildPack(input({ goldenHour: { evidence: { ...emptyGoldenHour.evidence, amount: '50000' } } }), 'hi', NOW)
    expect(pack.lang).toBe('hi')
    expect(pack.title).toBe('साइबर धोखाधड़ी की शिकायत — ब्योरा')
    expect(pack.notKnown).toBe('अभी पता नहीं')
    expect(pack.summary).toContain('मैंने ₹50,000 भेजे।')
    expect(packToText(pack)).toContain('रकम: ₹50,000')
  })

  it('falls back to a general summary when the caller is unknown', () => {
    const pack = buildPack(input(), 'en', NOW)
    expect(pack.summary).toBe(
      'I got a call from someone who said they were from the police or a government agency. They said I was under “digital arrest” and pressured me to send money.',
    )
  })

  it('names the download by date', () => {
    expect(packFileName(NOW)).toBe('ruko-complaint-pack-2026-10-10.txt')
  })
})

describe('golden hour model', () => {
  const t = packTranslator('en')

  it('words the elapsed time at minute granularity', () => {
    expect(elapsedText(t, 0)).toBe('Time since you started: less than a minute.')
    expect(elapsedText(t, 12)).toBe('Time since you started: 12 min.')
    expect(elapsedText(t, 61)).toBe('Time since you started: 1 hr 1 min.')
  })

  it('says amounts the Indian way', () => {
    expect(amountInWords(t, 200000)).toBe('2 lakh rupees')
    expect(amountInWords(t, 12034567)).toBe('1 crore 20 lakh 34 thousand 567 rupees')
    expect(amountInWords(packTranslator('hi'), 150000)).toBe('1 लाख 50 हज़ार रुपये')
  })

  it('round-trips datetime-local values in local time', () => {
    const ms = at(9, 5)
    expect(toLocalInputValue(ms)).toBe('2026-10-10T09:05')
    expect(parseLocalInput('2026-10-10T09:05')).toBe(ms)
    expect(parseLocalInput('yesterday evening')).toBeNull()
  })

  it('counts only the five steps and orders status steps', () => {
    expect(countDone({ report: true, bank: true, 'keep.sms': true })).toBe(2)
    expect(statusState('reported', 'onHold')).toBe('done')
    expect(statusState('onHold', 'onHold')).toBe('current')
    expect(statusState('refund', 'onHold')).toBe('upcoming')
  })
})
