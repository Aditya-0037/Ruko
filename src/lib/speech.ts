import type { Lang } from '../state/types'

/**
 * Read-aloud using the Web Speech API. Text is always also shown on screen (transcript),
 * so speech is an enhancement, never the only channel.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const wanted = lang === 'hi' ? ['hi-IN', 'hi'] : ['en-IN', 'en-GB', 'en-US', 'en']
  for (const code of wanted) {
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    if (match) return match
  }
  return undefined
}

export function speak(text: string, lang: Lang, opts: { onEnd?: () => void } = {}): boolean {
  if (!isSpeechSupported()) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    const voice = pickVoice(lang)
    if (voice) u.voice = voice
    u.rate = 0.9 // a little slower: calmer and clearer for older listeners
    u.pitch = 1
    if (opts.onEnd) {
      u.onend = opts.onEnd
      u.onerror = opts.onEnd
    }
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
