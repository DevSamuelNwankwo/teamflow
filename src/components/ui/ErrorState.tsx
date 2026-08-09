import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

/** Consistent failed-query state, used by every list/board/feed page. */
export function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-status-red-bg bg-status-red-bg/40 px-6 py-12 text-center">
      <AlertTriangle className="text-status-red-text" size={22} />
      <p className="text-sm text-status-red-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
