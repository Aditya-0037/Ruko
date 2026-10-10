import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { useNavigate } from 'react-router'
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clapperboard,
  Hand,
  PhoneOff,
  ShieldAlert,
  UserRound,
  Video,
  X,
} from 'lucide-react'
import { Button, DesignNote, Screen, useToast } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatClock } from '../../lib/format'
import { useNow, useReducedMotion } from '../../state/hooks'
import { useStore } from '../../state/store'
import { CallerIllustration } from './CallerIllustration'
import { useCallerLabel } from './callerLabel'
import { CALL_LINES, captionIndexAt } from './script'
import styles from './CallPage.module.css'

type Phase = 'ringing' | 'connected'

/**
 * /call — a clearly labelled practice "digital arrest" video call.
 * Ringing → connected (timer + scripted subtitles). The big Ruko button opens the calm card
 * WITHOUT ending the call, because real victims are kept on camera and told not to hang up.
 */
export function CallPage() {
  const { t } = useT()
  const navigate = useNavigate()
  const toast = useToast()
  const startCall = useStore((s) => s.startCall)
  const endCall = useStore((s) => s.endCall)
  const openPause = useStore((s) => s.openPause)

  // Returning from /pause ("Return to call") lands straight back in the connected call.
  const [phase, setPhase] = useState<Phase>(() =>
    useStore.getState().incident.callActive ? 'connected' : 'ringing',
  )
  const startedRef = useRef(false)
  const focusOnConnect = useRef(false)
  const callerHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Guard against React StrictMode running mount effects twice: start the call once.
    if (startedRef.current) return
    startedRef.current = true
    const { incident, startCall: start } = useStore.getState()
    if (!incident.callActive) start()
  }, [])

  useEffect(() => {
    // After "Accept", the Accept button is gone: move focus to the caller so it is not lost.
    if (phase === 'connected' && focusOnConnect.current) {
      focusOnConnect.current = false
      callerHeadingRef.current?.focus()
    }
  }, [phase])

  const finish = () => {
    endCall()
    toast({ message: t('call.endedToast') })
    navigate('/', { viewTransition: true })
  }

  const accept = () => {
    // Like a real phone, the call timer starts when she answers.
    startCall(useStore.getState().incident.callerLabel || undefined)
    focusOnConnect.current = true
    setPhase('connected')
  }

  const pause = () => {
    openPause()
    navigate('/pause', { viewTransition: true })
  }

  return (
    <Screen title={t('call.title')} hideTitle hideTopBar showHelp={false} className={styles.call}>
      <div className={styles.strip}>
        <p className={styles.badge}>
          <Clapperboard aria-hidden="true" />
          <span>{t('call.demoBadge')}</span>
        </p>
        <Button className={`${styles.ghost} ${styles.compact}`} icon={<X />} onClick={finish}>
          {t('call.endDemo')}
        </Button>
      </div>

      {phase === 'ringing' ? (
        <RingingView onAccept={accept} onDecline={finish} />
      ) : (
        <ConnectedView onPause={pause} onHangUp={finish} headingRef={callerHeadingRef} />
      )}
    </Screen>
  )
}

function RingingView({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const { t } = useT()
  const reduceMotion = useReducedMotion()
  const caller = useCallerLabel()

  return (
    <div
      className={[styles.ringing, !reduceMotion && styles.animate].filter(Boolean).join(' ')}
      data-animated={!reduceMotion}
    >
      <div className={styles.avatarWrap} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ring} />
        <div className={styles.avatar}>
          <CallerIllustration variant="avatar" />
        </div>
      </div>

      <h2 className={styles.callerName}>{t('call.callerName')}</h2>
      <p className={styles.agency} lang={caller.lang}>
        {caller.text}
      </p>
      <p className={styles.status}>
        <span className={styles.statusIcon} aria-hidden="true">
          <Video />
        </span>
        <span>{t('call.incoming')}</span>
      </p>
      <p className={styles.warning}>
        <CircleAlert aria-hidden="true" />
        <span>{t('call.notInContacts')}</span>
      </p>
      <p className={styles.practiceNote}>{t('call.practiceNote')}</p>

      <div className={styles.answerRow}>
        <Button className={`${styles.answer} ${styles.decline}`} icon={<PhoneOff />} onClick={onDecline}>
          {t('call.decline')}
        </Button>
        <Button variant="success" className={styles.answer} icon={<Video />} onClick={onAccept}>
          {t('call.accept')}
        </Button>
      </div>

      <div className={styles.notes}>
        <DesignNote title={t('call.note.demo.title')}>{t('call.note.demo.body')}</DesignNote>
      </div>
    </div>
  )
}

