import { WeatherIcon } from './WeatherIcon'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'

interface CurrentWeatherCardProps {
  data: WeatherSnapshot
}

/** Khối thời tiết hiện tại: nhiệt độ lớn, mô tả, các chỉ số phụ */
export function CurrentWeatherCard({ data }: CurrentWeatherCardProps) {
  const { location, current, timezoneOffset } = data
  const details = [
    { label: 'Cảm giác như', value: `${Math.round(current.feelsLike)}°` },
    { label: 'Độ ẩm', value: `${current.humidity}%` },
    { label: 'Gió', value: `${Math.round(current.windKmh)} km/h` },
    { label: 'Áp suất', value: `${current.pressure} hPa` },
    {
      label: 'Tầm nhìn',
      value: current.visibilityKm !== null ? `${current.visibilityKm} km` : '—',
    },
    { label: 'Mây', value: current.clouds !== null ? `${current.clouds}%` : '—' },
    { label: 'Mặt trời mọc', value: formatTime(current.sunrise, timezoneOffset) },
    { label: 'Mặt trời lặn', value: formatTime(current.sunset, timezoneOffset) },
  ]
  return (
    <section className="card-3d rounded-card from-primary to-primary-700 overflow-hidden bg-linear-to-br text-white [--card-edge:var(--color-primary-900)]">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/70">
            {location.name}
            {location.country ? `, ${location.country}` : ''}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-heading text-6xl font-bold">{Math.round(current.temp)}°</span>
            <div>
              <p className="text-lg font-semibold">{current.description}</p>
              <p className="text-sm text-white/70">
                Thấp {Math.round(current.tempMin)}° · Cao {Math.round(current.tempMax)}°
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Cập nhật {formatTime(current.observedAt, timezoneOffset)}
            {data.cached ? ' (từ bộ nhớ đệm)' : ''}
          </p>
        </div>
        <WeatherIcon code={current.icon} alt={current.description} className="size-28 shrink-0" />
      </div>
      <dl className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {details.map((d) => (
          <div key={d.label} className="bg-primary-800/60 px-4 py-3">
            <dt className="text-xs text-white/60">{d.label}</dt>
            <dd className="font-heading text-base font-semibold">{d.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
