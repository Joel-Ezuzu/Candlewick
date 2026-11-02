/** One point on a price chart: the time in milliseconds, and the price. */
export type ChartPoint = [number, number]

export type RangeId = '24H' | '7D' | '30D' | '1Y'
export interface Range {
  id: RangeId
  days: number
  label: string
}

export const ranges: Range[] = [
  { id: '24H', days: 1, label: '24 hours' },
  { id: '7D', days: 7, label: '7 days' },
  { id: '30D', days: 30, label: '30 days' },
  { id: '1Y', days: 365, label: '1 year' },
]

/** Keeps at most `max` points, evenly spread, always including the first and the last. */
export function downsample(points: ChartPoint[], max = 120): ChartPoint[] {
  if (points.length <= max) return points
  const step = (points.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)])
}

export interface Geometry {
  /** SVG path for the line. */
  line: string
  /** SVG path for the filled area under the line. */
  area: string
  xs: number[]
  ys: number[]
}

const round = (n: number): number => Math.round(n * 100) / 100

/** Turns prices into drawing coordinates. Higher prices sit higher on the chart. */
export function layout(points: ChartPoint[], width: number, height: number, padY = 14): Geometry {
  const times = points.map((p) => p[0])
  const prices = points.map((p) => p[1])
  const t0 = Math.min(...times)
  const t1 = Math.max(...times)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const span = high - low

  const xs = points.map((p, i) => round(t1 === t0 ? (i / Math.max(points.length - 1, 1)) * width : ((p[0] - t0) / (t1 - t0)) * width))
  const ys = points.map((p) => round(span === 0 ? height / 2 : height - padY - ((p[1] - low) / span) * (height - padY * 2)))

  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const area = `${line} L${xs[xs.length - 1]},${height} L${xs[0]},${height} Z`
  return { line, area, xs, ys }
}

/** The index of the point closest to a horizontal position. */
export function nearestIndex(xs: number[], x: number): number {
  let best = 0
  for (let i = 1; i < xs.length; i++) {
    if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i
  }
  return best
}

export function summarize(points: ChartPoint[]): { first: number; last: number; low: number; high: number } {
  const prices = points.map((p) => p[1])
  return { first: prices[0], last: prices[prices.length - 1], low: Math.min(...prices), high: Math.max(...prices) }
}
