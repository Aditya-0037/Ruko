import { describe, expect, it } from 'vitest'
import { CALL_LINES, CAPTION_INTERVAL_MS, captionIndexAt } from './script'

describe('captionIndexAt', () => {
  it('starts on the first line and moves on every interval', () => {
    expect(captionIndexAt(0)).toBe(0)
    expect(captionIndexAt(CAPTION_INTERVAL_MS - 1)).toBe(0)
    expect(captionIndexAt(CAPTION_INTERVAL_MS)).toBe(1)
    expect(captionIndexAt(CAPTION_INTERVAL_MS * 2 + 10)).toBe(2)
  })

  it('holds on the last line and never goes negative', () => {
    expect(captionIndexAt(CAPTION_INTERVAL_MS * 99)).toBe(CALL_LINES.length - 1)
    expect(captionIndexAt(-5000)).toBe(0)
  })
})
