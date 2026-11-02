import { ArrowDown, ArrowUp } from 'lucide-react'
import { startDir } from '../lib/coins'
import type { Sort, SortKey } from '../lib/coins'

const options: { key: SortKey; label: string }[] = [
  { key: 'rank', label: 'Market cap' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: '24h change' },
  { key: 'name', label: 'Name' },
]

interface SortChipsProps {
  sort: Sort
  onChange: (sort: Sort) => void
}

export function SortChips({ sort, onChange }: SortChipsProps) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 py-3.5" role="group" aria-label="Sort coins by">
      {options.map(({ key, label }) => {
        const active = sort.key === key
        const Arrow = sort.dir === 'asc' ? ArrowUp : ArrowDown
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: startDir[key] })}
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
              active ? 'border-gold bg-gold text-on-gold' : 'border-line bg-surface text-fg hover:border-gold'
            }`}
          >
            {label}
            {active && <Arrow className="size-4" aria-hidden="true" />}
            {active && <span className="sr-only">{sort.dir === 'asc' ? 'ascending' : 'descending'}</span>}
          </button>
        )
      })}
    </div>
  )
}
