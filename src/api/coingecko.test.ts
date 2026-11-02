import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, fetchChart, fetchCoinDetail, fetchCoinsByIds, fetchMarkets } from './coingecko'

const reply = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({ status, ok: status >= 200 && status < 300, json: () => Promise.resolve(body) })

afterEach(() => vi.unstubAllGlobals())

describe('fetchMarkets', () => {
  it('returns coins and drops broken items', async () => {
    vi.stubGlobal('fetch', reply(200, [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67000 }, { nope: true }]))
    const coins = await fetchMarkets()
    expect(coins).toHaveLength(1)
    expect(coins[0].symbol).toBe('BTC')
  })
  it('reports too many requests', async () => {
    vi.stubGlobal('fetch', reply(429, {}))
    await expect(fetchMarkets()).rejects.toMatchObject({ kind: 'rate-limit' })
  })
  it('reports a server problem', async () => {
    vi.stubGlobal('fetch', reply(500, {}))
    await expect(fetchMarkets()).rejects.toMatchObject({ kind: 'server' })
  })
  it('reports an unexpected reply', async () => {
    vi.stubGlobal('fetch', reply(200, { message: 'hello' }))
    await expect(fetchMarkets()).rejects.toBeInstanceOf(ApiError)
  })
  it('reports a network problem', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(fetchMarkets()).rejects.toMatchObject({ kind: 'network' })
  })
})

describe('fetchCoinDetail', () => {
  it('returns the coin', async () => {
    vi.stubGlobal('fetch', reply(200, { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', market_data: { current_price: { usd: 67000 } } }))
    expect((await fetchCoinDetail('bitcoin')).price).toBe(67000)
  })
  it('reports a coin that does not exist', async () => {
    vi.stubGlobal('fetch', reply(404, {}))
    await expect(fetchCoinDetail('nope')).rejects.toMatchObject({ kind: 'not-found' })
  })
  it('reports a reply with no price', async () => {
    vi.stubGlobal('fetch', reply(200, { id: 'a', symbol: 'a', name: 'A', market_data: {} }))
    await expect(fetchCoinDetail('a')).rejects.toMatchObject({ kind: 'server' })
  })
})

describe('fetchChart', () => {
  it('returns the price points and skips broken ones', async () => {
    vi.stubGlobal('fetch', reply(200, { prices: [[1, 10], [2, 11], ['x', 3], [3, null], [4, 12]] }))
    expect(await fetchChart('bitcoin', 7)).toEqual([[1, 10], [2, 11], [4, 12]])
  })
  it('needs at least two points to draw a line', async () => {
    vi.stubGlobal('fetch', reply(200, { prices: [[1, 10]] }))
    await expect(fetchChart('bitcoin', 7)).rejects.toMatchObject({ kind: 'server' })
  })
  it('asks for the right number of days', async () => {
    const spy = reply(200, { prices: [[1, 10], [2, 11]] })
    vi.stubGlobal('fetch', spy)
    await fetchChart('bitcoin', 30)
    expect(String(spy.mock.calls[0][0])).toContain('/coins/bitcoin/market_chart?vs_currency=usd&days=30')
  })
})

describe('fetchCoinsByIds', () => {
  it('asks for the coins by id and returns them with their trend lines', async () => {
    const spy = reply(200, [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67000, sparkline_in_7d: { price: [1, 2] } }])
    vi.stubGlobal('fetch', spy)
    const coins = await fetchCoinsByIds(['bitcoin', 'solana'])
    expect(String(spy.mock.calls[0][0])).toContain('ids=bitcoin,solana')
    expect(coins[0].sparkline).toEqual([1, 2])
  })
})
