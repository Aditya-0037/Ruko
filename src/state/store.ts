import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createId } from '../lib/ids'
import { evaluateTransfer } from '../lib/rules'
import { safeStorage } from '../lib/safeStorage'
import type {
  CalmRule,
  CheckAnswer,
  Evidence,
  FamilyDecision,
  GoldenHourState,
  IncidentState,
  Prefs,
  SetupState,
  SharingState,
  SignalId,
  StatusStep,
  TransferRequest,
  TrustedPerson,
} from './types'

export const STORE_KEY = 'ruko:v1'

/* ---------------- defaults ---------------- */

export const defaultPrefs: Prefs = {
  lang: 'en',
  textScale: 1,
  contrast: 'standard',
  easyRead: false,
  readAloud: false,
  motion: 'system',
  designNotes: false,
}

export const defaultSetup: SetupState = {
  elderName: '',
  completed: false,
  codeWord: '',
  drillCompletedAt: null,
}

export const defaultSharing: SharingState = {
  alertsDuringCall: true,
  transferPauses: true,
}

export const emptyIncident: IncidentState = {
  id: null,
  startedAt: null,
  callActive: false,
  callStartedAt: null,
  callerLabel: '',
  pauseOpenedAt: null,
  answers: {},
  alertSentAt: null,
  alertPersonId: null,
  familySeenAt: null,
  familyDecision: null,
  familyDecidedAt: null,
  transfer: null,
}

export const emptyEvidence: Evidence = {
  amount: '',
  transactionId: '',
  paidAt: '',
  scammerNumber: '',
  paidTo: '',
  bankName: '',
  notes: '',
}

export const emptyGoldenHour: GoldenHourState = {
  startedAt: null,
  called1930: false,
  called1930At: null,
  evidence: emptyEvidence,
  checklist: {},
  ackNumber: '',
  statusStep: 'reported',
}

/* ---------------- shape ---------------- */

export interface RukoState {
  prefs: Prefs
  setup: SetupState
  people: TrustedPerson[]
  rules: CalmRule[]
  sharing: SharingState
  incident: IncidentState
  goldenHour: GoldenHourState

  // prefs
  setPrefs: (patch: Partial<Prefs>) => void

  // setup
  setElderName: (name: string) => void
  setCodeWord: (word: string) => void
  completeSetup: () => void
  markDrillDone: () => void

  // trusted people
  addPerson: (p: Omit<TrustedPerson, 'id'>) => TrustedPerson
  updatePerson: (id: string, patch: Partial<Omit<TrustedPerson, 'id'>>) => void
  /** Returns the removed person and their index so an Undo toast can restore it. */
  removePerson: (id: string) => { person: TrustedPerson; index: number } | null
  restorePerson: (person: TrustedPerson, index: number) => void

  // calm-moment rules
  addRule: (r: Omit<CalmRule, 'id'>) => CalmRule
  updateRule: (id: string, patch: Partial<Omit<CalmRule, 'id'>>) => void
  removeRule: (id: string) => { rule: CalmRule; index: number } | null
  restoreRule: (rule: CalmRule, index: number) => void

  // sharing
  setSharing: (patch: Partial<SharingState>) => void

  // incident (during)
  startCall: (callerLabel?: string) => void
  endCall: () => void
  openPause: () => void
  answerCheck: (id: SignalId, answer: CheckAnswer) => void
  resetAnswers: () => void
  sendAlert: (personId?: string) => void
  /** Runs the calm-moment rules. Returns the stored request (status 'paused' or 'sent'). */
  requestTransfer: (t: { amount: number; payeeName: string; payeeIsNew: boolean }) => TransferRequest
  cancelTransfer: () => void
  /** Called from the family phone. */
  familySeen: () => void
  familyDecide: (decision: FamilyDecision) => void
  clearIncident: () => void

  // golden hour (after)
  startGoldenHour: () => void
  mark1930Called: () => void
  updateEvidence: (patch: Partial<Evidence>) => void
  toggleChecklist: (key: string, value?: boolean) => void
  setAckNumber: (ack: string) => void
  setStatusStep: (step: StatusStep) => void
  resetGoldenHour: () => void

  // demo
  loadDemoProfile: () => void
  resetAll: () => void
}

