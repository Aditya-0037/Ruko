import { useEffect, useId, useRef, useState } from 'react'
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { Button, Card, ChoiceGroup, DesignNote, Field, useToast } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import type { TrustedPerson } from '../../../state/types'
import { checkPhone, formatPhone, phoneErrorMessage } from '../phone'
import { RELATIONS, relationLabel, type Relation } from '../ruleText'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

type Values = Omit<TrustedPerson, 'id'>
type Message = { key: string; vars?: Record<string, string | number> }
type CardErrors = { name?: Message; phone?: Message }

/** A card on screen. Drafts live here until something is typed, then autosave into the store. */
interface Slot {
  key: string
  personId: string | null
  draft: Values
}

const EMPTY: Values = { name: '', relation: '', phone: '' }
const isEmpty = (v: Values) => !v.name.trim() && !v.phone.trim() && !v.relation

let draftCounter = 0
const newDraft = (): Slot => ({ key: `draft-${++draftCounter}`, personId: null, draft: EMPTY })

function initialSlots(people: TrustedPerson[]): Slot[] {
  return people.length ? people.map((p) => ({ key: p.id, personId: p.id, draft: EMPTY })) : [newDraft()]
}

const nameInputId = (key: string) => `person-${key}-name`

export function PersonStep() {
  const { t } = useT()
  const people = useStore((s) => s.people)
  const addPerson = useStore((s) => s.addPerson)
  const updatePerson = useStore((s) => s.updatePerson)
  const removePerson = useStore((s) => s.removePerson)
  const restorePerson = useStore((s) => s.restorePerson)
  const toast = useToast()

  const [slots, setSlots] = useState<Slot[]>(() => initialSlots(useStore.getState().people))
  const [errors, setErrors] = useState<Record<string, CardErrors>>({})
  const addRef = useRef<HTMLDivElement>(null)
  const focusNext = useRef<string | null>(null)

  // Move focus after cards are added or removed, once the DOM has the new card.
  useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = null
    if (target === 'add') addRef.current?.querySelector('button')?.focus()
    else document.getElementById(target)?.focus()
  })

  const valuesFor = (slot: Slot): Values => {
    if (!slot.personId) return slot.draft
    const p = people.find((x) => x.id === slot.personId)
    return p ? { name: p.name, relation: p.relation, phone: p.phone } : EMPTY
  }

  const clearError = (key: string, field: keyof CardErrors) =>
    setErrors((e) => (e[key]?.[field] ? { ...e, [key]: { ...e[key], [field]: undefined } } : e))

  /** Autosave: every change goes straight into the store (a draft is created on the first keystroke). */
  const change = (slot: Slot, patch: Partial<Values>) => {
    const next = { ...valuesFor(slot), ...patch }
    if (slot.personId) {
      if (isEmpty(next)) {
        // Everything was cleared: do not keep a blank person around for other screens to show.
        removePerson(slot.personId)
        setSlots((s) => s.map((x) => (x.key === slot.key ? { ...x, personId: null, draft: EMPTY } : x)))
      } else {
        updatePerson(slot.personId, patch)
      }
    } else if (isEmpty(next)) {
      setSlots((s) => s.map((x) => (x.key === slot.key ? { ...x, draft: next } : x)))
    } else {
      const created = addPerson(next)
      setSlots((s) => s.map((x) => (x.key === slot.key ? { ...x, personId: created.id, draft: EMPTY } : x)))
    }
    if ('name' in patch) clearError(slot.key, 'name')
    if ('phone' in patch) clearError(slot.key, 'phone')
  }

  const tidyPhone = (slot: Slot) => {
    if (!slot.personId) return
    const check = checkPhone(valuesFor(slot).phone)
    if (check.ok) updatePerson(slot.personId, { phone: formatPhone(check.digits) })
  }

  const addAnother = () => {
    const slot = newDraft()
    setSlots((s) => [...s, slot])
    focusNext.current = nameInputId(slot.key)
  }

  const remove = (slot: Slot) => {
    focusNext.current = 'add'
    setErrors((e) => {
      const rest = { ...e }
      delete rest[slot.key]
      return rest
    })
    if (!slot.personId) {
      setSlots((s) => {
        const rest = s.filter((x) => x.key !== slot.key)
        return rest.length ? rest : [newDraft()]
      })
      return
    }
    const removed = removePerson(slot.personId)
    setSlots((s) => {
      const rest = s.filter((x) => x.key !== slot.key)
      return rest.length ? rest : [newDraft()]
    })
    if (!removed) return
    const { person, index } = removed
    const name = person.name.trim()
    toast({
      message: name ? t('setup.person.removed', { name }) : t('setup.person.removedUnnamed'),
      actionLabel: t('common.undo'),
      onAction: () => {
        restorePerson(person, index)
        setSlots((s) => {
          if (s.some((x) => x.personId === person.id)) return s
          // Drop an untouched blank card that only appeared because the list became empty.
          const kept = s.filter((x) => x.personId || !isEmpty(x.draft))
          const at = Math.min(index, kept.length)
          return [...kept.slice(0, at), { key: person.id, personId: person.id, draft: EMPTY }, ...kept.slice(at)]
        })
      },
    })
  }

  const validate = () => {
    const current = useStore.getState().people
    const next: Record<string, CardErrors> = {}
    let complete = 0
    for (const slot of slots) {
      const stored = slot.personId ? current.find((p) => p.id === slot.personId) : undefined
      const v: Values = stored ?? slot.draft
      if (isEmpty(v)) continue
      const e: CardErrors = {}
      if (!v.name.trim()) e.name = { key: 'setup.person.nameError' }
      const check = checkPhone(v.phone)
      if (!check.ok) e.phone = phoneErrorMessage(check)
      if (e.name || e.phone) {
        next[slot.key] = e
      } else {
        complete += 1
        if (stored && check.ok) updatePerson(stored.id, { name: v.name.trim(), phone: formatPhone(check.digits) })
      }
    }
    if (complete === 0 && Object.keys(next).length === 0 && slots[0]) {
      next[slots[0].key] = { name: { key: 'setup.person.needOne' } }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <SetupLayout step="person" title={t('setup.person.title')} validate={validate}>
      <p className={styles.lead}>{t('setup.person.intro')}</p>
      <ol className={styles.cards} aria-label={t('setup.plan.people')}>
        {slots.map((slot, i) => (
          <li key={slot.key}>
            <PersonCard
              slotKey={slot.key}
              number={i + 1}
              values={valuesFor(slot)}
              errors={errors[slot.key]}
              canRemove={slots.length > 1 || !isEmpty(valuesFor(slot))}
              onChange={(patch) => change(slot, patch)}
              onPhoneBlur={() => tidyPhone(slot)}
              onRemove={() => remove(slot)}
            />
          </li>
        ))}
      </ol>
      <div ref={addRef}>
        <Button variant="secondary" fullWidth icon={<UserPlus />} onClick={addAnother}>
          {t('setup.person.add')}
        </Button>
      </div>
      <p className={styles.reassure}>
        <ShieldCheck aria-hidden="true" />
        <span>{t('setup.person.privacy')}</span>
      </p>
      <DesignNote title={t('setup.person.note.title')}>{t('setup.person.note.body')}</DesignNote>
    </SetupLayout>
  )
}

