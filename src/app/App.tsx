import { Outlet } from 'react-router'
import { WifiOff } from 'lucide-react'
import { ToastRegion } from '../design-system/components'
import { useT } from '../i18n/useT'
import { useOnline } from '../state/hooks'
import { CallPip } from '../features/call/CallPip'
import { PrefsEffect } from './PrefsEffect'
import styles from './Shell.module.css'

function OfflineBanner() {
  const online = useOnline()
  const { t } = useT()
  if (online) return null
  return (
    <div className={`${styles.offline} no-print`} role="status">
      <WifiOff aria-hidden="true" />
      <span>{t('shell.offline')}</span>
    </div>
  )
}

/** App shell shared by every route. */
export function App() {
  const { t } = useT()
  return (
    <>
      <PrefsEffect />
      <a href="#main" className={`${styles.skip} no-print`}>
        {t('shell.skipToContent')}
      </a>
      <OfflineBanner />
      <CallPip />
      <Outlet />
      <ToastRegion />
    </>
  )
}
