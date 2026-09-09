import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/common'
import { LANDING_MENU, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils'

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]'

/** Navbar cố định trên landing: logo, nút Menu (desktop), hamburger + panel trượt (mobile) */
export function LandingNavbar() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)
  const menuItems = LANDING_MENU.filter((m) => !('route' in m && m.route) || !isAuthenticated)

  return (
    <>
      <header className="bg-surface/80 fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-2 backdrop-blur-md md:px-6 md:py-3">
        <Link to={ROUTES.HOME} onClick={close} className="flex flex-col">
          <Logo variant="full" className="h-8 md:h-9" />
          <span className="text-primary mt-1 text-[8px] leading-none font-medium tracking-wide uppercase md:text-[9px]">
            Trợ lý sức khỏe toàn diện AI
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-5 md:flex">
          <span className="text-primary text-sm font-semibold">
            Không thay thế chẩn đoán y khoa
          </span>
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="bg-primary hover:bg-primary-600 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors duration-200"
            >
              Vào ứng dụng
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="bg-surface border-primary text-primary hover:bg-primary rounded-full border px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:text-white"
            >
              Menu
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative flex size-10 items-center justify-center md:hidden"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'bg-primary absolute h-0.5 w-6 rounded-full transition-all duration-300',
                EASE,
                i === 0 && (open ? 'translate-y-0 rotate-45' : '-translate-y-2'),
                i === 1 && (open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'),
                i === 2 && (open ? 'translate-y-0 -rotate-45' : 'translate-y-2'),
              )}
            />
          ))}
        </button>
      </header>

      {/* Overlay + panel (cả mobile lẫn desktop khi bấm Menu) */}
      <div
        className={cn('fixed inset-0 z-40', open ? 'pointer-events-auto' : 'pointer-events-none')}
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={close}
          className={cn(
            'bg-primary-900/20 absolute inset-0 backdrop-blur-sm transition-opacity duration-500',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'bg-surface absolute top-0 right-0 h-full w-[85%] max-w-sm shadow-2xl transition-transform duration-500',
            EASE,
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <nav className="flex h-full flex-col justify-center gap-1 px-8">
            {menuItems.map((item, i) => {
              const cls = cn(
                'font-heading text-primary hover:text-secondary text-4xl font-bold transition-all duration-500',
                EASE,
                open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
              )
              const style = { transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }
              return 'route' in item && item.route ? (
                <Link key={item.label} to={item.href} onClick={close} className={cls} style={style}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} onClick={close} className={cls} style={style}>
                  {item.label}
                </a>
              )
            })}
            <div
              className={cn(
                'mt-8 border-t border-neutral-200 pt-8 transition-all duration-500',
                EASE,
                open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
              )}
              style={{ transitionDelay: open ? '450ms' : '0ms' }}
            >
              <p className="text-primary mb-4 text-sm font-semibold">
                OmniCare không thay thế chẩn đoán y khoa.
              </p>
              <Link
                to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
                onClick={close}
                className="bg-primary hover:bg-primary-600 block w-full rounded-full px-6 py-4 text-center text-sm font-semibold text-white transition-colors duration-200"
              >
                {isAuthenticated ? 'Vào ứng dụng' : 'Đăng ký miễn phí'}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
