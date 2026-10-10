import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function AccessibilityPage() {
  const { t } = useT()
  return (
    <Screen title={t('accessibility.title')} back="/">
      <p>{t('accessibility.placeholder')}</p>
    </Screen>
  )
}
