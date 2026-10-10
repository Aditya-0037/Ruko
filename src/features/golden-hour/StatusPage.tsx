import { useId, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock,
  FileText,
  HandHeart,
  Info,
  ListTodo,
  MapPin,
  PhoneCall,
  type LucideIcon,
} from 'lucide-react'
import { ButtonAnchor, ButtonLink, Callout, Card, DesignNote, Field, Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import type { StatusStep } from '../../state/types'
import { paths, SECTION_STEP, STATUS_STEPS, statusState, type StepState } from './model'
import { fitClass, SaveStatus, SectionKicker, useSavedAt } from './ui'
import styles from './StatusPage.module.css'

/**
 * /golden-hour/status — what happens after reporting, in plain words. A vertical stepper she can
 * set to where she is; each step says what it means, what she can do and how long it can take.
 */
export function StatusPage() {
  const { t } = useT()
  const statusStep = useStore((s) => s.goldenHour.statusStep)
  const ackNumber = useStore((s) => s.goldenHour.ackNumber)
  const setStatusStep = useStore((s) => s.setStatusStep)
  const setAckNumber = useStore((s) => s.setAckNumber)
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const mark1930Called = useStore((s) => s.mark1930Called)
  const [savedAt, markSaved] = useSavedAt()
  // Decided once per visit: if the nudge vanished while she typed her complaint number,
  // the box she is typing in would jump up the screen.
  const [notReported] = useState(() => {
    const { checklist, ackNumber: ack } = useStore.getState().goldenHour
    return !checklist.report && ack.trim() === ''
  })
  const ackTitleId = useId()
  const whereId = useId()
  const radioName = useId()

  const onAck = (value: string) => {
    setAckNumber(value)
    // Having a complaint number means she has reported and is now tracking it.
    if (value.trim()) {
      toggleChecklist('report', true)
      toggleChecklist('track', true)
    }
    markSaved()
  }

  const choose = (step: StatusStep) => {
    setStatusStep(step)
    toggleChecklist('track', true)
    markSaved()
  }

  return (
    <Screen title={t('goldenHour.status.title')} back={paths.main}>
      <SectionKicker step={SECTION_STEP.status} />
      <p className="lead">{t('goldenHour.status.lead')}</p>

      {notReported && (
        <Callout tone="caution" icon={<Info />} title={t('goldenHour.status.notReported.title')}>
          <div className={`${styles.notReported} ${fitClass}`}>
            <p>{t('goldenHour.status.notReported.body')}</p>
            <ButtonAnchor href="tel:1930" variant="danger" icon={<PhoneCall />} onClick={() => mark1930Called()}>
              {t('goldenHour.call.button')}
            </ButtonAnchor>
          </div>
        </Callout>
      )}

      <Card as="section" aria-labelledby={ackTitleId}>
        <h2 id={ackTitleId} className={styles.smallTitle}>
          {t('goldenHour.status.ack.title')}
        </h2>
        <Field
          label={t('goldenHour.status.ack.label')}
          hint={t('goldenHour.status.ack.hint')}
          value={ackNumber}
          onChange={(e) => onAck(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          className={styles.mono}
        />
        <SaveStatus savedAt={savedAt} idle={t('goldenHour.status.ack.idle')} />
      </Card>

      <section className={styles.where} aria-labelledby={whereId}>
        <h2 id={whereId}>{t('goldenHour.status.where')}</h2>
        <fieldset className={styles.stepper}>
          <legend className="visually-hidden">{t('goldenHour.status.where')}</legend>
          <ol className={`${styles.list} ${fitClass}`}>
            {STATUS_STEPS.map((step, i) => (
              <StatusItem
                key={step}
                step={step}
                index={i}
                state={statusState(step, statusStep)}
                name={radioName}
                onChoose={choose}
              />
            ))}
          </ol>
        </fieldset>
      </section>

      <DesignNote title={t('goldenHour.status.note.stepper.title')}>{t('goldenHour.status.note.stepper.body')}</DesignNote>

      <Callout tone="info" icon={<HandHeart />} title={t('goldenHour.status.honest.title')}>
        <p>{t('goldenHour.status.honest.body')}</p>
      </Callout>

      <DesignNote title={t('goldenHour.status.note.honest.title')}>{t('goldenHour.status.note.honest.body')}</DesignNote>

      <div className={`${styles.links} ${fitClass}`}>
        <ButtonLink to={paths.pack} viewTransition variant="secondary" fullWidth icon={<FileText />}>
          {t('goldenHour.step.pack.link')}
        </ButtonLink>
        <ButtonLink to={paths.main} viewTransition variant="quiet" fullWidth icon={<ArrowLeft />}>
          {t('goldenHour.status.back')}
        </ButtonLink>
      </div>
    </Screen>
  )
}

/* ---------------- one step ---------------- */

const stateIcon: Record<StepState, LucideIcon> = {
  done: CheckCircle2,
  current: MapPin,
  upcoming: CircleDashed,
}

function StatusItem({
  step,
  index,
  state,
  name,
  onChoose,
}: {
  step: StatusStep
  index: number
  state: StepState
  name: string
  onChoose: (step: StatusStep) => void
}) {
  const { t } = useT()
  const title = t(`goldenHour.status.${step}.title`)
  const StateIcon = stateIcon[state]

  return (
    <li className={[styles.item, styles[state]].filter(Boolean).join(' ')}>
      <label className={styles.row}>
        <input
          type="radio"
          name={name}
          value={step}
          checked={state === 'current'}
          onChange={() => onChoose(step)}
          className={`visually-hidden ${styles.input}`}
        />
        <span className={styles.node} aria-hidden="true">
          {state === 'done' ? <Check /> : state === 'current' ? <MapPin /> : <span className={styles.nodeNumber}>{index + 1}</span>}
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>{' '}
          <span className={styles.state}>
            <StateIcon aria-hidden="true" />
            <span>{t(`goldenHour.status.state.${state}`)}</span>
          </span>
        </span>
      </label>
      {state === 'current' ? (
        <div className={styles.panel}>
          <Details step={step} />
        </div>
      ) : (
        <details className={styles.more}>
          <summary className={styles.summary}>
            <ChevronDown aria-hidden="true" className={styles.chevron} />
            <span>{t('goldenHour.status.readMore', { step: title })}</span>
          </summary>
          <div className={styles.moreBody}>
            <Details step={step} />
          </div>
        </details>
      )}
    </li>
  )
}

function Details({ step }: { step: StatusStep }) {
  const { t } = useT()
  return (
    <dl className={styles.details}>
      <div className={styles.detail}>
        <dt>
          <Info aria-hidden="true" />
          <span>{t('goldenHour.status.meansLabel')}</span>
        </dt>
        <dd>{t(`goldenHour.status.${step}.means`)}</dd>
      </div>
      <div className={styles.detail}>
        <dt>
          <ListTodo aria-hidden="true" />
          <span>{t('goldenHour.status.doLabel')}</span>
        </dt>
        <dd>{t(`goldenHour.status.${step}.do`)}</dd>
      </div>
      <div className={styles.detail}>
        <dt>
          <Clock aria-hidden="true" />
          <span>{t('goldenHour.status.waitLabel')}</span>
        </dt>
        <dd>{t(`goldenHour.status.${step}.wait`)}</dd>
      </div>
    </dl>
  )
}
