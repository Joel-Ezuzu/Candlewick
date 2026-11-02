import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { ApiError } from '../api/coingecko'
import { Attribution } from '../components/Attribution'
import { CoinListSkeleton } from '../components/CoinListSkeleton'
import { ErrorState } from '../components/ErrorState'
import { PriceChange } from '../components/PriceChange'
import { WatchRow } from '../components/WatchRow'
import { Button } from '../components/ui/Button'
import { useWatchlist } from '../hooks/useWatchlist'
import { useWatchlistCoins } from '../hooks/useWatchlistCoins'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Coin } from '../lib/coins'

export default function Watchlist() {
  usePageTitle('Watchlist')
  const { ids, toggle, keepOnly } = useWatchlist()
  const { data, error, isPending, isFetching, isPlaceholderData, refetch } = useWatchlistCoins(ids)
  const [editing, setEditing] = useState(false)

  // Coins the price service does not know (an old or mistyped id) are dropped from the list.
  useEffect(() => {
    if (data && !isPlaceholderData && ids.length > 0) {
      const known = data.map((coin) => coin.id)
      if (ids.some((id) => !known.includes(id))) keepOnly(known)
    }
  }, [data, isPlaceholderData, ids, keepOnly])

  const coins: Coin[] = ids.map((id) => data?.find((coin) => coin.id === id)).filter((coin): coin is Coin => coin !== undefined)
  const best = coins.filter((c) => c.change24h !== null).sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))[0]
  const empty = ids.length === 0

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Watchlist</h1>
          <p className="mt-1 text-sm text-muted">{ids.length === 1 ? '1 coin' : `${ids.length} coins`}</p>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold hover:border-gold"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </header>

      {empty ? (
        <div className="mt-8 flex flex-col items-center px-6 text-center">
          <span className="grid size-[72px] place-items-center rounded-full border border-line bg-surface text-gold">
            <Star className="size-8" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Your watchlist is empty</h2>
          <p className="mt-2 text-muted">Tap the star on a coin to keep an eye on it here.</p>
          <Button to="/" full className="mt-6">
            Browse the market
          </Button>
        </div>
      ) : isPending ? (
        <div className="-mx-5">
          <CoinListSkeleton rows={Math.min(ids.length, 6)} />
        </div>
      ) : error && !data ? (
        <ErrorState
          title="Could not load your watchlist"
          message={error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : (
        <>
          {error && (
            <p role="alert" className="mb-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              We could not refresh just now, so these are the last prices we had.
            </p>
          )}
          {best && !editing && (
            <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm text-muted">Best today</p>
              <p className="mt-0.5 flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
                {best.name}
                <PriceChange value={best.change24h} />
              </p>
            </div>
          )}
          <ul className="-mx-5 divide-y divide-line border-y border-line">
            {coins.map((coin) => (
              <li key={coin.id}>
                <WatchRow coin={coin} editing={editing} onRemove={() => toggle(coin.id)} />
              </li>
            ))}
          </ul>
          <Button to="/" variant="secondary" full className="mt-5">
            Add more coins
          </Button>
          <Attribution />
        </>
      )}
    </>
  )
}
