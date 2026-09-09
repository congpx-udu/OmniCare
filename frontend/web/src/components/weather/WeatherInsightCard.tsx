import { Link } from 'react-router-dom'
import { Button } from '@/components/common'
import { ROUTES } from '@/constants'
import type { WeatherInsight } from '@/types'

interface WeatherInsightCardProps {
  insight: WeatherInsight | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  onRetry: () => void
}

/** Khối "Ảnh hưởng đến bạn": AI đọc thời tiết + hồ sơ + buổi trong ngày → lưu ý, gợi ý bữa ăn và vận động */
export function WeatherInsightCard({ insight, status, error, onRetry }: WeatherInsightCardProps) {
  return (
    <section className="rounded-card bg-surface border border-neutral-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg">Ảnh hưởng đến bạn</h2>
          <p className="text-xs text-neutral-500">
            Dựa trên thời tiết hiện tại, hồ sơ sức khỏe và thời điểm trong ngày
            {insight ? ` (${insight.timeOfDay})` : ''}.
          </p>
        </div>
        {status === 'loading' && (
          <span className="text-xs text-neutral-500" aria-live="polite">
            Trợ lý đang phân tích...
          </span>
        )}
      </div>

      {status === 'loading' && !insight && (
        <div className="mt-4 space-y-2" aria-busy>
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
        </div>
      )}

      {status === 'failed' && !insight && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-danger">{error ?? 'Không lấy được lưu ý từ trợ lý AI.'}</span>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      )}

      {insight && (
        <div className={status === 'loading' ? 'mt-4 space-y-4 opacity-60' : 'mt-4 space-y-4'}>
          <p className="text-primary font-medium">{insight.summary}</p>

          {insight.tips.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {insight.tips.map((t) => (
                <li key={t.title} className="bg-surface-muted rounded-lg px-3.5 py-3 text-sm">
                  <p className="font-heading text-primary font-semibold">{t.title}</p>
                  <p className="mt-0.5 text-neutral-700">{t.detail}</p>
                </li>
              ))}
            </ul>
          )}

          {(insight.mealIdea || insight.activityIdea) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {insight.mealIdea && (
                <div className="border-secondary/30 bg-secondary-50 rounded-lg border px-3.5 py-3 text-sm">
                  <p className="text-secondary-700 font-heading font-semibold">Bữa ăn lúc này</p>
                  <p className="mt-0.5 text-neutral-700">{insight.mealIdea}</p>
                  <Link
                    to={`${ROUTES.CHAT}?mode=food`}
                    className="text-secondary mt-2 inline-block text-xs font-semibold hover:underline"
                  >
                    Hỏi thêm món cụ thể →
                  </Link>
                </div>
              )}
              {insight.activityIdea && (
                <div className="border-tertiary/30 bg-tertiary-50 rounded-lg border px-3.5 py-3 text-sm">
                  <p className="text-tertiary-700 font-heading font-semibold">Vận động lúc này</p>
                  <p className="mt-0.5 text-neutral-700">{insight.activityIdea}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-neutral-400">
            {insight.disclaimer}
            {insight.cached ? ' · Nội dung được lưu tạm 30 phút.' : ''}
          </p>
        </div>
      )}
    </section>
  )
}
