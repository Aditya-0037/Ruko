import { ArrowRight, CalendarHeart, Hand, Lightbulb, Lock, PlayCircle, Siren } from 'lucide-react'
import { Link } from 'react-router'
import {
  Button,
  ButtonLink,
  DesignNote,
  RukoMark,
  Screen,
  SegmentedControl,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import { languageOptions } from '../setup/LanguageCards'
import { resumeStep, stepPath } from '../setup/steps'
import { restorePlan, snapshotPlan } from './planSnapshot'
import styles from './Home.module.css'

/** First visit: who Ruko is for, in one sentence, with language first and setup one tap away. */
export function WelcomeView() {
  const { t, lang } = useT()
  const setPrefs = useStore((s) => s.setPrefs)
  const loadDemoProfile = useStore((s) => s.loadDemoProfile)
  const started = useStore((s) => s.setup.elderName.trim().length > 0)
  const resumeTo = useStore((s) => stepPath(resumeStep(s)))
  const toast = useToast()

  const tryDemo = () => {
    const before = snapshotPlan()
    loadDemoProfile()
    toast({
      message: t('home.demoLoaded'),
      actionLabel: t('common.undo'),
      onAction: () => restorePlan(before),
    })
  }

  const moments = [
    { icon: <CalendarHeart />, title: t('home.welcome.before.title'), body: t('home.welcome.before.body'), tone: styles.momentBefore },
    { icon: <Hand />, title: t('home.welcome.during.title'), body: t('home.welcome.during.body'), tone: styles.momentDuring },
    { icon: <Siren />, title: t('home.welcome.after.title'), body: t('home.welcome.after.body'), tone: styles.momentAfter },
  ]

  return (
    <Screen title={t('home.welcome.title')} hideTitle tone="calm">
      <SegmentedControl
        legend={t('home.welcome.languageLegend')}
        options={languageOptions()}
        value={lang}
        onChange={(l) => setPrefs({ lang: l })}
      />

      <div className={styles.hero}>
        <div className={styles.heroMark} aria-hidden="true">
          <RukoMark className={styles.heroMarkSvg} />
        </div>
        {/* The h1 ("Welcome to Ruko") is visually hidden; this is its visual form. */}
        <p className={styles.wordmark} aria-hidden="true">
          {t('app.name')}
        </p>
        <p className={styles.tagline}>{t('app.tagline')}</p>
        <p className={styles.promise}>
          <span className={styles.promiseButton} aria-hidden="true">
            {t('home.welcome.buttonSample')}
          </span>
          <span className={styles.promiseText}>{t('home.welcome.promise')}</span>
        </p>
      </div>

      <div className={styles.actions}>
        <ButtonLink
          to={started ? resumeTo : stepPath('language')}
          viewTransition
          variant="primary"
          size="lg"
          fullWidth
          iconEnd={<ArrowRight />}
        >
          {started ? t('home.welcome.continue') : t('home.welcome.setup')}
        </ButtonLink>
        <Button variant="secondary" fullWidth icon={<PlayCircle />} onClick={tryDemo} aria-describedby="welcome-demo-hint">
          {t('home.welcome.demo')}
        </Button>
        <p id="welcome-demo-hint" className={styles.hint}>
          {t('home.welcome.demoHint')}
        </p>
      </div>

      <section className={styles.how} aria-labelledby="welcome-how">
        <h2 id="welcome-how" className={styles.sectionTitle}>
          {t('home.welcome.howTitle')}
        </h2>
        <ol className={styles.moments}>
          {moments.map((m) => (
            <li key={m.title} className={[styles.moment, m.tone].join(' ')}>
              <span className={styles.momentIcon} aria-hidden="true">
                {m.icon}
              </span>
              <div className={styles.momentText}>
                <h3 className={styles.momentTitle}>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className={styles.privacy}>
        <Lock aria-hidden="true" />
        <span>{t('home.welcome.privacy')}</span>
      </p>

      <Link to="/about" viewTransition className={styles.judges}>
        <Lightbulb aria-hidden="true" />
        <span>{t('home.welcome.judges')}</span>
      </Link>

      <DesignNote title={t('home.note.language.title')}>{t('home.note.language.body')}</DesignNote>
    </Screen>
  )
}
