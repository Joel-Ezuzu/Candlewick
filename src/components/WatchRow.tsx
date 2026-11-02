import { Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Coin } from '../lib/coins'
import { formatPrice, toneOf } from '../lib/format'
import { CoinIcon } from './CoinIcon'
import { PriceChange } from './PriceChange'
import { Sparkline } from './Sparkline'

interface WatchRowProps {
  coin: Coin
  editing: boolean
  onRemove: () => void
}

export function WatchRow({ coin, editing, onRemove }: WatchRowProps) {
  const content = (
    <>
      <CoinIcon name={coin.name} image={coin.image} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{coin.name}</span>
        <span className="text-sm text-muted">{coin.symbol}</span>
      </span>
      {!editing && <Sparkline values={coin.sparkline} tone={toneOf(coin.change24h ?? 0)} />}
      <span className="w-24 text-right">
        <span className="num block text-base font-semibold">{formatPrice(coin.price)}</span>
        <PriceChange value={coin.change24h} />
      </span>
    </>
  )

  if (!editing) {
    return (
      <Link to={`/coin/${coin.id}`} className="flex min-h-16 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface">
        {content}
      </Link>
    )
  }
  return (
    <div className="flex min-h-16 items-center gap-3 px-5 py-2.5">
      {content}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${coin.name} from watchlist`}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-down text-on-gold"
      >
        <Minus className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
