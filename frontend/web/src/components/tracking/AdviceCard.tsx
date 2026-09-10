import { useState } from 'react'
import { Alert, IconButton, SectionCard } from '@/components/common'
import { NavIcon } from '@/components/layout'
import {
  ALERT_ICONS,
  ALERT_TONE,
  SUGGESTION_CATEGORY_ICONS,
  SUGGESTION_CATEGORY_LABELS,
} from '@/constants'
import type { HealthAdvice, TrendDirection } from '@/types'
import { cn, formatDate } from '@/utils'

interface AdviceCardProps {
  advice: HealthAdvice
  onToggle: (index: number, done: boolean) => void
  compact?: boolean
}

const TREND_CLASS: Record<TrendDirection, { rotate: string; tone: string }> = {
  up: { rotate: '-rotate-45', tone: 'bg-warning/10 text-warning' },
  down: { rotate: 'rotate-45', tone: 'bg-tertiary-50 text-tertiary-700' },
  stable: { rotate: '', tone: 'bg-neutral-100 text-neutral-600' },
}

/** Kết quả một lần AI phân tích: tổng quan (thu gọn), xu hướng dạng chip, cảnh báo, đề xuất có nút đã làm */
export function AdviceCard({ advice, onToggle, compact = false }: AdviceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const done = advice.suggestions.filter((s) => s.done).length

  return (
    <SectionCard
      icon="sparkles"
      title="Phân tích của trợ lý"
      actions={
        <>
          {advice.suggestions.length > 0 && (
            <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-1 text-xs font-semibold">
              {done}/{advice.suggestions.length}
            </span>
          )}
          <IconButton
            icon="chevron-down"
            label={expanded ? 'Thu gọn' : 'Xem thêm'}
            variant="ghost"
            size="sm"
            active={expanded}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className={cn('transition-transform', expanded && 'rotate-180')}
          />
        </>
      }
    >
      <p className="text-xs text-neutral-500">
        {formatDate(advice.from)} – {formatDate(advice.to)} · {advice.logCount} ngày
      </p>
      <p className={cn('text-primary mt-2', !expanded && 'line-clamp-3')}>{advice.summary}</p>

      {advice.alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {advice.alerts.map((a, i) => (
            <Alert key={i} variant={ALERT_TONE[a.level]} className="flex items-start gap-2">
              <NavIcon name={ALERT_ICONS[a.level]} className="mt-0.5 size-4 shrink-0" />
              <span>{a.message}</span>
            </Alert>
          ))}
        </div>
      )}

      {!compact && advice.trends.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {advice.trends.map((t) => (
            <li key={t.metric}>
              <span
                className={cn(
                  'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm',
                  TREND_CLASS[t.direction].tone,
                )}
              >
                <NavIcon
                  name="arrow-right"
                  className={cn('size-4 shrink-0', TREND_CLASS[t.direction].rotate)}
                />
                <span className="font-semibold">{t.metric}</span>
                <span className="truncate text-xs opacity-80">{t.comment}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {advice.suggestions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {advice.suggestions.map((s, i) => (
            <li
              key={i}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                s.done ? 'border-secondary/30 bg-secondary-50/60' : 'border-neutral-200',
              )}
            >
              <IconButton
                icon="check"
                label={s.done ? 'Bỏ đánh dấu' : 'Đánh dấu đã làm'}
                variant="outline"
                size="sm"
                active={s.done}
                className="rounded-full"
                onClick={() => onToggle(i, !s.done)}
                tooltipSide="right"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'font-heading font-semibold',
                    s.done && 'text-neutral-500 line-through',
                  )}
                >
                  {s.title}
                </p>
                <p className="text-neutral-700">{s.detail}</p>
                {s.when && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <NavIcon name="clock" className="size-3.5" />
                    {s.when}
                  </p>
                )}
              </div>
              <span className="bg-tertiary-50 text-tertiary-700 inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold">
                <NavIcon name={SUGGESTION_CATEGORY_ICONS[s.category]} className="size-3.5" />
                {SUGGESTION_CATEGORY_LABELS[s.category]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] text-neutral-400">{advice.disclaimer}</p>
    </SectionCard>
  )
}
