import { Link, Outlet } from 'react-router-dom'
import { Logo } from '@/components/common'
import { LandingNavbar } from '@/components/landing'
import { NavIcon } from '@/components/layout'
import { FOOTER_LINKS, MEDICAL_DISCLAIMER } from '@/constants'

/** Layout công khai: navbar nổi + nội dung + footer */
export function LandingLayout() {
  return (
    <div className="bg-surface flex min-h-dvh flex-col">
      <LandingNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <Logo variant="full" className="h-9" />
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Trợ lý sức khỏe toàn diện bằng AI: đánh giá triệu chứng sơ bộ, số hóa đơn thuốc và
                gợi ý theo thời tiết, thể trạng của bạn.
              </p>
            </div>

            <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-x-8 gap-y-3">
              {FOOTER_LINKS.map((l) =>
                l.route ? (
                  <Link
                    key={l.label}
                    to={l.href}
                    className="hover:text-secondary text-sm font-medium text-neutral-600 transition"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    className="hover:text-secondary text-sm font-medium text-neutral-600 transition"
                  >
                    {l.label}
                  </a>
                ),
              )}
            </nav>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-1.5">
              <NavIcon name="info" className="mt-px size-3.5 shrink-0" />
              {MEDICAL_DISCLAIMER}
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} OmniCare</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
