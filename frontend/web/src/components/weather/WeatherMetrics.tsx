import { NavIcon, type NavIconName } from '@/components/layout'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'

interface WeatherMetricsProps {
  data: WeatherSnapshot
}

type Extra = 'eye' | 'cloud' | 'sunrise' | 'sunset' | 'gauge' | 'rain'

/** Icon inline cho chỉ số chưa có trong NavIcon */
function ExtraIcon({ kind }: { kind: Extra }) {
  const d = {
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    cloud: 'M7 17a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.25 4.25 0 0 1 .5 8.5H7z',
    sunrise: 'M4 18h16 M12 14a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z M12 3v6 M9 6l3-3 3 3 M3 14h2M19 14h2',
    sunset: 'M4 18h16 M12 14a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z M12 9V3 M9 6l3 3 3-3 M3 14h2M19 14h2',
    gauge: 'M12 20a8 8 0 1 1 8-8 M12 12l4-3 M12 12h.01',
    rain: 'M7 13a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 4.5a4.25 4.25 0 0 1 .5 8.5H7z M8 16l-1 3 M12 16l-1 3 M16 16l-1 3',
  }[kind]
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
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

/** Lưới 8 ô chỉ số hiện tại (cảm giác, độ ẩm, gió, áp suất, tầm nhìn, mây, mặt trời mọc/lặn) */
export function WeatherMetrics({ data }: WeatherMetricsProps) {
  const { current, timezoneOffset } = data
  const items: Array<{ label: string; value: string; icon: NavIconName | { kind: Extra } }> = [
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
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="card-3d rounded-card bg-surface-cream flex items-center gap-3 border border-neutral-200/80 p-4"
        >
          <span className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-2xl">
            {typeof it.icon === 'string' ? (
              <NavIcon name={it.icon} className="size-5" />
            ) : (
              <ExtraIcon kind={it.icon.kind} />
            )}
          </span>
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
              {it.label}
            </dt>
            <dd className="font-heading text-primary truncate text-xl font-bold">{it.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
