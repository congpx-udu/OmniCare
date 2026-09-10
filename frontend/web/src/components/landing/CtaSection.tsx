import { Link } from 'react-router-dom'
import { NavIcon } from '@/components/layout'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { Reveal } from './Reveal'

/** Dải kêu gọi hành động cuối trang */
export function CtaSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <Reveal className="mx-auto w-full max-w-7xl">
        <div className="from-primary via-primary-700 to-secondary-700 relative overflow-hidden rounded-[2rem] bg-linear-to-br px-6 py-12 text-center text-white sm:px-12 lg:py-16">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(26rem_18rem_at_92%_0%,rgba(92,201,197,0.3),transparent_65%),radial-gradient(24rem_18rem_at_20%_110%,rgba(95,179,228,0.22),transparent_65%)]"
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <NavIcon name="sparkles" className="size-7" />
            </span>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bắt đầu với vài câu hỏi đơn giản
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Tạo tài khoản bằng số điện thoại, hỏi trợ lý ngay trong lần đầu mở ứng dụng.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
                className="font-heading text-primary inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold shadow-sm transition hover:bg-neutral-100 active:scale-95"
              >
                {isAuthenticated ? 'Vào ứng dụng' : 'Đăng ký miễn phí'}
                <NavIcon name="arrow-right" className="size-4" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to={ROUTES.LOGIN}
                  className="font-heading inline-flex h-13 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                >
                  Tôi đã có tài khoản
                </Link>
              )}
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/60">
              <NavIcon name="info" className="size-3.5" />
              OmniCare không thay thế chẩn đoán y khoa.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
