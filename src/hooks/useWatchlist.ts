import { useCallback, useSyncExternalStore } from 'react'
import { parseIds, toggleId } from '../lib/watchlist'

const KEY = 'candlewick-watchlist'
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    return parseIds(localStorage.getItem(KEY))
  } catch {
    return []
  }
}

// One shared copy, so every screen sees the same list at the same moment.
let current: string[] = typeof window === 'undefined' ? [] : read()

function save(ids: string[]) {
  current = ids
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // The list still works until the page closes.
  }
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  // Another tab changed the list.
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) {
      current = read()
      listeners.forEach((listener) => listener())
    }
  })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => current

/** The coins a person is watching, saved in this browser. */
export function useWatchlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => [])
  const has = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback((id: string) => save(toggleId(current, id)), [])
  const keepOnly = useCallback((keep: string[]) => save(current.filter((id) => keep.includes(id))), [])
  return { ids, has, toggle, keepOnly }
}
