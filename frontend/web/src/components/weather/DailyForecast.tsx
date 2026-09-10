import { RainChance } from './RainChance'
import { WeatherIcon } from './WeatherIcon'
import { SectionCard } from '@/components/common'
import type { WeatherSnapshot } from '@/types'
import { formatWeekday } from '@/utils'

interface DailyForecastProps {
  items: WeatherSnapshot['daily']
}

/** Dự báo 5 ngày: mỗi dòng một ngày, thanh nhiệt độ min–max */
export function DailyForecast({ items }: DailyForecastProps) {
  const min = Math.min(...items.map((d) => d.tempMin))
  const max = Math.max(...items.map((d) => d.tempMax))
  const span = Math.max(max - min, 1)
  return (
    <SectionCard icon="calendar" title="5 ngày tới">
      <div className="divide-y divide-neutral-100">
        {items.map((d, i) => {
          const left = ((d.tempMin - min) / span) * 100
          const width = ((d.tempMax - d.tempMin) / span) * 100
          return (
            <div
              key={d.date}
              className="grid grid-cols-[4.5rem_2.5rem_auto_1fr_auto] items-center gap-3 py-2.5"
              title={d.description}
            >
              <span className="font-heading text-primary text-sm font-semibold">
                {i === 0 ? 'Hôm nay' : formatWeekday(d.date)}
              </span>
              <WeatherIcon code={d.icon} alt={d.description} className="size-10" />
              <RainChance pop={d.pop} className="w-11" />
              <div className="relative h-2 rounded-full bg-neutral-200">
                <span
                  className="from-tertiary to-warning absolute inset-y-0 rounded-full bg-linear-to-r"
                  style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                />
              </div>
              <span className="text-right text-sm whitespace-nowrap tabular-nums">
                <span className="text-neutral-500">{Math.round(d.tempMin)}°</span>{' '}
                <span className="text-primary font-semibold">{Math.round(d.tempMax)}°</span>
              </span>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
