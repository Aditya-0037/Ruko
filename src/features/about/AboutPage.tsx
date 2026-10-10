import { useId } from 'react'
import { useNavigate } from 'react-router'
import {
  BadgeCheck,
  Ban,
  Feather,
  HandHeart,
  Lightbulb,
  ListChecks,
  MonitorSmartphone,
  Play,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { Button, ButtonLink, Callout, Card, DesignNote, Screen, Switch, useToast } from '../../design-system/components'
import { useT } from '../../i18n/useT'
import { formatINR } from '../../lib/format'
import { DEMO_PERSON_ID, demoProfile, useStore, type RukoState } from '../../state/store'
import styles from './AboutPage.module.css'

const PRINCIPLES: { id: string; icon: LucideIcon }[] = [
  { id: 'calm', icon: Feather },
  { id: 'friction', icon: Scale },
  { id: 'dignity', icon: HandHeart },
  { id: 'explain', icon: ListChecks },
]

const JUDGING = ['ux', 'visual', 'a11y', 'ia', 'original', 'polish']
const SOURCES = ['i4c', 'rbi', 'helplines', 'wcag', 'apple', 'nng']

/** True when this phone holds someone's own setup (not empty, not already the demo family). */
function selectHasOwnSetup(s: RukoState): boolean {
  const demoName = demoProfile().setup.elderName
  const ownName = s.setup.elderName.trim() !== '' && s.setup.elderName !== demoName
  return ownName || s.people.some((p) => p.id !== DEMO_PERSON_ID)
}

/** /about — "How Ruko was designed", written for judges. */
export function AboutPage() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const toast = useToast()
  const designNotes = useStore((s) => s.prefs.designNotes)
  const setPrefs = useStore((s) => s.setPrefs)
  const loadDemoProfile = useStore((s) => s.loadDemoProfile)
  const hasOwnSetup = useStore(selectHasOwnSetup)
  const tourHintId = useId()
  const tableCaptionId = useId()

  const startTour = () => {
    const s = useStore.getState()
    const snapshot = {
      prefs: s.prefs,
      setup: s.setup,
      people: s.people,
      rules: s.rules,
      sharing: s.sharing,
      incident: s.incident,
      goldenHour: s.goldenHour,
    }
    setPrefs({ designNotes: true })
    loadDemoProfile()
    navigate('/', { viewTransition: true })
    toast({
      message: t('about.tour.toast'),
      duration: 12000,
      // Undo instead of "Are you sure?" — offered only when there was a real setup to lose.
      ...(hasOwnSetup ? { actionLabel: t('common.undo'), onAction: () => useStore.setState(snapshot) } : {}),
    })
  }

  const crore = (amount: number) => t('about.problem.crore', { amount: formatINR(amount, lang) })

  return (
    <Screen title={t('about.title')} back="/">
      <p className="lead">{t('about.lead')}</p>

      {/* Tour */}
      <Card as="section" tone="primary" aria-labelledby="about-tour">
        <h2 id="about-tour" className={styles.sectionTitle}>
          {t('about.tour.heading')}
        </h2>
        <p id={tourHintId}>
          {t('about.tour.hint')}
          {hasOwnSetup && <> {t('about.tour.replaceWarning')}</>}
        </p>
        <Button variant="primary" size="lg" fullWidth icon={<Play />} onClick={startTour} aria-describedby={tourHintId}>
          {t('about.tour.button')}
        </Button>
        <Switch
          label={t('about.notes.label')}
          description={t('about.notes.desc')}
          checked={designNotes}
          onChange={(on) => setPrefs({ designNotes: on })}
        />
      </Card>

      <DesignNote title={t('about.note.tour.title')}>{t('about.note.tour.body')}</DesignNote>

      {/* The problem */}
      <section className={styles.section} aria-labelledby="about-problem">
        <h2 id="about-problem" className={styles.sectionTitle}>
          {t('about.problem.heading')}
        </h2>
        <ul className={styles.stats}>
          <li className={styles.stat}>
            <span className={styles.statValue}>{crore(1935)}</span>
            <span className={styles.statLabel}>{t('about.problem.lostLabel')}</span>
          </li>
          <li className={styles.stat}>
            <span className={styles.statValue}>{t('about.problem.complaintsValue')}</span>
            <span className={styles.statLabel}>{t('about.problem.complaintsLabel')}</span>
          </li>
          <li className={styles.stat}>
            <span className={styles.statValue}>{crore(22845)}</span>
            <span className={styles.statLabel}>{t('about.problem.cyberLabel')}</span>
          </li>
        </ul>
        <p>{t('about.problem.how')}</p>
        <Callout tone="info" icon={<ShieldCheck />}>
          {t('about.problem.fact')}
        </Callout>
        <p className={styles.source}>{t('about.problem.source')}</p>
      </section>

      {/* Key insight */}
      <section className={styles.section} aria-labelledby="about-insight">
        <h2 id="about-insight" className={styles.sectionTitle}>
          {t('about.insight.heading')}
        </h2>
        <div className={styles.insight}>
          <Lightbulb aria-hidden="true" className={styles.insightIcon} />
          <p>{t('about.insight.body')}</p>
        </div>
      </section>

      {/* Personas */}
      <section className={styles.section} aria-labelledby="about-personas">
        <h2 id="about-personas" className={styles.sectionTitle}>
          {t('about.personas.heading')}
        </h2>
        <ul className={styles.personas}>
          {(['kamla', 'rahul'] as const).map((id) => {
            const name = t(`about.persona.${id}.name`)
            return (
              <li key={id}>
                <Card as="article" className={styles.persona} aria-labelledby={`about-persona-${id}`}>
                  <div className={styles.personaHead}>
                    <span className={[styles.avatar, styles[`avatar_${id}`]].join(' ')} aria-hidden="true">
                      {name.charAt(0)}
                    </span>
                    <div>
                      <h3 id={`about-persona-${id}`} className={styles.personaName}>
                        {name}
                      </h3>
                      <p className={styles.personaFacts}>{t(`about.persona.${id}.facts`)}</p>
                    </div>
                  </div>
                  <p>{t(`about.persona.${id}.need`)}</p>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Principles */}
      <section className={styles.section} aria-labelledby="about-principles">
        <h2 id="about-principles" className={styles.sectionTitle}>
          {t('about.principles.heading')}
        </h2>
        <ol className={styles.principles}>
          {PRINCIPLES.map(({ id, icon: Icon }, i) => (
            <li key={id} className={styles.principle}>
              <span className={styles.principleNumber} aria-hidden="true">
                {i + 1}
              </span>
              <div className={styles.principleText}>
                <h3 className={styles.principleTitle}>
                  <Icon aria-hidden="true" />
                  <span>{t(`about.principle.${id}.title`)}</span>
                </h3>
                <p>{t(`about.principle.${id}.body`, { amount: formatINR(10000, lang) })}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Judging areas */}
      <section className={styles.section} aria-labelledby="about-judging">
        <h2 id="about-judging" className={styles.sectionTitle}>
          {t('about.judging.heading')}
        </h2>
        {/* Labelled, focusable scroll region: at 200% text the table scrolls inside itself, never the page. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll this region */}
        <div className={styles.tableRegion} role="region" aria-labelledby={tableCaptionId} tabIndex={0}>
          <table className={styles.table}>
            <caption id={tableCaptionId} className={styles.caption}>
              {t('about.judging.caption')}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t('about.judging.col.area')}</th>
                <th scope="col">{t('about.judging.col.ruko')}</th>
              </tr>
            </thead>
            <tbody>
              {JUDGING.map((id) => (
                <tr key={id}>
                  <th scope="row">{t(`about.judging.${id}`)}</th>
                  <td>{t(`about.judging.${id}.body`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rejected concept */}
      <Card as="section" tone="sunken" aria-labelledby="about-rejected">
        <h2 id="about-rejected" className={styles.sectionTitle}>
          {t('about.rejected.heading')}
        </h2>
        <h3 className={styles.rejectedTitle}>
          <Ban aria-hidden="true" />
          <span>{t('about.rejected.title')}</span>
        </h3>
        <p>{t('about.rejected.body')}</p>
        <ul className={styles.reasons}>
          <li>{t('about.rejected.r1')}</li>
          <li>{t('about.rejected.r2')}</li>
          <li>{t('about.rejected.r3')}</li>
        </ul>
        <p className={styles.instead}>{t('about.rejected.instead')}</p>
        <DesignNote title={t('about.note.rejected.title')}>{t('about.note.rejected.body')}</DesignNote>
      </Card>

      {/* Explore */}
      <section className={styles.section} aria-labelledby="about-explore">
        <h2 id="about-explore" className={styles.sectionTitle}>
          {t('about.explore.heading')}
        </h2>
        <div className={styles.explore}>
          <ButtonLink to="/demo" viewTransition variant="secondary" fullWidth icon={<MonitorSmartphone />}>
            {t('about.explore.demo')}
          </ButtonLink>
          <ButtonLink to="/accessibility" viewTransition variant="secondary" fullWidth icon={<BadgeCheck />}>
            {t('about.explore.accessibility')}
          </ButtonLink>
        </div>
      </section>

      {/* Sources and credits */}
      <section className={styles.footer} aria-labelledby="about-sources">
        <h2 id="about-sources" className={styles.footerTitle}>
          {t('about.sources.heading')}
        </h2>
        <ul className={styles.sources}>
          {SOURCES.map((id) => (
            <li key={id}>{t(`about.source.${id}`)}</li>
          ))}
        </ul>
        <p className={styles.credits}>{t('about.credits')}</p>
        <p className={styles.source}>{t('about.credits.local')}</p>
      </section>
    </Screen>
  )
}
