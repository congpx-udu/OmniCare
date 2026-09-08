import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Button, Logo } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { LANDING_NAV, MEDICAL_DISCLAIMER, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

/** Layout công khai (landing): header menu ngang + footer */
export function LandingLayout() {
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const authActions = isAuthenticated ? (
    <Link to={ROUTES.DASHBOARD}>
      <Button size="sm">Vào ứng dụng</Button>
    </Link>
  ) : (
    <>
      <Link to={ROUTES.LOGIN}>
        <Button variant="ghost" size="sm">
          Đăng nhập
        </Button>
      </Link>
      <Link to={ROUTES.REGISTER}>
        <Button size="sm">Đăng ký miễn phí</Button>
      </Link>
    </>
  )

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-surface/90 sticky top-0 z-20 border-b border-neutral-200 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link to={ROUTES.HOME} className="shrink-0">
            <Logo variant="full" className="h-9" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-heading hover:text-primary rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">{authActions}</div>

          <button
            type="button"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="text-primary rounded-md p-1.5 hover:bg-neutral-100 md:hidden"
          >
            <NavIcon name={menuOpen ? 'close' : 'menu'} className="size-6" />
          </button>
        </div>

        {menuOpen && (
          <div className="bg-surface border-t border-neutral-200 px-4 py-3 md:hidden">
            <nav className="flex flex-col">
              {LANDING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-heading text-primary rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-neutral-100"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex gap-2 border-t border-neutral-200 pt-3">{authActions}</div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-neutral-500 sm:px-6">
          <Logo variant="mark" className="h-8 opacity-80" />
          <p>{MEDICAL_DISCLAIMER}</p>
          <p>© {new Date().getFullYear()} OmniCare — Trợ lý Sức khỏe Toàn diện AI</p>
        </div>
      </footer>
    </div>
  )
}
