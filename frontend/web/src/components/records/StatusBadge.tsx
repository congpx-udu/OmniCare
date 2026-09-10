import { NavIcon, type NavIconName } from '@/components/layout'
import { RECORD_STATUS_LABELS } from '@/constants'
import type { RecordStatus } from '@/types'
import { cn } from '@/utils'

const TONE = {
  info: 'bg-tertiary-50 text-tertiary-700',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-secondary-50 text-secondary-700',
  error: 'bg-danger/10 text-danger',
} as const

const DOT = {
  info: 'bg-tertiary',
  warning: 'bg-warning',
  success: 'bg-secondary',
  error: 'bg-danger',
} as const

const ICON: Record<RecordStatus, NavIconName> = {
  pending: 'clock',
  needs_review: 'eye',
  done: 'check',
  failed: 'alert',
}

/** Chip trạng thái hồ sơ: chấm màu + icon + nhãn ngắn (không chỉ dựa vào màu) */
export function StatusBadge({ status, className }: { status: RecordStatus; className?: string }) {
  const s = RECORD_STATUS_LABELS[status]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        TONE[s.tone],
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', DOT[s.tone])} />
      <NavIcon name={ICON[status]} className="size-3.5" />
      {s.label}
    </span>
  )
}
