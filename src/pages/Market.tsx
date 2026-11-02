import { useState } from 'react'
import { RefreshCw, Search, SearchX } from 'lucide-react'
import { ApiError } from '../api/coingecko'
import { Attribution } from '../components/Attribution'
import { CoinListSkeleton } from '../components/CoinListSkeleton'
import { CoinRow } from '../components/CoinRow'
import { ErrorState } from '../components/ErrorState'
import { Logo } from '../components/Logo'
import { SortChips } from '../components/SortChips'
import { usePageTitle } from '../hooks/usePageTitle'
import { useMarkets } from '../hooks/useMarkets'
import { useNow } from '../hooks/useNow'
import { filterAndSort } from '../lib/coins'
import type { Sort } from '../lib/coins'
import { timeAgo } from '../lib/format'

export default function Market() {
  usePageTitle()
  const { data, error, isPending, isFetching, refetch, dataUpdatedAt } = useMarkets()
  const now = useNow()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>({ key: 'rank', dir: 'asc' })

  const coins = data ? filterAndSort(data, query, sort) : []
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
  const status = isFetching ? 'Updating prices...' : data ? `Updated ${timeAgo(dataUpdatedAt, now).toLowerCase()}` : 'Live crypto prices'

  return (
    <>
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1>
            <Logo />
          </h1>
          <p className="mt-1.5 text-sm text-muted" role="status">
            {status}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh prices"
          className="grid size-11 place-items-center rounded-xl border border-line bg-surface hover:border-gold disabled:opacity-60"
        >
          <RefreshCw className={`size-5 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </header>

      {isPending ? (
        <div className="-mx-5">
          <CoinListSkeleton />
        </div>
      ) : error && !data ? (
        <ErrorState message={message} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <>
          {error && (
            <p role="alert" className="mb-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              We could not refresh just now, so these are the last prices we had.
            </p>
          )}
          <div className="relative">
            <label htmlFor="search" className="sr-only">
              Search coins
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="search"
              type="search"
              autoComplete="off"
              placeholder="Search coins"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-surface pr-4 pl-12 text-base outline-none placeholder:text-muted focus:border-gold"
            />
          </div>
          <SortChips sort={sort} onChange={setSort} />

          {coins.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
              <SearchX className="mx-auto size-8 text-muted" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold">No coins match</p>
              <p className="mt-1 text-muted">Nothing found for "{query.trim()}". Check the spelling or try a symbol like BTC.</p>
            </div>
          ) : (
            <ul className="-mx-5 divide-y divide-line border-y border-line">
              {coins.map((coin) => (
                <li key={coin.id}>
                  <CoinRow coin={coin} />
                </li>
              ))}
            </ul>
          )}
          <Attribution />
        </>
      )}
    </>
  )
}
