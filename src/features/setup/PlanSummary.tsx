import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { CircleCheck, CircleDashed, Eye, EyeOff, KeyRound, PhoneCall, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import type { Lang } from '../../state/types'
import { relationLabel, ruleSummary, sharingSummary } from './ruleText'
import { editPath, type EditOrigin, type SetupStep } from './steps'
import styles from './PlanSummary.module.css'

interface PlanSummaryProps {
  /** Where the Edit links should return to after saving. */
  editFrom: EditOrigin
  showName?: boolean
  showDrill?: boolean
}

function formatDay(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long' }).format(ms)
}

/**
 * The whole safety plan in plain sentences, each part with its own Edit link.
 * Status is always icon + words (never colour alone).
 */
export function PlanSummary({ editFrom, showName, showDrill }: PlanSummaryProps) {
  const { t, lang } = useT()
  const setup = useStore((s) => s.setup)
  const people = useStore((s) => s.people)
  const rule = useStore((s) => s.rules[0] ?? null)
  const sharing = useStore((s) => s.sharing)
  const [revealed, setRevealed] = useState(false)

  const named = people.filter((p) => p.name.trim())
  const firstName = named[0]?.name.trim()
  const codeWord = setup.codeWord.trim()

  return (
    <dl className={styles.list}>
      {showName && (
        <Row icon={<UserRound />} label={t('setup.plan.name')} edit={['name', editFrom]}>
          {setup.elderName.trim() ? (
            <span className={styles.strong}>{setup.elderName.trim()}</span>
          ) : (
            <Status ok={false}>{t('setup.plan.notSet')}</Status>
          )}
        </Row>
      )}

      <Row
        icon={<Users />}
        label={people.length > 1 ? t('setup.plan.people') : t('setup.plan.person')}
        edit={['person', editFrom]}
      >
        {people.length === 0 ? (
          <Status ok={false}>{t('setup.plan.noPerson')}</Status>
        ) : (
          <ul className={styles.people}>
            {people.map((p) => (
              <li key={p.id}>
                <span className={styles.strong}>{p.name.trim() || t('setup.person.newPerson')}</span>
                {p.relation && (
                  <span className={styles.relation}>
                    <span aria-hidden="true"> · </span>
                    <span className="visually-hidden">, </span>
                    {relationLabel(t, p.relation)}
                  </span>
                )}
                {p.phone && <span className={styles.phone}>{p.phone}</span>}
              </li>
            ))}
          </ul>
        )}
      </Row>

      <Row icon={<ShieldCheck />} label={t('setup.plan.rule')} edit={['rules', editFrom]}>
        {rule ? (
          <span>{ruleSummary(t, lang, rule, people)}</span>
        ) : (
          <Status ok={false}>{t('setup.plan.ruleNone')}</Status>
        )}
      </Row>

      <Row icon={<KeyRound />} label={t('setup.plan.codeWord')} edit={['code-word', editFrom]}>
        {codeWord ? (
          <span className={styles.codeRow}>
            <Status ok>{t('setup.plan.codeWordSet')}</Status>
            {revealed && <span className={styles.codeWord}>{codeWord}</span>}
            <button
              type="button"
              className={styles.reveal}
              onClick={() => setRevealed((r) => !r)}
            >
              {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              <span>{revealed ? t('setup.code.hide') : t('setup.code.show')}</span>
            </button>
          </span>
        ) : (
          <Status ok={false}>{t('setup.plan.codeWordNotSet')}</Status>
        )}
      </Row>

      <Row
        icon={<Eye />}
        label={firstName ? t('setup.plan.sharingLabel', { name: firstName }) : t('setup.plan.sharingLabelNoName')}
        edit={['sharing', editFrom]}
      >
        <span>{sharingSummary(t, sharing)}</span>
      </Row>

      {showDrill && (
        <Row icon={<PhoneCall />} label={t('setup.plan.drill')}>
          {setup.drillCompletedAt ? (
            <Status ok>{t('setup.plan.drillDone', { date: formatDay(setup.drillCompletedAt, lang) })}</Status>
          ) : (
            <Status ok={false}>{t('setup.plan.drillNotYet')}</Status>
          )}
        </Row>
      )}
    </dl>
  )
}

function Row({
  icon,
  label,
  edit,
  children,
}: {
  icon: ReactNode
  label: string
  edit?: [SetupStep, EditOrigin]
  children: ReactNode
}) {
  const { t } = useT()
  return (
    <div className={styles.row}>
      <dt className={styles.label}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </dt>
      <dd className={styles.value}>{children}</dd>
      {edit && (
        <dd className={styles.action}>
          <Link to={editPath(edit[0], edit[1])} viewTransition className={styles.edit}>
            <span aria-hidden="true">{t('common.edit')}</span>
            <span className="visually-hidden">{t('setup.plan.editThing', { thing: label })}</span>
          </Link>
        </dd>
      )}
    </div>
  )
}

function Status({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={[styles.status, ok ? styles.ok : styles.todo].join(' ')}>
      {ok ? <CircleCheck aria-hidden="true" /> : <CircleDashed aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}
