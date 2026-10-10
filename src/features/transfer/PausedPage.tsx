import { useEffect, useId, useRef, type ReactNode } from 'react'
import {
  Circle,
  CircleCheck,
  CircleDot,
  Clapperboard,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  Hand,
  Hourglass,
  House,
  Landmark,
  Lock,
  LockOpen,
  PhoneCall,
  PhoneIncoming,
  Send,
  ShieldCheck,
  Siren,
  UserRound,
  Users,
} from 'lucide-react'
import {
  Button,
  ButtonAnchor,
  ButtonLink,
  Callout,
  DesignNote,
  ListenButton,
  Screen,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatClock, formatINR } from '../../lib/format'
import { assessAnswers } from '../../lib/scamSignals'
import { isSpeechSupported } from '../../lib/speech'
import { useNow, useReducedMotion, useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { TransferRequest, TrustedPerson } from '../../state/types'
import { useRichT } from './rich'
import {
  endWaitNow,
  isUnlocked,
  loopStatus,
  ruleCopy,
  sendAfterWait,
  telHref,
  type LoopStatus,
} from './transferModel'
import styles from './PausedPage.module.css'

type View = 'empty' | 'paused' | 'safe' | 'sent'

function viewFor(tr: TransferRequest | null): View {
  if (!tr || (tr.status === 'sent' && tr.ruleId === null)) return 'empty'
  if (tr.status === 'cancelled' || tr.status === 'blocked') return 'safe'
  if (tr.status === 'sent') return 'sent'
  return 'paused' // paused, or approved but not sent yet
}

/** Family-loop changes worth announcing: they arrive from the other phone, without any action here. */
const ANNOUNCED: LoopStatus[] = ['seen', 'calling', 'approved', 'blocked']

/**
 * /transfer/paused — the hero moment. Literal headline, the rule she chose while calm, a
 * protective wait, and her trusted person in the loop. Cancel is the one big button.
 */
export function PausedPage() {
  const { t, lang } = useT()
  const transfer = useStore((s) => s.incident.transfer)
  const incident = useStore((s) => s.incident)
  const sharing = useStore((s) => s.sharing)
  const callActive = useStore((s) => s.incident.callActive)
  const cancelTransfer = useStore((s) => s.cancelTransfer)
  const person = useTrustedPerson(transfer?.askPersonId)
  const view = viewFor(transfer)
  const status = loopStatus(incident, sharing, person !== null)
  const focusHeading = useRef(false)

  useEffect(() => {
    // Her own action replaced the buttons with a new page state: take focus to the new headline.
    if (!focusHeading.current) return
    focusHeading.current = false
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [view])

  const amount = transfer ? formatINR(transfer.amount, lang) : ''
  const title =
    view === 'paused' && transfer
      ? transfer.payeeIsNew
        ? t('transfer.paused.headline.new', { amount })
        : t('transfer.paused.headline.saved', { amount, payee: transfer.payeeName })
      : view === 'safe'
        ? t('transfer.safe.title', { amount })
        : view === 'sent'
          ? t('transfer.sent.title', { amount })
          : t('transfer.empty.title')

  const announcement =
    view !== 'empty' && ANNOUNCED.includes(status) ? t(`transfer.status.${status}`, { name: person?.name ?? '' }) : ''

  const cancel = () => {
    focusHeading.current = true
    cancelTransfer()
  }

  const sendAnyway = () => {
    focusHeading.current = true
    sendAfterWait()
  }

  return (
    <Screen
      title={title}
      back={callActive ? '/pause' : '/'}
      tone={view === 'paused' ? 'caution' : view === 'safe' ? 'calm' : 'default'}
      footer={
        view === 'paused' ? (
          <Button variant="primary" size="lg" fullWidth icon={<ShieldCheck />} onClick={cancel} className={styles.cancel}>
            {t('transfer.paused.cancel')}
          </Button>
        ) : undefined
      }
    >
      {/* Always first and always mounted, so a block from the other phone is announced even as
          the page switches to the safe state. */}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {view === 'paused' && transfer && (
        <PausedView transfer={transfer} person={person} status={status} onSendAnyway={sendAnyway} />
      )}
      {view === 'safe' && transfer && <SafeView transfer={transfer} person={person} />}
      {view === 'sent' && <SentView />}
      {view === 'empty' && <EmptyView />}
    </Screen>
  )
}

/* =========================================================
   Paused
   ========================================================= */

function PausedView({
  transfer,
  person,
  status,
  onSendAnyway,
}: {
  transfer: TransferRequest
  person: TrustedPerson | null
  status: LoopStatus
  onSendAnyway: () => void
}) {
  const { t, lang } = useT()
  const rt = useRichT()
  const now = useNow(1000)
  const rule = useStore((s) => s.rules.find((r) => r.id === transfer.ruleId) ?? null)
  const answers = useStore((s) => s.incident.answers)
  const readAloud = useStore((s) => s.prefs.readAloud)
  const lockTitleId = useId()
  const anywayHintId = useId()
  const demoHintId = useId()
  const lockHeadlineRef = useRef<HTMLParagraphElement>(null)
  const focusLock = useRef(false)

  const remaining = transfer.unlockAt === null ? 0 : Math.max(0, transfer.unlockAt - now)
  const total = transfer.unlockAt === null ? 1 : Math.max(1, transfer.unlockAt - transfer.requestedAt)
  const approved = transfer.status === 'approved'
  const unlocked = isUnlocked(transfer, now)
  const minutesLeft = Math.ceil(remaining / 60_000)
  const scam = assessAnswers(answers).level === 'scam'
  const name = person?.name.trim() ?? ''
  const amount = formatINR(transfer.amount, lang)
  const rc = ruleCopy(t, lang, rule, person)
  const headline = transfer.payeeIsNew
    ? t('transfer.paused.headline.new', { amount })
    : t('transfer.paused.headline.saved', { amount, payee: transfer.payeeName })
  // Exactly the words on screen (no ticking clock), so speech is a second channel, not a new message.
  const spoken = [headline, t('transfer.paused.because'), t(rc.key, rc.vars), t('transfer.paused.chosen')].join(' ')

  useEffect(() => {
    // "End the wait now" disappears once pressed: move focus to the new lock message.
    if (unlocked && focusLock.current) {
      focusLock.current = false
      lockHeadlineRef.current?.focus()
    }
  }, [unlocked])

  // Minute granularity only: the text changes once a minute, so it is announced once a minute.
  const srTime = approved
    ? ''
    : unlocked
      ? t('transfer.paused.srOver')
      : minutesLeft === 1
        ? t('transfer.paused.srLeftOne')
        : t('transfer.paused.srLeft', { count: minutesLeft })

  return (
    <>
      <div className={styles.meta}>
        <span className={styles.badge}>
          <Hand aria-hidden="true" />
          <span>{t('transfer.paused.badge')}</span>
        </span>
        <p className={styles.payee}>{rt('transfer.paused.payee', { payee: transfer.payeeName })}</p>
      </div>

      {scam && (
        <Callout tone="danger" title={t('transfer.paused.scam.title')}>
          <p>{t('transfer.paused.scam.body')}</p>
        </Callout>
      )}

      <figure className={styles.rule}>
        <figcaption className={styles.ruleIntro}>{t('transfer.paused.because')}</figcaption>
        <blockquote className={styles.quote}>
          <p>{rt(rc.key, rc.vars)}</p>
        </blockquote>
      </figure>

      {isSpeechSupported() && (
        <div className={styles.listen}>
          <ListenButton text={spoken} autoPlay={readAloud} variant="quiet" />
        </div>
      )}

      <section className={styles.lock} aria-labelledby={lockTitleId}>
        <h2 id={lockTitleId} className={styles.eyebrow}>
          {t('transfer.paused.lockTitle')}
        </h2>
        <div className={styles.lockRow}>
          <Ring fraction={unlocked ? 0 : remaining / total} unlocked={unlocked} />
          <div className={styles.lockText}>
            {approved ? (
              <p ref={lockHeadlineRef} tabIndex={-1} className={styles.lockHeadline}>
                {rt('transfer.paused.unlocked', { name })}
              </p>
            ) : unlocked ? (
              <>
                <p ref={lockHeadlineRef} tabIndex={-1} className={styles.lockHeadline}>
                  {t('transfer.paused.waitOver')}
                </p>
                <p className={styles.chosen}>{t('transfer.paused.waitOverBody')}</p>
              </>
            ) : (
              <>
                <p className={styles.lockedFor}>
                  {rt('transfer.paused.lockedFor', {}, {
                    time: (
                      <span role="timer" className={styles.clock}>
                        {formatClock(remaining)}
                      </span>
                    ),
                  })}
                </p>
                <p className={styles.chosen}>{t('transfer.paused.chosen')}</p>
              </>
            )}
          </div>
        </div>
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {srTime}
        </p>
        <FamilyLoop status={status} name={name} />
      </section>

      <div className={styles.actions}>
        {person && (
          <ButtonAnchor href={telHref(person.phone)} variant="secondary" fullWidth icon={<PhoneCall />}>
            {rt('transfer.paused.call', { name })}
          </ButtonAnchor>
        )}
        {unlocked && (
          <div className={styles.anyway}>
            <Button variant="quiet" fullWidth icon={<Send />} onClick={onSendAnyway} aria-describedby={anywayHintId}>
              {t('transfer.paused.sendAnyway', { amount })}
            </Button>
            <p id={anywayHintId} className={styles.hint}>
              {t('transfer.paused.sendAnywayHint')}
            </p>
          </div>
        )}
      </div>

      {!unlocked && (
        <div className={styles.demo}>
          <Button
            variant="quiet"
            icon={<Clapperboard />}
            aria-describedby={demoHintId}
            onClick={() => {
              focusLock.current = true
              // Use this screen's clock, so the change shows at once (not at the next tick).
              endWaitNow(now)
            }}
          >
            {t('transfer.paused.demoEnd')}
          </Button>
          <p id={demoHintId} className={styles.hint}>
            {t('transfer.paused.demoHint')}
          </p>
        </div>
      )}

      <DesignNote title={t('transfer.paused.note.friction.title')}>{t('transfer.paused.note.friction.body')}</DesignNote>
      <DesignNote title={t('transfer.paused.note.rbi.title')}>{t('transfer.paused.note.rbi.body')}</DesignNote>
    </>
  )
}

/** Decorative progress ring for the protective wait. The words beside it carry the meaning. */
function Ring({ fraction, unlocked }: { fraction: number; unlocked: boolean }) {
  const reduce = useReducedMotion()
  const r = 42
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, fraction))
  return (
    <span className={[styles.ring, reduce && styles.still].filter(Boolean).join(' ')} aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        <circle className={styles.ringTrack} cx="50" cy="50" r={r} />
        <circle
          className={styles.ringValue}
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
        />
      </svg>
      <span className={styles.ringIcon}>{unlocked ? <LockOpen /> : <Lock />}</span>
    </span>
  )
}

