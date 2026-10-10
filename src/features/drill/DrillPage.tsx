import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  Clapperboard,
  Eye,
  EyeOff,
  Hand,
  House,
  KeyRound,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import {
  BigButton,
  Button,
  ButtonAnchor,
  ButtonLink,
  Callout,
  Card,
  DesignNote,
  ListenButton,
  Screen,
  StepProgress,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatTime } from '../../lib/format'
import { useReducedMotion, useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import { Celebration } from './Celebration'
import { DrillIllustration } from './DrillIllustration'
import styles from './DrillPage.module.css'

export const DRILL_STEPS = 5

type Praise = 'imagine' | 'press' | 'code' | 'skip'

/** ?step=3 → 3. Anything odd → 1. Keeping the step in the URL makes the phone's Back button go back one step. */
export function parseStep(value: string | null): number {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= DRILL_STEPS ? n : 1
}

const tel = (phone: string) => `tel:${phone.replace(/[^+0-9]/g, '')}`

/**
 * /drill — "Practise the pause". Five forgiving steps; every action moves forward and there is
 * no failure state, no score and no timer.
 */
export function DrillPage() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const step = parseStep(params.get('step'))
  const person = useTrustedPerson()
  const codeWord = useStore((s) => s.setup.codeWord.trim())
  const drillCompletedAt = useStore((s) => s.setup.drillCompletedAt)
  const markDrillDone = useStore((s) => s.markDrillDone)
  const startCall = useStore((s) => s.startCall)
  const readAloud = useStore((s) => s.prefs.readAloud)
  const reduced = useReducedMotion()

  // Warm feedback belongs to the step it was earned on (so browser Back/Forward never shows a stale one).
  const [praise, setPraise] = useState<{ step: number; kind: Praise } | null>(null)
  const [revealed, setRevealed] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const praiseRef = useRef<HTMLDivElement>(null)
  const prevStep = useRef(step)
  const codeId = useId()
  const demoHintId = useId()

  const go = (next: number, kind?: Praise) => {
    setPraise(kind ? { step: next, kind } : null)
    setRevealed(false)
    setParams(next === 1 ? {} : { step: String(next) }, { viewTransition: true })
  }

  // Move focus to the new step (praise first, if any) so screen readers hear what changed.
  // Comparing with the previous step keeps this safe under StrictMode and skips the first load.
  useEffect(() => {
    if (prevStep.current === step) return
    prevStep.current = step
    ;(praiseRef.current ?? headingRef.current)?.focus()
  }, [step])

  // Reaching the last step is the achievement, however the person got there.
  useEffect(() => {
    if (step === DRILL_STEPS) markDrillDone()
  }, [step, markDrillDone])

  const demoCall = () => {
    startCall()
    navigate('/call', { viewTransition: true })
  }

  const praiseNow = praise && praise.step === step ? praise.kind : null

  const headings: Record<number, string> = {
    1: t('drill.imagine.heading'),
    2: t('drill.press.heading'),
    3: t('drill.code.heading'),
    4: t('drill.tell.heading'),
    5: t('drill.done.heading'),
  }

  // Exactly the words on screen, so speech is a second channel, never a different message.
  const spoken: Record<number, string> = {
    1: `${headings[1]}. ${t('drill.imagine.body')} ${t('drill.imagine.safe')}`,
    2: `${headings[2]}. ${t('drill.press.body')}`,
    3: `${headings[3]}. ${t('drill.code.body')}`,
    4: `${headings[4]}. ${person ? t('drill.tell.body', { name: person.name }) : t('drill.tell.none.body')}`,
    5: `${headings[5]} ${person ? t('drill.done.body', { name: person.name }) : t('drill.done.bodyNoPerson')}`,
  }

  const prevButton =
    step > 1 && step < DRILL_STEPS ? (
      <Button variant="quiet" icon={<ArrowLeft />} onClick={() => go(step - 1)} className={styles.prev}>
        {t('drill.prev')}
      </Button>
    ) : null

  return (
    <Screen title={t('drill.title')} back="/" tone={step === DRILL_STEPS ? 'calm' : 'default'}>
      <div className={styles.intro}>
        <p className="lead">{t('drill.lead')}</p>
        <StepProgress current={step} total={DRILL_STEPS} />
      </div>

      {praiseNow && (
        <div ref={praiseRef} tabIndex={-1} className={styles.praise}>
          {praiseNow === 'press' ? (
            <Callout tone="success" title={t('drill.praise.press.title')}>
              {t('drill.praise.press.body')}
            </Callout>
          ) : (
            <Callout tone="success" title={t(`drill.praise.${praiseNow}`)} />
          )}
        </div>
      )}

      <section className={styles.step} aria-labelledby="drill-step-heading">
        {step === DRILL_STEPS && <Celebration still={reduced} />}

        <h2
          id="drill-step-heading"
          ref={headingRef}
          tabIndex={-1}
          className={[styles.heading, step === DRILL_STEPS && styles.doneHeading].filter(Boolean).join(' ')}
        >
          {headings[step]}
        </h2>
        <div className={styles.listen}>
          <ListenButton text={spoken[step]} autoPlay={readAloud} variant="quiet" />
        </div>

        {step === 1 && (
          <>
            <div className={styles.scene}>
              <span className={styles.practiceTag}>
                <Clapperboard aria-hidden="true" />
                <span>{t('drill.practiceTag')}</span>
              </span>
              <DrillIllustration label={t('drill.imagine.illustration')} />
            </div>
            <p>{t('drill.imagine.body')}</p>
            <Callout tone="info" icon={<ShieldCheck />} title={t('drill.imagine.safe')}>
              {t('drill.imagine.fact')}
            </Callout>
            <Button variant="primary" size="lg" fullWidth onClick={() => go(2, 'imagine')}>
              {t('drill.imagine.next')}
            </Button>
            <DesignNote title={t('drill.note.rehearse.title')}>{t('drill.note.rehearse.body')}</DesignNote>
          </>
        )}

        {step === 2 && (
          <>
            <p>{t('drill.press.body')}</p>
            <BigButton
              title={t('drill.press.buttonTitle')}
              subtitle={t('drill.press.buttonSub')}
              icon={<Hand />}
              onClick={() => go(3, 'press')}
            />
            <p className={styles.muted}>{t('drill.press.note')}</p>
            {prevButton}
          </>
        )}

        {step === 3 && (
          <>
            <p>{t('drill.code.body')}</p>
            {codeWord ? (
              <>
                <Card tone="sunken" compact className={styles.codeCard}>
                  <Button
                    variant="secondary"
                    icon={revealed ? <EyeOff /> : <Eye />}
                    aria-expanded={revealed}
                    aria-controls={codeId}
                    onClick={() => setRevealed((r) => !r)}
                  >
                    {revealed ? t('drill.code.hide') : t('drill.code.show')}
                  </Button>
                  <div id={codeId}>
                    {revealed ? (
                      <div className={styles.codeReveal}>
                        <p className={styles.codeLabel}>
                          <KeyRound aria-hidden="true" />
                          <span>{t('drill.code.yourWord')}</span>
                        </p>
                        <p className={styles.codeWord}>{codeWord}</p>
                        <p>{t('drill.code.sayIt')}</p>
                      </div>
                    ) : (
                      <p className={styles.muted}>{t('drill.code.hiddenHint')}</p>
                    )}
                  </div>
                </Card>
                <Button variant="primary" size="lg" fullWidth onClick={() => go(4, 'code')}>
                  {t('drill.code.done')}
                </Button>
                <Button variant="quiet" onClick={() => go(4, 'skip')}>
                  {t('drill.skip')}
                </Button>
              </>
            ) : (
              <>
                <Callout tone="info" icon={<KeyRound />} title={t('drill.code.none.title')}>
                  {t('drill.code.none.body')}
                </Callout>
                <ButtonLink to="/setup/code-word" viewTransition variant="secondary" fullWidth icon={<KeyRound />}>
                  {t('drill.code.none.choose')}
                </ButtonLink>
                <Button variant="primary" size="lg" fullWidth onClick={() => go(4, 'skip')}>
                  {t('drill.code.none.continue')}
                </Button>
              </>
            )}
            {prevButton}
          </>
        )}

        {step === 4 && (
          <>
            {person ? (
              <>
                <p>{t('drill.tell.body', { name: person.name })}</p>
                <Card className={styles.personCard}>
                  <div className={styles.personRow}>
                    <span className={styles.avatar} aria-hidden="true">
                      {person.name.charAt(0)}
                    </span>
                    <div className={styles.personText}>
                      <p className={styles.personName}>{person.name}</p>
                      <p className={styles.muted}>
                        {person.relation ? `${person.relation} · ` : ''}
                        <span dir="ltr">{person.phone}</span>
                      </p>
                    </div>
                  </div>
                  <ButtonAnchor
                    href={tel(person.phone)}
                    variant="secondary"
                    fullWidth
                    icon={<PhoneCall />}
                    aria-describedby="drill-call-hint"
                  >
                    {t('drill.tell.call', { name: person.name })}
                  </ButtonAnchor>
                  <p id="drill-call-hint" className={styles.muted}>
                    {t('drill.tell.callHint', { name: person.name })}
                  </p>
                </Card>
              </>
            ) : (
              <>
                <Callout tone="info" icon={<UserPlus />} title={t('drill.tell.none.title')}>
                  {t('drill.tell.none.body')}
                </Callout>
                <ButtonLink to="/setup/person" viewTransition variant="secondary" fullWidth icon={<UserPlus />}>
                  {t('drill.tell.none.add')}
                </ButtonLink>
              </>
            )}
            <p className={styles.muted}>{t('drill.tell.also')}</p>
            <Button variant="primary" size="lg" fullWidth onClick={() => go(5)}>
              {t('drill.tell.done')}
            </Button>
            {prevButton}
          </>
        )}

        {step === DRILL_STEPS && (
          <>
            <p className={styles.doneBody}>
              {person ? t('drill.done.body', { name: person.name }) : t('drill.done.bodyNoPerson')}
            </p>
            {drillCompletedAt && (
              <p className={styles.muted}>{t('drill.done.when', { time: formatTime(drillCompletedAt, lang) })}</p>
            )}
            <p>{t('drill.done.again')}</p>
            <DesignNote title={t('drill.note.forgive.title')}>{t('drill.note.forgive.body')}</DesignNote>
            <div className={styles.doneActions}>
              <p id={demoHintId} className={styles.demoHint}>
                <span className={styles.demoTag}>{t('common.demoLabel')}</span> <span>{t('drill.done.demoHint')}</span>
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<PhoneCall />}
                onClick={demoCall}
                aria-describedby={demoHintId}
              >
                {t('drill.done.demo')}
              </Button>
              <ButtonLink to="/" viewTransition variant="secondary" fullWidth icon={<House />}>
                {t('drill.done.home')}
              </ButtonLink>
              <Button variant="quiet" icon={<RotateCcw />} onClick={() => go(1)}>
                {t('drill.done.restart')}
              </Button>
            </div>
          </>
        )}
      </section>
    </Screen>
  )
}
