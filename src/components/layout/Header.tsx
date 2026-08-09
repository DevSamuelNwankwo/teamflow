import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  title: string
  onOpenMobileNav: () => void
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-default bg-surface px-4 md:px-6">
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-control text-text-secondary hover:bg-surface-sunken md:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="flex-1 truncate text-base font-semibold text-text-primary">{title}</h1>

      <ThemeToggle />
      <UserMenu />
    </header>
  )
}
