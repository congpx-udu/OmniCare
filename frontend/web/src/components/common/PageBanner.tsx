import type { ReactNode } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface PageBannerProps {
  icon: NavIconName
  title: string
  /** Dòng nhỏ phía trên tiêu đề (ngày, trạng thái) */
  kicker?: string
  /** Một dòng ngắn dưới tiêu đề */
  subtitle?: string
  /** Nút icon (variant "glass") góc phải trên */
  actions?: ReactNode
  /** Nút / lối tắt dưới tiêu đề (bên trái) */
  cta?: ReactNode
  /** Khối bên phải (ví dụ ô thời tiết) */
  aside?: ReactNode
  /** Nút quay lại đặt trước icon */
  leading?: ReactNode
  tone?: 'teal' | 'sky'
  className?: string
}

/** Banner đầu trang dùng chung: nền gradient navy → teal/sky, tiêu đề trắng, nút icon kính mờ */
export function PageBanner({
  icon,
  title,
  kicker,
  subtitle,
  actions,
  cta,
  aside,
  leading,
  tone = 'teal',
  className,
}: PageBannerProps) {
  return (
    <section
      className={cn(
        'from-primary via-primary-700 relative overflow-hidden rounded-[1.5rem] bg-linear-to-br p-6 text-white shadow-[0_24px_48px_-20px_rgba(11,37,69,0.5)] sm:p-8',
        tone === 'teal' ? 'to-secondary-700' : 'to-tertiary-700',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl',
          tone === 'teal' ? 'bg-secondary-300/20' : 'bg-tertiary-300/20',
        )}
      />
      <span
        aria-hidden
        className="bg-tertiary-300/15 pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {leading}
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <NavIcon name={icon} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            {kicker && <p className="text-sm font-medium text-white/70">{kicker}</p>}
            <h1 className="text-2xl leading-tight font-bold text-white sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 line-clamp-2 text-sm text-white/75">{subtitle}</p>}
            {cta && <div className="mt-4 flex flex-wrap gap-2">{cta}</div>}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2 self-start lg:hidden">{actions}</div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {aside}
          {actions && <div className="hidden items-center gap-2 lg:flex">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
