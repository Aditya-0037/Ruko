import { useEffect, useId } from 'react'
import { ArrowRight, CheckCircle2, HeartHandshake, PhoneCall, RotateCcw } from 'lucide-react'
import {
  Button,
  ButtonAnchor,
  ButtonLink,
  Callout,
  Card,
  DesignNote,
  ListenButton,
  Screen,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatTime } from '../../lib/format'
import { useStore } from '../../state/store'
import { HourTimer } from './HourTimer'
import {
  countDone,
  countEvidence,
  CYBERCRIME_URL,
  EVIDENCE_FIELDS,
  SANCHAR_SAATHI_URL,
  STEP_KEYS,
  STEP_LINKS,
  type StepKey,
} from './model'
import { rich } from './rich'
import { checkboxClass, ExternalLink, fitClass, Site } from './ui'
import styles from './GoldenHourPage.module.css'

/**
 * /golden-hour — money already went. One huge, calm action (call 1930), a gentle clock that says
 * why speed matters, a blame-free word, then five ordered steps she can tick off.
 */
export function GoldenHourPage() {
  const { t, lang } = useT()
  const toast = useToast()
  const startGoldenHour = useStore((s) => s.startGoldenHour)
  const resetGoldenHour = useStore((s) => s.resetGoldenHour)
  const mark1930Called = useStore((s) => s.mark1930Called)
  const startedAt = useStore((s) => s.goldenHour.startedAt)
  const calledAt = useStore((s) => (s.goldenHour.called1930 ? s.goldenHour.called1930At : null))
  const checklist = useStore((s) => s.goldenHour.checklist)
  const readAloud = useStore((s) => s.prefs.readAloud)
  const explainId = useId()
  const stepsId = useId()
  const alsoId = useId()

  // The clock starts the first time she opens this screen, and keeps its start time after that.
  useEffect(() => {
    startGoldenHour()
  }, [startGoldenHour])

  const done = countDone(checklist)
  const total = STEP_KEYS.length

  const startAgain = () => {
    const before = useStore.getState().goldenHour
    resetGoldenHour()
    startGoldenHour()
    toast({
      message: t('goldenHour.reset.done'),
      actionLabel: t('common.undo'),
      onAction: () => useStore.setState({ goldenHour: before }),
    })
  }

  const listenText = [t('goldenHour.title'), t('goldenHour.lead'), t('goldenHour.call.explain'), t('goldenHour.call.say')].join(
    ' ',
  )

  return (
    <Screen title={t('goldenHour.title')} back="/" tone="danger">
      <p className="lead">{t('goldenHour.lead')}</p>

      {/* ---- The one thing to do now ---- */}
      <div className={`${styles.callCard} ${fitClass}`}>
        <ButtonAnchor
          href="tel:1930"
          variant="danger"
          size="lg"
          fullWidth
          icon={<PhoneCall />}
          className={styles.callButton}
          aria-describedby={explainId}
          onClick={() => mark1930Called()}
        >
          {t('goldenHour.call.button')}
        </ButtonAnchor>
        <p id={explainId} className={styles.callExplain}>
          {t('goldenHour.call.explain')}
        </p>
        <p className={styles.say}>{t('goldenHour.call.say')}</p>
        {calledAt !== null && (
          <p className={styles.called}>
            <CheckCircle2 aria-hidden="true" />
            <span>{t('goldenHour.call.done', { time: formatTime(calledAt, lang) })}</span>
          </p>
        )}
        <div className={styles.callLinks}>
          <ExternalLink href={CYBERCRIME_URL}>
            {rich(t('goldenHour.online'), { site: <Site>cybercrime.gov.in</Site> })}
          </ExternalLink>
          <ListenButton text={listenText} autoPlay={readAloud} variant="quiet" />
        </div>
      </div>

      <HourTimer startedAt={startedAt} />
      <DesignNote title={t('goldenHour.note.countdown.title')}>{t('goldenHour.note.countdown.body')}</DesignNote>

      <Callout tone="success" icon={<HeartHandshake />} title={t('goldenHour.reassure.title')}>
        <p>{t('goldenHour.reassure.body')}</p>
      </Callout>
      <DesignNote title={t('goldenHour.note.blame.title')}>{t('goldenHour.note.blame.body')}</DesignNote>

      {/* ---- Five steps ---- */}
      <section className={styles.steps} aria-labelledby={stepsId}>
        <div className={styles.stepsHead}>
          <h2 id={stepsId}>{t('goldenHour.steps.title')}</h2>
          <p className={styles.progressText}>{t('goldenHour.steps.progress', { done, total })}</p>
        </div>
        <div className={styles.progressBar} aria-hidden="true">
          {STEP_KEYS.map((key) => (
            <span key={key} className={[styles.segment, checklist[key] && styles.segmentDone].filter(Boolean).join(' ')} />
          ))}
        </div>
        <ol className={`${styles.stepList} ${fitClass}`}>
          {STEP_KEYS.map((key, i) => (
            <StepItem key={key} stepKey={key} n={i + 1} />
          ))}
        </ol>
        {/* Present from the start so the message is announced when the last box is ticked. */}
        <div role="status" className={styles.allDone}>
          {done === total && (
            <Callout tone="success" title={t('goldenHour.steps.allDone.title')}>
              <p>{t('goldenHour.steps.allDone.body')}</p>
            </Callout>
          )}
        </div>
      </section>

      <Card as="section" tone="sunken" compact aria-labelledby={alsoId}>
        <h2 id={alsoId} className={styles.alsoTitle}>
          {t('goldenHour.chakshu.title')}
        </h2>
        <p>{t('goldenHour.chakshu.body')}</p>
        <ExternalLink href={SANCHAR_SAATHI_URL}>
          {rich(t('goldenHour.chakshu.link'), { site: <Site>sancharsaathi.gov.in</Site> })}
        </ExternalLink>
      </Card>

      <Button variant="quiet" icon={<RotateCcw />} onClick={startAgain} className={styles.reset}>
        {t('goldenHour.reset.button')}
      </Button>
    </Screen>
  )
}

