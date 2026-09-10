import type { ReactNode } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface EmptyStateProps {
  icon: NavIconName
  title: string
  /** Một câu ngắn */
  hint?: string
  action?: ReactNode
  className?: string
}

/** Trạng thái trống thân thiện: icon lớn trong vòng tròn teal nhạt + tiêu đề + hành động */
export function EmptyState({ icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card flex flex-col items-center justify-center gap-3 border border-dashed border-neutral-300 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="bg-secondary-50 text-secondary flex size-14 items-center justify-center rounded-full">
        <NavIcon name={icon} className="size-7" />
      </span>
      <p className="font-heading text-primary font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-neutral-500">{hint}</p>}
      {action}
    </div>
  )
}
