import { toCoin, toCoinDetail } from '../lib/coins'
import type { Coin, CoinDetail } from '../lib/coins'
import type { ChartPoint } from '../lib/chart'

const BASE = 'https://api.coingecko.com/api/v3'
const MARKETS_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'

export type ApiErrorKind = 'rate-limit' | 'network' | 'server' | 'not-found'

const messages: Record<ApiErrorKind, string> = {
  'rate-limit': 'Too many requests. The free price service needs a short break. Try again in a minute.',
  network: "Couldn't reach the price service. Check your connection and try again.",
  server: 'The price service sent something unexpected. Try again in a moment.',
  'not-found': "We couldn't find that coin.",
}

export class ApiError extends Error {
  kind: ApiErrorKind

  constructor(kind: ApiErrorKind) {
    super(messages[kind])
    this.name = 'ApiError'
    this.kind = kind
  }
}

/** Asks the price service for something and turns every kind of failure into an ApiError. */
async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, { signal, headers: { accept: 'application/json' } })
  } catch (error) {
    // A cancelled request is not a failure the person needs to see.
    if (signal?.aborted) throw error
    throw new ApiError('network')
  }

  if (response.status === 429) throw new ApiError('rate-limit')
  if (response.status === 404) throw new ApiError('not-found')
  if (!response.ok) throw new ApiError('server')

  const data: unknown = await response.json().catch(() => null)
  if (data === null) throw new ApiError('server')
  return data
}

/** The top 100 coins by market cap, with price and 24 hour change. */
export async function fetchMarkets(signal?: AbortSignal): Promise<Coin[]> {
  const data = await getJson(MARKETS_URL, signal)
  if (!Array.isArray(data)) throw new ApiError('server')
  return data.map(toCoin).filter((coin): coin is Coin => coin !== null)
}

/** One coin with its stats. */
export async function fetchCoinDetail(id: string, signal?: AbortSignal): Promise<CoinDetail> {
  const url = `${BASE}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  const detail = toCoinDetail(await getJson(url, signal))
  if (!detail) throw new ApiError('server')
  return detail
}

/** Price history as [time in ms, price] pairs. Broken pairs are skipped. */
export async function fetchChart(id: string, days: number, signal?: AbortSignal): Promise<ChartPoint[]> {
  const data = await getJson(`${BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`, signal)
  const prices = typeof data === 'object' && data !== null && 'prices' in data ? data.prices : null
  if (!Array.isArray(prices)) throw new ApiError('server')
  const points = prices.filter(
    (p): p is ChartPoint => Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[1]),
  )
  if (points.length < 2) throw new ApiError('server')
  return points.map(([time, price]) => [time, price])
}

/** The coins in a watchlist, with a 7 day trend line for each. */
export async function fetchCoinsByIds(ids: string[], signal?: AbortSignal): Promise<Coin[]> {
  const list = ids.map(encodeURIComponent).join(',')
  const data = await getJson(`${BASE}/coins/markets?vs_currency=usd&ids=${list}&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=24h`, signal)
  if (!Array.isArray(data)) throw new ApiError('server')
  return data.map(toCoin).filter((coin): coin is Coin => coin !== null)
}
