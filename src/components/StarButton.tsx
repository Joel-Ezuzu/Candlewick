import { Star } from 'lucide-react'

interface StarButtonProps {
  active: boolean
  onToggle: () => void
}

/** Adds a coin to the watchlist, or takes it off. */
export function StarButton({ active, onToggle }: StarButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? 'Remove from watchlist' : 'Add to watchlist'}
      className={`grid size-11 shrink-0 place-items-center rounded-xl border bg-surface transition-colors ${
        active ? 'border-gold text-gold' : 'border-line text-fg hover:border-gold'
      }`}
    >
      <Star className={`size-5 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
    </button>
  )
}
