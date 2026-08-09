import { Activity, FolderKanban, LayoutDashboard, ListChecks, Users } from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number | string; className?: string }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/app/team', label: 'Team', icon: Users },
  { to: '/app/activity', label: 'Activity', icon: Activity },
]
