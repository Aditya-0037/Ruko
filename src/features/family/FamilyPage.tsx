import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import {
  BellOff,
  BellRing,
  Check,
  CircleHelp,
  Clock,
  EyeOff,
  Hand,
  LockOpen,
  PhoneCall,
  PhoneOff,
  PhoneOutgoing,
  Send,
  ShieldCheck,
  Smartphone,
  Sun,
  TriangleAlert,
  Undo2,
  Users,
} from 'lucide-react'
import {
  Button,
  ButtonAnchor,
  Callout,
  DesignNote,
  Screen,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatINR, minutesBetween } from '../../lib/format'
import { assessAnswers } from '../../lib/scamSignals'
import { useNow, useReducedMotion } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { CheckAnswer, SignalId, TransferRequest } from '../../state/types'
import { useRichT } from '../transfer/rich'
import { waitForText } from '../transfer/transferModel'
import {
  elderRef,
  snapshotDecision,
  undoApproval,
  useMarkSeen,
  type DecisionSnapshot,
} from './familyActions'
import styles from './FamilyPage.module.css'

const DEFAULT_CALLER = 'CBI Mumbai'

/**
 * /family — Rahul's phone. Silent until it matters (Calm Technology). Shows only what Kamla chose
 * to share, and gives one-tap ways to call, block or approve, with Undo instead of "Are you sure?".
 */
export function FamilyPage() {
  const { t } = useT()
  const rt = useRichT()
  const elderName = useStore((s) => s.setup.elderName)
  const people = useStore((s) => s.people)
  const incident = useStore((s) => s.incident)
  const sharing = useStore((s) => s.sharing)
  const loadDemoProfile = useStore((s) => s.loadDemoProfile)
  const familyDecide = useStore((s) => s.familyDecide)
  const [calling, setCalling] = useState(false)
  const callingHeadingRef = useRef<HTMLHeadingElement>(null)
  const focusAfterCall = useRef<'panel' | 'page' | null>(null)

  const viewerId = incident.alertPersonId ?? incident.transfer?.askPersonId ?? null
  const viewer = people.find((p) => p.id === viewerId) ?? people[0] ?? null
  const elder = elderRef(t, viewer, elderName)
  const elderFull = elderName.trim() || t('family.elderFallback')
  const title = viewer?.name.trim() ? t('family.title', { person: viewer.name.trim() }) : t('family.titleNoPerson')

  const tr = incident.transfer
  const alertVisible = incident.alertSentAt !== null && sharing.alertsDuringCall
  const transferVisible = tr !== null && tr.ruleId !== null && sharing.transferPauses
  const anyVisible = alertVisible || transferVisible
  const notSetUp = people.length === 0 && !elderName.trim()

  useMarkSeen(anyVisible, transferVisible && tr ? tr.requestedAt : null)

  useEffect(() => {
    const target = focusAfterCall.current
    if (!target) return
    focusAfterCall.current = null
    if (target === 'panel') callingHeadingRef.current?.focus()
    else document.querySelector<HTMLElement>('main h1')?.focus()
  }, [calling])

  const call = () => {
    familyDecide('calling')
    focusAfterCall.current = 'panel'
    setCalling(true)
  }

  const endCall = () => {
    focusAfterCall.current = 'page'
    setCalling(false)
  }

  const callButton = (variant: 'primary' | 'secondary') =>
    calling ? null : (
      <Button variant={variant} size={variant === 'primary' ? 'lg' : 'md'} fullWidth icon={<PhoneCall />} onClick={call}>
        {rt('family.callElder', { elder })}
      </Button>
    )

  return (
    <Screen title={title} back="/" className={styles.family}>
      <div className={styles.role}>
        <span className={styles.avatar} aria-hidden="true">
          {(viewer?.name.trim()[0] ?? '?').toUpperCase()}
        </span>
        <div className={styles.roleText}>
          <p className={styles.roleLabel}>
            <Smartphone aria-hidden="true" />
            <span>{t('family.role')}</span>
          </p>
          <p className={styles.roleFor}>{rt('family.roleFor', { elder: elderFull })}</p>
        </div>
      </div>

      {calling && (
        <CallingPanel elder={elder} headingRef={callingHeadingRef} onEnd={endCall} />
      )}

      {anyVisible ? (
        <>
          {transferVisible && tr && (
            <TransferCard transfer={tr} elder={elder} callButton={callButton('secondary')} />
          )}
          {alertVisible && (
            <AlertCard elder={elder} callButton={transferVisible ? null : callButton('primary')} />
          )}
          {alertVisible && !sharing.transferPauses && (
            <div className={styles.private}>
              <span className={styles.privateIcon} aria-hidden="true">
                <EyeOff />
              </span>
              <div className={styles.privateText}>
                <p className={styles.privateTitle}>{rt('family.notShared.title', { elder })}</p>
                <p>{rt('family.notShared.body', { elder })}</p>
              </div>
            </div>
          )}
          <DesignNote title={t('family.note.dignity.title')}>{t('family.note.dignity.body')}</DesignNote>
        </>
      ) : (
        <>
          {notSetUp && (
            <Callout tone="info" icon={<Users />} title={t('family.setup.title')}>
              <p>{t('family.setup.body')}</p>
              <Button variant="secondary" icon={<Users />} onClick={loadDemoProfile} className={styles.calloutAction}>
                {t('family.setup.load')}
              </Button>
            </Callout>
          )}
          <QuietState elder={elder} />
        </>
      )}
    </Screen>
  )
}

