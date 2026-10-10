import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function FamilyPage() {
  const { t } = useT()
  return (
    <Screen title={t('family.title')} back="/">
      <p>{t('family.placeholder')}</p>
    </Screen>
  )
}
