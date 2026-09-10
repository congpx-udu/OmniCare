import { cn } from '@/utils'

interface RainChanceProps {
  /** Xác suất mưa 0–1 */
  pop: number
  className?: string
}

/** Xác suất mưa dạng "giọt nước + %", ẩn khi bằng 0 */
export function RainChance({ pop, className }: RainChanceProps) {
  if (pop <= 0) return <span className={className} />
  return (
    <span className={cn('text-tertiary-700 inline-flex items-center gap-0.5 text-xs', className)}>
      <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden>
        <path d="M12 2.5s-6 7-6 11.5a6 6 0 0 0 12 0c0-4.5-6-11.5-6-11.5z" />
      </svg>
      {Math.round(pop * 100)}%
    </span>
  )
}
