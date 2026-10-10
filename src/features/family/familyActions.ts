import { useEffect } from 'react'
import { useStore } from '../../state/store'
import type { FamilyDecision, TrustedPerson } from '../../state/types'

type T = (key: string, vars?: Record<string, string | number>) => string

/** A short beat before "seen" is reported, so the change is visible on the other phone in the demo. */
export const SEEN_DELAY_MS = 1200

/**
 * How the trusted person refers to the elder: "Maa" for a son or daughter, otherwise her name.
 * Relations are stored in English by setup ("Son", "Daughter", …).
 */
export function elderRef(t: T, viewer: TrustedPerson | null, elderName: string): string {
  if (viewer && (viewer.relation === 'Son' || viewer.relation === 'Daughter')) return t('family.maa')
  return elderName.trim() || t('family.elderFallback')
}

/**
 * Report "seen" once something is actually on screen for the trusted person (and the tab is
 * visible). Runs again when a new transfer arrives, because the shared familySeen() only records
 * the first look of an incident.
 */
export function useMarkSeen(visible: boolean, transferRequestedAt: number | null): void {
  useEffect(() => {
    if (!visible) return
    let timer: number | undefined
    const mark = () => {
      timer = window.setTimeout(() => {
        const { incident, familySeen } = useStore.getState()
        if (!incident.id) return
        familySeen()
        markTransferSeen()
      }, SEEN_DELAY_MS)
    }
    if (document.visibilityState === 'hidden') {
      const onVisible = () => {
        if (document.visibilityState !== 'visible') return
        document.removeEventListener('visibilitychange', onVisible)
        mark()
      }
      document.addEventListener('visibilitychange', onVisible)
      return () => {
        document.removeEventListener('visibilitychange', onVisible)
        window.clearTimeout(timer)
      }
    }
    mark()
    return () => window.clearTimeout(timer)
  }, [visible, transferRequestedAt])
}

/* ---------------- local store helpers ----------------
 * The shared store has no actions for these yet; they stay in this folder until the integrator
 * promotes them (see sharedChangeRequests).
 */

/** Record that the trusted person saw the current transfer (familySeen keeps only the first look). */
export function markTransferSeen(now = Date.now()): void {
  useStore.setState((s) => {
    const tr = s.incident.transfer
    if (!tr) return s
    if (s.incident.familySeenAt !== null && s.incident.familySeenAt >= tr.requestedAt) return s
    return { incident: { ...s.incident, familySeenAt: now } }
  })
}

export interface DecisionSnapshot {
  incidentId: string | null
  decision: FamilyDecision | null
  decidedAt: number | null
}

export function snapshotDecision(): DecisionSnapshot {
  const { incident } = useStore.getState()
  return { incidentId: incident.id, decision: incident.familyDecision, decidedAt: incident.familyDecidedAt }
}

/**
 * Undo an approval: the transfer goes back to paused, as if Approve was never pressed.
 * Does nothing if the money was already sent or the incident has changed.
 */
export function undoApproval(snap: DecisionSnapshot): boolean {
  let restored = false
  useStore.setState((s) => {
    const tr = s.incident.transfer
    if (s.incident.id !== snap.incidentId || !tr || tr.status !== 'approved') return s
    restored = true
    return {
      incident: {
        ...s.incident,
        transfer: { ...tr, status: 'paused' as const },
        familyDecision: snap.decision,
        familyDecidedAt: snap.decidedAt,
      },
    }
  })
  return restored
}
