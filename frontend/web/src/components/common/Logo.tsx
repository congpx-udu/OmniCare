import logoFull from '@/assets/logo-full.png'
import logoMark from '@/assets/logo.png'
import { APP_NAME } from '@/constants'
import { cn } from '@/utils'

interface LogoProps {
  /** `full`: logo kèm chữ OmniCare; `mark`: chỉ biểu tượng */
  variant?: 'full' | 'mark'
  className?: string
}

export function Logo({ variant = 'full', className }: LogoProps) {
  const src = variant === 'full' ? logoFull : logoMark
  return (
    <img
      src={src}
      alt={APP_NAME}
      draggable={false}
      className={cn('object-contain select-none', variant === 'full' ? 'h-12' : 'h-10', className)}
    />
  )
}
