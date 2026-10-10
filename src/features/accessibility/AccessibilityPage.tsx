import { useState } from 'react'
import {
  ALargeSmall,
  Accessibility,
  BookOpenText,
  Check,
  Contrast,
  Eye,
  Keyboard,
  Languages,
  LifeBuoy,
  Lightbulb,
  Pointer,
  Snail,
  Speech,
  TimerOff,
  Volume2,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { ButtonLink, Callout, Card, DesignNote, Screen, Switch } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import { ContrastTable } from './ContrastTable'
import styles from './AccessibilityPage.module.css'

const FEATURES: { id: string; icon: LucideIcon }[] = [
  { id: 'screenReader', icon: Speech },
  { id: 'largerText', icon: ALargeSmall },
  { id: 'contrast', icon: Eye },
  { id: 'highContrast', icon: Contrast },
  { id: 'motion', icon: Snail },
  { id: 'languages', icon: Languages },
  { id: 'easyRead', icon: BookOpenText },
  { id: 'readAloud', icon: Volume2 },
  { id: 'offline', icon: WifiOff },
  { id: 'noTimeLimits', icon: TimerOff },
  { id: 'targets', icon: Pointer },
  { id: 'keyboard', icon: Keyboard },
  { id: 'help', icon: LifeBuoy },
]

const AUTO_CHECKS = ['axeUnit', 'axeE2e', 'tokens', 'i18n', 'lint']
const MANUAL_CHECKS = ['keyboard', 'screenReader', 'zoom', 'modes', 'people']

function backTarget(): 'history' | '/' {
  if (typeof window === 'undefined') return '/'
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' && idx > 0 ? 'history' : '/'
}

/** /accessibility — an "Accessibility label", inspired by App Store Accessibility Nutrition Labels. */
export function AccessibilityPage() {
  const { t } = useT()
  const contrast = useStore((s) => s.prefs.contrast)
  const setPrefs = useStore((s) => s.setPrefs)
  const [back] = useState(backTarget)

  return (
    <Screen title={t('accessibility.title')} back={back}>
      <p className="lead">{t('accessibility.lead')}</p>

      {/* The label itself: heavy rules and a plain checklist, like a nutrition label. */}
      <section className={styles.label} aria-labelledby="a11y-label-heading">
        <header className={styles.labelHeader}>
          <span className={styles.labelIcon} aria-hidden="true">
            <Accessibility />
          </span>
          <div>
            <h2 id="a11y-label-heading" className={styles.labelTitle}>
              {t('accessibility.label.heading')}
            </h2>
            <p className={styles.labelSub}>{t('accessibility.label.sub')}</p>
          </div>
        </header>
        <ul className={styles.features} aria-label={t('accessibility.label.listName')}>
          {FEATURES.map(({ id, icon: Icon }) => (
            <li key={id} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden="true">
                <Icon />
                <span className={styles.featureCheck}>
                  <Check />
                </span>
              </span>
              <span className={styles.featureText}>
                <span className={styles.featureName}>{t(`accessibility.f.${id}`)}</span>
                <span className={styles.featureDesc}>{t(`accessibility.f.${id}.desc`)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.labelFooter}>{t('accessibility.label.target')}</p>
      </section>

      <DesignNote title={t('accessibility.note.label.title')}>{t('accessibility.note.label.body')}</DesignNote>

      <ButtonLink to="/adapt" viewTransition variant="primary" size="lg" fullWidth icon={<Accessibility />}>
        {t('accessibility.adaptCta')}
      </ButtonLink>

      {/* Measured contrast */}
      <Card as="section" aria-labelledby="a11y-contrast">
        <h2 id="a11y-contrast" className={styles.sectionTitle}>
          {t('accessibility.contrast.heading')}
        </h2>
        <p>{t('accessibility.contrast.intro')}</p>
        <Switch
          label={t('accessibility.contrast.try.label')}
          description={t('accessibility.contrast.try.desc')}
          checked={contrast === 'high'}
          onChange={(on) => setPrefs({ contrast: on ? 'high' : 'standard' })}
        />
        <ContrastTable mode={contrast} />
        <DesignNote title={t('accessibility.note.live.title')}>{t('accessibility.note.live.body')}</DesignNote>
      </Card>

      {/* How we test — honest about what is automated and what is a manual checklist */}
      <Card as="section" aria-labelledby="a11y-test">
        <h2 id="a11y-test" className={styles.sectionTitle}>
          {t('accessibility.test.heading')}
        </h2>
        <p>{t('accessibility.test.intro')}</p>
        <h3 className={styles.subTitle}>{t('accessibility.test.auto.heading')}</h3>
        <ul className={styles.checks}>
          {AUTO_CHECKS.map((id) => (
            <li key={id}>{t(`accessibility.test.auto.${id}`)}</li>
          ))}
        </ul>
        <h3 className={styles.subTitle}>{t('accessibility.test.manual.heading')}</h3>
        <ul className={styles.checks}>
          {MANUAL_CHECKS.map((id) => (
            <li key={id}>{t(`accessibility.test.manual.${id}`)}</li>
          ))}
        </ul>
        <Callout tone="info" title={t('accessibility.test.honestTitle')}>
          {t('accessibility.test.honest')}
        </Callout>
      </Card>

      <ButtonLink to="/about" viewTransition variant="quiet" icon={<Lightbulb />} className={styles.more}>
        {t('accessibility.more.about')}
      </ButtonLink>
    </Screen>
  )
}
