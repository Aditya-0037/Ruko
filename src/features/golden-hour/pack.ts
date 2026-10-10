import { dictionaries } from '../../i18n/dictionaries'
import { translate } from '../../i18n/translate'
import { formatDateTime, formatINR, formatTime, parseAmount } from '../../lib/format'
import type { GoldenHourState, IncidentState, Lang, TrustedPerson } from '../../state/types'
import { moneyLeft, parseLocalInput, sameDay, type T } from './model'

/**
 * The complaint pack: everything the person has written plus what Ruko saw on this phone,
 * as one structured document. Rendered on screen, copied, shared, printed and downloaded
 * from the same model, so every copy says exactly the same thing.
 */

export interface PackRow {
  id: string
  label: string
  /** null = not known yet (shown as "Not known yet", never as a blank). */
  value: string | null
  /** Numbers and IDs: shown with tabular figures so they are easy to read out. */
  numeric?: boolean
}

export interface PackSection {
  id: 'person' | 'payment' | 'caller'
  heading: string
  rows: PackRow[]
}

export interface PackEvent {
  at: number
  time: string
  text: string
}

export interface ComplaintPack {
  lang: Lang
  title: string
  prepared: string
  notKnown: string
  person: PackSection
  summaryHeading: string
  summary: string
  payment: PackSection
  caller: PackSection
  timelineHeading: string
  timeline: PackEvent[]
  timelineEmpty: string
  footer: string
}

export interface PackInput {
  elderName: string
  /** The family contact to list (first trusted person). */
  person: TrustedPerson | null
  /** Everyone, to name who an alert went to. */
  people: TrustedPerson[]
  incident: IncidentState
  goldenHour: GoldenHourState
}

/** A translator fixed to one language, so the pack can be made in English on a Hindi screen. */
export function packTranslator(lang: Lang): T {
  return (key, vars) => translate(dictionaries, lang, key, { vars })
}

/** The practice call's default caller, translated by the call feature when a translation exists. */
const DEFAULT_CALLER = 'CBI Mumbai'

function callerName(label: string, tr: T): string | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  if (trimmed === DEFAULT_CALLER) {
    const translated = tr('call.agency')
    return translated === 'call.agency' ? trimmed : translated
  }
  return trimmed
}

const orNull = (s: string) => (s.trim() ? s.trim() : null)

