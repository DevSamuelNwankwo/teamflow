import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/** Guards /app/* routes. Shows a spinner while the session is resolving so unauthenticated
 *  users never see a flash of the login page (or vice versa). */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-brand-600"
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Keeps already-logged-in users off /login and /register. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth()

  if (status === 'loading') return null
  if (status === 'authenticated') return <Navigate to="/app/dashboard" replace />

  return <Outlet />
}
