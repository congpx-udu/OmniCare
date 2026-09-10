import type { ReactNode } from 'react'
import { cn } from '@/utils'

interface AlertProps {
  variant?: 'error' | 'success' | 'info' | 'warning'
  children: ReactNode
  className?: string
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3.5 py-2.5 text-sm',
        variant === 'error' && 'border-danger/30 bg-danger/5 text-danger',
        variant === 'success' && 'border-secondary/30 bg-secondary-50 text-secondary-700',
        variant === 'info' && 'border-tertiary/30 bg-tertiary-50 text-tertiary-700',
        variant === 'warning' && 'border-warning/30 bg-warning/5 text-warning',
        className,
      )}
    >
      {children}
    </div>
  )
}
