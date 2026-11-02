import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ApiError, fetchCoinsByIds } from '../api/coingecko'

/** Prices and trend lines for the coins in the watchlist. */
export function useWatchlistCoins(ids: string[]) {
  return useQuery({
    queryKey: ['watchlist', [...ids].sort().join(',')],
    queryFn: ({ signal }) => fetchCoinsByIds(ids, signal),
    enabled: ids.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
    retry: (failures, error) => !(error instanceof ApiError && error.kind === 'rate-limit') && failures < 1,
  })
}
