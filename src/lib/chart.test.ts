import { describe, expect, it } from 'vitest'
import { downsample, layout, nearestIndex, summarize } from './chart'
import type { ChartPoint } from './chart'

const series = (n: number): ChartPoint[] => Array.from({ length: n }, (_, i) => [i * 1000, 100 + i])

describe('downsample', () => {
  it('leaves short lists alone', () => {
    expect(downsample(series(10), 120)).toHaveLength(10)
  })
  it('shrinks long lists but keeps the first and last points', () => {
    const points = series(1000)
    const result = downsample(points, 100)
    expect(result).toHaveLength(100)
    expect(result[0]).toEqual(points[0])
    expect(result[99]).toEqual(points[999])
  })
})

describe('layout', () => {
  it('spreads points from left to right across the width', () => {
    const { xs } = layout(series(5), 400, 200)
    expect(xs[0]).toBe(0)
    expect(xs[4]).toBe(400)
  })
  it('puts higher prices higher up, with room above and below', () => {
    const { ys } = layout(series(5), 400, 200, 14)
    expect(ys[4]).toBeLessThan(ys[0])
    expect(ys[4]).toBe(14)
    expect(ys[0]).toBe(186)
  })
  it('draws a flat line in the middle when the price never moves', () => {
    const { ys } = layout([[0, 5], [1000, 5], [2000, 5]], 400, 200)
    expect(new Set(ys)).toEqual(new Set([100]))
  })
  it('closes the filled area along the bottom', () => {
    const { area } = layout(series(3), 100, 50)
    expect(area.startsWith('M0,')).toBe(true)
    expect(area.endsWith('L0,50 Z')).toBe(true)
  })
  it('places points by time, so gaps in the data show up as gaps', () => {
    const { xs } = layout([[0, 1], [100, 2], [1000, 3]], 1000, 100)
    expect(xs).toEqual([0, 100, 1000])
  })
})

describe('nearestIndex', () => {
  it('finds the closest point to a position', () => {
    expect(nearestIndex([0, 100, 200, 300], 140)).toBe(1)
    expect(nearestIndex([0, 100, 200, 300], 160)).toBe(2)
    expect(nearestIndex([0, 100, 200, 300], 999)).toBe(3)
  })
})

describe('summarize', () => {
  it('finds the first, last, lowest and highest price', () => {
    expect(summarize([[0, 5], [1, 9], [2, 3], [3, 7]])).toEqual({ first: 5, last: 7, low: 3, high: 9 })
  })
})
