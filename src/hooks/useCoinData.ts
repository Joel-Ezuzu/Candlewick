import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ApiError, fetchChart, fetchCoinDetail } from '../api/coingecko'

// Asking again straight after "too many requests" or "not found" only makes things worse.
const retryOnce = (failures: number, error: Error) =>
  !(error instanceof ApiError && (error.kind === 'rate-limit' || error.kind === 'not-found')) && failures < 1

export function useCoinDetail(id: string) {
  return useQuery({
    queryKey: ['coin', id],
    queryFn: ({ signal }) => fetchCoinDetail(id, signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: retryOnce,
  })
}

/** Price history for a number of days. Keeps showing the old range while the new one loads. */
export function useChart(id: string, days: number) {
  return useQuery({
    queryKey: ['chart', id, days],
    queryFn: ({ signal }) => fetchChart(id, days, signal),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    retry: retryOnce,
  })
}
