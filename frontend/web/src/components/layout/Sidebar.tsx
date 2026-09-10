import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo, Tooltip } from '@/components/common'
import { APP_NAV, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'
import { NavIcon } from './NavIcon'

interface SidebarProps {
  onNavigate?: () => void
  onLogout: () => void
  /** Thu gọn thành thanh icon (desktop); tên mục hiện qua tooltip */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

/** Khi thu gọn mới cần tooltip tên mục; mở rộng thì nhãn đã hiện */
function NavItemWrap({
  label,
  collapsed,
  children,
}: {
  label: string
  collapsed: boolean
  children: ReactNode
}) {
  return collapsed ? (
    <Tooltip label={label} side="right" className="w-full">
      {children}
    </Tooltip>
  ) : (
    <div className="w-full">{children}</div>
  )
}

/** Sidebar trái: logo, điều hướng icon-first, user + đăng xuất. Thu gọn → chỉ icon, hover hiện tên. */
export function Sidebar({
  onNavigate,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const { user } = useAuth()
  const initial = user?.fullName.trim().charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 items-center border-b border-neutral-200',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <Link to={ROUTES.DASHBOARD} onClick={onNavigate} aria-label="Về Tổng quan">
          <Logo variant={collapsed ? 'mark' : 'full'} className={collapsed ? 'h-8' : 'h-8'} />
        </Link>
        {onToggleCollapse && !collapsed && (
          <Tooltip label="Thu gọn menu" side="right">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Thu gọn menu"
              className="hover:bg-primary-50 hover:text-primary hidden size-9 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition lg:flex"
            >
              <NavIcon name="chevron-left" className="size-5" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Thu gọn: tooltip cần tràn ra ngoài nên không cuộn; mở rộng: cuộn dọc, không cuộn ngang */}
      <nav
        className={cn(
          'flex-1 space-y-1 py-4',
          collapsed ? 'overflow-visible px-2' : 'overflow-x-hidden overflow-y-auto px-3',
        )}
      >
        {APP_NAV.map((item) => (
          <NavItemWrap key={item.to} label={item.label} collapsed={collapsed}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              aria-label={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'font-heading flex w-full items-center gap-3 rounded-xl text-sm font-semibold transition duration-150',
                  collapsed ? 'h-11 justify-center' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'hover:bg-primary-50 hover:text-primary text-neutral-600',
                )
              }
            >
              <NavIcon name={item.icon} className="size-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          </NavItemWrap>
        ))}
      </nav>

      <div className={cn('border-t border-neutral-200', collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {onToggleCollapse && (
              <Tooltip label="Mở rộng menu" side="right">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Mở rộng menu"
                  className="hover:bg-primary-50 hover:text-primary flex size-9 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition"
                >
                  <NavIcon name="chevron-right" className="size-5" />
                </button>
              </Tooltip>
            )}
            <Tooltip label={user?.fullName ?? 'Tài khoản'} side="right">
              <Link
                to={ROUTES.PROFILE}
                onClick={onNavigate}
                aria-label="Hồ sơ cá nhân"
                className="bg-secondary-100 text-secondary-700 font-heading flex size-9 items-center justify-center rounded-full text-sm font-bold"
              >
                {initial}
              </Link>
            </Tooltip>
            <Tooltip label="Đăng xuất" side="right">
              <button
                type="button"
                onClick={onLogout}
                aria-label="Đăng xuất"
                className="hover:text-danger hover:bg-danger/10 flex size-9 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition"
              >
                <NavIcon name="logout" className="size-5" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Link
              to={ROUTES.PROFILE}
              onClick={onNavigate}
              aria-label="Hồ sơ cá nhân"
              className="bg-secondary-100 text-secondary-700 font-heading flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            >
              {initial}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-primary truncate text-sm font-semibold">
                {user?.fullName ?? '—'}
              </p>
              <p className="truncate text-xs text-neutral-500">{user?.phone}</p>
            </div>
            <Tooltip label="Đăng xuất" side="top">
              <button
                type="button"
                onClick={onLogout}
                aria-label="Đăng xuất"
                className="hover:text-danger hover:bg-danger/10 flex size-9 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition"
              >
                <NavIcon name="logout" className="size-5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
