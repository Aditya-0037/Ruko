export type Lang = 'en' | 'hi'

export type TextScale = 1 | 1.15 | 1.3 | 1.5 | 1.75 | 2

export interface Prefs {
  lang: Lang
  /** 1 = 100% … 2 = 200%. Applied as --text-scale on <html>. */
  textScale: TextScale
  contrast: 'standard' | 'high'
  /** Shorter sentences, more spacing, icons beside text. */
  easyRead: boolean
  /** Read key screens aloud automatically (a Listen button is always available). */
  readAloud: boolean
  /** 'system' follows prefers-reduced-motion. */
  motion: 'system' | 'reduce' | 'full'
  /** Judge-facing design rationale callouts on every screen. */
  designNotes: boolean
}

export interface SetupState {
  elderName: string
  completed: boolean
  /** A word only the family knows — asked when a "relative" calls in panic (deepfake defence). */
  codeWord: string
  drillCompletedAt: number | null
}

export interface TrustedPerson {
  id: string
  name: string
  relation: string
  phone: string
}

/**
 * A calm-moment rule: chosen by the elder while calm, for her frightened future self.
 * Example: "new person + over ₹10,000 → wait 60 minutes and ask Rahul".
 */
export interface CalmRule {
  id: string
  enabled: boolean
  payee: 'new' | 'any'
  minAmount: number
  waitMinutes: number
  askPersonId: string | null
}

/** What family may see. The elder controls this and can switch it off in one tap. */
export interface SharingState {
  alertsDuringCall: boolean
  transferPauses: boolean
}

export type CheckAnswer = 'yes' | 'no' | 'unsure'
export type SignalId = 'secrecy' | 'moneyMove' | 'videoHold'

export type TransferStatus = 'paused' | 'cancelled' | 'approved' | 'blocked' | 'sent'

export interface TransferRequest {
  amount: number
  payeeName: string
  payeeIsNew: boolean
  requestedAt: number
  status: TransferStatus
  /** Rule that paused it, if any. */
  ruleId: string | null
  /** When the protective wait ends (ms epoch), if paused. */
  unlockAt: number | null
  askPersonId: string | null
}

export type FamilyDecision = 'calling' | 'approve' | 'block'

export interface IncidentState {
  /** null = no incident in progress. */
  id: string | null
  startedAt: number | null
  callActive: boolean
  callStartedAt: number | null
  /** Who the simulated caller claims to be, e.g. "CBI Mumbai". */
  callerLabel: string
  pauseOpenedAt: number | null
  answers: Partial<Record<SignalId, CheckAnswer>>
  alertSentAt: number | null
  alertPersonId: string | null
  familySeenAt: number | null
  familyDecision: FamilyDecision | null
  familyDecidedAt: number | null
  transfer: TransferRequest | null
}

export interface Evidence {
  amount: string
  transactionId: string
  paidAt: string
  scammerNumber: string
  paidTo: string
  bankName: string
  notes: string
}

/** Golden hour status steps, in order. */
export type StatusStep = 'reported' | 'bankAsked' | 'onHold' | 'policeOrder' | 'refund'

export interface GoldenHourState {
  startedAt: number | null
  called1930: boolean
  called1930At: number | null
  evidence: Evidence
  checklist: Record<string, boolean>
  ackNumber: string
  statusStep: StatusStep
}
