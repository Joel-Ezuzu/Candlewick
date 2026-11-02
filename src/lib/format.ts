const usd = (options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options })

/** $67,420.18 for big prices, $0.5230 for cents, and enough digits for tiny coins. */
export function formatPrice(value: number): string {
  if (value >= 1) return usd({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  if (value >= 0.01) return usd({ minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value)
  return usd({ maximumSignificantDigits: 4 }).format(value)
}

/** +2.41% or -0.64%. A move of zero has no sign. */
export function formatPercent(value: number): string {
  const rounded = Number(value.toFixed(2))
  if (rounded === 0) return '0.00%'
  return `${rounded > 0 ? '+' : '-'}${Math.abs(rounded).toFixed(2)}%`
}

/** $1.33T or $28.4B, for market cap and volume. */
export function formatCompact(value: number): string {
  return usd({ notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}

export type Tone = 'up' | 'down' | 'flat'

export function toneOf(value: number): Tone {
  const rounded = Number(value.toFixed(2))
  return rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat'
}

/** "Just now", "3 min ago" or "2 h ago". */
export function timeAgo(then: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - then) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  return `${Math.floor(minutes / 60)} h ago`
}

/** 19.7M BTC. A coin count with its symbol. */
export function formatSupply(value: number, symbol: string): string {
  const count = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
  return `${count} ${symbol}`
}

/** The time for one point on the chart. Shorter ranges show the hour, longer ones show the year. */
export function formatChartTime(timestamp: number, range: '24H' | '7D' | '30D' | '1Y'): string {
  const date = new Date(timestamp)
  const clock = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (range === '24H') return clock
  if (range === '1Y') return `${day} ${date.getFullYear()}`
  return `${day}, ${clock}`
}
