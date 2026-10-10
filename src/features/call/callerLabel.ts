import { useT } from '../../i18n/useT'
import { useStore } from '../../state/store'
import { DEFAULT_CALLER_LABEL } from './script'

/**
 * Who the simulated caller claims to be, in the reader's language.
 * The default "CBI Mumbai" is translated (सीबीआई मुंबई) so Hindi screens never mix scripts;
 * a custom label is shown as stored, with `lang` so screen readers pronounce it correctly.
 */
export function useCallerLabel(): { text: string; lang: 'en' | undefined } {
  const label = useStore((s) => s.incident.callerLabel)
  const { t, lang } = useT()
  if (!label || label === DEFAULT_CALLER_LABEL) return { text: t('call.agency'), lang: undefined }
  return { text: label, lang: lang === 'en' ? undefined : 'en' }
}
