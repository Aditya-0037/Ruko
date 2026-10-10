import { useEffect, useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { isSpeechSupported, speak, stopSpeaking } from '../../lib/speech'
import { Button } from './Button'

interface ListenButtonProps {
  /** Exactly the text shown on screen — speech is a second channel, not a different message. */
  text: string
  /** Start reading immediately (used when the "Read aloud" preference is on). */
  autoPlay?: boolean
  variant?: 'secondary' | 'quiet'
}

export function ListenButton({ text, autoPlay, variant = 'secondary' }: ListenButtonProps) {
  const { t, lang } = useT()
  const [speaking, setSpeaking] = useState(false)
  const supported = isSpeechSupported()

  useEffect(() => {
    if (!autoPlay || !supported) return
    const ok = speak(text, lang, { onEnd: () => setSpeaking(false) })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect the started utterance
    setSpeaking(ok)
    return () => stopSpeaking()
  }, [autoPlay, supported, text, lang])

  useEffect(() => () => stopSpeaking(), [])

  if (!supported) return null

  return (
    <Button
      variant={variant}
      icon={speaking ? <Square /> : <Volume2 />}
      aria-pressed={speaking}
      onClick={() => {
        if (speaking) {
          stopSpeaking()
          setSpeaking(false)
        } else {
          setSpeaking(speak(text, lang, { onEnd: () => setSpeaking(false) }))
        }
      }}
    >
      {speaking ? t('common.stopListening') : t('common.listen')}
    </Button>
  )
}
