import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function AdaptPage() {
  const { t } = useT()
  return (
    <Screen title={t('adapt.title')} back="/">
      <p>{t('adapt.placeholder')}</p>
    </Screen>
  )
}
