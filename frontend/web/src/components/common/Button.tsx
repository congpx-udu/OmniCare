import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        variant === 'outline' && 'border border-primary text-primary hover:bg-primary-light',
        className,
      )}
      {...props}
    />
  )
}
