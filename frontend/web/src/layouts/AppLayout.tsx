import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/common'
import { NavIcon, Sidebar } from '@/components/layout'
import { APP_NAV, MEDICAL_DISCLAIMER, ROUTES, STORAGE_KEYS } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === '1'
  } catch {
    return false
  }
}

/** Khu vực ứng dụng sau đăng nhập: sidebar trái (thu gọn được thành thanh icon), drawer trên mobile */
export function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, next ? '1' : '0')
      } catch {
        /* bỏ qua: chỉ là tùy chọn giao diện */
      }
      return next
    })
  }

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const currentTitle =
    APP_NAV.find((item) => location.pathname.startsWith(item.to))?.label ?? 'OmniCare'

  return (
    <div className="bg-background flex min-h-dvh">
      <aside
        className={cn(
          'bg-surface fixed inset-y-0 left-0 z-20 hidden border-r border-neutral-200 transition-[width] duration-200 lg:block',
          collapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <Sidebar onLogout={handleLogout} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

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

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[padding] duration-200',
          collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
        )}
      >
        <header className="bg-surface/95 sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-neutral-200 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setDrawerOpen(true)}
            className="text-primary flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-neutral-100"
          >
            <NavIcon name="menu" className="size-6" />
          </button>
          <Link to={ROUTES.DASHBOARD} aria-label="Về Tổng quan">
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
