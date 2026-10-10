import { useId, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import {
  Ban,
  Banknote,
  BellRing,
  Check,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  FileText,
  House,
  Info,
  KeyRound,
  ListChecks,
  LockKeyhole,
  PencilLine,
  Phone,
  PhoneOff,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Video,
  VideoOff,
} from 'lucide-react'
import {
  ButtonAnchor,
  ButtonLink,
  Callout,
  Card,
  DesignNote,
  ListenButton,
  RukoMark,
  Screen,
  type CalloutTone,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatTime } from '../../lib/format'
import { assessAnswers, type AssessmentLevel } from '../../lib/scamSignals'
import { useReducedMotion, useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { CheckAnswer, SignalId } from '../../state/types'
import {
  answerLabelKey,
  FIRST_QUESTION_PATH,
  QUESTIONS,
  questionPath,
  stepOf,
  TOTAL_QUESTIONS,
} from './questions'
import styles from './ResultPage.module.css'

const SIGNAL_ICON: Record<SignalId, ReactNode> = {
  secrecy: <LockKeyhole />,
  moneyMove: <Banknote />,
  videoHold: <Video />,
}

const MEDALLION_ICON: Record<AssessmentLevel, ReactNode> = {
  scam: <ShieldAlert />,
  unsure: <ShieldQuestion />,
  clear: <ShieldCheck />,
}

const CALLOUT_TONE: Record<AssessmentLevel, CalloutTone> = {
  scam: 'danger',
  unsure: 'caution',
  clear: 'info',
}

const ANSWER_ICON: Record<CheckAnswer | 'none', ReactNode> = {
  yes: <CircleAlert />,
  no: <CircleCheck />,
  unsure: <CircleHelp />,
  none: <CircleDashed />,
}

interface Reason {
  key: string
  kind: 'matched' | 'unsure' | 'missing' | 'tip'
  icon: ReactNode
  lead: string
  fact?: string
}

/**
 * /check/result — rules you can explain, not an AI verdict. A big, plain headline; exactly which
 * answers led to it, each with the fact that disproves the caller; then one clear next step.
 */
export function ResultPage() {
  const { t, lang } = useT()
  const answers = useStore((s) => s.incident.answers)
  const alertPersonId = useStore((s) => s.incident.alertPersonId)
  const alertSentAt = useStore((s) => s.incident.alertSentAt)
  const readAloud = useStore((s) => s.prefs.readAloud)
  const person = useTrustedPerson(alertPersonId)
  const reduceMotion = useReducedMotion()
  const tellHintId = useId()
  const callHintId = useId()
  const moneyHintId = useId()
  const changeHintId = useId()

  const { level, matched, unsure, missing } = assessAnswers(answers)

  // Nothing answered yet (e.g. a deep link): there is no result to explain, so start the check.
  if (missing.length === TOTAL_QUESTIONS) return <Navigate to={FIRST_QUESTION_PATH} replace />

  const name = person?.name
  const warn = level !== 'clear'

  const title =
    level === 'scam'
      ? t('check.result.scam.title')
      : level === 'unsure'
        ? name
          ? t('check.result.unsure.title', { person: name })
          : t('check.result.unsure.titleNoPerson')
        : t('check.result.clear.title')

  const lead =
    level === 'unsure'
      ? name
        ? t('check.result.unsure.lead', { person: name })
        : t('check.result.unsure.leadNoPerson')
      : null

  // "Not sure" heading, unless the only gaps are questions not answered yet.
  const why =
    level === 'unsure' && unsure.length === 0 ? t('check.result.missing.why') : t(`check.result.${level}.why`)

  const reasons: Reason[] =
    level === 'scam'
      ? matched.map((id) => ({
          key: id,
          kind: 'matched',
          icon: SIGNAL_ICON[id],
          lead: t(`check.reason.${id}`),
          fact: t(`check.fact.${id}`),
        }))
      : level === 'unsure'
        ? QUESTIONS.filter((id) => unsure.includes(id) || missing.includes(id)).map((id) =>
            unsure.includes(id)
              ? { key: id, kind: 'unsure', icon: SIGNAL_ICON[id], lead: t(`check.unsure.${id}`), fact: t(`check.fact.${id}`) }
              : { key: id, kind: 'missing', icon: SIGNAL_ICON[id], lead: t(`check.missing.${id}`) },
          )
        : [
            { key: 'otp', kind: 'tip', icon: <KeyRound />, lead: t('check.tip.otp') },
            { key: 'money', kind: 'tip', icon: <Banknote />, lead: t('check.tip.money') },
            { key: 'ruko', kind: 'tip', icon: <RukoMark className={styles.mark} />, lead: t('check.tip.ruko') },
          ]

  // Read aloud exactly what the verdict says on screen (speech is a second channel, not a new message).
  const reassure = t('check.result.reassure')

  const speech = [
    title,
    reassure,
    lead,
    ...reasons.flatMap((r) => [r.lead, r.fact]),
    warn ? t('check.result.hangUp') : null,
    warn ? t('check.result.hangUpBody') : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Screen title={title} back={questionPath(TOTAL_QUESTIONS)} tone="calm" className={styles[level]}>
      {/* Decorative: the h1 carries the meaning. Shown above the h1 via CSS order. */}
      <div
        className={[styles.medallion, !reduceMotion && styles.animate].filter(Boolean).join(' ')}
        aria-hidden="true"
        data-level={level}
      >
        {MEDALLION_ICON[level]}
      </div>

      <div className={styles.column}>
        <p className={styles.reassure}>{reassure}</p>
        <div className={styles.verdictWrap}>
          <Callout
            tone={CALLOUT_TONE[level]}
            icon={level === 'clear' ? <Info /> : <ListChecks />}
            className={styles.verdict}
          >
            <div className={styles.why}>
              <h2 className={styles.sectionTitle}>{why}</h2>
              {lead && <p>{lead}</p>}
              <ul className={styles.reasons}>
                {reasons.map((r) => (
                  <li key={r.key} className={styles.reason} data-kind={r.kind}>
                    <span className={styles.reasonIcon} aria-hidden="true">
                      {r.icon}
                    </span>
                    <span className={styles.reasonText}>
                      <span className={styles.reasonLead}>{r.lead}</span>
                      {r.fact && <span className={styles.reasonFact}>{r.fact}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {level === 'unsure' && missing.length > 0 && (
                <ButtonLink
                  to={questionPath(stepOf(missing[0]))}
                  viewTransition
                  variant="secondary"
                  icon={<PencilLine />}
                  className={styles.roundButton}
                >
                  {t('check.result.answerMissing')}
                </ButtonLink>
              )}
            </div>
          </Callout>
          <div className={styles.listen}>
            <ListenButton text={speech} autoPlay={readAloud} variant="quiet" />
          </div>
        </div>

        {warn ? (
          <div className={styles.next}>
            <h2 className={styles.sectionTitle}>{t('check.result.next')}</h2>

            <div className={styles.hangUp}>
              <span className={styles.hangUpIcon} aria-hidden="true">
                <PhoneOff />
              </span>
              <div className={styles.hangUpText}>
                <p className={styles.hangUpTitle}>{t('check.result.hangUp')}</p>
                <p>{t('check.result.hangUpBody')}</p>
              </div>
            </div>

            {person && alertSentAt !== null && (
              <p className={styles.told}>
                <Check aria-hidden="true" />
                <span>{t('check.result.told', { name: person.name, time: formatTime(alertSentAt, lang) })}</span>
              </p>
            )}

            <div className={styles.action}>
              <ButtonLink
                to="/tell"
                viewTransition
                variant="primary"
                size="lg"
                fullWidth
                icon={<BellRing />}
                aria-describedby={tellHintId}
                className={styles.roundButton}
              >
                {person ? t('check.result.tell', { name: person.name }) : t('check.result.tellNoPerson')}
              </ButtonLink>
              <p id={tellHintId} className={styles.hint}>
                {person ? t('check.result.tellHint', { name: person.name }) : t('check.result.tellNoPersonHint')}
              </p>
            </div>

            <div className={styles.action}>
              <ButtonAnchor
                href="tel:1930"
                variant="secondary"
                size="lg"
                fullWidth
                icon={<Phone />}
                aria-describedby={callHintId}
                className={styles.roundButton}
              >
                {t('check.result.call1930')}
              </ButtonAnchor>
              <p id={callHintId} className={styles.hint}>
                {t('check.result.call1930Hint')}
              </p>
            </div>

            <div className={styles.action}>
              <ButtonLink
                to="/transfer"
                viewTransition
                variant="quiet"
                fullWidth
                icon={<Banknote />}
                aria-describedby={moneyHintId}
                className={styles.roundButton}
              >
                {t('check.result.pressured')}
              </ButtonLink>
              <p id={moneyHintId} className={styles.hint}>
                {t('check.result.pressuredHint')}
              </p>
            </div>
          </div>
        ) : (
          <ButtonLink
            to="/"
            viewTransition
            variant="primary"
            size="lg"
            fullWidth
            icon={<House />}
            className={styles.roundButton}
          >
            {t('check.result.home')}
          </ButtonLink>
        )}

        <Card className={styles.officers}>
          <h2 className={styles.sectionTitle}>{t('check.officers.title')}</h2>
          <ul className={styles.facts}>
            <li className={styles.fact}>
              <FileText aria-hidden="true" />
              <span>{t('check.officers.notice')}</span>
            </li>
            <li className={styles.fact}>
              <Ban aria-hidden="true" />
              <span>{t('check.officers.money')}</span>
            </li>
            <li className={styles.fact}>
              <VideoOff aria-hidden="true" />
              <span>{t('check.officers.video')}</span>
            </li>
          </ul>
          <p className={`${styles.fact} ${styles.law}`}>
            <Scale aria-hidden="true" />
            <span>{t('check.officers.law')}</span>
          </p>
        </Card>

        <div className={styles.answers}>
          <h2 className={styles.sectionTitle}>{t('check.answers.title')}</h2>
          <dl className={styles.answerList}>
            {QUESTIONS.map((id) => {
              const answer = answers[id]
              return (
                <div key={id} className={styles.answerRow}>
                  <dt className={styles.answerTopic}>{t(`check.topic.${id}`)}</dt>
                  <dd className={styles.answerValue} data-answer={answer ?? 'none'}>
                    <span className={styles.answerIcon} aria-hidden="true">
                      {ANSWER_ICON[answer ?? 'none']}
                    </span>
                    <span>{t(answerLabelKey(answer))}</span>
                  </dd>
                </div>
              )
            })}
          </dl>
          <div className={styles.action}>
            <ButtonLink
              to={FIRST_QUESTION_PATH}
              viewTransition
              variant="secondary"
              fullWidth
              icon={<PencilLine />}
              aria-describedby={changeHintId}
              className={styles.roundButton}
            >
              {t('check.result.change')}
            </ButtonLink>
            <p id={changeHintId} className={styles.hint}>
              {t('check.result.changeHint')}
            </p>
          </div>
        </div>

        <DesignNote title={t('check.note.rules.title')}>{t('check.note.rules.body')}</DesignNote>
        <DesignNote title={t('check.note.unsure.title')}>{t('check.note.unsure.body')}</DesignNote>
      </div>
    </Screen>
  )
}
