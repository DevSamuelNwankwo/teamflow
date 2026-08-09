import { Suspense, useState } from 'react'
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

function ContentFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-brand-600"
        role="status"
        aria-label="Loading page"
      />
    </div>
  )
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
        {/* Suspense boundary lives here (not around AppShell itself) so route-level
            React.lazy chunks only swap the content area — sidebar/header stay put
            between page navigations instead of flashing away. */}
        <main className="flex-1 p-4 md:p-6">
          <Suspense fallback={<ContentFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
