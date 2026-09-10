import type { ReactNode } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface PageHeaderProps {
  icon: NavIconName
  title: string
  /** Một dòng ngắn (≤ 80 ký tự); không viết đoạn văn */
  subtitle?: string
  /** Nút icon / hành động bên phải */
  actions?: ReactNode
  className?: string
}

/** Đầu trang thống nhất: ô icon teal + tiêu đề + phụ đề ngắn; hành động bên phải dạng nút icon */
export function PageHeader({ icon, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-center gap-3 sm:gap-4', className)}>
      <span className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-2xl">
        <NavIcon name={icon} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl leading-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="truncate text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
