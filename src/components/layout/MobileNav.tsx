import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navItems'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

/** Slide-in navigation drawer for viewports below the tablet breakpoint (< 768px). */
export function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close navigation menu"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <nav
        aria-label="Main navigation"
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-popover"
      >
        <div className="flex h-14 items-center justify-between border-b border-border-default px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-control bg-brand-600 text-sm font-bold text-white">
              T
            </div>
            <span className="text-base font-semibold text-text-primary">TeamFlow</span>
          </div>
          <button
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-control text-text-secondary hover:bg-surface-sunken"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
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
        </div>
      </nav>
    </div>
  )
}
