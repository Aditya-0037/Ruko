import { describe, expect, it } from 'vitest'
import { formatClock, formatINR, minutesBetween, parseAmount } from './format'

describe('format', () => {
  it('uses Indian digit grouping for rupees', () => {
    expect(formatINR(200000)).toBe('₹2,00,000')
    expect(formatINR(1234567)).toBe('₹12,34,567')
  })
  it('formats call clocks', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(187_000)).toBe('03:07')
    expect(formatClock(3_729_000)).toBe('1:02:09')
  })
  it('never returns negative minutes', () => {
    expect(minutesBetween(10_000, 0)).toBe(0)
    expect(minutesBetween(0, 125_000)).toBe(2)
  })
  it('parses typed amounts', () => {
    expect(parseAmount('₹2,00,000')).toBe(200000)
    expect(parseAmount('')).toBe(0)
  })
})
