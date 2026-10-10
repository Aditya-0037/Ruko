/**
 * The scripted "officer" lines for the practice call, in the order reported in real
 * digital-arrest cases: a fake case → "do not disconnect" → secrecy → move the money.
 * Each line carries a plain-words scam sign, shown in the transcript so practice teaches.
 */
export const CALL_LINES = [
  { line: 'call.line.1', sign: 'call.sign.1' },
  { line: 'call.line.2', sign: 'call.sign.2' },
  { line: 'call.line.3', sign: 'call.sign.3' },
  { line: 'call.line.4', sign: 'call.sign.4' },
] as const

/** A new caption every ~6 seconds: slow enough for an older reader to finish each line. */
export const CAPTION_INTERVAL_MS = 6000

/** Which line is on screen after `elapsedMs` of connected call. Holds on the last line. */
export function captionIndexAt(elapsedMs: number): number {
  const index = Math.floor(Math.max(0, elapsedMs) / CAPTION_INTERVAL_MS)
  return Math.min(CALL_LINES.length - 1, index)
}

/** The fallback agency when the store has none (matches the store's startCall default). */
export const DEFAULT_CALLER_LABEL = 'CBI Mumbai'
