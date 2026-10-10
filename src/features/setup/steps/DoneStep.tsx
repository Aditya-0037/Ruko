import { useEffect } from 'react'
import { Home, PhoneCall, ShieldCheck, UserPlus } from 'lucide-react'
import { ButtonLink, Callout, Card, DesignNote } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import { PlanSummary } from '../PlanSummary'
import { SetupLayout } from '../SetupLayout'
import { editPath } from '../steps'
import styles from '../Setup.module.css'

export function DoneStep() {
  const { t } = useT()
  const completed = useStore((s) => s.setup.completed)
  const completeSetup = useStore((s) => s.completeSetup)
  const people = useStore((s) => s.people)
  const name = people.find((p) => p.name.trim())?.name.trim()

  // Reaching the last step completes setup; every answer was already autosaved on the way.
  useEffect(() => {
    if (!completed) completeSetup()
  }, [completed, completeSetup])

  const hero = (
    <div className={styles.doneBadge} aria-hidden="true">
      <ShieldCheck />
    </div>
  )

  return (
    // Links live in the page, not the sticky footer: the shared footer sits outside the main landmark.
    <SetupLayout step="done" title={t('setup.done.title')} footer={false} hero={hero}>
      <p className={styles.lead}>{t('setup.done.intro')}</p>

      {people.length === 0 && (
        <Callout tone="caution">
          <p>{t('setup.done.missingPerson')}</p>
          <ButtonLink
            to={editPath('person', 'done')}
            viewTransition
            variant="secondary"
            icon={<UserPlus />}
            className={styles.calloutAction}
          >
            {t('setup.rules.ask.add')}
          </ButtonLink>
        </Callout>
      )}

      <Card as="section" aria-labelledby="done-summary" className={styles.summaryCard}>
        <h2 id="done-summary" className={styles.subheading}>
          {t('setup.done.summaryTitle')}
        </h2>
        <PlanSummary editFrom="done" showName />
      </Card>

      <div className={styles.doneActions}>
        <p className={styles.muted}>{t('setup.done.whyPractise')}</p>
        <ButtonLink to="/drill" viewTransition variant="primary" size="lg" fullWidth icon={<PhoneCall />}>
          {name ? t('setup.done.practise', { name }) : t('setup.done.practiseNoName')}
        </ButtonLink>
        <ButtonLink to="/" viewTransition variant="secondary" fullWidth icon={<Home />}>
          {t('setup.done.home')}
        </ButtonLink>
      </div>
      <DesignNote title={t('setup.done.note.title')}>{t('setup.done.note.body')}</DesignNote>
    </SetupLayout>
  )
}
