import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface StatCardProps {
  label: string
  icon: NavIconName
  value: string
  unit?: string
  /** Dòng phụ nhỏ dưới giá trị (ví dụ "AQI 4/5", "Bình thường") */
  sub?: string
  tone?: string
  to: string
}

/** Thẻ chỉ số nhanh: icon lớn trong ô teal, nhãn ngắn, số to. Cả thẻ là link sang trang chi tiết. */
export function StatCard({ label, icon, value, unit, sub, tone, to }: StatCardProps) {
  return (
    <Link
      to={to}
      className="card-3d rounded-card bg-surface-cream hover:border-primary-200 flex w-full items-center gap-4 border border-neutral-200/80 p-4 sm:p-5"
    >
      <span className="bg-secondary-50 text-secondary flex size-12 shrink-0 items-center justify-center rounded-2xl">
        <NavIcon name={icon} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </span>
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span
            className={cn(
              'font-heading text-primary text-2xl font-bold whitespace-nowrap sm:text-3xl',
              tone,
            )}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-neutral-500">{unit}</span>}
        </span>
        {sub && <span className="block truncate text-xs text-neutral-500">{sub}</span>}
      </span>
    </Link>
  )
}
