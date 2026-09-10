import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface StatCardProps {
  label: string
  icon: NavIconName
  value: string
  unit?: string
  /** Dòng phụ nhỏ cạnh giá trị (ví dụ "AQI 48", "Bình thường") */
  sub?: string
  tone?: string
  to: string
}

/** Thẻ chỉ số nhanh trên Dashboard: nhãn mono viết hoa, giá trị lớn, icon góc phải */
export function StatCard({ label, icon, value, unit, sub, tone, to }: StatCardProps) {
  return (
    <Link
      to={to}
      className="card-3d rounded-card bg-surface-cream hover:border-primary-200 block border border-neutral-200/80 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
          {label}
        </span>
        <NavIcon name={icon} className="text-secondary size-4" />
      </div>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={cn('font-heading text-primary text-3xl font-bold whitespace-nowrap', tone)}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-neutral-500">{unit}</span>}
        {sub && <span className="text-xs whitespace-nowrap text-neutral-500">{sub}</span>}
      </p>
    </Link>
  )
}