/* ---------------- demo profile ---------------- */

export const DEMO_PERSON_ID = 'person_rahul'

export function demoProfile(): Pick<RukoState, 'setup' | 'people' | 'rules' | 'sharing'> {
  return {
    setup: { elderName: 'Kamla Devi', completed: true, codeWord: 'Gulmohar', drillCompletedAt: null },
    people: [{ id: DEMO_PERSON_ID, name: 'Rahul', relation: 'Son', phone: '+91 98765 43210' }],
    rules: [
      {
        id: 'rule_default',
        enabled: true,
        payee: 'new',
        minAmount: 10000,
        waitMinutes: 60,
        askPersonId: DEMO_PERSON_ID,
      },
    ],
    sharing: { ...defaultSharing },
  }
}

/* ---------------- store ---------------- */

const now = () => Date.now()

export const useStore = create<RukoState>()(
  persist(
    (set, get) => ({
      prefs: defaultPrefs,
      setup: defaultSetup,
      people: [],
      rules: [],
      sharing: defaultSharing,
      incident: emptyIncident,
      goldenHour: emptyGoldenHour,

      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

      setElderName: (elderName) => set((s) => ({ setup: { ...s.setup, elderName } })),
      setCodeWord: (codeWord) => set((s) => ({ setup: { ...s.setup, codeWord } })),
      completeSetup: () => set((s) => ({ setup: { ...s.setup, completed: true } })),
      markDrillDone: () => set((s) => ({ setup: { ...s.setup, drillCompletedAt: now() } })),

      addPerson: (p) => {
        const person = { ...p, id: createId('person') }
        set((s) => ({ people: [...s.people, person] }))
        return person
      },
      updatePerson: (id, patch) =>
        set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePerson: (id) => {
        const index = get().people.findIndex((p) => p.id === id)
        if (index < 0) return null
        const person = get().people[index]
        set((s) => ({ people: s.people.filter((p) => p.id !== id) }))
        return { person, index }
      },
      restorePerson: (person, index) =>
        set((s) => {
          if (s.people.some((p) => p.id === person.id)) return s
          const people = [...s.people]
          people.splice(Math.min(index, people.length), 0, person)
          return { people }
        }),

      addRule: (r) => {
        const rule = { ...r, id: createId('rule') }
        set((s) => ({ rules: [...s.rules, rule] }))
        return rule
      },
      updateRule: (id, patch) =>
        set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRule: (id) => {
        const index = get().rules.findIndex((r) => r.id === id)
        if (index < 0) return null
        const rule = get().rules[index]
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }))
        return { rule, index }
      },
      restoreRule: (rule, index) =>
        set((s) => {
          if (s.rules.some((r) => r.id === rule.id)) return s
          const rules = [...s.rules]
          rules.splice(Math.min(index, rules.length), 0, rule)
          return { rules }
        }),

      setSharing: (patch) => set((s) => ({ sharing: { ...s.sharing, ...patch } })),

      startCall: (callerLabel = 'CBI Mumbai') =>
        set(() => ({
          incident: {
            ...emptyIncident,
            id: createId('incident'),
            startedAt: now(),
            callActive: true,
            callStartedAt: now(),
            callerLabel,
          },
        })),
      endCall: () => set((s) => ({ incident: { ...s.incident, callActive: false } })),
      openPause: () =>
        set((s) => ({
          incident: {
            ...s.incident,
            id: s.incident.id ?? createId('incident'),
            startedAt: s.incident.startedAt ?? now(),
            pauseOpenedAt: s.incident.pauseOpenedAt ?? now(),
          },
        })),
      answerCheck: (id, answer) =>
        set((s) => ({ incident: { ...s.incident, answers: { ...s.incident.answers, [id]: answer } } })),
      resetAnswers: () => set((s) => ({ incident: { ...s.incident, answers: {} } })),
      sendAlert: (personId) =>
        set((s) => ({
          incident: {
            ...s.incident,
            id: s.incident.id ?? createId('incident'),
            startedAt: s.incident.startedAt ?? now(),
            alertSentAt: now(),
            alertPersonId: personId ?? s.people[0]?.id ?? null,
          },
        })),
      requestTransfer: ({ amount, payeeName, payeeIsNew }) => {
        const { rules, people } = get()
        const decision = evaluateTransfer({ amount, payeeIsNew }, rules, people)
        const requestedAt = now()
        const transfer: TransferRequest =
          decision.action === 'pause'
            ? {
                amount,
                payeeName,
                payeeIsNew,
                requestedAt,
                status: 'paused',
                ruleId: decision.rule.id,
                unlockAt: requestedAt + decision.waitMinutes * 60_000,
                askPersonId: decision.askPerson?.id ?? null,
              }
            : {
                amount,
                payeeName,
                payeeIsNew,
                requestedAt,
                status: 'sent',
                ruleId: null,
                unlockAt: null,
                askPersonId: null,
              }
        set((s) => ({
          incident: {
            ...s.incident,
            id: s.incident.id ?? createId('incident'),
            startedAt: s.incident.startedAt ?? requestedAt,
            transfer,
          },
        }))
        return transfer
      },
      cancelTransfer: () =>
        set((s) =>
          s.incident.transfer
            ? { incident: { ...s.incident, transfer: { ...s.incident.transfer, status: 'cancelled' } } }
            : s,
        ),
      familySeen: () =>
        set((s) => ({ incident: { ...s.incident, familySeenAt: s.incident.familySeenAt ?? now() } })),
      familyDecide: (decision) =>
        set((s) => {
          const t = s.incident.transfer
          const transfer =
            t && t.status === 'paused'
              ? { ...t, status: decision === 'approve' ? ('approved' as const) : decision === 'block' ? ('blocked' as const) : t.status }
              : t
          return {
            incident: {
              ...s.incident,
              familySeenAt: s.incident.familySeenAt ?? now(),
              familyDecision: decision,
              familyDecidedAt: now(),
              transfer,
            },
          }
        }),
      clearIncident: () => set(() => ({ incident: emptyIncident })),

      startGoldenHour: () =>
        set((s) => ({ goldenHour: { ...s.goldenHour, startedAt: s.goldenHour.startedAt ?? now() } })),
      mark1930Called: () =>
        set((s) => ({ goldenHour: { ...s.goldenHour, called1930: true, called1930At: now() } })),
      updateEvidence: (patch) =>
        set((s) => ({ goldenHour: { ...s.goldenHour, evidence: { ...s.goldenHour.evidence, ...patch } } })),
      toggleChecklist: (key, value) =>
        set((s) => ({
          goldenHour: {
            ...s.goldenHour,
            checklist: { ...s.goldenHour.checklist, [key]: value ?? !s.goldenHour.checklist[key] },
          },
        })),
      setAckNumber: (ackNumber) => set((s) => ({ goldenHour: { ...s.goldenHour, ackNumber } })),
      setStatusStep: (statusStep) => set((s) => ({ goldenHour: { ...s.goldenHour, statusStep } })),
      resetGoldenHour: () => set(() => ({ goldenHour: emptyGoldenHour })),

      loadDemoProfile: () =>
        set(() => ({ ...demoProfile(), incident: emptyIncident, goldenHour: emptyGoldenHour })),
      resetAll: () =>
        set((s) => ({
          prefs: s.prefs, // keep accessibility preferences — never surprise the user
          setup: defaultSetup,
          people: [],
          rules: [],
          sharing: defaultSharing,
          incident: emptyIncident,
          goldenHour: emptyGoldenHour,
        })),
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        prefs: s.prefs,
        setup: s.setup,
        people: s.people,
        rules: s.rules,
        sharing: s.sharing,
        incident: s.incident,
        goldenHour: s.goldenHour,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<RukoState>
        return {
          ...current,
          ...p,
          prefs: { ...current.prefs, ...p.prefs },
          setup: { ...current.setup, ...p.setup },
          sharing: { ...current.sharing, ...p.sharing },
          incident: { ...current.incident, ...p.incident },
          goldenHour: {
            ...current.goldenHour,
            ...p.goldenHour,
            evidence: { ...current.goldenHour.evidence, ...p.goldenHour?.evidence },
          },
        }
      },
    },
  ),
)

/* ---------------- selectors ---------------- */

export const selectTrustedPerson = (s: RukoState, id?: string | null): TrustedPerson | null =>
  s.people.find((p) => p.id === id) ?? s.people[0] ?? null
