import { Home } from 'lucide-react'
import { ButtonLink, Screen } from '../design-system/components'
import { useT } from '../i18n/useT'

export function NotFoundPage() {
  const { t } = useT()
  return (
    <Screen title={t('notFound.title')} back="/">
      <p className="lead">{t('notFound.body')}</p>
      <ButtonLink to="/" variant="primary" size="lg" icon={<Home />}>
        {t('common.home')}
      </ButtonLink>
    </Screen>
  )
}
