/** One coin, in the shape the app uses. */
export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  price: number
  change24h: number | null
  marketCap: number | null
  rank: number | null
  /** Prices over the last 7 days, for a small trend line. Empty when not asked for. */
  sparkline: number[]
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const numberOrNull = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

function sparklineOf(value: unknown): number[] {
  if (!isObject(value) || !Array.isArray(value.price)) return []
  return value.price.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
}

/** Turns one item from the price API into a Coin, or null if it is missing the basics. */
export function toCoin(raw: unknown): Coin | null {
  if (!isObject(raw)) return null
  const { id, symbol, name, image } = raw
  const price = numberOrNull(raw.current_price)
  if (typeof id !== 'string' || typeof symbol !== 'string' || typeof name !== 'string' || price === null) return null
  return {
    id,
    symbol: symbol.toUpperCase(),
    name,
    image: typeof image === 'string' ? image : '',
    price,
    change24h: numberOrNull(raw.price_change_percentage_24h),
    marketCap: numberOrNull(raw.market_cap),
    rank: numberOrNull(raw.market_cap_rank),
    sparkline: sparklineOf(raw.sparkline_in_7d),
  }
}

export type SortKey = 'rank' | 'price' | 'change' | 'name'
export type SortDir = 'asc' | 'desc'
export interface Sort {
  key: SortKey
  dir: SortDir
}

/** The direction each sort starts in. Pressing the same sort again flips it. */
export const startDir: Record<SortKey, SortDir> = { rank: 'asc', price: 'desc', change: 'desc', name: 'asc' }

function valueFor(coin: Coin, key: SortKey): number | string | null {
  if (key === 'rank') return coin.rank
  if (key === 'price') return coin.price
  if (key === 'change') return coin.change24h
  return coin.name
}

/** Keeps coins whose name or symbol contains the search words, then sorts them. Missing values go last. */
export function filterAndSort(coins: Coin[], query: string, sort: Sort): Coin[] {
  const text = query.trim().toLowerCase()
  const kept = text ? coins.filter((c) => c.name.toLowerCase().includes(text) || c.symbol.toLowerCase().includes(text)) : coins
  const sign = sort.dir === 'asc' ? 1 : -1

  return [...kept].sort((a, b) => {
    const x = valueFor(a, sort.key)
    const y = valueFor(b, sort.key)
    if (x === null && y === null) return 0
    if (x === null) return 1
    if (y === null) return -1
    if (typeof x === 'string' && typeof y === 'string') return x.localeCompare(y) * sign
    return ((x as number) - (y as number)) * sign
  })
}

/** Everything the coin page shows about one coin. */
export interface CoinDetail {
  id: string
  symbol: string
  name: string
  image: string
  price: number
  change24h: number | null
  marketCap: number | null
  volume24h: number | null
  high24h: number | null
  low24h: number | null
  circulatingSupply: number | null
  allTimeHigh: number | null
}

/** Pulls the US dollar value out of an API field like { usd: 123, eur: 110 }. */
function usdOf(value: unknown): number | null {
  return isObject(value) ? numberOrNull(value.usd) : null
}

/** Turns the reply for one coin into a CoinDetail, or null if the basics are missing. */
export function toCoinDetail(raw: unknown): CoinDetail | null {
  if (!isObject(raw) || !isObject(raw.market_data)) return null
  const { id, symbol, name, image } = raw
  const market = raw.market_data
  const price = usdOf(market.current_price)
  if (typeof id !== 'string' || typeof symbol !== 'string' || typeof name !== 'string' || price === null) return null
  return {
    id,
    symbol: symbol.toUpperCase(),
    name,
    image: isObject(image) && typeof image.small === 'string' ? image.small : '',
    price,
    change24h: numberOrNull(market.price_change_percentage_24h),
    marketCap: usdOf(market.market_cap),
    volume24h: usdOf(market.total_volume),
    high24h: usdOf(market.high_24h),
    low24h: usdOf(market.low_24h),
    circulatingSupply: numberOrNull(market.circulating_supply),
    allTimeHigh: usdOf(market.ath),
  }
}
