import { ACTIVITY_LABELS, MOOD_LABELS } from '@/constants'
import type { HealthLog } from '@/types'
import { formatDate } from '@/utils'

interface LogHistoryProps {
  logs: HealthLog[]
  onPick: (date: string) => void
  onDelete: (date: string) => void
  limit?: number
}

/** Danh sách nhật ký gần đây (mới → cũ), bấm để sửa */
export function LogHistory({ logs, onPick, onDelete, limit = 14 }: LogHistoryProps) {
  const recent = [...logs].reverse().slice(0, limit)
  if (recent.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        Chưa có nhật ký nào. Nhập chỉ số hôm nay ở phía trên.
      </p>
    )
  }
  return (
    <div className="rounded-card bg-surface overflow-x-auto border border-neutral-200">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead className="bg-surface-muted text-xs text-neutral-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Ngày</th>
            <th className="px-3 py-2 font-semibold">Cân nặng</th>
            <th className="px-3 py-2 font-semibold">Huyết áp</th>
            <th className="px-3 py-2 font-semibold">Nhịp tim</th>
            <th className="px-3 py-2 font-semibold">Đường huyết</th>
            <th className="px-3 py-2 font-semibold">Ngủ</th>
            <th className="px-3 py-2 font-semibold">Vận động</th>
            <th className="px-3 py-2 font-semibold">Cảm nhận</th>
            <th className="w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {recent.map((l) => (
            <tr key={l.date} className="hover:bg-surface-muted/60">
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onPick(l.date)}
                  className="text-secondary font-semibold hover:underline"
                >
                  {formatDate(l.date)}
                </button>
              </td>
              <td className="px-3 py-2">{l.weightKg ?? '—'}</td>
              <td className="px-3 py-2">
                {l.systolic || l.diastolic ? `${l.systolic ?? '?'}/${l.diastolic ?? '?'}` : '—'}
              </td>
              <td className="px-3 py-2">{l.heartRate ?? '—'}</td>
              <td className="px-3 py-2">{l.glucose ?? '—'}</td>
              <td className="px-3 py-2">{l.sleepHours ?? '—'}</td>
              <td className="px-3 py-2">
                {l.activityMinutes !== null || l.activityType
                  ? `${l.activityMinutes ?? 0}′ ${l.activityType ? ACTIVITY_LABELS[l.activityType] : ''}`
                  : '—'}
              </td>
              <td className="px-3 py-2">{l.mood ? MOOD_LABELS[l.mood].emoji : '—'}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(l.date)}
                  aria-label={`Xóa nhật ký ${formatDate(l.date)}`}
                  className="text-danger text-xs hover:underline"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
