import { Link } from 'react-router-dom'
import type { Coin } from '../lib/coins'
import { formatPrice } from '../lib/format'
import { CoinIcon } from './CoinIcon'
import { PriceChange } from './PriceChange'

export function CoinRow({ coin }: { coin: Coin }) {
  return (
    <Link
      to={`/coin/${coin.id}`}
      className="flex min-h-16 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface"
    >
      <CoinIcon name={coin.name} image={coin.image} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{coin.name}</span>
        <span className="text-sm text-muted">{coin.symbol}</span>
      </span>
      <span className="text-right">
        <span className="num block text-base font-semibold">{formatPrice(coin.price)}</span>
        <PriceChange value={coin.change24h} />
      </span>
    </Link>
  )
}
