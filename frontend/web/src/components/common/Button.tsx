import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'inverted' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

/** Nút theo design system: Primary (navy), Secondary (nền nhạt), Inverted, Outlined, Ghost */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'font-heading inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition',
        'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        variant === 'primary' && 'bg-primary hover:bg-primary-600 active:bg-primary-800 text-white',
        variant === 'secondary' && 'bg-surface-muted text-primary hover:bg-primary-100',
        variant === 'inverted' && 'bg-primary-600 hover:bg-primary-500 text-white',
        variant === 'outline' &&
          'bg-surface text-primary hover:border-primary hover:bg-primary-50 border border-neutral-300',
        variant === 'ghost' && 'text-primary hover:bg-primary-50',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}
