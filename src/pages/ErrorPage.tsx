import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Router-level errorElement — replaces React Router's default "Unexpected Application Error!"
 *  screen with something on-brand, and offers a reload (the right recovery for the most common
 *  cause here: a stale chunk reference from a deploy that landed while the tab was open). */
export function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-sunken px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-red-bg text-status-red-text">
        <AlertTriangle size={22} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    </div>
  )
}
