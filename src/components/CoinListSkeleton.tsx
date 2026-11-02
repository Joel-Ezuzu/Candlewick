/** Grey placeholder rows shown while the first prices load. */
export function CoinListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading prices">
      <ul className="animate-pulse" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex min-h-16 items-center gap-3 border-t border-line px-5 py-2.5">
            <span className="size-10 rounded-full bg-surface-2" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-28 rounded bg-surface-2" />
              <span className="block h-3 w-12 rounded bg-surface-2" />
            </span>
            <span className="space-y-2">
              <span className="ml-auto block h-3.5 w-20 rounded bg-surface-2" />
              <span className="ml-auto block h-3 w-12 rounded bg-surface-2" />
            </span>
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading prices...</span>
    </div>
  )
}
