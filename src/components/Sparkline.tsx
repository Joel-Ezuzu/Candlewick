import { useMemo } from 'react'
import { downsample, layout } from '../lib/chart'
import type { ChartPoint } from '../lib/chart'
import type { Tone } from '../lib/format'

const W = 64
const H = 28

/** A tiny trend line for the last 7 days. Green if the coin is up today, red if it is down. */
export function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const line = useMemo(() => {
    if (values.length < 2) return ''
    const points = downsample(values.map((value, i): ChartPoint => [i, value]), 32)
    return layout(points, W, H, 3).line
  }, [values])

  if (!line) return <span className="block h-7 w-16 shrink-0" aria-hidden="true" />
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={`shrink-0 ${tone === 'down' ? 'text-down' : 'text-up'}`}>
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
