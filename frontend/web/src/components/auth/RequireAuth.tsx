import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Logo } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

/** Chặn route cần đăng nhập. Chưa có token → về /login và nhớ trang đang vào. */
export function RequireAuth() {
  const { isAuthenticated, isVerifying } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }
  if (isVerifying) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
        <Logo variant="mark" className="h-14 animate-pulse" />
        <p className="text-sm text-neutral-500">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    )
  }
  return <Outlet />
}
