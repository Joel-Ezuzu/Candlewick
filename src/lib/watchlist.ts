const MAX = 100

/** Reads the saved list. Anything that is not a list of text ids is thrown away. */
export function parseIds(raw: string | null): string[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    const ids = data.filter((item): item is string => typeof item === 'string' && item.length > 0)
    return [...new Set(ids)].slice(0, MAX)
  } catch {
    return []
  }
}

/** Adds a coin to the top of the list, or takes it off if it is already there. */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, MAX)
}
