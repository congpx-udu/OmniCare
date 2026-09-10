import { WeatherIcon } from './WeatherIcon'
import { NavIcon, type NavIconName } from '@/components/layout'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'

interface CurrentWeatherCardProps {
  data: WeatherSnapshot
}

/** Icon inline cho chỉ số chưa có trong NavIcon */
function DetailIcon({ kind }: { kind: 'eye' | 'cloud' | 'sunrise' | 'sunset' | 'gauge' }) {
  const d = {
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    cloud: 'M7 17a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.25 4.25 0 0 1 .5 8.5H7z',
    sunrise: 'M4 18h16 M12 14a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z M12 3v6 M9 6l3-3 3 3 M3 14h2M19 14h2',
    sunset: 'M4 18h16 M12 14a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z M12 9V3 M9 6l3 3 3-3 M3 14h2M19 14h2',
    gauge: 'M12 20a8 8 0 1 1 8-8 M12 12l4-3 M12 12h.01',
  }[kind]
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

/** Khối thời tiết hiện tại: nhiệt độ lớn + 8 chỉ số dạng ô icon, nền navy nổi 3D */
export function CurrentWeatherCard({ data }: CurrentWeatherCardProps) {
  const { location, current, timezoneOffset } = data
  const details: Array<{
    label: string
    value: string
    icon: NavIconName | { kind: 'eye' | 'cloud' | 'sunrise' | 'sunset' | 'gauge' }
  }> = [
    { label: 'Cảm giác', value: `${Math.round(current.feelsLike)}°`, icon: 'thermometer' },
    { label: 'Độ ẩm', value: `${current.humidity}%`, icon: 'droplet' },
    { label: 'Gió', value: `${Math.round(current.windKmh)} km/h`, icon: 'wind' },
    { label: 'Áp suất', value: `${current.pressure} hPa`, icon: { kind: 'gauge' } },
    {
      label: 'Tầm nhìn',
      value: current.visibilityKm !== null ? `${current.visibilityKm} km` : '—',
      icon: { kind: 'eye' },
    },
    {
      label: 'Mây',
      value: current.clouds !== null ? `${current.clouds}%` : '—',
      icon: { kind: 'cloud' },
    },
    {
      label: 'Mặt trời mọc',
      value: formatTime(current.sunrise, timezoneOffset),
      icon: { kind: 'sunrise' },
    },
    {
      label: 'Mặt trời lặn',
      value: formatTime(current.sunset, timezoneOffset),
      icon: { kind: 'sunset' },
    },
  ]
  return (
    <section className="card-3d rounded-card from-primary to-primary-700 overflow-hidden bg-linear-to-br text-white [--card-edge:var(--color-primary-900)]">
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm text-white/70">
            <NavIcon name="pin" className="size-4 shrink-0" />
            <span className="truncate">
              {location.name}
              {location.country ? `, ${location.country}` : ''}
            </span>
          </p>
          <div className="mt-1 flex items-end gap-3">
            <span className="font-heading text-6xl leading-none font-bold sm:text-7xl">
              {Math.round(current.temp)}°
            </span>
            <div className="pb-1">
              <p className="text-lg leading-tight font-semibold">{current.description}</p>
              <p className="text-sm text-white/70">
                {Math.round(current.tempMin)}° · {Math.round(current.tempMax)}°
              </p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-white/60">
            <NavIcon name="clock" className="size-3.5" />
            {formatTime(current.observedAt, timezoneOffset)}
            {data.cached ? ' · bộ nhớ đệm' : ''}
          </p>
        </div>
        <WeatherIcon
          code={current.icon}
          alt={current.description}
          className="size-24 shrink-0 sm:size-28"
        />
      </div>
      <dl className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        {details.map((d) => (
          <div key={d.label} className="bg-primary-800/60 flex items-center gap-3 px-4 py-3">
            <span className="bg-secondary/20 text-secondary-200 flex size-8 shrink-0 items-center justify-center rounded-lg">
              {typeof d.icon === 'string' ? (
                <NavIcon name={d.icon} className="size-4" />
              ) : (
                <DetailIcon kind={d.icon.kind} />
              )}
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] text-white/60">{d.label}</dt>
              <dd className="font-heading truncate text-base font-semibold">{d.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
