import { RainChance } from './RainChance'
import { WeatherIcon } from './WeatherIcon'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'

interface HourlyStripProps {
  items: WeatherSnapshot['hourly']
  timezoneOffset: number
}

/** Dải dự báo 24 giờ tới (mỗi 3 giờ), cuộn ngang trên mobile */
export function HourlyStrip({ items, timezoneOffset }: HourlyStripProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg">24 giờ tới</h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {items.map((h) => (
          <div
            key={h.at}
            className="rounded-card bg-surface flex min-w-24 flex-1 flex-col items-center border border-neutral-200 px-2 py-3 text-center"
          >
            <span className="text-xs font-semibold text-neutral-500">
              {formatTime(h.at, timezoneOffset)}
            </span>
            <WeatherIcon code={h.icon} alt={h.description} className="size-10" />
            <span className="font-heading text-primary text-lg font-bold">
              {Math.round(h.temp)}°
            </span>
            <RainChance pop={h.pop} className="h-4" />
          </div>
        ))}
      </div>
    </section>
  )
}
