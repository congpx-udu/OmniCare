import { ChartCard } from './ChartCard'
import { lastSevenDays } from './weekSeries'
import type { HealthLog } from '@/types'

interface WeightTrendCardProps {
  logs: HealthLog[]
  /** Cân nặng trong hồ sơ, dùng khi nhật ký tuần này chưa có số đo */
  profileWeightKg: number | null
}

const W = 400
const H = 190
const PAD = { top: 12, right: 12, bottom: 24, left: 34 }

/** Biểu đồ đường + vùng tô cân nặng 7 ngày gần nhất (SVG thuần, không thêm thư viện) */
export function WeightTrendCard({ logs, profileWeightKg }: WeightTrendCardProps) {
  const days = lastSevenDays(logs, 'weightKg')
  const pts = days
    .map((d, i) => ({ ...d, i }))
    .filter((d): d is typeof d & { value: number } => d.value !== null)
  const latest = pts.at(-1)?.value ?? profileWeightKg
  const first = pts[0]?.value ?? null
  const delta = pts.length >= 2 && first !== null && latest !== null ? latest - first : null
  const badge =
    delta === null ? null : `${delta > 0 ? '+' : ''}${(Math.round(delta * 10) / 10).toFixed(1)} kg`

  const values = pts.map((p) => p.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const span = max - min || 2
  const lo = min - span * 0.5
  const hi = max + span * 0.5
  const xOf = (i: number) => PAD.left + ((W - PAD.left - PAD.right) * i) / 6
  const yOf = (v: number) => PAD.top + ((hi - v) / (hi - lo)) * (H - PAD.top - PAD.bottom)

  // Đường cong mượt bằng bezier giữa các điểm liên tiếp
  const line = pts
    .map((p, k) => {
      if (k === 0) return `M${xOf(p.i)},${yOf(p.value)}`
      const prev = pts[k - 1]
      const cx = (xOf(prev.i) + xOf(p.i)) / 2
      return `C${cx},${yOf(prev.value)} ${cx},${yOf(p.value)} ${xOf(p.i)},${yOf(p.value)}`
    })
    .join(' ')
  const last = pts.at(-1)
  const area =
    pts.length >= 2 && last
      ? `${line} L${xOf(last.i)},${H - PAD.bottom} L${xOf(pts[0].i)},${H - PAD.bottom} Z`
      : ''
  const ticks = [lo, (lo + hi) / 2, hi]

  return (
    <ChartCard
      icon="heart"
      label="Cân nặng"
      value={latest !== null ? latest.toFixed(1) : '—'}
      unit="kg"
      badge={badge}
      badgeTone={delta !== null && delta <= 0 ? 'teal' : 'muted'}
    >
      {pts.length < 2 ? (
        <div className="flex h-44 items-center justify-center text-center text-sm text-neutral-500">
          Ghi cân nặng ít nhất 2 ngày trong tuần để thấy xu hướng.
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cân nặng 7 ngày" className="w-full">
          <defs>
            <linearGradient id="weight-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
            </linearGradient>
          </defs>
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
                y={yOf(t) + 3}
                textAnchor="end"
                className="fill-neutral-400 font-mono text-[9px]"
              >
                {Math.round(t)}
              </text>
            </g>
          ))}
          <path d={area} fill="url(#weight-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--color-secondary-700)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {pts.map((p) => (
            <circle
              key={p.date}
              cx={xOf(p.i)}
              cy={yOf(p.value)}
              r={3.5}
              fill="var(--color-surface-cream)"
              stroke="var(--color-secondary-700)"
              strokeWidth={2}
            >
              <title>
                {p.label}: {p.value} kg
              </title>
            </circle>
          ))}
          {days.map((d, i) => (
            <text
              key={d.date}
              x={xOf(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-neutral-500 font-mono text-[9px]"
            >
              {d.label}
            </text>
          ))}
        </svg>
      )}
    </ChartCard>
  )
}
