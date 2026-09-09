import { RainChance } from './RainChance'
import { WeatherIcon } from './WeatherIcon'
import type { WeatherSnapshot } from '@/types'
import { formatWeekday } from '@/utils'

interface DailyForecastProps {
  items: WeatherSnapshot['daily']
}

/** Dự báo 5 ngày: mỗi dòng là một ngày, thanh nhiệt độ min–max */
export function DailyForecast({ items }: DailyForecastProps) {
  const min = Math.min(...items.map((d) => d.tempMin))
  const max = Math.max(...items.map((d) => d.tempMax))
  const span = Math.max(max - min, 1)
  return (
    <section className="space-y-3">
      <h2 className="text-lg">5 ngày tới</h2>
      <div className="rounded-card bg-surface divide-y divide-neutral-100 border border-neutral-200">
        {items.map((d, i) => {
          const left = ((d.tempMin - min) / span) * 100
          const width = ((d.tempMax - d.tempMin) / span) * 100
          return (
            <div
              key={d.date}
              className="grid grid-cols-[5rem_2.5rem_1fr_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[6rem_2.5rem_1fr_7rem_auto]"
            >
              <span className="font-heading text-primary text-sm font-semibold">
                {i === 0 ? 'Hôm nay' : formatWeekday(d.date)}
              </span>
              <WeatherIcon code={d.icon} alt={d.description} className="size-10" />
              <span className="hidden truncate text-sm text-neutral-600 sm:block">
                {d.description}
              </span>
              <RainChance pop={d.pop} className="sm:hidden" />
              <div className="hidden items-center gap-2 sm:flex">
                <RainChance pop={d.pop} className="w-12 justify-end" />
                <div className="relative h-1.5 flex-1 rounded-full bg-neutral-200">
                  <span
                    className="from-tertiary to-warning absolute inset-y-0 rounded-full bg-linear-to-r"
                    style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                  />
                </div>
              </div>
              <span className="text-right text-sm whitespace-nowrap">
                <span className="text-neutral-500">{Math.round(d.tempMin)}°</span>{' '}
                <span className="text-primary font-semibold">{Math.round(d.tempMax)}°</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
