import { describe, expect, it } from 'vitest'
import { filterAndSort, toCoin, toCoinDetail } from './coins'
import type { Coin } from './coins'

const coin = (over: Partial<Coin>): Coin => ({
  id: 'x', symbol: 'X', name: 'X', image: '', price: 1, change24h: 0, marketCap: 1, rank: 1, sparkline: [], ...over,
})

const coins: Coin[] = [
  coin({ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 67000, change24h: 2.4, rank: 1 }),
  coin({ id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3500, change24h: -1.1, rank: 2 }),
  coin({ id: 'solana', symbol: 'SOL', name: 'Solana', price: 170, change24h: 5.2, rank: 5 }),
  coin({ id: 'nodata', symbol: 'NDA', name: 'No Data Coin', price: 1, change24h: null, rank: null }),
]

describe('toCoin', () => {
  it('maps an item from the price API', () => {
    const result = toCoin({ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'i.png', current_price: 67000, price_change_percentage_24h: 2.4, market_cap: 1e12, market_cap_rank: 1 })
    expect(result).toEqual({ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'i.png', price: 67000, change24h: 2.4, marketCap: 1e12, rank: 1, sparkline: [] })
  })
  it('keeps the 7 day trend line when the API sends one', () => {
    const result = toCoin({ id: 'a', symbol: 'a', name: 'A', current_price: 1, sparkline_in_7d: { price: [1, 2, 'x', 3] } })
    expect(result?.sparkline).toEqual([1, 2, 3])
  })
  it('uses null for numbers the API leaves out', () => {
    const result = toCoin({ id: 'a', symbol: 'a', name: 'A', current_price: 1, price_change_percentage_24h: null })
    expect(result?.change24h).toBeNull()
    expect(result?.rank).toBeNull()
  })
  it('skips items that are missing the basics', () => {
    expect(toCoin(null)).toBeNull()
    expect(toCoin({ id: 'a', symbol: 'a', name: 'A' })).toBeNull()
    expect(toCoin({ id: 'a', symbol: 'a', name: 'A', current_price: 'lots' })).toBeNull()
  })
})

describe('filterAndSort', () => {
  it('finds coins by name or symbol, ignoring capital letters', () => {
    expect(filterAndSort(coins, 'BIT', { key: 'rank', dir: 'asc' }).map((c) => c.id)).toEqual(['bitcoin'])
    expect(filterAndSort(coins, 'eth', { key: 'rank', dir: 'asc' }).map((c) => c.id)).toEqual(['ethereum'])
  })
  it('returns everything for an empty search', () => {
    expect(filterAndSort(coins, '  ', { key: 'rank', dir: 'asc' })).toHaveLength(4)
  })
  it('sorts by market cap rank, with unranked coins last', () => {
    expect(filterAndSort(coins, '', { key: 'rank', dir: 'asc' }).map((c) => c.id)).toEqual(['bitcoin', 'ethereum', 'solana', 'nodata'])
  })
  it('sorts by price in both directions', () => {
    expect(filterAndSort(coins, '', { key: 'price', dir: 'desc' })[0].id).toBe('bitcoin')
    expect(filterAndSort(coins, '', { key: 'price', dir: 'asc' })[0].id).toBe('nodata')
  })
  it('sorts by 24 hour change and keeps missing data at the end', () => {
    expect(filterAndSort(coins, '', { key: 'change', dir: 'desc' }).map((c) => c.id)).toEqual(['solana', 'bitcoin', 'ethereum', 'nodata'])
    expect(filterAndSort(coins, '', { key: 'change', dir: 'asc' }).map((c) => c.id)).toEqual(['ethereum', 'bitcoin', 'solana', 'nodata'])
  })
  it('sorts by name', () => {
    expect(filterAndSort(coins, '', { key: 'name', dir: 'asc' })[0].id).toBe('bitcoin')
  })
  it('does not change the list it was given', () => {
    const copy = [...coins]
    filterAndSort(coins, '', { key: 'price', dir: 'asc' })
    expect(coins).toEqual(copy)
  })
})

describe('toCoinDetail', () => {
  const raw = {
    id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: { small: 'b.png' },
    market_data: {
      current_price: { usd: 67000 }, price_change_percentage_24h: 2.4, market_cap: { usd: 1.3e12 },
      total_volume: { usd: 2.8e10 }, high_24h: { usd: 68000 }, low_24h: { usd: 65000 }, circulating_supply: 19.7e6, ath: { usd: 73750 },
    },
  }
  it('maps the stats the coin page needs', () => {
    expect(toCoinDetail(raw)).toEqual({
      id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'b.png', price: 67000, change24h: 2.4, marketCap: 1.3e12,
      volume24h: 2.8e10, high24h: 68000, low24h: 65000, circulatingSupply: 19.7e6, allTimeHigh: 73750,
    })
  })
  it('uses null for stats the API leaves out', () => {
    const result = toCoinDetail({ ...raw, market_data: { current_price: { usd: 1 } } })
    expect(result?.marketCap).toBeNull()
    expect(result?.allTimeHigh).toBeNull()
  })
  it('skips a reply with no price', () => {
    expect(toCoinDetail({ ...raw, market_data: {} })).toBeNull()
    expect(toCoinDetail({ id: 'a' })).toBeNull()
  })
})
