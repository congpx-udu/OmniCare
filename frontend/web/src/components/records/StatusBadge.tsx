import { RECORD_STATUS_LABELS } from '@/constants'
import type { RecordStatus } from '@/types'
import { cn } from '@/utils'

const TONE = {
  info: 'bg-tertiary-50 text-tertiary-700',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-secondary-50 text-secondary-700',
  error: 'bg-danger/10 text-danger',
} as const

export function StatusBadge({ status, className }: { status: RecordStatus; className?: string }) {
  const s = RECORD_STATUS_LABELS[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONE[s.tone],
        className,
      )}
    >
      {s.label}
    </span>
  )
}
