import { CircleAlert } from 'lucide-react'
import { Button } from './ui/Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry: () => void
  retrying: boolean
}

export function ErrorState({ title = 'Could not load prices', message, onRetry, retrying }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-8 py-16 text-center">
      <span className="grid size-[72px] place-items-center rounded-full border border-line bg-surface text-down">
        <CircleAlert className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted">{message}</p>
      <Button full className="mt-6" onClick={onRetry} disabled={retrying}>
        {retrying ? 'Trying again...' : 'Try again'}
      </Button>
    </div>
  )
}
