import { useCallback } from 'react'
import { useStore } from '../state/store'
import { dictionaries } from './dictionaries'
import { translate, type Vars } from './translate'

/**
 * const { t, lang } = useT()
 * t('pause.title') · t('help.callPerson', { name: 'Rahul' })
 * Honours Easy Read: returns `<key>.easy` when it exists and Easy Read is on.
 */
export function useT() {
  const lang = useStore((s) => s.prefs.lang)
  const easyRead = useStore((s) => s.prefs.easyRead)
  const t = useCallback(
    (key: string, vars?: Vars) => translate(dictionaries, lang, key, { easyRead, vars }),
    [lang, easyRead],
  )
  return { t, lang, easyRead }
}
