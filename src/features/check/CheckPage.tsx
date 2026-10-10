import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function CheckPage() {
  const { t } = useT()
  return (
    <Screen title={t('check.title')} back="/">
      <p>{t('check.placeholder')}</p>
    </Screen>
  )
}
