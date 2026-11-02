import { useEffect } from 'react'

/** Keeps the browser tab title in step with the screen, like "Watchlist · Candlewick". */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · Candlewick` : 'Candlewick'
  }, [title])
}
