import { Button } from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="pt-16">
      <p className="num font-display text-8xl font-extrabold tracking-tighter text-gold">404</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">This page doesn't exist</h1>
      <p className="mt-2 max-w-xs text-muted">The link may be old, or the address was typed wrong.</p>
      <Button to="/" full className="mt-8">
        Go to the market
      </Button>
    </div>
  )
}
