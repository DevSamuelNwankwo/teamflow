import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navItems'

/** Persistent left navigation, visible from the tablet breakpoint up.
 *  Below that, MobileNav renders the same links in a slide-in drawer. */
export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border-default md:bg-surface lg:w-64">
      <div className="flex h-14 items-center gap-2 border-b border-border-default px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-600 text-sm font-bold text-white">
          T
        </div>
        <span className="text-base font-semibold text-text-primary">TeamFlow</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300'
                  : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
