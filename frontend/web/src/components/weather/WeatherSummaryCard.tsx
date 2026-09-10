import { Link } from 'react-router-dom'
import { WeatherIcon } from './WeatherIcon'
import { NavIcon } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { WeatherSnapshot } from '@/types'

interface WeatherSummaryCardProps {
  data: WeatherSnapshot | null
  loading?: boolean
  /** Một câu "ảnh hưởng đến bạn" nếu đã có */
  insightSummary?: string | null
}

/** Thẻ thời tiết gọn cho Dashboard; chưa có dữ liệu thì mời sang trang Thời tiết */
export function WeatherSummaryCard({
  data,
  loading = false,
  insightSummary = null,
}: WeatherSummaryCardProps) {
  if (!data) {
    return (
      <Link
        to={ROUTES.WEATHER}
        className="card-3d rounded-card bg-surface hover:border-primary-200 flex items-center gap-4 border border-neutral-200 p-5"
      >
        <span className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-2xl">
          <NavIcon name="weather" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg">Thời tiết hôm nay</h3>
          <p className="truncate text-sm text-neutral-500">
            {loading ? 'Đang tải...' : 'Chọn vị trí để xem'}
          </p>
        </div>
        <NavIcon name="arrow-right" className="text-secondary size-5 shrink-0" aria-hidden />
      </Link>
    )
  }
  const { location, current, daily } = data
  const today = daily[0]
  return (
    <Link
      to={ROUTES.WEATHER}
      className="card-3d rounded-card bg-surface hover:border-primary-200 flex items-center gap-4 border border-neutral-200 p-5"
    >
      <WeatherIcon code={current.icon} alt={current.description} className="size-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm text-neutral-500">
          <NavIcon name="pin" className="size-3.5 shrink-0" />
          {location.name}
        </p>
        <p className="font-heading text-primary text-2xl font-bold">
          {Math.round(current.temp)}°{' '}
          <span className="text-base font-medium text-neutral-600">{current.description}</span>
        </p>
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <NavIcon name="droplet" className="size-3.5" />
            {current.humidity}%
          </span>
          <span className="inline-flex items-center gap-1">
            <NavIcon name="wind" className="size-3.5" />
            {Math.round(current.windKmh)} km/h
          </span>
          {today && today.pop > 0 && <span>Mưa {Math.round(today.pop * 100)}%</span>}
        </p>
        {insightSummary && <p className="text-primary mt-1 truncate text-sm">{insightSummary}</p>}
      </div>
      <NavIcon name="arrow-right" className="text-secondary size-5 shrink-0" aria-hidden />
    </Link>
  )
}
