import { formatPercent, toneOf } from '../lib/format'

const tones = { up: 'text-up', down: 'text-down', flat: 'text-muted' }

/** The 24 hour move, with an arrow and a sign so it never depends on colour alone. */
export function PriceChange({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-muted">No data</span>
  const tone = toneOf(value)

  return (
    <span className={`inline-flex items-center justify-end gap-1 text-sm font-semibold ${tones[tone]}`}>
      {tone !== 'flat' && (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d={tone === 'up' ? 'M5 1l4 7H1z' : 'M5 9L1 2h8z'} fill="currentColor" />
        </svg>
      )}
      <span className="num">{formatPercent(value)}</span>
      <span className="sr-only">in 24 hours</span>
    </span>
  )
}
