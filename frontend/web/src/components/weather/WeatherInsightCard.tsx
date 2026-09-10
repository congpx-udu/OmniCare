import { Link } from 'react-router-dom'
import { IconButton, SectionCard } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { WeatherInsight } from '@/types'

interface WeatherInsightCardProps {
  insight: WeatherInsight | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  onRetry: () => void
}

/** Khối "Ảnh hưởng đến bạn": AI đọc thời tiết + hồ sơ + buổi trong ngày → lưu ý, bữa ăn, vận động */
export function WeatherInsightCard({ insight, status, error, onRetry }: WeatherInsightCardProps) {
  const loading = status === 'loading'
  return (
    <SectionCard
      icon="sparkles"
      title="Ảnh hưởng đến bạn"
      lift
      actions={
        <>
          {insight && (
            <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-1 text-xs font-semibold">
              {insight.timeOfDay}
            </span>
          )}
          <IconButton
            icon="refresh"
            label="Phân tích lại"
            variant="ghost"
            size="sm"
            loading={loading}
            onClick={onRetry}
          />
        </>
      }
    >
      {loading && !insight && (
        <div className="space-y-2" aria-busy aria-live="polite">
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        </div>
      )}

      {status === 'failed' && !insight && (
        <p className="text-danger flex items-center gap-2 text-sm">
          <NavIcon name="alert" className="size-4 shrink-0" />
          {error ?? 'Không lấy được lưu ý từ trợ lý AI.'}
        </p>
      )}

      {insight && (
        <div className={loading ? 'space-y-4 opacity-60' : 'space-y-4'}>
          <p className="text-primary font-medium">{insight.summary}</p>

          {insight.tips.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {insight.tips.map((t) => (
                <li
                  key={t.title}
                  className="bg-surface-muted/70 flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm"
                >
                  <span className="bg-surface text-tertiary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <NavIcon name="info" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-primary font-semibold">{t.title}</p>
                    <p className="mt-0.5 text-neutral-700">{t.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {(insight.mealIdea || insight.activityIdea) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {insight.mealIdea && (
                <Link
                  to={`${ROUTES.CHAT}?mode=food`}
                  className="border-secondary/30 bg-secondary-50 hover:border-secondary flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition"
                >
                  <span className="bg-surface text-secondary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <NavIcon name="food" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-secondary-700 font-heading font-semibold">Bữa ăn lúc này</p>
                    <p className="mt-0.5 text-neutral-700">{insight.mealIdea}</p>
                  </div>
                  <NavIcon name="arrow-right" className="text-secondary mt-1 size-4 shrink-0" />
                </Link>
              )}
              {insight.activityIdea && (
                <div className="border-tertiary/30 bg-tertiary-50 flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm">
                  <span className="bg-surface text-tertiary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <NavIcon name="walk" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-tertiary-700 font-heading font-semibold">Vận động lúc này</p>
                    <p className="mt-0.5 text-neutral-700">{insight.activityIdea}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-neutral-400">
            {insight.disclaimer}
            {insight.cached ? ' · Lưu tạm 30 phút.' : ''}
          </p>
        </div>
      )}
    </SectionCard>
  )
}
