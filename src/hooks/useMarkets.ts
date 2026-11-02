import { useQuery } from '@tanstack/react-query'
import { ApiError, fetchMarkets } from '../api/coingecko'

/** Live prices. Refreshes every minute and keeps the last prices if a refresh fails. */
export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: ({ signal }) => fetchMarkets(signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
    // Asking again straight after "too many requests" only makes it worse.
    retry: (failures, error) => !(error instanceof ApiError && error.kind === 'rate-limit') && failures < 1,
  })
}
