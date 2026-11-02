import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { downsample, layout, nearestIndex, summarize } from '../lib/chart'
import type { ChartPoint, Range } from '../lib/chart'
import { formatChartTime, formatPrice } from '../lib/format'

const W = 358
const H = 180

interface PriceChartProps {
  points: ChartPoint[]
  range: Range
  name: string
  /** True while the points on screen belong to the previous range. */
  busy: boolean
}

/** A price line you can read with a finger, a mouse or the arrow keys. */
export function PriceChart({ points, range, name, busy }: PriceChartProps) {
  const gradientId = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const data = useMemo(() => downsample(points), [points])
  const geo = useMemo(() => layout(data, W, H), [data])
  const stats = useMemo(() => summarize(data), [data])
  const [picked, setPicked] = useState<number | null>(null)

  const active = !busy && picked !== null && picked < data.length ? picked : null
  const point = active === null ? null : data[active]

  function pointAt(clientX: number) {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box || box.width === 0) return
    setPicked(nearestIndex(geo.xs, ((clientX - box.left) / box.width) * W))
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = data.length - 1
    const from = active ?? last
    const moves: Record<string, number> = {
      ArrowLeft: Math.max(0, from - 1),
      ArrowRight: Math.min(last, from + 1),
      Home: 0,
      End: last,
    }
    if (event.key === 'Escape') setPicked(null)
    else if (event.key in moves) setPicked(moves[event.key])
    else return
    event.preventDefault()
  }

  const summary = busy
    ? 'The chart is loading.'
    : `${name} price over ${range.label}, from ${formatPrice(stats.first)} to ${formatPrice(stats.last)}. Lowest ${formatPrice(stats.low)}, highest ${formatPrice(stats.high)}.`

  return (
    <div aria-busy={busy} className={`transition-opacity ${busy ? 'opacity-50' : ''}`}>
      <div
        role="group"
        aria-label="Price chart. Use the left and right arrow keys to read prices."
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => setPicked(null)}
        className="rounded-xl outline-offset-4"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={summary}
          className="block w-full touch-pan-y select-none"
          onPointerMove={(e) => pointAt(e.clientX)}
          onPointerDown={(e) => pointAt(e.clientX)}
          onPointerLeave={() => setPicked(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--gold)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={geo.area} fill={`url(#${gradientId})`} />
          <path d={geo.line} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {active !== null && (
            <g>
              <line x1={geo.xs[active]} x2={geo.xs[active]} y1="0" y2={H} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
              <circle cx={geo.xs[active]} cy={geo.ys[active]} r="5" fill="var(--gold)" stroke="var(--bg)" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden="true">
        <span>{formatChartTime(data[0][0], range.id)}</span>
        <span>{formatChartTime(data[data.length - 1][0], range.id)}</span>
      </div>
      <p aria-live="polite" className="num mt-2 min-h-6 text-sm text-muted">
        {point ? (
          <>
            <span>{formatChartTime(point[0], range.id)}</span>
            <span className="mx-2">·</span>
            <span className="font-semibold text-fg">{formatPrice(point[1])}</span>
          </>
        ) : (
          'Touch or hover the chart to see prices.'
        )}
      </p>
    </div>
  )
}