/* =========================================================
   Nothing happening — calm by default
   ========================================================= */

function QuietState({ elder }: { elder: string }) {
  const { t } = useT()
  const rt = useRichT()
  const sharing = useStore((s) => s.sharing)
  const quietId = useId()
  const whenId = useId()
  const neverId = useId()
  const exampleId = useId()

  return (
    <>
      <section className={styles.quiet} aria-labelledby={quietId}>
        <span className={styles.quietIcon} aria-hidden="true">
          <Sun />
        </span>
        <h2 id={quietId} className={styles.quietTitle}>
          {t('family.quiet.title')}
        </h2>
        <p className="lead">{rt('family.quiet.body', { elder })}</p>
      </section>

      <section className={styles.section} aria-labelledby={whenId}>
        <h2 id={whenId} className={styles.sectionTitle}>
          {t('family.quiet.whenTitle')}
        </h2>
        <ul className={styles.list}>
          <li>
            <span className={styles.listIcon} aria-hidden="true">
              {sharing.alertsDuringCall ? <BellRing /> : <BellOff />}
            </span>
            <span>
              {sharing.alertsDuringCall
                ? rt('family.quiet.whenAlert', { elder })
                : rt('family.quiet.alertsOff', { elder })}
            </span>
          </li>
          <li>
            <span className={styles.listIcon} aria-hidden="true">
              {sharing.transferPauses ? <Hand /> : <EyeOff />}
            </span>
            <span>
              {sharing.transferPauses
                ? rt('family.quiet.whenTransfer', { elder })
                : rt('family.quiet.transferNotShared', { elder })}
            </span>
          </li>
        </ul>
      </section>

      <figure className={styles.example} aria-labelledby={exampleId}>
        <figcaption id={exampleId} className={styles.exampleCaption}>
          {t('family.example.caption')}
        </figcaption>
        <div className={styles.exampleCard}>
          <p className={styles.badge}>
            <TriangleAlert aria-hidden="true" />
            <span>{t('family.example.badge')}</span>
          </p>
          <p className={styles.exampleTitle}>{rt('family.alert.title', { elder })}</p>
          <p className={styles.exampleChip}>
            <PhoneCall aria-hidden="true" />
            <span>{rt('family.callElder', { elder })}</span>
          </p>
        </div>
      </figure>

      <section className={styles.section} aria-labelledby={neverId}>
        <h2 id={neverId} className={styles.sectionTitle}>
          {t('family.quiet.neverTitle')}
        </h2>
        <p className={styles.never}>
          <span className={styles.listIcon} aria-hidden="true">
            <EyeOff />
          </span>
          <span>{rt('family.quiet.never', { elder })}</span>
        </p>
      </section>

      <DesignNote title={t('family.note.calm.title')}>{t('family.note.calm.body')}</DesignNote>
    </>
  )
}

/* =========================================================
   The alert: Maa pressed Ruko during a call
   ========================================================= */

function AlertCard({ elder, callButton }: { elder: string; callButton: ReactNode }) {
  const { t } = useT()
  const rt = useRichT()
  const now = useNow(15_000)
  const alertSentAt = useStore((s) => s.incident.alertSentAt)
  const callerLabel = useStore((s) => s.incident.callerLabel)
  const answers = useStore((s) => s.incident.answers)
  const titleId = useId()
  const mins = alertSentAt === null ? 0 : minutesBetween(alertSentAt, now)
  const caller = !callerLabel || callerLabel === DEFAULT_CALLER ? t('family.callerDefault') : callerLabel

  return (
    <article className={[styles.card, styles.alertCard].join(' ')} aria-labelledby={titleId}>
      <div className={styles.cardTop}>
        <p className={[styles.badge, styles.badgeAlert].join(' ')}>
          <TriangleAlert aria-hidden="true" />
          <span>{t('family.alert.badge')}</span>
        </p>
        <p className={styles.time}>
          <Clock aria-hidden="true" />
          <span>{mins < 1 ? t('family.time.justNow') : t('family.time.minutes', { count: mins })}</span>
        </p>
      </div>
      <h2 id={titleId} className={styles.cardTitle}>
        {rt('family.alert.title', { elder })}
      </h2>
      <p>{rt('family.alert.caller', { caller })}</p>
      <Signs answers={answers} elder={elder} />
      {callButton}
    </article>
  )
}

