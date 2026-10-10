import { useEffect, useId } from 'react'
import { Link } from 'react-router'
import { Banknote, BellRing, HandCoins, ListChecks, PhoneOff, ShieldCheck, UserPlus } from 'lucide-react'
import { ButtonLink, Card, DesignNote, ListenButton, Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useTrustedPerson } from '../../state/hooks'
import { useStore } from '../../state/store'
import { BreathingCircle } from './BreathingCircle'
import styles from './PausePage.module.css'

/**
 * /pause — the calm card. Opened by the Ruko button while the scam call keeps running.
 * One fact in big type (read aloud), then two clear choices: tell family, or check the call.
 */
export function PausePage() {
  const { t } = useT()
  const openPause = useStore((s) => s.openPause)
  const readAloud = useStore((s) => s.prefs.readAloud)
  const person = useTrustedPerson()
  const actionsId = useId()
  const tellHintId = useId()
  const checkHintId = useId()
  const moneyHintId = useId()
  const pressuredHintId = useId()

  useEffect(() => {
    // Idempotent (keeps the first time it opened), so StrictMode's double effect is harmless.
    openPause()
  }, [openPause])

  const core = t('pause.core')
  const law = t('pause.law')

  return (
    <Screen title={t('pause.title')} back="/" tone="calm">
      <Card tone="primary" className={styles.card}>
        <p className={styles.core}>{core}</p>
        <p className={styles.law}>
          <ShieldCheck aria-hidden="true" className={styles.lawIcon} />
          <span>{law}</span>
        </p>
        {/* Reads exactly what the card says: speech is a second channel, not a different message. */}
        <div className={styles.listen}>
          <ListenButton text={`${core} ${law}`} autoPlay={readAloud} />
        </div>
      </Card>

      <section className={styles.actions} aria-labelledby={actionsId}>
        <h2 id={actionsId} className="visually-hidden">
          {t('pause.actionsTitle')}
        </h2>

        {person ? (
          <div className={styles.action}>
            <ButtonLink
              to="/tell"
              viewTransition
              variant="primary"
              size="lg"
              fullWidth
              icon={<BellRing />}
              aria-describedby={tellHintId}
            >
              {t('pause.tell', { name: person.name })}
            </ButtonLink>
            <p id={tellHintId} className={styles.hint}>
              {t('pause.tellHint', { name: person.name })}
            </p>
          </div>
        ) : (
          <div className={styles.action}>
            <ButtonLink
              to="/setup/person"
              viewTransition
              variant="primary"
              size="lg"
              fullWidth
              icon={<UserPlus />}
              aria-describedby={tellHintId}
            >
              {t('pause.addPerson')}
            </ButtonLink>
            <p id={tellHintId} className={styles.hint}>
              {t('pause.noPerson')}
            </p>
          </div>
        )}

        <div className={styles.action}>
          <ButtonLink
            to="/check/1"
            viewTransition
            variant="secondary"
            size="lg"
            fullWidth
            icon={<ListChecks />}
            aria-describedby={checkHintId}
          >
            {t('pause.check')}
          </ButtonLink>
          <p id={checkHintId} className={styles.hint}>
            {t('pause.checkHint')}
          </p>
        </div>
      </section>

      <div className={styles.quiet}>
        <p className={styles.hangUp}>
          <PhoneOff aria-hidden="true" />
          <span>{t('pause.hangUp')}</span>
        </p>
        <Link to="/golden-hour" viewTransition className={styles.moneyLink} aria-describedby={moneyHintId}>
          <Banknote aria-hidden="true" className={styles.moneyIcon} />
          <span className={styles.moneyText}>{t('pause.moneySent')}</span>
        </Link>
        <p id={moneyHintId} className={styles.moneyHint}>
          {t('pause.moneySentHint')}
        </p>
        <Link to="/transfer" viewTransition className={styles.moneyLink} aria-describedby={pressuredHintId}>
          <HandCoins aria-hidden="true" className={styles.moneyIcon} />
          <span className={styles.moneyText}>{t('pause.pressured')}</span>
        </Link>
        <p id={pressuredHintId} className={styles.moneyHint}>
          {t('pause.pressuredHint')}
        </p>
      </div>

      <BreathingCircle />

      <DesignNote title={t('pause.note.call.title')}>{t('pause.note.call.body')}</DesignNote>
      <DesignNote title={t('pause.note.fact.title')}>{t('pause.note.fact.body')}</DesignNote>
    </Screen>
  )
}
