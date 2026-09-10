import { RainChance } from './RainChance'
import { WeatherIcon } from './WeatherIcon'
import { SectionCard } from '@/components/common'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'

interface HourlyStripProps {
  items: WeatherSnapshot['hourly']
  timezoneOffset: number
}

/** Dải 24 giờ tới (mỗi 3 giờ), cuộn ngang mượt, có snap */
export function HourlyStrip({ items, timezoneOffset }: HourlyStripProps) {
  return (
    <SectionCard icon="clock" title="24 giờ tới">
      <div className="-mx-2 flex snap-x snap-mandatory [scrollbar-width:thin] gap-2 overflow-x-auto px-2 pb-1">
        {items.map((h, i) => (
          <div
            key={h.at}
            className={
              i === 0
                ? 'bg-secondary-50 border-secondary/30 flex min-w-[5.5rem] flex-1 snap-start flex-col items-center rounded-xl border px-2 py-3 text-center'
                : 'bg-surface-muted/60 flex min-w-[5.5rem] flex-1 snap-start flex-col items-center rounded-xl px-2 py-3 text-center'
            }
          >
            <span className="text-xs font-semibold text-neutral-500">
              {i === 0 ? 'Bây giờ' : formatTime(h.at, timezoneOffset)}
            </span>
            <WeatherIcon code={h.icon} alt={h.description} className="size-10" />
            <span className="font-heading text-primary text-lg font-bold">
              {Math.round(h.temp)}°
            </span>
            <RainChance pop={h.pop} className="h-4" />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
