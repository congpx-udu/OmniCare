import { METRICS, type MetricKey } from '@/constants'
import type { HealthLog } from '@/types'

interface TrendChartProps {
  metric: MetricKey
  logs: HealthLog[]
  /** Số ngày hiển thị gần nhất */
  days?: number
}

const W = 640
const H = 200
const PAD = { top: 12, right: 12, bottom: 28, left: 40 }

function short(date: string) {
  const [, m, d] = date.split('-')
  return `${Number(d)}/${Number(m)}`
}

/** Biểu đồ đường SVG thuần cho một chỉ số theo ngày (không thêm thư viện) */
export function TrendChart({ metric, logs, days = 30 }: TrendChartProps) {
  const cfg = METRICS.find((m) => m.key === metric)!
  const recent = logs.slice(-days)
  const series = cfg.fields.map((field) =>
    recent
      .map((l) => ({ date: l.date, v: l[field] as number | null }))
      .filter((p): p is { date: string; v: number } => p.v !== null),
  )
  const points = series.flat()
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
        Cần ít nhất 2 ngày có {cfg.label.toLowerCase()} để vẽ xu hướng.
      </div>
    )
  }
  const dates = [...new Set(recent.map((l) => l.date))].sort()
  const xOf = (date: string) =>
    PAD.left + ((W - PAD.left - PAD.right) * dates.indexOf(date)) / Math.max(dates.length - 1, 1)
  const values = points.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const lo = min - span * 0.15
  const hi = max + span * 0.15
  const yOf = (v: number) => PAD.top + ((hi - v) / (hi - lo)) * (H - PAD.top - PAD.bottom)
  const ticks = [lo, (lo + hi) / 2, hi]
  const labelEvery = Math.max(1, Math.ceil(dates.length / 6))

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Biểu đồ ${cfg.label}`}
      className="h-auto w-full"
    >
      {ticks.map((t) => (
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
            y={yOf(t) + 4}
            textAnchor="end"
            className="fill-neutral-500 text-[10px]"
          >
            {Math.round(t * 10) / 10}
          </text>
        </g>
      ))}
      {dates.map((d, i) =>
        i % labelEvery === 0 || i === dates.length - 1 ? (
          <text
            key={d}
            x={xOf(d)}
            y={H - 8}
            textAnchor="middle"
            className="fill-neutral-500 text-[10px]"
          >
            {short(d)}
          </text>
        ) : null,
      )}
      {series.map((s, si) => {
        if (s.length === 0) return null
        const d = s.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.date)},${yOf(p.v)}`).join(' ')
        return (
          <g key={si}>
            <path
              d={d}
              fill="none"
              stroke={cfg.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={si === 0 ? 1 : 0.55}
            />
            {s.map((p) => (
              <circle key={p.date} cx={xOf(p.date)} cy={yOf(p.v)} r={3} fill={cfg.color}>
                <title>
                  {short(p.date)}: {p.v} {cfg.unit}
                </title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
