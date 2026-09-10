import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { ROUTES } from '@/constants'

interface ChartCardProps {
  icon: NavIconName
  label: string
  value: string
  unit: string
  badge?: string | null
  badgeTone?: 'teal' | 'muted'
  children: ReactNode
}

/** Khung chung cho hai biểu đồ 7 ngày: icon teal + nhãn ngắn + số; bấm vào sang trang Theo dõi */
export function ChartCard({
  icon,
  label,
  value,
  unit,
  badge,
  badgeTone = 'teal',
  children,
}: ChartCardProps) {
  return (
    <Link
      to={ROUTES.TRACKING}
      className="card-3d rounded-card bg-surface-cream hover:border-primary-200 block w-full border border-neutral-200/80 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-2xl">
            <NavIcon name={icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              {label} · 7 ngày
            </p>
            <p className="font-heading text-primary text-xl font-bold">
              {value} <span className="text-sm font-medium text-neutral-500">{unit}</span>
            </p>
          </div>
        </div>
        {badge && (
          <span
            className={
              badgeTone === 'teal'
                ? 'bg-secondary-700 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white'
                : 'shrink-0 rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-700'
            }
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </Link>
  )
}
