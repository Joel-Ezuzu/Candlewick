import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/coingecko'
import { Attribution } from '../components/Attribution'
import { CoinIcon } from '../components/CoinIcon'
import { ErrorState } from '../components/ErrorState'
import { PriceChange } from '../components/PriceChange'
import { PriceChart } from '../components/PriceChart'
import { RangeTabs } from '../components/RangeTabs'
import { StarButton } from '../components/StarButton'
import { Button } from '../components/ui/Button'
import { useChart, useCoinDetail } from '../hooks/useCoinData'
import { usePageTitle } from '../hooks/usePageTitle'
import { useWatchlist } from '../hooks/useWatchlist'
import { ranges } from '../lib/chart'
import type { RangeId } from '../lib/chart'
import { formatCompact, formatPrice, formatSupply } from '../lib/format'

/** Long prices, like $0.00001234, get a smaller size so they always fit. */
const priceSize = (text: string): string => (text.length >= 14 ? 'text-3xl' : text.length >= 11 ? 'text-4xl' : 'text-5xl')

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="num mt-1 text-base font-semibold">{value}</dd>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading coin" className="animate-pulse">
      <div className="mt-6 h-10 w-48 rounded bg-surface-2" />
      <div className="mt-3 h-4 w-24 rounded bg-surface-2" />
      <div className="mt-6 h-[180px] rounded-xl bg-surface-2" />
      <div className="mt-4 h-11 rounded-xl bg-surface-2" />
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[74px] rounded-2xl bg-surface-2" />
        ))}
      </div>
      <span className="sr-only">Loading coin...</span>
    </div>
  )
}

export default function Coin() {
  const { id = '' } = useParams()
  const [rangeId, setRangeId] = useState<RangeId>('24H')
  const range = ranges.find((r) => r.id === rangeId) ?? ranges[0]
  const detail = useCoinDetail(id)
  const chart = useChart(id, range.days)
  const coin = detail.data
  const watchlist = useWatchlist()
  usePageTitle(coin?.name ?? id)

  const back = (
    <Link
      to="/"
      aria-label="Back to market"
      className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface hover:border-gold"
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </Link>
  )

  if (detail.isPending) {
    return (
      <>
        <div className="pt-2">{back}</div>
        <PageSkeleton />
      </>
    )
  }

  if (!coin) {
    const notFound = detail.error instanceof ApiError && detail.error.kind === 'not-found'
    return (
      <>
        <div className="pt-2">{back}</div>
        {notFound ? (
          <div role="alert" className="px-4 py-16 text-center">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Coin not found</h1>
            <p className="mt-2 text-muted">We could not find a coin called "{id}". The link may be wrong.</p>
            <Button to="/" full className="mt-6">
              Back to market
            </Button>
          </div>
        ) : (
          <ErrorState
            title="Could not load this coin"
            message={detail.error instanceof ApiError ? detail.error.message : 'Something went wrong. Please try again.'}
            onRetry={() => detail.refetch()}
            retrying={detail.isFetching}
          />
        )}
      </>
    )
  }

  return (
    <>
      <header className="flex items-center gap-3 pt-2">
        {back}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5">
          <CoinIcon name={coin.name} image={coin.image} />
          <div className="min-w-0">
            <h1 className="truncate text-base leading-tight font-semibold">{coin.name}</h1>
            <p className="text-sm text-muted">{coin.symbol}</p>
          </div>
        </div>
        <StarButton active={watchlist.has(coin.id)} onToggle={() => watchlist.toggle(coin.id)} />
      </header>

      <section className="mt-6" aria-label="Price">
        <p className={`num font-display font-extrabold tracking-tight ${priceSize(formatPrice(coin.price))}`}>{formatPrice(coin.price)}</p>
        <p className="mt-1.5 flex items-center gap-2 text-sm">
          <PriceChange value={coin.change24h} />
          <span className="text-muted">today</span>
        </p>
      </section>

      <section className="mt-6" aria-label="Chart">
        {chart.isPending ? (
          <div role="status" aria-label="Loading chart" className="h-[180px] animate-pulse rounded-xl bg-surface-2" />
        ) : chart.data ? (
          <PriceChart points={chart.data} range={range} name={coin.name} busy={chart.isPlaceholderData} />
        ) : (
          <div role="alert" className="grid h-[180px] place-items-center rounded-xl border border-line bg-surface px-6 text-center">
            <div>
              <p className="text-muted">
                {chart.error instanceof ApiError ? chart.error.message : 'The chart could not load.'}
              </p>
              <Button variant="secondary" className="mt-3 min-h-11" onClick={() => chart.refetch()} disabled={chart.isFetching}>
                {chart.isFetching ? 'Trying again...' : 'Try again'}
              </Button>
            </div>
          </div>
        )}
        <div className="mt-4">
          <RangeTabs value={rangeId} onChange={setRangeId} />
        </div>
      </section>

      <section className="mt-6" aria-label="Stats">
        <dl className="grid grid-cols-2 gap-2.5">
          <Stat label="Market cap" value={coin.marketCap === null ? 'No data' : formatCompact(coin.marketCap)} />
          <Stat label="24h volume" value={coin.volume24h === null ? 'No data' : formatCompact(coin.volume24h)} />
          <Stat label="24h high" value={coin.high24h === null ? 'No data' : formatPrice(coin.high24h)} />
          <Stat label="24h low" value={coin.low24h === null ? 'No data' : formatPrice(coin.low24h)} />
          <Stat label="Supply" value={coin.circulatingSupply === null ? 'No data' : formatSupply(coin.circulatingSupply, coin.symbol)} />
          <Stat label="All-time high" value={coin.allTimeHigh === null ? 'No data' : formatPrice(coin.allTimeHigh)} />
        </dl>
      </section>

      <Attribution />
    </>
  )
}
