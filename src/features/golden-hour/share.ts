/** Copy, share and download helpers for the complaint pack. Each degrades gracefully. */

/** Copies text. Uses the Clipboard API, then the older execCommand route (no HTTPS needed). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* permission denied or insecure context: fall back below */
  }
  const previousFocus = document.activeElement as HTMLElement | null
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.setAttribute('aria-hidden', 'true')
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.opacity = '0'
    area.style.pointerEvents = 'none'
    document.body.appendChild(area)
    area.select()
    const ok = typeof document.execCommand === 'function' && document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  } finally {
    // The temporary textarea took focus; give it back so keyboard users are not lost.
    previousFocus?.focus?.({ preventScroll: true })
  }
}

export function canShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export type ShareResult = 'shared' | 'cancelled' | 'failed'

export async function shareText(title: string, text: string): Promise<ShareResult> {
  if (!canShare()) return 'failed'
  try {
    await navigator.share({ title, text })
    return 'shared'
  } catch (err) {
    // Closing the share sheet is a choice, not an error.
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    return 'failed'
  }
}

/** Starts a download of a UTF-8 text file. */
export function downloadText(fileName: string, text: string): void {
  const hasBlobUrl = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
  const href = hasBlobUrl
    ? URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    : `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  if (hasBlobUrl) window.setTimeout(() => URL.revokeObjectURL(href), 10_000)
}
