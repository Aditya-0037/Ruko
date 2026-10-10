import { useStore, type RukoState } from '../../state/store'

type PlanSnapshot = Pick<RukoState, 'setup' | 'people' | 'rules' | 'sharing' | 'incident' | 'goldenHour'>

/** Copy of everything the person typed, so "Try the demo" and "Start again" can offer Undo instead of a confirm dialog. */
export function snapshotPlan(): PlanSnapshot {
  const { setup, people, rules, sharing, incident, goldenHour } = useStore.getState()
  return { setup, people, rules, sharing, incident, goldenHour }
}

export function restorePlan(snapshot: PlanSnapshot) {
  useStore.setState(snapshot)
}
