import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function AboutPage() {
  const { t } = useT()
  return (
    <Screen title={t('about.title')} back="/">
      <p>{t('about.placeholder')}</p>
    </Screen>
  )
}