function Signs({ answers, elder }: { answers: Partial<Record<SignalId, CheckAnswer>>; elder: string }) {
  const { t } = useT()
  const rt = useRichT()
  const titleId = useId()
  if (Object.keys(answers).length === 0) return null
  const a = assessAnswers(answers)
  return (
    <section className={styles.signs} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.signsTitle}>
        {rt('family.signs.title', { elder })}
      </h3>
      {a.matched.length > 0 && (
        <>
          <p className={styles.signsIntro}>{t('family.signs.yesIntro')}</p>
          <ul className={styles.signList}>
            {a.matched.map((id) => (
              <li key={id} className={styles.signYes}>
                <Check aria-hidden="true" />
                <span>{t(`family.sign.${id}`)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {a.unsure.length > 0 && (
        <>
          <p className={styles.signsIntro}>{t('family.signs.unsureIntro')}</p>
          <ul className={styles.signList}>
            {a.unsure.map((id) => (
              <li key={id}>
                <CircleHelp aria-hidden="true" />
                <span>{t(`family.sign.${id}`)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {a.level === 'clear' && <p>{t('family.signs.clear')}</p>}
    </section>
  )
}

/* =========================================================
   The paused transfer: block, approve (with undo) or call
   ========================================================= */

/** Each state says what it is in words, with its own icon — never colour alone. */
const BADGE: Record<TransferRequest['status'], { icon: ReactNode; className?: string }> = {
  paused: { icon: <Hand />, className: styles.badgePaused },
  blocked: { icon: <ShieldCheck />, className: styles.badgeSafe },
  cancelled: { icon: <ShieldCheck />, className: styles.badgeSafe },
  approved: { icon: <LockOpen /> },
  sent: { icon: <Send />, className: styles.badgeAlert },
}

function TransferCard({
  transfer,
  elder,
  callButton,
}: {
  transfer: TransferRequest
  elder: string
  callButton: ReactNode
}) {
  const { t, lang } = useT()
  const rt = useRichT()
  const toast = useToast()
  const now = useNow(15_000)
  const familyDecide = useStore((s) => s.familyDecide)
  const ruleWait = useStore((s) => s.rules.find((r) => r.id === transfer.ruleId)?.waitMinutes ?? null)
  const titleId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)
  const snapshot = useRef<DecisionSnapshot | null>(null)

  const amount = formatINR(transfer.amount, lang)
  const status = transfer.status

  useEffect(() => {
    // Block / Approve / Undo replace the buttons: keep focus on the card, whose heading now says what happened.
    if (!focusHeading.current) return
    focusHeading.current = false
    headingRef.current?.focus()
  }, [status])

  const waitMinutes =
    ruleWait ??
    (transfer.unlockAt === null ? 0 : Math.max(1, Math.round((transfer.unlockAt - transfer.requestedAt) / 60_000)))
  const remaining = transfer.unlockAt === null ? 0 : transfer.unlockAt - now

  const restore = () => {
    focusHeading.current = true
    if (undoApproval(snapshot.current ?? { incidentId: useStore.getState().incident.id, decision: null, decidedAt: null })) {
      toast({ message: t('family.toast.restored') })
    }
  }

  const block = () => {
    focusHeading.current = true
    familyDecide('block')
  }

  const approve = () => {
    snapshot.current = snapshotDecision()
    focusHeading.current = true
    familyDecide('approve')
    toast({
      message: t('family.toast.approved', { amount }),
      actionLabel: t('common.undo'),
      onAction: restore,
    })
  }

  let heading: ReactNode
  let body: ReactNode = null
  let tone: 'caution' | 'success' | 'neutral' | 'danger' = 'caution'

  if (status === 'paused') {
    heading = rt(transfer.payeeIsNew ? 'family.transfer.title.new' : 'family.transfer.title.saved', {
      elder,
      amount,
      payee: transfer.payeeName,
      waitFor: waitForText(t, waitMinutes),
    })
    body = (
      <>
        <p className={styles.time}>
          <Clock aria-hidden="true" />
          <span>
            {remaining <= 0
              ? t('family.transfer.unlocked')
              : remaining < 60_000
                ? t('family.transfer.unlocksSoon')
                : t('family.transfer.unlocks', { count: Math.ceil(remaining / 60_000) })}
          </span>
        </p>
        <div className={styles.decide}>
          <Button variant="primary" size="lg" fullWidth icon={<ShieldCheck />} onClick={block}>
            {t('family.transfer.block')}
          </Button>
          <Button variant="secondary" fullWidth onClick={approve}>
            {t('family.transfer.approve', { amount })}
          </Button>
          {callButton}
        </div>
      </>
    )
  } else if (status === 'blocked') {
    tone = 'success'
    heading = rt('family.transfer.blocked', { elder, amount })
    body = (
      <>
        <p>{rt('family.transfer.blockedTold', { elder })}</p>
        {callButton}
      </>
    )
  } else if (status === 'approved') {
    tone = 'neutral'
    heading = t('family.transfer.approved', { amount })
    body = (
      <div className={styles.decide}>
        <Button variant="secondary" fullWidth icon={<Undo2 />} onClick={restore}>
          {t('family.transfer.undoApproval')}
        </Button>
        {callButton}
      </div>
    )
  } else if (status === 'cancelled') {
    tone = 'success'
    heading = rt('family.transfer.cancelled', { elder, amount })
    body = callButton
  } else {
    tone = 'danger'
    heading = rt('family.transfer.sent', { elder, amount })
    body = (
      <>
        <p>{rt('family.transfer.sentHelp', { elder })}</p>
        <div className={styles.decide}>
          <ButtonAnchor href="tel:1930" variant="danger" fullWidth icon={<PhoneCall />}>
            {t('family.transfer.call1930')}
          </ButtonAnchor>
          {callButton}
        </div>
      </>
    )
  }

  return (
    <article className={[styles.card, styles[`tone_${tone}`]].join(' ')} aria-labelledby={titleId}>
      <div className={styles.cardTop}>
        <p className={[styles.badge, BADGE[status].className].filter(Boolean).join(' ')}>
          <span className={styles.badgeIcon} aria-hidden="true">
            {BADGE[status].icon}
          </span>
          <span>{t(status === 'paused' ? 'family.transfer.badge' : `family.transfer.badge.${status}`)}</span>
        </p>
      </div>
      <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.cardTitle}>
        {heading}
      </h2>
      {body}
    </article>
  )
}

/* =========================================================
   Calling Maa (simulated)
   ========================================================= */

function CallingPanel({
  elder,
  headingRef,
  onEnd,
}: {
  elder: string
  headingRef: RefObject<HTMLHeadingElement | null>
  onEnd: () => void
}) {
  const { t } = useT()
  const rt = useRichT()
  const reduce = useReducedMotion()
  const hasCodeWord = useStore((s) => s.setup.codeWord.trim().length > 0)
  const titleId = useId()
  const sayId = useId()

  return (
    <section className={styles.calling} aria-labelledby={titleId}>
      <div className={styles.callingTop}>
        <span className={[styles.pulse, !reduce && styles.pulseOn].filter(Boolean).join(' ')} aria-hidden="true">
          <PhoneOutgoing />
        </span>
        <div className={styles.callingText}>
          <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.cardTitle}>
            {rt('family.calling.title', { elder })}
          </h2>
          <p className={styles.muted}>{t('family.calling.simulated')}</p>
        </div>
      </div>
      <p>{rt('family.calling.shown', { elder })}</p>
      <h3 id={sayId} className={styles.signsTitle}>
        {t('family.calling.sayTitle')}
      </h3>
      <ul className={styles.list} aria-labelledby={sayId}>
        <li>
          <span className={styles.listIcon} aria-hidden="true">
            <Check />
          </span>
          <span>{rt('family.calling.say1', { elder })}</span>
        </li>
        <li>
          <span className={styles.listIcon} aria-hidden="true">
            <Check />
          </span>
          <span>{rt('family.calling.say2', { elder })}</span>
        </li>
        {hasCodeWord && (
          <li>
            <span className={styles.listIcon} aria-hidden="true">
              <Check />
            </span>
            <span>{rt('family.calling.say3', { elder })}</span>
          </li>
        )}
      </ul>
      <Button variant="secondary" fullWidth icon={<PhoneOff />} onClick={onEnd}>
        {t('family.calling.end')}
      </Button>
    </section>
  )
}
