import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function GoldenHourPage() {
  const { t } = useT()
  return (
    <Screen title={t('goldenHour.title')} back="/">
      <p>{t('goldenHour.placeholder')}</p>
    </Screen>
  )
}
