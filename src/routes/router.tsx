import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, RedirectIfAuthenticated } from './ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { TasksPage } from '@/pages/TasksPage'
import { TeamPage } from '@/pages/TeamPage'
import { ActivityPage } from '@/pages/ActivityPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  { index: true, element: <Navigate to="/app/dashboard" replace /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
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
])
