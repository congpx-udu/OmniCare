import type { HTMLAttributes, ReactNode } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface SectionCardProps extends HTMLAttributes<HTMLElement> {
  icon?: NavIconName
  title?: string
  /** Chip / nút icon góc phải tiêu đề */
  actions?: ReactNode
  /** Nền kem (Dashboard) hay trắng */
  tone?: 'cream' | 'white' | 'teal'
  /** Nhấc 3D khi hover (thẻ bấm được) */
  lift?: boolean
  children: ReactNode
}

/** Thẻ khối chuẩn: bo 16px, bóng mềm, tiêu đề có icon; dùng cho mọi trang trong app */
export function SectionCard({
  icon,
  title,
  actions,
  tone = 'white',
  lift = false,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-card border p-5',
        tone === 'white' && 'bg-surface border-neutral-200',
        tone === 'cream' && 'bg-surface-cream border-neutral-200/80',
        tone === 'teal' && 'bg-secondary-50 border-secondary/30',
        lift ? 'card-3d hover:border-primary-200' : 'shadow-sm',
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center gap-3">
          {icon && (
            <span className="bg-secondary-50 text-secondary flex size-9 shrink-0 items-center justify-center rounded-xl">
              <NavIcon name={icon} className="size-5" />
            </span>
          )}
          {title && <h2 className="min-w-0 flex-1 truncate text-lg">{title}</h2>}
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
