import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function DrillPage() {
  const { t } = useT()
  return (
    <Screen title={t('drill.title')} back="/">
      <p>{t('drill.placeholder')}</p>
    </Screen>
  )
}