export function buildPack(input: PackInput, lang: Lang, now: number): ComplaintPack {
  const tr = packTranslator(lang)
  const { evidence, ackNumber, startedAt, called1930, called1930At } = input.goldenHour
  const { incident } = input

  const amountNumber = parseAmount(evidence.amount)
  const amount = amountNumber > 0 ? formatINR(amountNumber, lang) : orNull(evidence.amount)
  const paidAtMs = parseLocalInput(evidence.paidAt)
  const paidAt = paidAtMs !== null ? formatDateTime(paidAtMs, lang) : orNull(evidence.paidAt)
  const caller = callerName(incident.callerLabel, tr)

  /* ---- what happened, in her own words ---- */
  const summary = [
    caller ? tr('goldenHour.pack.doc.summary.call', { caller }) : tr('goldenHour.pack.doc.summary.callUnknown'),
    tr('goldenHour.pack.doc.summary.pressure'),
  ]
  if (amount) {
    summary.push(
      paidAt
        ? tr('goldenHour.pack.doc.summary.paidOn', { amount, when: paidAt })
        : tr('goldenHour.pack.doc.summary.paid', { amount }),
    )
  }

  /* ---- timeline from what Ruko saw ---- */
  const events: { at: number; text: string }[] = []
  if (incident.callStartedAt) {
    events.push({
      at: incident.callStartedAt,
      text: caller ? tr('goldenHour.pack.event.call', { caller }) : tr('goldenHour.pack.event.callUnknown'),
    })
  }
  if (incident.pauseOpenedAt) events.push({ at: incident.pauseOpenedAt, text: tr('goldenHour.pack.event.pause') })
  if (incident.alertSentAt) {
    const to = input.people.find((p) => p.id === incident.alertPersonId)
    events.push({
      at: incident.alertSentAt,
      text: to ? tr('goldenHour.pack.event.alert', { name: to.name }) : tr('goldenHour.pack.event.alertUnknown'),
    })
  }
  const transfer = incident.transfer
  if (transfer) {
    const vars = { amount: formatINR(transfer.amount, lang), payee: transfer.payeeName }
    events.push({
      at: transfer.requestedAt,
      text: moneyLeft(transfer)
        ? tr('goldenHour.pack.event.transferSent', vars)
        : tr('goldenHour.pack.event.transferPaused', vars),
    })
  }
  if (paidAtMs !== null) events.push({ at: paidAtMs, text: tr('goldenHour.pack.event.paid') })
  if (startedAt) events.push({ at: startedAt, text: tr('goldenHour.pack.event.goldenHour') })
  if (called1930 && called1930At) events.push({ at: called1930At, text: tr('goldenHour.pack.event.called1930') })
  events.sort((a, b) => a.at - b.at)

  const person = input.person
  return {
    lang,
    title: tr('goldenHour.pack.doc.title'),
    prepared: tr('goldenHour.pack.doc.prepared', { date: formatDateTime(now, lang) }),
    notKnown: tr('goldenHour.pack.notKnown'),
    person: {
      id: 'person',
      heading: tr('goldenHour.pack.doc.person'),
      rows: [
        { id: 'name', label: tr('goldenHour.pack.doc.name'), value: orNull(input.elderName) },
        {
          id: 'family',
          label: tr('goldenHour.pack.doc.family'),
          value: person
            ? tr('goldenHour.pack.doc.familyValue', { name: person.name, relation: person.relation, phone: person.phone })
            : null,
        },
        { id: 'ack', label: tr('goldenHour.pack.doc.ack'), value: orNull(ackNumber), numeric: true },
      ],
    },
    summaryHeading: tr('goldenHour.pack.doc.summaryTitle'),
    summary: summary.join(' '),
    payment: {
      id: 'payment',
      heading: tr('goldenHour.pack.doc.payment'),
      rows: [
        { id: 'amount', label: tr('goldenHour.pack.doc.amount'), value: amount, numeric: true },
        { id: 'txn', label: tr('goldenHour.pack.doc.txn'), value: orNull(evidence.transactionId), numeric: true },
        { id: 'paidAt', label: tr('goldenHour.pack.doc.paidAt'), value: paidAt },
        { id: 'paidTo', label: tr('goldenHour.pack.doc.paidTo'), value: orNull(evidence.paidTo) },
        { id: 'bank', label: tr('goldenHour.pack.doc.bank'), value: orNull(evidence.bankName) },
      ],
    },
    caller: {
      id: 'caller',
      heading: tr('goldenHour.pack.doc.caller'),
      rows: [
        { id: 'number', label: tr('goldenHour.pack.doc.number'), value: orNull(evidence.scammerNumber), numeric: true },
        { id: 'claimed', label: tr('goldenHour.pack.doc.claimed'), value: caller },
        { id: 'notes', label: tr('goldenHour.pack.doc.notes'), value: orNull(evidence.notes) },
      ],
    },
    timelineHeading: tr('goldenHour.pack.doc.timeline'),
    timeline: events.map((e) => ({
      at: e.at,
      time: sameDay(e.at, now) ? formatTime(e.at, lang) : formatDateTime(e.at, lang),
      text: e.text,
    })),
    timelineEmpty: tr('goldenHour.pack.doc.timelineEmpty'),
    footer: tr('goldenHour.pack.doc.footer'),
  }
}

/** Plain text for copy, share and download: readable in WhatsApp, SMS, email or a web form. */
export function packToText(pack: ComplaintPack): string {
  const locale = pack.lang === 'hi' ? 'hi-IN' : 'en-IN'
  const heading = (h: string) => ['', h.toLocaleUpperCase(locale)]
  const rows = (section: PackSection) => [
    ...heading(section.heading),
    ...section.rows.map((r) => `${r.label}: ${r.value ?? pack.notKnown}`),
  ]
  return [
    pack.title.toLocaleUpperCase(locale),
    pack.prepared,
    ...rows(pack.person),
    ...heading(pack.summaryHeading),
    pack.summary,
    ...rows(pack.payment),
    ...rows(pack.caller),
    ...heading(pack.timelineHeading),
    ...(pack.timeline.length ? pack.timeline.map((e) => `${e.time} — ${e.text}`) : [pack.timelineEmpty]),
    '',
    pack.footer,
  ].join('\n')
}

/** "ruko-complaint-pack-2026-10-10.txt" */
export function packFileName(now: number): string {
  const d = new Date(now)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `ruko-complaint-pack-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.txt`
}
