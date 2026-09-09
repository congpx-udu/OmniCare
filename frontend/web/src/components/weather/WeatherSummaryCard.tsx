import { Link } from 'react-router-dom'
import { WeatherIcon } from './WeatherIcon'
import { ROUTES } from '@/constants'
import type { WeatherSnapshot } from '@/types'

interface WeatherSummaryCardProps {
  data: WeatherSnapshot | null
  loading?: boolean
}

/** Thẻ thời tiết gọn cho Dashboard; khi chưa có dữ liệu thì mời sang trang Thời tiết */
export function WeatherSummaryCard({ data, loading = false }: WeatherSummaryCardProps) {
  if (!data) {
    return (
      <Link
        to={ROUTES.WEATHER}
        className="rounded-card bg-surface hover:border-primary-200 flex items-center justify-between border border-neutral-200 p-5 transition hover:shadow-lg"
      >
        <div>
          <h3 className="text-lg">Thời tiết hôm nay</h3>
          <p className="mt-1 text-sm text-neutral-600">
            {loading ? 'Đang tải...' : 'Chọn vị trí để xem thời tiết và dự báo.'}
          </p>
        </div>
        <span className="text-secondary text-sm font-semibold">Xem →</span>
      </Link>
    )
  }
  const { location, current, daily } = data
  const today = daily[0]
  return (
    <Link
      to={ROUTES.WEATHER}
      className="rounded-card bg-surface hover:border-primary-200 flex items-center gap-4 border border-neutral-200 p-5 transition hover:shadow-lg"
    >
      <WeatherIcon code={current.icon} alt={current.description} className="size-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-neutral-500">{location.name}</p>
        <p className="font-heading text-primary text-2xl font-bold">
          {Math.round(current.temp)}°{' '}
          <span className="text-base font-medium text-neutral-600">{current.description}</span>
        </p>
        <p className="text-xs text-neutral-500">
          Độ ẩm {current.humidity}% · Gió {Math.round(current.windKmh)} km/h
          {today && today.pop > 0 ? ` · Mưa ${Math.round(today.pop * 100)}%` : ''}
        </p>
      </div>
    </Link>
  )
}