interface PersonCardProps {
  slotKey: string
  number: number
  values: Values
  errors?: CardErrors
  canRemove: boolean
  onChange: (patch: Partial<Values>) => void
  onPhoneBlur: () => void
  onRemove: () => void
}

function PersonCard({ slotKey, number, values, errors, canRemove, onChange, onPhoneBlur, onRemove }: PersonCardProps) {
  const { t } = useT()
  const headingId = useId()
  const name = values.name.trim()
  const msg = (m?: Message) => (m ? t(m.key, m.vars) : undefined)

  return (
    <Card as="section" className={styles.personCard} aria-labelledby={headingId}>
      <div className={styles.personHead}>
        <span className={styles.personNumber} aria-hidden="true">
          {number}
        </span>
        <h2 id={headingId} className={styles.personTitle}>
          {name || t('setup.person.newPerson')}
        </h2>
      </div>
      <Field
        id={nameInputId(slotKey)}
        label={t('setup.person.name')}
        value={values.name}
        error={msg(errors?.name)}
        onChange={(e) => onChange({ name: e.target.value })}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
      />
      <div className={styles.relation}>
        <ChoiceGroup<Relation>
          legend={t('setup.person.relation')}
          layout="row"
          options={RELATIONS.map((r) => ({ value: r, label: relationLabel(t, r) }))}
          value={(RELATIONS as readonly string[]).includes(values.relation) ? (values.relation as Relation) : undefined}
          onChange={(relation) => onChange({ relation })}
        />
      </div>
      <Field
        id={`person-${slotKey}-phone`}
        label={t('setup.person.phone')}
        hint={t('setup.person.phoneHint')}
        value={values.phone}
        error={msg(errors?.phone)}
        onChange={(e) => onChange({ phone: e.target.value })}
        onBlur={onPhoneBlur}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
      />
      {canRemove && (
        <Button variant="quiet" icon={<Trash2 />} onClick={onRemove} className={styles.remove}>
          {name ? t('setup.person.remove', { name }) : t('setup.person.removeUnnamed')}
        </Button>
      )}
    </Card>
  )
}
