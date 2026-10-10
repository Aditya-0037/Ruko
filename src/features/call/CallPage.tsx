import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function CallPage() {
  const { t } = useT()
  return (
    <Screen title={t('call.title')} back="/">
      <p>{t('call.placeholder')}</p>
    </Screen>
  )
}
