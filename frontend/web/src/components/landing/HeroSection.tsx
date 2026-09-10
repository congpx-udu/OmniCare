import { Link } from 'react-router-dom'
import { NavIcon } from '@/components/layout'
import { HERO_HIGHLIGHTS, HERO_STATS, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { AppPreview } from './AppPreview'
import { Reveal } from './Reveal'

/** Màn mở đầu: tiêu đề + CTA bên trái, ảnh minh họa sản phẩm bên phải */
export function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section id="hero" className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Nền: hai quầng màu vẽ bằng gradient (rẻ, không dùng blur/mask) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_30rem_at_5%_-15%,rgba(0,122,120,0.16),transparent_60%),radial-gradient(46rem_32rem_at_100%_-10%,rgba(2,132,199,0.14),transparent_60%)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <Reveal>
            <span className="border-secondary/30 bg-secondary-50 text-secondary-700 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
              <NavIcon name="sparkles" className="size-3.5" />
              Trợ lý sức khỏe toàn diện bằng AI
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-primary mt-5 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Chăm sóc sức khỏe
              <br />
              <span className="from-secondary to-tertiary bg-linear-to-r bg-clip-text text-transparent">
                chủ động
              </span>
              , mỗi ngày.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Kể điều bạn đang gặp, gửi ảnh đơn thuốc hay bữa ăn. OmniCare đánh giá sơ bộ, gợi ý
              thực đơn và vận động theo thời tiết, thể trạng của riêng bạn.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
                className="font-heading bg-primary hover:bg-primary-600 inline-flex h-13 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-[0_16px_32px_-16px_rgba(11,37,69,0.8)] transition active:scale-95"
              >
                {isAuthenticated ? 'Vào ứng dụng' : 'Bắt đầu miễn phí'}
                <NavIcon name="arrow-right" className="size-4" />
              </Link>
              <a
                href="#features"
                className="font-heading bg-surface text-primary hover:border-secondary hover:text-secondary inline-flex h-13 items-center gap-2 rounded-xl border border-neutral-300 px-6 text-sm font-semibold transition"
              >
                Xem tính năng
                <NavIcon name="chevron-down" className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {HERO_HIGHLIGHTS.map((h) => (
                <li
                  key={h.label}
                  className="bg-surface/80 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 backdrop-blur"
                >
                  <NavIcon name={h.icon} className="text-secondary size-3.5" />
                  {h.label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-neutral-200 pt-6">
              {HERO_STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-heading text-primary text-2xl font-bold">{s.value}</dt>
                  <dd className="mt-0.5 text-xs leading-snug text-neutral-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:pl-6">
          <AppPreview />
        </Reveal>
      </div>
    </section>
  )
}
