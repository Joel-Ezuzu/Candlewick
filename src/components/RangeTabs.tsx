import { ranges } from '../lib/chart'
import type { RangeId } from '../lib/chart'

interface RangeTabsProps {
  value: RangeId
  onChange: (id: RangeId) => void
}

export function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Chart range">
      {ranges.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`h-11 flex-1 rounded-xl border text-sm font-semibold transition-colors ${
            value === id ? 'border-gold bg-gold text-on-gold' : 'border-line bg-surface text-fg hover:border-gold'
          }`}
        >
          {id}
          <span className="sr-only"> ({label})</span>
        </button>
      ))}
    </div>
  )
}
