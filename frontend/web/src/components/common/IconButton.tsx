import type { ButtonHTMLAttributes } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'
import { Tooltip } from './Tooltip'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: NavIconName
  /** Tên chức năng: dùng làm aria-label và tooltip khi hover/focus */
  label: string
  variant?: 'soft' | 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  /** Trạng thái đang bật (ví dụ bộ lọc đang mở) */
  active?: boolean
  loading?: boolean
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}

const SIZE = {
  sm: { btn: 'size-8', icon: 'size-4' },
  md: { btn: 'size-10', icon: 'size-5' },
  lg: { btn: 'size-12', icon: 'size-6' },
} as const

/** Nút chỉ có icon (≥ 40px cho md), luôn kèm aria-label và tooltip hiện tên chức năng khi hover/focus */
export function IconButton({
  icon,
  label,
  variant = 'soft',
  size = 'md',
  active = false,
  loading = false,
  tooltipSide = 'bottom',
  className,
  disabled,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <button
        type={type}
        aria-label={label}
        aria-pressed={active || undefined}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl transition duration-150',
          'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
          SIZE[size].btn,
          variant === 'soft' &&
            (active
              ? 'bg-secondary text-white shadow-sm'
              : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'),
          variant === 'primary' && 'bg-primary hover:bg-primary-600 text-white shadow-sm',
          variant === 'ghost' &&
            (active
              ? 'bg-primary-50 text-primary'
              : 'hover:bg-primary-50 hover:text-primary text-neutral-500'),
          variant === 'outline' &&
            (active
              ? 'border-secondary bg-secondary border text-white'
              : 'bg-surface hover:border-secondary hover:text-secondary border border-neutral-200 text-neutral-600'),
          variant === 'danger' && 'bg-danger/10 text-danger hover:bg-danger/20',
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              SIZE[size].icon,
            )}
          />
        ) : (
          <NavIcon name={icon} className={SIZE[size].icon} />
        )}
      </button>
    </Tooltip>
  )
}
