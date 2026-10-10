import { MapPinOff, MessageSquareOff, ShieldCheck } from 'lucide-react'
import { Callout, Card, DesignNote, Switch } from '../../../design-system/components'
import { useT } from '../../../i18n/useT'
import { useStore } from '../../../state/store'
import { firstPersonName } from '../ruleText'
import { SetupLayout } from '../SetupLayout'
import styles from '../Setup.module.css'

export function SharingStep() {
  const { t } = useT()
  const people = useStore((s) => s.people)
  const sharing = useStore((s) => s.sharing)
  const setSharing = useStore((s) => s.setSharing)
  const hasName = people.some((p) => p.name.trim())
  const name = firstPersonName(t, people)
  const title = hasName ? t('setup.sharing.title', { name }) : t('setup.sharing.titleNoName')
  const allOff = !sharing.alertsDuringCall && !sharing.transferPauses

  return (
    <SetupLayout step="sharing" title={title}>
      <p className={styles.lead}>{t('setup.sharing.intro')}</p>

      <Card className={styles.switchCard}>
        <Switch
          label={t('setup.sharing.alerts')}
          description={t('setup.sharing.alertsDesc', { name })}
          checked={sharing.alertsDuringCall}
          onChange={(alertsDuringCall) => setSharing({ alertsDuringCall })}
        />
        <hr className={styles.divider} />
        <Switch
          label={t('setup.sharing.pauses')}
          description={t('setup.sharing.pausesDesc', { name })}
          checked={sharing.transferPauses}
          onChange={(transferPauses) => setSharing({ transferPauses })}
        />
      </Card>

      {allOff && (
        <Callout tone="caution">
          {hasName ? t('setup.sharing.allOff', { name }) : t('setup.sharing.allOffNoName')}
        </Callout>
      )}

      <Callout tone="success" icon={<ShieldCheck />} title={t('setup.sharing.neverTitle')}>
        <ul className={styles.neverList}>
          <li>
            <MapPinOff aria-hidden="true" />
            <span>{t('setup.sharing.neverLocation')}</span>
          </li>
          <li>
            <MessageSquareOff aria-hidden="true" />
            <span>{t('setup.sharing.neverMessages')}</span>
          </li>
        </ul>
      </Callout>

      <DesignNote title={t('setup.sharing.note.title')}>{t('setup.sharing.note.body')}</DesignNote>
    </SetupLayout>
  )
}
