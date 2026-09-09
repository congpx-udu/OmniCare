import { Link, NavLink } from 'react-router-dom'
import { Logo } from '@/components/common'
import { APP_NAV, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'
import { NavIcon } from './NavIcon'

interface SidebarProps {
  onNavigate?: () => void
  onLogout: () => void
}

/** Nội dung sidebar trái: logo, điều hướng, thông tin user + đăng xuất */
export function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const { user } = useAuth()
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-neutral-200 px-5">
        <Link to={ROUTES.DASHBOARD} onClick={onNavigate}>
          <Logo variant="full" className="h-8" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {APP_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'font-heading flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'hover:bg-primary-50 hover:text-primary text-neutral-600',
              )
            }
          >
            <NavIcon name={item.icon} className="size-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="bg-secondary-100 text-secondary-700 font-heading flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            {user?.fullName.trim().charAt(0).toUpperCase() ?? '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-primary truncate text-sm font-semibold">
              {user?.fullName ?? '—'}
            </p>
            <p className="truncate text-xs text-neutral-500">{user?.phone}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="hover:text-danger rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100"
          >
            <NavIcon name="logout" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
