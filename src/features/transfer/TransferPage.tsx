import { Screen } from '../../design-system/components'
import { useT } from '../../i18n/useT'

export function TransferPage() {
  const { t } = useT()
  return (
    <Screen title={t('transfer.title')} back="/">
      <p>{t('transfer.placeholder')}</p>
    </Screen>
  )
}
