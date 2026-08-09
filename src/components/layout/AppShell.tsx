import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Header } from './Header'
import { NAV_ITEMS } from './navItems'

function useCurrentTitle() {
  const { pathname } = useLocation()
  const match = NAV_ITEMS.find((item) => pathname.startsWith(item.to))
  return match?.label ?? 'TeamFlow'
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const title = useCurrentTitle()

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
