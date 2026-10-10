import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  Hand,
  Lightbulb,
  MonitorSmartphone,
  OctagonAlert,
  PhoneCall,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Siren,
  Smartphone,
} from 'lucide-react'
import {
  BigButton,
  Button,
  ButtonAnchor,
  ButtonLink,
  Card,
  DesignNote,
  Screen,
  useToast,
} from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import { PlanSummary } from '../setup/PlanSummary'
import { resumeStep, stepPath } from '../setup/steps'
import { restorePlan, snapshotPlan } from './planSnapshot'
import styles from './Home.module.css'

/** Home once a plan exists: the Ruko button first, then everything else by moment (Before · During · After). */
export function SafetyHome() {
  const { t } = useT()
  const navigate = useNavigate()
  const toast = useToast()
  const name = useStore((s) => s.setup.elderName.trim())
  const completed = useStore((s) => s.setup.completed)
  const resumeTo = useStore((s) => stepPath(resumeStep(s)))
  const openPause = useStore((s) => s.openPause)
  const startCall = useStore((s) => s.startCall)
  const resetAll = useStore((s) => s.resetAll)

  const go = (to: string) => navigate(to, { viewTransition: true })

  const pressRuko = () => {
    openPause()
    go('/pause')
  }

  const demoCall = () => {
    startCall()
    go('/call')
  }

  const startAgain = () => {
    const before = snapshotPlan()
    resetAll()
    toast({ message: t('home.more.resetDone'), actionLabel: t('common.undo'), onAction: () => restorePlan(before) })
  }

  return (
    <Screen title={name ? t('home.greeting', { name }) : t('home.greetingNoName')} tone="calm">
      {completed ? (
        <p className={styles.status}>
          <ShieldCheck aria-hidden="true" />
          <span>{t('home.status.ready')}</span>
        </p>
      ) : (
        <div className={styles.unfinished}>
          <p className={styles.unfinishedText}>
            <CircleAlert aria-hidden="true" />
            <span>{t('home.status.unfinished')}</span>
          </p>
          <ButtonLink to={resumeTo} viewTransition variant="secondary" iconEnd={<ArrowRight />}>
            {t('home.finishSetup')}
          </ButtonLink>
        </div>
      )}

      <div className={styles.rukoZone}>
        <BigButton
          title={t('home.ruko.title')}
          subtitle={t('home.ruko.subtitle')}
          icon={<Hand />}
          onClick={pressRuko}
          aria-describedby="ruko-reassure"
        />
        <p id="ruko-reassure" className={styles.reassure}>
          {t('home.ruko.reassure')}
        </p>
      </div>

      <DesignNote title={t('home.note.button.title')}>{t('home.note.button.body')}</DesignNote>

      <div className={styles.timeline}>
        {/* BEFORE */}
        <Card as="section" aria-labelledby="home-before" className={styles.momentCard}>
          <MomentHeading id="home-before" eyebrow={t('home.before.eyebrow')} tone="before" title={t('home.before.title')} />
          <PlanSummary editFrom="home" showDrill />
          <ButtonLink to="/drill" viewTransition variant="secondary" fullWidth icon={<PlayCircle />}>
            {t('home.before.drill')}
          </ButtonLink>
        </Card>

        {/* DURING */}
        <Card as="section" aria-labelledby="home-during" className={styles.momentCard}>
          <MomentHeading id="home-during" eyebrow={t('home.during.eyebrow')} tone="during" title={t('home.during.title')} />
          <p>{t('home.during.body')}</p>
          <Button variant="secondary" fullWidth icon={<Hand />} onClick={pressRuko}>
            {t('home.during.pause')}
          </Button>
          <div className={styles.demoBox}>
            <p id="home-demo-hint" className={styles.demoHint}>
              <span className={styles.demoTag}>{t('common.demoLabel')}</span>{' '}
              <span>{t('home.during.demoHint')}</span>
            </p>
            <Button variant="secondary" fullWidth icon={<PhoneCall />} onClick={demoCall} aria-describedby="home-demo-hint">
              {t('home.during.demo')}
            </Button>
          </div>
        </Card>

        {/* AFTER */}
        <Card as="section" aria-labelledby="home-after" className={`${styles.momentCard} ${styles.afterCard}`}>
          <MomentHeading id="home-after" eyebrow={t('home.after.eyebrow')} tone="after" title={t('home.after.title')} />
          <p>{t('home.after.body')}</p>
          <ButtonLink to="/golden-hour" viewTransition variant="danger" fullWidth icon={<Siren />}>
            {t('home.after.cta')}
          </ButtonLink>
          <ButtonAnchor href="tel:1930" variant="secondary" fullWidth icon={<PhoneCall />}>
            {t('home.after.call1930')}
          </ButtonAnchor>
        </Card>
      </div>

      <DesignNote title={t('home.note.time.title')}>{t('home.note.time.body')}</DesignNote>

      <nav className={styles.more} aria-labelledby="home-more">
        <h2 id="home-more" className={styles.moreTitle}>
          {t('home.more.title')}
        </h2>
        <ul className={styles.moreList}>
          <MoreLink to="/adapt" icon={<Accessibility />} label={t('adapt.title')} hint={t('home.more.adaptHint')} />
          <MoreLink to="/family" icon={<Smartphone />} label={t('home.more.family')} hint={t('home.more.familyHint')} />
          <MoreLink to="/demo" icon={<MonitorSmartphone />} label={t('home.more.demo')} hint={t('home.more.demoHint')} />
          <MoreLink
            to="/accessibility"
            icon={<BadgeCheck />}
            label={t('home.more.accessibility')}
            hint={t('home.more.accessibilityHint')}
          />
          <MoreLink to="/about" icon={<Lightbulb />} label={t('home.more.about')} hint={t('home.more.aboutHint')} />
        </ul>
        <Button variant="quiet" icon={<RotateCcw />} onClick={startAgain} className={styles.reset}>
          {t('home.more.reset')}
        </Button>
      </nav>
    </Screen>
  )
}

function MomentHeading({
  id,
  eyebrow,
  title,
  tone,
}: {
  id: string
  eyebrow: string
  title: string
  tone: 'before' | 'during' | 'after'
}) {
  const icon = tone === 'after' ? <OctagonAlert /> : tone === 'during' ? <Hand /> : <ShieldCheck />
  return (
    <h2 id={id} className={styles.momentHeading}>
      <span className={[styles.eyebrow, styles[`eyebrow_${tone}`]].join(' ')}>
        <span className={styles.eyebrowIcon} aria-hidden="true">
          {icon}
        </span>
        {eyebrow}
      </span>
      <span className="visually-hidden">:</span>{' '}
      <span className={styles.momentHeadingText}>{title}</span>
    </h2>
  )
}

function MoreLink({ to, icon, label, hint }: { to: string; icon: ReactNode; label: string; hint: string }) {
  return (
    <li>
      <Link to={to} viewTransition className={styles.moreLink}>
        <span className={styles.moreIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.moreText}>
          <span className={styles.moreLabel}>{label}</span>
          <span className={styles.moreHint}>{hint}</span>
        </span>
      </Link>
    </li>
  )
}
