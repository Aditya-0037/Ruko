import { useEffect, useId, useRef, useState } from 'react'
import {
  ArrowLeft,
  BellOff,
  BellRing,
  Check,
  Clock,
  EyeOff,
  ListChecks,
  PhoneCall,
  PhoneOff,
  Settings2,
  Smartphone,
  UserPlus,
} from 'lucide-react'
import {
  Button,
  ButtonAnchor,
  ButtonLink,
  Callout,
  DesignNote,
  RukoMark,
  Screen,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatTime } from '../../lib/format'
import { useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import type { TrustedPerson } from '../../state/types'
import { useCallerLabel } from '../call/callerLabel'
import { telHref } from './tel'
import styles from './TellPage.module.css'

/** Long enough to read "Telling Rahul…", short enough to feel instant. */
export const SEND_DELAY_MS = 1200

/**
 * /tell — "Tell my person". Explicit and transparent: she sees exactly what Rahul will get and
 * what is not shared, and nothing is sent until she presses the button.
 */
export function TellPage() {
  const { t } = useT()
  const alertPersonId = useStore((s) => s.incident.alertPersonId)
  const alertsOn = useStore((s) => s.sharing.alertsDuringCall)
  const person = useTrustedPerson(alertPersonId)

  const title = person ? t('pause.tell.title', { name: person.name }) : t('pause.tell.titleNoPerson')

  if (person && alertsOn) return <SendFlow person={person} title={title} />

  return (
    <Screen title={title} back="/pause" tone="calm">
      {person ? <AlertsOff person={person} /> : <NoPerson />}
    </Screen>
  )
}

/* ---------------- states ---------------- */

function NoPerson() {
  const { t } = useT()
  return (
    <>
      <Callout tone="info" icon={<UserPlus />}>
        <p>{t('pause.tell.noPerson.body')}</p>
      </Callout>
      <ButtonLink to="/setup/person" viewTransition variant="primary" size="lg" fullWidth icon={<UserPlus />}>
        {t('pause.tell.addPerson')}
      </ButtonLink>
      <NextActions person={null} sent={false} />
    </>
  )
}

function AlertsOff({ person }: { person: TrustedPerson }) {
  const { t } = useT()
  return (
    <>
      <Callout tone="info" icon={<BellOff />} title={t('pause.tell.off.title')}>
        <p>{t('pause.tell.off.body', { name: person.name })}</p>
      </Callout>
      <ButtonAnchor href={telHref(person.phone)} variant="primary" size="lg" fullWidth icon={<PhoneCall />}>
        {t('pause.tell.call', { name: person.name })}
      </ButtonAnchor>
      <ButtonLink to="/setup/sharing" viewTransition variant="quiet" fullWidth icon={<Settings2 />}>
        {t('pause.tell.off.change')}
      </ButtonLink>
      <NextActions person={null} sent={false} />
    </>
  )
}

function SendFlow({ person, title }: { person: TrustedPerson; title: string }) {
  const { t, lang } = useT()
  const alertSentAt = useStore((s) => s.incident.alertSentAt)
  const sendAlert = useStore((s) => s.sendAlert)
  const [sending, setSending] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const timerRef = useRef<number | null>(null)
  const pendingPersonRef = useRef<string | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const stepsId = useId()
  const sharedId = useId()

  useEffect(
    () => () => {
      // Leaving mid-send must not lose the alert she asked for: send it right away.
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
        useStore.getState().sendAlert(pendingPersonRef.current ?? undefined)
      }
    },
    [],
  )

  useEffect(() => {
    // The send button is replaced by the result: move focus there so it is not lost.
    if (justSent) successRef.current?.focus()
  }, [justSent])

  const send = () => {
    if (sending) return
    setSending(true)
    pendingPersonRef.current = person.id
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      sendAlert(person.id)
      setSending(false)
      setJustSent(true)
    }, SEND_DELAY_MS)
  }

  const sent = alertSentAt !== null

  // Until it is sent, the one action lives in the sticky footer: always at thumb reach, while the
  // preview above shows exactly what will be sent.
  const sendButton = (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      icon={<BellRing />}
      loading={sending}
      loadingText={t('pause.tell.sending', { name: person.name })}
      onClick={send}
      className={styles.sendButton}
    >
      {t('pause.tell.send', { name: person.name })}
    </Button>
  )

  return (
    <Screen title={title} back="/pause" tone="calm" footer={sent ? undefined : sendButton}>
      <div>
        {/* Present (and in the accessibility tree) from the start, so the success message is
            announced when it appears. Empty, it takes no space. */}
        <div role="status">
          {sent && (
            <div ref={successRef} tabIndex={-1} className={styles.success}>
              <Callout tone="success" title={t('pause.tell.sentTitle', { name: person.name })}>
                <p>{t('pause.tell.sentBody')}</p>
                <p className={styles.sentAt}>
                  <Clock aria-hidden="true" />
                  <span>{t('pause.tell.sentAt', { time: formatTime(alertSentAt, lang) })}</span>
                </p>
              </Callout>
            </div>
          )}
        </div>
        {!sent && <p className="lead">{t('pause.tell.lead', { name: person.name })}</p>}
      </div>

      {sent ? (
        <>
          <NextActions person={person} sent />
          <Preview person={person} sent />
          <Button
            variant="quiet"
            fullWidth
            icon={<BellRing />}
            loading={sending}
            loadingText={t('pause.tell.sending', { name: person.name })}
            onClick={send}
          >
            {t('pause.tell.sendAgain', { name: person.name })}
          </Button>
          <Shared id={sharedId} />
        </>
      ) : (
        <>
          <Preview person={person} sent={false} />
          <DesignNote title={t('pause.tell.note.progress.title')}>{t('pause.tell.note.progress.body')}</DesignNote>
          <section className={styles.section} aria-labelledby={stepsId}>
            <h2 id={stepsId} className={styles.sectionTitle}>
              {t('pause.tell.steps.title')}
            </h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Smartphone />
                </span>
                <span>{t('pause.tell.step1', { name: person.name })}</span>
              </li>
              <li>
                <span className={styles.stepIcon} aria-hidden="true">
                  <PhoneOff />
                </span>
                <span>{t('pause.tell.step2')}</span>
              </li>
              <li>
                <span className={styles.stepIcon} aria-hidden="true">
                  <PhoneCall />
                </span>
                <span>{t('pause.tell.step3', { name: person.name })}</span>
              </li>
            </ol>
          </section>
          <Shared id={sharedId} />
          <NextActions person={person} sent={false} />
        </>
      )}

      <DesignNote title={t('pause.tell.note.preview.title')}>{t('pause.tell.note.preview.body')}</DesignNote>
    </Screen>
  )
}

