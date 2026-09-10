import { IconButton, SectionCard } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { METRICS, type MetricKey } from '@/constants'
import type { HealthLog } from '@/types'
import { cn } from '@/utils'

interface TrendChartProps {
  metric: MetricKey
  /** Chỉ số có dữ liệu để chọn */
  available: MetricKey[]
  onMetricChange: (m: MetricKey) => void
  logs: HealthLog[]
  /** Số ngày hiển thị gần nhất */
  days: 7 | 30
  onDaysChange: (d: 7 | 30) => void
}

const W = 640
const H = 200
const PAD = { top: 12, right: 12, bottom: 28, left: 40 }

function short(date: string) {
  const [, m, d] = date.split('-')
  return `${Number(d)}/${Number(m)}`
}

/** Thẻ Xu hướng: chọn chỉ số bằng nút icon, giá trị mới nhất + chênh lệch, biểu đồ đường SVG thuần */
export function TrendChart({
  metric,
  available,
  onMetricChange,
  logs,
  days,
  onDaysChange,
}: TrendChartProps) {
  const cfg = METRICS.find((m) => m.key === metric)!
  const recent = logs.slice(-days)
  const series = cfg.fields.map((field) =>
    recent
      .map((l) => ({ date: l.date, v: l[field] as number | null }))
      .filter((p): p is { date: string; v: number } => p.v !== null),
  )
  const primary = series[0]
  const latest = primary.at(-1) ?? null
  const previous = primary.length > 1 ? primary[primary.length - 2] : null
  const delta = latest && previous ? Math.round((latest.v - previous.v) * 10) / 10 : null
  const latestText =
    latest && cfg.key === 'bloodPressure'
      ? `${latest.v}/${series[1]?.at(-1)?.v ?? '?'}`
      : latest
        ? String(latest.v)
        : '—'

  const points = series.flat()
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
    <SectionCard
      icon={cfg.icon}
      title="Xu hướng"
      actions={
        <div className="flex gap-1" role="group" aria-label="Khoảng thời gian">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={days === r}
              onClick={() => onDaysChange(r)}
              className={cn(
                'h-9 cursor-pointer rounded-full px-3 text-xs font-semibold transition',
                'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:outline-none',
                days === r
                  ? 'bg-primary text-white'
                  : 'hover:border-primary border border-neutral-200 text-neutral-600',
              )}
            >
              {r} ngày
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Chỉ số">
        {METRICS.filter((m) => available.includes(m.key)).map((m) => (
          <IconButton
            key={m.key}
            icon={m.icon}
            label={m.label}
            variant="outline"
            active={metric === m.key}
            role="tab"
            aria-selected={metric === m.key}
            onClick={() => onMetricChange(m.key)}
            tooltipSide="top"
          />
        ))}
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {cfg.label}
        </span>
        <span className="font-heading text-primary text-2xl font-bold">{latestText}</span>
        <span className="text-sm text-neutral-500">{cfg.unit}</span>
        {delta !== null && delta !== 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              delta > 0 ? 'bg-warning/10 text-warning' : 'bg-secondary-50 text-secondary-700',
            )}
          >
            <NavIcon
              name="arrow-right"
              className={cn('size-3.5', delta > 0 ? '-rotate-45' : 'rotate-45')}
            />
            {Math.abs(delta)}
          </span>
        )}
      </div>

      {points.length < 2 ? (
        <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
          Cần ít nhất 2 ngày có {cfg.label.toLowerCase()} để vẽ xu hướng.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Biểu đồ ${cfg.label} ${days} ngày`}
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
                className="fill-neutral-500 font-mono text-[10px]"
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
                className="fill-neutral-500 font-mono text-[10px]"
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
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={si === 0 ? 1 : 0.5}
                />
                {s.map((p) => (
                  <circle
                    key={p.date}
                    cx={xOf(p.date)}
                    cy={yOf(p.v)}
                    r={3.5}
                    fill="var(--color-surface)"
                    stroke={cfg.color}
                    strokeWidth={2}
                  >
                    <title>
                      {short(p.date)}: {p.v} {cfg.unit}
                    </title>
                  </circle>
                ))}
              </g>
            )
          })}
        </svg>
      )}
    </SectionCard>
  )
}
