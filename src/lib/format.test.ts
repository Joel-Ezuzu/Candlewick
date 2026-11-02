import { describe, expect, it } from 'vitest'
import { formatChartTime, formatCompact, formatPercent, formatPrice, formatSupply, timeAgo, toneOf } from './format'

describe('formatPrice', () => {
  it('shows two decimals for prices of a dollar or more', () => {
    expect(formatPrice(67420.18)).toBe('$67,420.18')
    expect(formatPrice(1)).toBe('$1.00')
  })
  it('shows four decimals for cents', () => {
    expect(formatPrice(0.523)).toBe('$0.5230')
  })
  it('keeps enough digits for tiny prices', () => {
    expect(formatPrice(0.00001234)).toBe('$0.00001234')
  })
})

describe('formatPercent', () => {
  it('adds a plus sign to gains and a minus sign to losses', () => {
    expect(formatPercent(2.414)).toBe('+2.41%')
    expect(formatPercent(-0.644)).toBe('-0.64%')
  })
  it('shows no sign when nothing moved', () => {
    expect(formatPercent(0)).toBe('0.00%')
    expect(formatPercent(0.004)).toBe('0.00%')
  })
})

describe('formatCompact', () => {
  it('shortens big numbers', () => {
    expect(formatCompact(1.33e12)).toBe('$1.33T')
    expect(formatCompact(28.4e9)).toBe('$28.4B')
  })
})

describe('toneOf', () => {
  it('tells up, down and flat apart', () => {
    expect(toneOf(1.2)).toBe('up')
    expect(toneOf(-1.2)).toBe('down')
    expect(toneOf(0.001)).toBe('flat')
  })
})

describe('timeAgo', () => {
  it('describes how long ago something happened', () => {
    const now = 10_000_000
    expect(timeAgo(now - 20_000, now)).toBe('Just now')
    expect(timeAgo(now - 3 * 60_000, now)).toBe('3 min ago')
    expect(timeAgo(now - 125 * 60_000, now)).toBe('2 h ago')
  })
})

describe('formatSupply', () => {
  it('shortens a coin count and adds the symbol', () => {
    expect(formatSupply(19_700_000, 'BTC')).toBe('19.7M BTC')
    expect(formatSupply(120_000_000_000, 'DOGE')).toBe('120B DOGE')
  })
})

describe('formatChartTime', () => {
  const stamp = new Date(2026, 9, 6, 14, 5).getTime()
  it('shows only the time for one day', () => {
    expect(formatChartTime(stamp, '24H')).toBe('14:05')
  })
  it('shows the day and time for a week or a month', () => {
    expect(formatChartTime(stamp, '7D')).toBe('6 Oct, 14:05')
  })
  it('shows the year for a year', () => {
    expect(formatChartTime(stamp, '1Y')).toBe('6 Oct 2026')
  })
})