/* ---------------- pieces ---------------- */

/** A faithful preview of the notification on the trusted person's phone. */
function Preview({ person, sent }: { person: TrustedPerson; sent: boolean }) {
  const { t } = useT()
  const elderName = useStore((s) => s.setup.elderName)
  const caller = useCallerLabel()
  const titleId = useId()
  const elder = elderName.trim() || t('pause.tell.elderFallback')

  return (
    <section className={styles.previewSection} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        {sent
          ? t('pause.tell.previewTitleSent', { name: person.name })
          : t('pause.tell.previewTitle', { name: person.name })}
      </h2>
      <figure className={styles.preview}>
        <figcaption className={styles.previewCaption}>
          <Smartphone aria-hidden="true" />
          <span>{t('pause.tell.previewCaption', { name: person.name })}</span>
        </figcaption>
        <div className={styles.notification}>
          <p className={styles.notifApp}>
            <RukoMark className={styles.notifMark} />
            <span>{t('pause.tell.previewApp')}</span>
          </p>
          <p className={styles.notifTitle}>{t('pause.tell.previewHeading', { elder })}</p>
          <p className={styles.notifBody}>
            {t('pause.tell.previewBody', { elder, caller: caller.text })}
          </p>
          <p className={styles.notifActions}>
            <span className="visually-hidden">{t('pause.tell.previewButtons', { name: person.name })} </span>
            <span className={styles.notifChip}>{t('pause.tell.previewCall', { elder })}</span>
            <span className={styles.notifChip}>{t('pause.tell.previewOpen')}</span>
          </p>
        </div>
      </figure>
    </section>
  )
}

/** Dignity-first: what is and is not shared, in words (never colour alone). */
function Shared({ id }: { id: string }) {
  const { t } = useT()
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        {t('pause.tell.shared.title')}
      </h2>
      <ul className={styles.shared}>
        <li>
          <span className={styles.sharedIcon} aria-hidden="true">
            <Check />
          </span>
          <span>{t('pause.tell.shared.yes')}</span>
        </li>
        <li>
          <span className={styles.sharedIcon} aria-hidden="true">
            <EyeOff />
          </span>
          <span>{t('pause.tell.shared.no')}</span>
        </li>
      </ul>
    </section>
  )
}

function NextActions({ person, sent }: { person: TrustedPerson | null; sent: boolean }) {
  const { t } = useT()
  const titleId = useId()
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        {sent ? t('pause.tell.next.title') : t('pause.tell.next.titleBefore')}
      </h2>
      <div className={styles.nextList}>
        <ButtonLink
          to="/check/1"
          viewTransition
          variant={sent ? 'primary' : 'secondary'}
          fullWidth
          icon={<ListChecks />}
        >
          {t('pause.tell.check')}
        </ButtonLink>
        {person && (
          <ButtonAnchor href={telHref(person.phone)} variant="secondary" fullWidth icon={<PhoneCall />}>
            {t('pause.tell.call', { name: person.name })}
          </ButtonAnchor>
        )}
        <ButtonLink to="/pause" viewTransition variant="quiet" fullWidth icon={<ArrowLeft />}>
          {t('pause.tell.backToCalm')}
        </ButtonLink>
      </div>
    </section>
  )
}
