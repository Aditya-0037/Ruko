import { Hourglass, ShieldCheck, UserPlus } from 'lucide-react'
import { Button, ButtonLink, Callout, ChoiceGroup, DesignNote } from '../../../design-system/components'
import { formatINR } from '../../../lib/format'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import type { CalmRule } from '../../../state/types'
import {
  AMOUNT_OPTIONS,
  askPersonFor,
  DEFAULT_RULE,
  RECOMMENDED_AMOUNT,
  RECOMMENDED_WAIT,
  relationLabel,
  rulePreview,
  WAIT_OPTIONS,
  waitLabel,
} from '../ruleText'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

type RuleValues = Omit<CalmRule, 'id'>

export function RulesStep() {
  const { t, lang } = useT()
  const rule = useStore((s) => s.rules[0] ?? null)
  const people = useStore((s) => s.people)
  const addRule = useStore((s) => s.addRule)
  const updateRule = useStore((s) => s.updateRule)

  const named = people.filter((p) => p.name.trim())
  const fallbackPerson = named[0] ?? people[0] ?? null
  const values: RuleValues = rule ?? { ...DEFAULT_RULE, askPersonId: fallbackPerson?.id ?? null }
  const asked = askPersonFor(values, people)

  /** Autosave: the first change creates the single rule, later changes update it. */
  const save = (patch: Partial<RuleValues>) => {
    if (rule) updateRule(rule.id, patch)
    else addRule({ ...values, ...patch })
  }

  const applyRecommended = () => save({ ...DEFAULT_RULE, askPersonId: fallbackPerson?.id ?? null })

  const validate = () => {
    // Continue with the recommended choices if nothing was touched, and never point at a removed person.
    const askPersonId = asked?.id ?? null
    if (!rule) addRule({ ...values, askPersonId })
    else if (rule.askPersonId !== askPersonId) updateRule(rule.id, { askPersonId })
    return true
  }

  const recommended = t('setup.rules.recommended')

  return (
    <SetupLayout step="rules" title={t('setup.rules.title')} validate={validate}>
      <p className={styles.lead}>{t('setup.rules.intro')}</p>

      <div className={styles.rulePreview}>
        <p className={styles.rulePreviewLabel}>
          <ShieldCheck aria-hidden="true" />
          <span>{t('setup.rules.previewLabel')}</span>
        </p>
        <p className={styles.rulePreviewText}>{rulePreview(t, lang, values, people)}</p>
      </div>

      <ChoiceGroup<string>
        legend={t('setup.rules.amount.legend')}
        layout="row"
        options={AMOUNT_OPTIONS.map((a) => ({
          value: String(a),
          label: formatINR(a, lang),
          description: a === RECOMMENDED_AMOUNT ? recommended : undefined,
        }))}
        value={String(values.minAmount)}
        onChange={(v) => save({ minAmount: Number(v) })}
      />

      <ChoiceGroup<'new' | 'any'>
        legend={t('setup.rules.payee.legend')}
        options={[
          { value: 'new', label: t('setup.rules.payee.new'), description: t('setup.rules.payee.newDesc') },
          { value: 'any', label: t('setup.rules.payee.any'), description: t('setup.rules.payee.anyDesc') },
        ]}
        value={values.payee}
        onChange={(payee) => save({ payee })}
      />

      <ChoiceGroup<string>
        legend={t('setup.rules.wait.legend')}
        options={WAIT_OPTIONS.map((m) => ({
          value: String(m),
          label: waitLabel(t, m),
          description: m === RECOMMENDED_WAIT ? recommended : undefined,
          icon: <Hourglass />,
        }))}
        value={String(values.waitMinutes)}
        onChange={(v) => save({ waitMinutes: Number(v) })}
      />

      {people.length > 0 ? (
        <ChoiceGroup<string>
          legend={t('setup.rules.ask.legend')}
          options={people.map((p) => ({
            value: p.id,
            label: p.name.trim() || t('setup.person.newPerson'),
            description: p.relation ? relationLabel(t, p.relation) : undefined,
          }))}
          value={asked?.id}
          onChange={(askPersonId) => save({ askPersonId })}
        />
      ) : (
        <Callout tone="caution" title={t('setup.rules.ask.legend')}>
          <p>{t('setup.rules.ask.none')}</p>
          <ButtonLink to="/setup/person" viewTransition variant="secondary" icon={<UserPlus />} className={styles.calloutAction}>
            {t('setup.rules.ask.add')}
          </ButtonLink>
        </Callout>
      )}

      <Button variant="quiet" onClick={applyRecommended}>
        {t('setup.rules.notSure')}
      </Button>

      <p className={styles.muted}>{t('setup.rules.why')}</p>
      <DesignNote title={t('setup.rules.note.title')}>{t('setup.rules.note.body')}</DesignNote>
    </SetupLayout>
  )
}
