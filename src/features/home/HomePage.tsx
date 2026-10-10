import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function HomePage() {
  const { t } = useT()
  return (
    <Screen title={t('home.title')} back="/">
      <p>{t('home.placeholder')}</p>
    </Screen>
  )
}
