import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function DemoPage() {
  const { t } = useT()
  return (
    <Screen title={t('demo.title')} back="/">
      <p>{t('demo.placeholder')}</p>
    </Screen>
  )
}
