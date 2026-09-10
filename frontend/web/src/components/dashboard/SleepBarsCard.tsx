import { ChartCard } from './ChartCard'
import { lastSevenDays } from './weekSeries'
import type { HealthLog } from '@/types'

interface SleepBarsCardProps {
  logs: HealthLog[]
}

const SLEEP_GOAL_H = 7
const W = 400
const H = 190
const PAD = { top: 12, right: 12, bottom: 24, left: 28 }
const MAX_H = 10

/** Biểu đồ cột giấc ngủ 7 ngày; cột đạt mục tiêu 7h màu teal, chưa đạt màu cam */
export function SleepBarsCard({ logs }: SleepBarsCardProps) {
  const days = lastSevenDays(logs, 'sleepHours')
  const values = days.map((d) => d.value).filter((v): v is number => v !== null)
  const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null
  const yOf = (v: number) => PAD.top + (1 - Math.min(v, MAX_H) / MAX_H) * (H - PAD.top - PAD.bottom)
  const slot = (W - PAD.left - PAD.right) / 7
  const barW = slot * 0.4

  return (
    <ChartCard
      icon="moon"
      label="Giấc ngủ"
      value={avg !== null ? avg.toFixed(1) : '—'}
      unit="giờ TB"
      badge={`Mục tiêu ${SLEEP_GOAL_H}h`}
      badgeTone="teal"
    >
      {values.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-center text-sm text-neutral-500">
          Ghi số giờ ngủ mỗi ngày để theo dõi giấc ngủ trong tuần.
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Giấc ngủ 7 ngày" className="w-full">
          {[0, 3, 6, MAX_H].map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yOf(t)}
                y2={yOf(t)}
                stroke="currentColor"
                className="text-neutral-200"
                strokeDasharray="3 3"
              />
              <text
                x={PAD.left - 6}
                y={yOf(t) + 3}
                textAnchor="end"
                className="fill-neutral-400 font-mono text-[9px]"
              >
                {t}
              </text>
            </g>
          ))}
          {days.map((d, i) => {
            const cx = PAD.left + slot * i + slot / 2
            const reached = d.value !== null && d.value >= SLEEP_GOAL_H
            return (
              <g key={d.date}>
                {d.value !== null && (
                  <rect
                    x={cx - barW / 2}
                    y={yOf(d.value)}
                    width={barW}
                    height={H - PAD.bottom - yOf(d.value)}
                    rx={3}
                    fill={reached ? 'var(--color-secondary-700)' : 'var(--color-warning)'}
                    opacity={reached ? 1 : 0.85}
                  >
                    <title>
                      {d.label}: {d.value} giờ
                    </title>
                  </rect>
                )}
                <text
                  x={cx}
                  y={H - 6}
                  textAnchor="middle"
                  className="fill-neutral-500 font-mono text-[9px]"
                >
                  {d.label}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </ChartCard>
  )
}