const STATUS_ICON: Record<LoopStatus, ReactNode> = {
  waiting: <Hourglass />,
  seen: <Eye />,
  calling: <PhoneIncoming />,
  approved: <LockOpen />,
  blocked: <ShieldCheck />,
  notShared: <EyeOff />,
  noPerson: <UserRound />,
}

type StepState = 'done' | 'now' | 'next'

/** The family loop, live: the other phone's actions show up here without a refresh. */
function FamilyLoop({ status, name }: { status: LoopStatus; name: string }) {
  const { t } = useT()
  const rt = useRichT()
  const showSteps = status === 'waiting' || status === 'seen' || status === 'calling' || status === 'approved'
  const seen = status !== 'waiting'
  const decided = status === 'approved'
  const steps: { key: string; label: ReactNode; state: StepState }[] = [
    { key: 'asked', label: rt('transfer.loop.asked', { name }), state: 'done' },
    { key: 'seen', label: rt('transfer.loop.seen', { name }), state: seen ? 'done' : 'now' },
    {
      key: 'decided',
      label: rt(status === 'calling' ? 'transfer.loop.calling' : 'transfer.loop.decided', { name }),
      state: decided ? 'done' : seen ? 'now' : 'next',
    },
  ]

  return (
    <div className={styles.loop}>
      <p className={[styles.status, styles[`status_${status}`]].filter(Boolean).join(' ')}>
        <span className={styles.statusIcon} aria-hidden="true">
          {STATUS_ICON[status]}
        </span>
        <span>{rt(`transfer.status.${status}`, { name })}</span>
      </p>
      {showSteps && (
        <ol className={styles.steps} aria-label={t('transfer.loop.label', { name })}>
          {steps.map((s) => (
            <li key={s.key} className={styles[`step_${s.state}`]}>
              <span className={styles.stepIcon} aria-hidden="true">
                {s.state === 'done' ? <CircleCheck /> : s.state === 'now' ? <CircleDot /> : <Circle />}
              </span>
              <span>
                {s.label}{' '}
                <span className="visually-hidden">({t(`transfer.loop.${s.state}`)})</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* =========================================================
   Safe — cancelled by her, or blocked by her person
   ========================================================= */

function SafeView({ transfer, person }: { transfer: TransferRequest; person: TrustedPerson | null }) {
  const { t } = useT()
  const rt = useRichT()
  const callActive = useStore((s) => s.incident.callActive)
  const nextId = useId()
  const name = person?.name.trim() ?? ''
  const blocked = transfer.status === 'blocked'

  return (
    <>
      <div className={styles.safeHero}>
        <span className={styles.safeIcon} aria-hidden="true">
          <ShieldCheck />
        </span>
        <div className={styles.safeText}>
          <p className={styles.safeLine}>
            {blocked ? rt('transfer.safe.blockedBy', { name }) : t('transfer.safe.cancelledByYou')}
          </p>
          {callActive && <p>{t('transfer.safe.hangUp')}</p>}
        </div>
      </div>

      <section className={styles.next} aria-labelledby={nextId}>
        <h2 id={nextId} className={styles.sectionTitle}>
          {t('transfer.safe.next')}
        </h2>
        <ol className={styles.nextList}>
          <li>
            <span className={styles.nextNum} aria-hidden="true">
              1
            </span>
            <div className={styles.nextBody}>
              <p className={styles.nextTitle}>{t('transfer.safe.step.report')}</p>
              <p className={styles.hint}>{t('transfer.safe.step.reportHelp')}</p>
              <ButtonAnchor
                href="https://sancharsaathi.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                icon={<Flag />}
                iconEnd={<ExternalLink />}
              >
                {t('transfer.safe.step.reportLink')}{' '}
                <span className="visually-hidden">{t('transfer.newTab')}</span>
              </ButtonAnchor>
            </div>
          </li>
          <li>
            <span className={styles.nextNum} aria-hidden="true">
              2
            </span>
            <div className={styles.nextBody}>
              <p className={styles.nextTitle}>{t('transfer.safe.step.otp')}</p>
              <p className={styles.hint}>{t('transfer.safe.step.otpHelp')}</p>
              <ButtonAnchor href="tel:1930" variant="secondary" icon={<PhoneCall />}>
                {t('transfer.safe.step.otpCall')}
              </ButtonAnchor>
            </div>
          </li>
          <li>
            <span className={styles.nextNum} aria-hidden="true">
              3
            </span>
            <div className={styles.nextBody}>
              <p className={styles.nextTitle}>{t('transfer.safe.step.family')}</p>
              <p className={styles.hint}>{t('transfer.safe.step.familyHelp')}</p>
              {person && (
                <ButtonAnchor href={telHref(person.phone)} variant="secondary" icon={<Users />}>
                  {rt('transfer.safe.step.familyCall', { name })}
                </ButtonAnchor>
              )}
            </div>
          </li>
        </ol>
      </section>

      <ButtonLink to="/" viewTransition variant="primary" size="lg" fullWidth icon={<House />}>
        {t('transfer.home')}
      </ButtonLink>
    </>
  )
}

/* =========================================================
   Sent after the wait — autonomy, with the golden hour one tap away
   ========================================================= */

function SentView() {
  const { t } = useT()
  return (
    <>
      <p className="lead">{t('transfer.sent.body')}</p>
      <Callout tone="caution" title={t('transfer.sent.helpTitle')}>
        <p>{t('transfer.sent.helpBody')}</p>
      </Callout>
      <div className={styles.actions}>
        <ButtonLink to="/golden-hour" viewTransition variant="danger" size="lg" fullWidth icon={<Siren />}>
          {t('transfer.sent.goldenHour')}
        </ButtonLink>
        <ButtonAnchor href="tel:1930" variant="secondary" fullWidth icon={<PhoneCall />}>
          {t('transfer.sent.call1930')}
        </ButtonAnchor>
        <ButtonLink to="/" viewTransition variant="quiet" fullWidth icon={<House />}>
          {t('transfer.home')}
        </ButtonLink>
      </div>
    </>
  )
}

/* =========================================================
   Nothing paused
   ========================================================= */

function EmptyView() {
  const { t } = useT()
  return (
    <>
      <p className="lead">{t('transfer.empty.body')}</p>
      <ButtonLink to="/transfer" viewTransition variant="primary" size="lg" fullWidth icon={<Landmark />}>
        {t('transfer.empty.open')}
      </ButtonLink>
      <ButtonLink to="/" viewTransition variant="quiet" fullWidth icon={<House />}>
        {t('transfer.home')}
      </ButtonLink>
    </>
  )
}
