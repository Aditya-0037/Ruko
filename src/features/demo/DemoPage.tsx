import { useId, useState } from 'react'
import { BatteryFull, Landmark, RotateCcw, Signal, Users, Video, Wifi } from 'lucide-react'
import { Button, Callout, DesignNote, Screen, useToast } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatINR, formatTime } from '../../lib/format'
import { useNow } from '../../state/hooks'
import { useStore } from '../../state/store'
import styles from './DemoPage.module.css'

interface FrameState {
  src: string
  /** Bumped to remount (reload) the iframe even when the src stays the same. */
  version: number
}

/**
 * /demo — "Two phones, one loop". Kamla's phone and Rahul's phone side by side, as two same-origin
 * iframes. The store syncs between them through the browser's storage event (src/state/sync.ts),
 * so the whole family loop runs live with no server.
 */
export function DemoPage() {
  const { t } = useT()
  const toast = useToast()
  const loadDemoProfile = useStore((s) => s.loadDemoProfile)
  const clearIncident = useStore((s) => s.clearIncident)
  const ready = useStore((s) => s.setup.completed && s.people.length > 0)
  const [kamla, setKamla] = useState<FrameState>({ src: '/', version: 0 })
  const [rahul, setRahul] = useState<FrameState>({ src: '/family', version: 0 })
  const controlsId = useId()
  const statusId = useId()
  const scriptId = useId()
  const phonesId = useId()

  const reloadKamla = (src: string) => setKamla((k) => ({ src, version: k.version + 1 }))
  const reloadRahul = () => setRahul((r) => ({ src: '/family', version: r.version + 1 }))

  const load = () => {
    loadDemoProfile()
    reloadKamla('/')
    reloadRahul()
    toast({ message: t('demo.toast.loaded') })
  }

  const startScam = () => {
    // The call screen starts the call itself and rings first. Starting it here would skip the
    // ringing screen, so we only clear any old incident and point Kamla's phone at /call.
    clearIncident()
    reloadKamla('/call')
    toast({ message: t('demo.toast.call') })
  }

  const openBank = () => {
    reloadKamla('/transfer')
    toast({ message: t('demo.toast.bank') })
  }

  const reset = () => {
    clearIncident()
    reloadKamla('/')
    reloadRahul()
    toast({ message: t('demo.toast.reset') })
  }

  return (
    <Screen title={t('demo.title')} back="/" className={styles.demo}>
      <p className="lead">{t('demo.lead')}</p>

      <div className={styles.stage}>
        <div className={styles.panel}>
          <section className={styles.block} aria-labelledby={controlsId}>
            <h2 id={controlsId} className={styles.blockTitle}>
              {t('demo.controls.title')}
            </h2>
            {!ready && <Callout tone="info">{t('demo.needProfile')}</Callout>}
            <div className={styles.buttons}>
              <Button variant={ready ? 'secondary' : 'primary'} fullWidth icon={<Users />} onClick={load}>
                {t('demo.load')}
              </Button>
              <Button variant={ready ? 'primary' : 'secondary'} fullWidth icon={<Video />} onClick={startScam}>
                {t('demo.start')}
              </Button>
              <Button variant="secondary" fullWidth icon={<Landmark />} onClick={openBank}>
                {t('demo.bank')}
              </Button>
              <Button variant="quiet" fullWidth icon={<RotateCcw />} onClick={reset}>
                {t('demo.reset')}
              </Button>
            </div>
          </section>

          <section className={styles.block} aria-labelledby={statusId}>
            <h2 id={statusId} className={styles.blockTitle}>
              {t('demo.status.title')}
            </h2>
            <LoopStatus />
          </section>

          <section className={styles.block} aria-labelledby={scriptId}>
            <h2 id={scriptId} className={styles.blockTitle}>
              {t('demo.script.title')}
            </h2>
            <ol className={styles.script}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n}>
                  <span className={styles.scriptNum} aria-hidden="true">
                    {n}
                  </span>
                  <span>{t(`demo.script.${n}`)}</span>
                </li>
              ))}
            </ol>
          </section>

          <DesignNote title={t('demo.note.loop.title')}>{t('demo.note.loop.body')}</DesignNote>
          <DesignNote title={t('demo.note.sync.title')}>{t('demo.note.sync.body')}</DesignNote>
        </div>

        <section className={styles.phones} aria-labelledby={phonesId}>
          <h2 id={phonesId} className="visually-hidden">
            {t('demo.phones.title')}
          </h2>
          <p className={styles.hint}>{t('demo.framesHint')}</p>
          <div className={styles.phoneRow}>
            <Phone
              who="kamla"
              name={t('demo.kamla.name')}
              role={t('demo.kamla.role')}
              frameTitle={t('demo.kamla.frame')}
              frame={kamla}
            />
            <Phone
              who="rahul"
              name={t('demo.rahul.name')}
              role={t('demo.rahul.role')}
              frameTitle={t('demo.rahul.frame')}
              frame={rahul}
            />
          </div>
        </section>
      </div>
    </Screen>
  )
}

/** A phone drawn with tokens: bezel, status bar with notch, the live app, a home indicator. */
function Phone({
  who,
  name,
  role,
  frameTitle,
  frame,
}: {
  who: 'kamla' | 'rahul'
  name: string
  role: string
  frameTitle: string
  frame: FrameState
}) {
  const { lang } = useT()
  const now = useNow(30_000)
  const nameId = useId()
  return (
    <figure className={styles.phone} aria-labelledby={nameId}>
      <figcaption className={styles.caption}>
        <span className={[styles.initial, styles[who]].join(' ')} aria-hidden="true">
          {name.trim()[0]}
        </span>
        <span className={styles.captionText}>
          <span id={nameId} className={styles.who}>
            {name}
          </span>
          <span className={styles.roleLine}>{role}</span>
        </span>
      </figcaption>
      <div className={styles.device}>
        <div className={styles.screen}>
          <div className={styles.statusBar} aria-hidden="true">
            <span className={styles.clock}>{formatTime(now, lang)}</span>
            <span className={styles.notch} />
            <span className={styles.icons}>
              <Signal />
              <Wifi />
              <BatteryFull />
            </span>
          </div>
          <iframe key={frame.version} src={frame.src} title={frameTitle} className={styles.frame} />
          <span className={styles.homeBar} aria-hidden="true" />
        </div>
      </div>
    </figure>
  )
}

/** A plain-words readout of the shared state, updated live as either phone changes it. */
function LoopStatus() {
  const { t, lang } = useT()
  const incident = useStore((s) => s.incident)
  const tr = incident.transfer

  const call = incident.callActive
    ? t('demo.status.callRunning')
    : incident.callStartedAt
      ? t('demo.status.callEnded')
      : t('demo.status.callNone')
  const alert = incident.alertSentAt
    ? t('demo.status.alertSent', { time: formatTime(incident.alertSentAt, lang) })
    : t('demo.status.alertNone')
  const payment = tr ? t(`demo.status.pay.${tr.status}`, { amount: formatINR(tr.amount, lang) }) : t('demo.status.payNone')
  const family = incident.familyDecision
    ? t(`demo.status.family.${incident.familyDecision}`)
    : incident.familySeenAt
      ? t('demo.status.familySeen')
      : t('demo.status.familyNone')

  const rows: [string, string][] = [
    [t('demo.status.call'), call],
    [t('demo.status.alert'), alert],
    [t('demo.status.payment'), payment],
    [t('demo.status.family'), family],
  ]

  return (
    <dl className={styles.status}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.statusRow}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
