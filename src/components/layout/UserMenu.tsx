import { useEffect, useRef, useState } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Avatar'
import { notify } from '@/lib/toast'
import { getReadableError } from '@/api/errors'

export function UserMenu() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.name ?? user?.email ?? 'Account'

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function handleLogout() {
    setOpen(false)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      notify.error(getReadableError(error))
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-control p-1 hover:bg-surface-sunken"
      >
        <Avatar name={displayName} src={profile?.avatar_url} size="sm" />
        <span className="hidden text-sm font-medium text-text-primary sm:inline">{displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-48 rounded-control border border-border-default bg-surface py-1 shadow-popover"
        >
          <div className="border-b border-border-subtle px-3 py-2">
            <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
            <p className="truncate text-xs text-text-tertiary">{user?.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/app/team')
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
          >
            <UserIcon size={16} /> View team
          </button>
          <button
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-status-red-text hover:bg-status-red-bg"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
