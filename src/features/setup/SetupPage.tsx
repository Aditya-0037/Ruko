import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function SetupPage() {
  const { t } = useT()
  return (
    <Screen title={t('setup.title')} back="/">
      <p>{t('setup.placeholder')}</p>
    </Screen>
  )
}
