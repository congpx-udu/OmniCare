import type { ReactNode } from 'react'
import { cn } from '@/utils'

interface TooltipProps {
  /** Nội dung tooltip (tên chức năng) */
  label: string
  /** Vị trí hiện tooltip so với phần tử bọc */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Chỉ hiện khi hover/focus vào phần tử bọc; phần tử bọc phải có aria-label riêng */
  children: ReactNode
  className?: string
}

const SIDE_CLASS = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
} as const

/**
 * Tooltip thuần CSS: hiện khi hover hoặc focus bàn phím vào phần tử bên trong (group).
 * Chỉ để bổ sung tên chức năng cho icon; không chứa nội dung quan trọng duy nhất.
 */
export function Tooltip({ label, side = 'bottom', children, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'bg-primary pointer-events-none absolute z-30 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md',
          'opacity-0 transition duration-150 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none',
          SIDE_CLASS[side],
        )}
      >
        {label}
      </span>
    </span>
  )
}
