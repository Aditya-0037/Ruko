import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function PausePage() {
  const { t } = useT()
  return (
    <Screen title={t('pause.title')} back="/">
      <p>{t('pause.placeholder')}</p>
    </Screen>
  )
}
