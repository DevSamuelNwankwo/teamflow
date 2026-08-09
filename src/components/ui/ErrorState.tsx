import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { getReadableError } from '@/api/errors'

interface ErrorStateProps {
  /** Short, page-specific context, e.g. "Couldn't load projects." */
  title?: string
  /** The query/mutation's actual error — rendered via getReadableError() so network failures,
   *  expired sessions, etc. show their real cause instead of one generic string everywhere. */
  error?: unknown
  /** Escape hatch for a fully custom message; takes precedence over title+error. */
  message?: string
  onRetry?: () => void
}

/** Consistent failed-query state, used by every list/board/feed page. */
export function ErrorState({ title = "Couldn't load this data.", error, message, onRetry }: ErrorStateProps) {
  const reason = message ?? (error !== undefined ? getReadableError(error) : undefined)

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-status-red-bg bg-status-red-bg/40 px-6 py-12 text-center">
      <AlertTriangle className="text-status-red-text" size={22} />
      <div>
        <p className="text-sm font-medium text-status-red-text">{title}</p>
        {reason && reason !== title && <p className="mt-1 text-xs text-status-red-text/80">{reason}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
