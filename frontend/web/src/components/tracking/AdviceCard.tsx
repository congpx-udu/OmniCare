import { Alert } from '@/components/common'
import { ALERT_TONE, SUGGESTION_CATEGORY_LABELS } from '@/constants'
import type { HealthAdvice } from '@/types'
import { cn, formatDate } from '@/utils'

interface AdviceCardProps {
  advice: HealthAdvice
  onToggle: (index: number, done: boolean) => void
  compact?: boolean
}

const ARROW = { up: '↑', down: '↓', stable: '→' } as const

/** Kết quả một lần AI phân tích: tổng quan, xu hướng, cảnh báo mềm, đề xuất có checkbox "đã làm" */
export function AdviceCard({ advice, onToggle, compact = false }: AdviceCardProps) {
  const done = advice.suggestions.filter((s) => s.done).length
  return (
    <section className="rounded-card bg-surface space-y-4 border border-neutral-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg">Phân tích của trợ lý</h3>
          <p className="text-xs text-neutral-500">
            {formatDate(advice.from)} – {formatDate(advice.to)} · {advice.logCount} ngày nhật ký ·
            lúc {new Date(advice.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        {advice.suggestions.length > 0 && (
          <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {done}/{advice.suggestions.length} đã làm
          </span>
        )}
      </div>

      <p className="text-primary">{advice.summary}</p>

      {advice.alerts.map((a, i) => (
        <Alert key={i} variant={ALERT_TONE[a.level]}>
          {a.message}
        </Alert>
      ))}

      {!compact && advice.trends.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {advice.trends.map((t) => (
            <li key={t.metric} className="bg-surface-muted rounded-lg px-3.5 py-2.5 text-sm">
              <span className="font-heading text-primary font-semibold">
                {ARROW[t.direction]} {t.metric}
              </span>
              <p className="text-neutral-700">{t.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {advice.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-heading text-primary text-sm font-semibold">Đề xuất cải thiện</h4>
          <ul className="space-y-2">
            {advice.suggestions.map((s, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm transition',
                  s.done ? 'border-secondary/30 bg-secondary-50/60' : 'border-neutral-200',
                )}
              >
                <input
                  id={`${advice.id}-${i}`}
                  type="checkbox"
                  checked={s.done}
                  onChange={(e) => onToggle(i, e.target.checked)}
                  className="accent-secondary mt-0.5 size-4 shrink-0"
                />
                <label htmlFor={`${advice.id}-${i}`} className="min-w-0 flex-1 cursor-pointer">
                  <span
                    className={cn(
                      'font-heading font-semibold',
                      s.done && 'text-neutral-500 line-through',
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="bg-tertiary-50 text-tertiary-700 ml-2 rounded-full px-2 py-0.5 text-[11px]">
                    {SUGGESTION_CATEGORY_LABELS[s.category]}
                  </span>
                  <p className="text-neutral-700">{s.detail}</p>
                  {s.when && <p className="text-xs text-neutral-500">⏰ {s.when}</p>}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-neutral-400">{advice.disclaimer}</p>
    </section>
  )
}
