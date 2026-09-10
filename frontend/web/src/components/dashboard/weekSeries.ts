import type { HealthLog } from '@/types'

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export interface DayPoint {
  date: string
  /** Nhãn thứ: T2..T7, CN */
  label: string
  value: number | null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 7 ngày gần nhất (kết thúc hôm nay) cho một trường số của nhật ký; ngày không ghi thì null */
export function lastSevenDays(logs: HealthLog[], field: keyof HealthLog): DayPoint[] {
  const byDate = new Map(logs.map((l) => [l.date, l]))
  const today = new Date()
  const out: DayPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const raw = byDate.get(date)?.[field]
    out.push({ date, label: WEEKDAYS[d.getDay()], value: typeof raw === 'number' ? raw : null })
  }
  return out
}
