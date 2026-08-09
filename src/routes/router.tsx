import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, RedirectIfAuthenticated } from './ProtectedRoute'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ErrorPage } from '@/pages/ErrorPage'

/** Wraps a named export as a React.lazy-compatible default export, so route-level code
 *  splitting doesn't force every page to switch to `export default`. Keeps heavy per-page
 *  dependencies (Recharts on the dashboard, dnd-kit on the project detail page) out of the
 *  initial bundle that auth/shell code needs. */
function lazyPage<M extends Record<string, ComponentType>>(factory: () => Promise<M>, key: keyof M) {
  return lazy(() => factory().then((m) => ({ default: m[key] })))
}

const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'), 'RegisterPage')
const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage')
const ProjectsPage = lazyPage(() => import('@/pages/ProjectsPage'), 'ProjectsPage')
const ProjectDetailPage = lazyPage(() => import('@/pages/ProjectDetailPage'), 'ProjectDetailPage')
const TasksPage = lazyPage(() => import('@/pages/TasksPage'), 'TasksPage')
const TeamPage = lazyPage(() => import('@/pages/TeamPage'), 'TeamPage')
const ActivityPage = lazyPage(() => import('@/pages/ActivityPage'), 'ActivityPage')

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-brand-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    // Root layout route with no path — every top-level route below is its child, so any error
    // thrown during render/loading anywhere in the tree (including a lazy-chunk load failure
    // vite:preloadError didn't catch) bubbles up to this one errorElement instead of React
    // Router's default "Unexpected Application Error!" screen.
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      {
        element: <RedirectIfAuthenticated />,
        children: [
          {
            path: '/login',
            element: (
              <Suspense fallback={<PageFallback />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: '/register',
            element: (
              <Suspense fallback={<PageFallback />}>
                <RegisterPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: '/app',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'projects', element: <ProjectsPage /> },
              { path: 'projects/:projectId', element: <ProjectDetailPage /> },
              { path: 'tasks', element: <TasksPage /> },
              { path: 'team', element: <TeamPage /> },
              { path: 'activity', element: <ActivityPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