/* ---------------- one step ---------------- */

function StepItem({ stepKey, n }: { stepKey: StepKey; n: number }) {
  const { t } = useT()
  const checked = useStore((s) => !!s.goldenHour.checklist[stepKey])
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const extra = useStepExtra(stepKey)
  const descId = useId()
  const link = STEP_LINKS[stepKey]

  return (
    <li className={[styles.step, checked && styles.stepDone].filter(Boolean).join(' ')}>
      <p className={styles.stepKicker}>
        <span>{t('goldenHour.step.number', { n })}</span>
        {checked && (
          <span className={styles.doneBadge}>
            <CheckCircle2 aria-hidden="true" />
            <span>{t('goldenHour.step.done')}</span>
          </span>
        )}
      </p>
      <label className={styles.stepLabel}>
        <input
          type="checkbox"
          className={checkboxClass}
          checked={checked}
          onChange={(e) => toggleChecklist(stepKey, e.target.checked)}
          aria-describedby={descId}
        />
        <span className={styles.stepTitle}>{t(`goldenHour.step.${stepKey}.title`)}</span>
      </label>
      <div id={descId} className={styles.stepBody}>
        <p>{t(`goldenHour.step.${stepKey}.desc`)}</p>
        {extra && <p className={styles.stepExtra}>{extra}</p>}
      </div>
      {link && (
        <ButtonLink to={link} viewTransition variant="secondary" iconEnd={<ArrowRight />} className={styles.stepLink}>
          {t(`goldenHour.step.${stepKey}.link`)}
        </ButtonLink>
      )}
    </li>
  )
}

/** A short, live fact under a step: how much is written, where things stand. */
function useStepExtra(stepKey: StepKey): string | null {
  const { t } = useT()
  const evidenceCount = useStore((s) => countEvidence(s.goldenHour.evidence))
  const statusStep = useStore((s) => s.goldenHour.statusStep)
  const tracking = useStore(
    (s) => s.goldenHour.statusStep !== 'reported' || s.goldenHour.ackNumber.trim() !== '' || !!s.goldenHour.checklist.report,
  )
  switch (stepKey) {
    case 'evidence':
      return evidenceCount > 0
        ? t('goldenHour.step.evidence.count', { count: evidenceCount, total: EVIDENCE_FIELDS.length })
        : null
    case 'track':
      return tracking ? t('goldenHour.step.track.now', { step: t(`goldenHour.status.${statusStep}.title`) }) : null
    default:
      return null
  }
}
