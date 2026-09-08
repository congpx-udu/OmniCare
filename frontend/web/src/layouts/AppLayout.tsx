import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/common'
import { NavIcon, Sidebar } from '@/components/layout'
import { APP_NAV, MEDICAL_DISCLAIMER, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

/** Khu vực ứng dụng sau đăng nhập: sidebar trái cố định (desktop), drawer (mobile) */
export function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const currentTitle =
    APP_NAV.find((item) => location.pathname.startsWith(item.to))?.label ?? 'OmniCare'

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="bg-surface fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-neutral-200 lg:block">
        <Sidebar onLogout={handleLogout} />
      </aside>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setDrawerOpen(false)}
            className="bg-primary-900/50 absolute inset-0"
          />
          <aside className="bg-surface absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar mobile */}
        <header className="bg-surface/95 sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-neutral-200 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setDrawerOpen(true)}
            className="text-primary rounded-md p-1.5 hover:bg-neutral-100"
          >
            <NavIcon name="menu" className="size-6" />
          </button>
          <Link to={ROUTES.DASHBOARD}>
            <Logo variant="mark" className="h-7" />
          </Link>
          <span className="font-heading text-primary truncate text-sm font-semibold">
            {currentTitle}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="px-4 py-3 text-center text-xs text-neutral-500">
          {MEDICAL_DISCLAIMER}
        </footer>
      </div>
    </div>
  )
}
