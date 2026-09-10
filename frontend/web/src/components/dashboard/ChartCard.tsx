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

/** Khung chung cho hai biểu đồ 7 ngày trên Dashboard, bấm vào sang trang Theo dõi */
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
      className="card-3d rounded-card bg-surface-cream hover:border-primary-200 block border border-neutral-200/80 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-secondary-50 text-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <NavIcon name={icon} className="size-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
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
                ? 'bg-secondary-700 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white'
                : 'rounded-full bg-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-700'
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