interface ConnectedViewProps {
  onPause: () => void
  onHangUp: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}

function ConnectedView({ onPause, onHangUp, headingRef }: ConnectedViewProps) {
  const { t } = useT()
  const now = useNow(1000)
  const startedAt = useStore((s) => s.incident.callStartedAt)
  const reduceMotion = useReducedMotion()
  const caller = useCallerLabel()
  const [showTranscript, setShowTranscript] = useState(false)
  const nameId = useId()
  const transcriptId = useId()
  const transcriptTitleId = useId()
  const hintId = useId()

  const elapsed = startedAt === null ? 0 : now - startedAt
  const index = captionIndexAt(elapsed)
  const current = CALL_LINES[index]
  const said = CALL_LINES.slice(0, index + 1)

  return (
    <div className={styles.connected}>
      <section className={styles.tile} aria-labelledby={nameId}>
        <div className={styles.tileHeader}>
          <h2 id={nameId} ref={headingRef} tabIndex={-1} className={styles.tileName}>
            {t('call.callerName')}
          </h2>
          <div className={styles.tileMeta}>
            <p className={styles.tileAgency} lang={caller.lang}>
              {caller.text}
            </p>
            {/* Updates every second visually, but is not a live region: nothing is announced. */}
            <p className={styles.timer}>
              <Video aria-hidden="true" />
              <span className="visually-hidden">{t('call.timerLabel')}: </span>
              <span>{formatClock(elapsed)}</span>
            </p>
          </div>
        </div>

        <div className={styles.video}>
          <CallerIllustration />
          <div className={styles.self} aria-hidden="true">
            <UserRound />
            <span>{t('call.you')}</span>
          </div>
        </div>

        {/* Subtitles change every ~6 s on purpose WITHOUT aria-live; the transcript below is the
            screen-reader friendly channel and is read at the user's own pace. */}
        <div className={styles.caption}>
          <p className={styles.captionLabel}>{t('call.captionLabel')}</p>
          <p
            key={index}
            className={[styles.captionText, !reduceMotion && styles.captionAnimate].filter(Boolean).join(' ')}
          >
            <q>{t(current.line)}</q>
          </p>
        </div>
      </section>

      <div className={styles.controls}>
        <Button
          className={styles.ghost}
          icon={showTranscript ? <ChevronUp /> : <ChevronDown />}
          aria-expanded={showTranscript}
          aria-controls={transcriptId}
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? t('call.transcriptHide') : t('call.transcriptShow')}
        </Button>
        <Button className={styles.ghost} icon={<PhoneOff />} onClick={onHangUp}>
          {t('call.hangUp')}
        </Button>
      </div>

      <section
        id={transcriptId}
        className={styles.transcript}
        aria-labelledby={transcriptTitleId}
        hidden={!showTranscript}
      >
        <h2 id={transcriptTitleId} className={styles.transcriptTitle}>
          {t('call.transcriptTitle')}
        </h2>
        <ol className={styles.lines}>
          {said.map(({ line, sign }) => (
            <li key={line} className={styles.lineItem}>
              <q className={styles.lineText}>{t(line)}</q>
              <p className={styles.sign}>
                <ShieldAlert aria-hidden="true" />
                <span>
                  <strong>{t('call.signLabel')}:</strong> {t(sign)}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.notes}>
        <DesignNote title={t('call.note.ruko.title')}>{t('call.note.ruko.body')}</DesignNote>
      </div>

      <div className={styles.dock}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className={styles.ruko}
          icon={<Hand />}
          onClick={onPause}
          aria-label={`${t('call.rukoTitle')} — ${t('call.rukoSub')}`}
          aria-describedby={hintId}
        >
          <span className={styles.rukoTitle}>{t('call.rukoTitle')}</span>
          <span className={styles.rukoSub}>{t('call.rukoSub')}</span>
        </Button>
        <p id={hintId} className={styles.dockHint}>
          {t('call.rukoHint')}
        </p>
      </div>
    </div>
  )
}
