import { ChartCandlestick } from 'lucide-react'

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-gold text-on-gold">
        <ChartCandlestick className="size-5" />
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">Candlewick</span>
    </span>
  )
}
