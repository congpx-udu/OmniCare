import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { LANDING_MENU, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'

/** Navbar landing: trong suốt khi ở đỉnh, nền kính mờ khi cuộn; mobile mở panel dọc */
export function LandingNavbar() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface/95 border-b border-neutral-200/70 shadow-[0_4px_16px_-8px_rgba(11,37,69,0.25)]'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-18 lg:px-8">
        <Link to={ROUTES.HOME} onClick={close} aria-label="OmniCare — trang chủ">
          <Logo variant="full" className="h-8 lg:h-9" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {LANDING_MENU.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-primary hover:bg-primary-50 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="font-heading bg-primary hover:bg-primary-600 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            >
              Vào ứng dụng
              <NavIcon name="arrow-right" className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="font-heading text-primary hover:bg-primary-50 inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold transition"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="font-heading bg-primary hover:bg-primary-600 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
              >
                Dùng thử miễn phí
                <NavIcon name="arrow-right" className="size-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-primary ml-auto flex size-11 cursor-pointer items-center justify-center rounded-xl transition hover:bg-neutral-100 lg:hidden"
        >
          <NavIcon name={open ? 'close' : 'menu'} className="size-6" />
        </button>
      </div>

      {/* Panel mobile */}
      <div
        className={cn(
          'bg-surface overflow-hidden border-b border-neutral-200 transition-[max-height,opacity] duration-300 lg:hidden',
          open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pt-2 pb-5 sm:px-6">
          {LANDING_MENU.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className="hover:bg-primary-50 hover:text-primary font-heading rounded-xl px-3 py-3 text-base font-semibold text-neutral-700 transition"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 grid gap-2 border-t border-neutral-200 pt-4">
            {isAuthenticated ? (
              <Link
                to={ROUTES.DASHBOARD}
                onClick={close}
                className="font-heading bg-primary inline-flex h-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
              >
                Vào ứng dụng
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={close}
                  className="font-heading bg-primary inline-flex h-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
                >
                  Dùng thử miễn phí
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={close}
                  className="font-heading text-primary inline-flex h-12 items-center justify-center rounded-xl border border-neutral-300 text-sm font-semibold"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
