import { EmptyState, IconButton } from '@/components/common'
import { NavIcon, type NavIconName } from '@/components/layout'
import { ACTIVITY_ICONS, ACTIVITY_LABELS, MOOD_LABELS } from '@/constants'
import type { HealthLog } from '@/types'
import { cn, formatDate } from '@/utils'

interface LogHistoryProps {
  logs: HealthLog[]
  onPick: (date: string) => void
  onDelete: (date: string) => void
  limit?: number
}

interface Cell {
  icon: NavIconName
  label: string
  value: string
  tone?: string
}

function cells(l: HealthLog): Cell[] {
  const out: Cell[] = []
  if (l.weightKg !== null) out.push({ icon: 'scale', label: 'Cân nặng', value: `${l.weightKg} kg` })
  if (l.systolic !== null || l.diastolic !== null)
    out.push({
      icon: 'heart',
      label: 'Huyết áp',
      value: `${l.systolic ?? '?'}/${l.diastolic ?? '?'}`,
    })
  if (l.heartRate !== null)
    out.push({ icon: 'activity', label: 'Nhịp tim', value: `${l.heartRate} bpm` })
  if (l.glucose !== null)
    out.push({ icon: 'droplet', label: 'Đường huyết', value: `${l.glucose} mmol/L` })
  if (l.sleepHours !== null)
    out.push({ icon: 'bed', label: 'Giấc ngủ', value: `${l.sleepHours} h` })
  if (l.activityMinutes !== null || l.activityType)
    out.push({
      icon: l.activityType ? ACTIVITY_ICONS[l.activityType] : 'walk',
      label: l.activityType ? ACTIVITY_LABELS[l.activityType] : 'Vận động',
      value: `${l.activityMinutes ?? 0}′`,
    })
  if (l.mood)
    out.push({
      icon: 'smile',
      label: `Cảm nhận: ${MOOD_LABELS[l.mood].label}`,
      value: `${l.mood}/5`,
      tone: MOOD_LABELS[l.mood].tone,
    })
  return out
}

/** Nhật ký gần đây (mới → cũ): mỗi ngày một dòng, chỉ số là icon + số, sửa/xóa bằng nút icon */
export function LogHistory({ logs, onPick, onDelete, limit = 14 }: LogHistoryProps) {
  const recent = [...logs].reverse().slice(0, limit)
  if (recent.length === 0) {
    return (
      <EmptyState
        icon="activity"
        title="Chưa có nhật ký"
        hint="Ghi chỉ số hôm nay ở phía trên để bắt đầu theo dõi."
      />
    )
  }
  return (
    <ul className="space-y-2">
      {recent.map((l) => {
        const items = cells(l)
        return (
          <li
            key={l.date}
            className="bg-surface flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-neutral-200 px-3 py-2 shadow-sm"
          >
            <span className="font-heading text-primary inline-flex w-24 shrink-0 items-center gap-1.5 text-sm font-semibold">
              <NavIcon name="calendar" className="text-secondary size-4" />
              {formatDate(l.date)}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {items.length === 0 && (
                <span className="text-xs text-neutral-400">Chưa có chỉ số</span>
              )}
              {items.map((c) => (
                <span
                  key={c.label}
                  aria-label={`${c.label}: ${c.value}`}
                  className={cn(
                    'bg-surface-muted inline-flex h-8 items-center gap-1 rounded-full px-2.5 font-mono text-xs font-semibold text-neutral-700',
                    c.tone,
                  )}
                >
                  <NavIcon name={c.icon} className="size-3.5" />
                  {c.value}
                </span>
              ))}
              {l.note && (
                <span className="bg-tertiary-50 text-tertiary-700 inline-flex h-8 max-w-48 items-center gap-1 rounded-full px-2.5 text-xs">
                  <NavIcon name="clipboard" className="size-3.5 shrink-0" />
                  <span className="truncate">{l.note}</span>
                </span>
              )}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <IconButton
                icon="pencil"
                label="Sửa nhật ký"
                size="sm"
                variant="ghost"
                onClick={() => onPick(l.date)}
              />
              <IconButton
                icon="trash"
                label="Xóa nhật ký"
                size="sm"
                variant="ghost"
                className="hover:bg-danger/10 hover:text-danger"
                onClick={() => onDelete(l.date)}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
