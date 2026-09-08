import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button, Logo } from '@/components/common'
import { MEDICAL_DISCLAIMER, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'

const NAV_ITEMS = [
  { to: ROUTES.HOME, label: 'Trang chủ', end: true },
  { to: ROUTES.CHAT, label: 'Chat sức khỏe' },
  { to: ROUTES.OCR, label: 'Hồ sơ OCR' },
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.PROFILE, label: 'Hồ sơ' },
]

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-surface/95 sticky top-0 z-10 border-b border-neutral-200 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={ROUTES.HOME} className="shrink-0">
            <Logo variant="full" className="h-9" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'font-heading rounded-lg px-3 py-2 text-sm font-semibold transition',
                    isActive ? 'bg-primary-50 text-primary' : 'hover:text-primary text-neutral-600',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="font-heading text-primary text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-neutral-500">{user.phone}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-neutral-200 px-4 py-3 text-center text-xs text-neutral-500 sm:px-6">
        {MEDICAL_DISCLAIMER}
      </footer>
    </div>
  )
}
