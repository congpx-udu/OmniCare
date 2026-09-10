import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NavIcon } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { WeatherSnapshot } from '@/types'
import { formatTime } from '@/utils'
import { WeatherIcon } from './WeatherIcon'

interface WeatherHeroProps {
  data: WeatherSnapshot | null
  /** Trạng thái khi chưa có dữ liệu */
  statusText: string
  /** Nút icon điều khiển vị trí (đổi vị trí / định vị lại) */
  actions?: ReactNode
}

const AQI_CLASS: Record<number, string> = {
  1: 'bg-secondary-300/30',
  2: 'bg-secondary-300/30',
  3: 'bg-warning/40',
  4: 'bg-danger/50',
  5: 'bg-danger/50',
}

/** Banner trang Thời tiết: nhiệt độ lớn, mô tả, vị trí, AQI, nút vị trí và lối tắt "Ăn gì" */
export function WeatherHero({ data, statusText, actions }: WeatherHeroProps) {
  const air = data?.airQuality ?? null
  return (
    <section className="from-primary via-primary-700 to-tertiary-700 relative overflow-hidden rounded-[1.5rem] bg-linear-to-br p-6 text-white shadow-[0_24px_48px_-20px_rgba(11,37,69,0.5)] sm:p-8">
      <span
        aria-hidden
        className="bg-tertiary-300/20 pointer-events-none absolute -top-24 -right-10 size-72 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-secondary-300/20 pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-white/80">
            <NavIcon name="pin" className="size-4 shrink-0" />
            <span className="truncate">
              {data
                ? `${data.location.name}${data.location.country ? `, ${data.location.country}` : ''}`
                : statusText}
            </span>
          </p>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>

        {data ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <WeatherIcon
                code={data.current.icon}
                alt={data.current.description}
                className="size-24 shrink-0 sm:size-28"
              />
              <div className="min-w-0">
                <p className="font-heading text-6xl leading-none font-bold sm:text-7xl">
                  {Math.round(data.current.temp)}°
                </p>
                <p className="mt-2 text-lg font-semibold capitalize">{data.current.description}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                  <span>
                    {Math.round(data.current.tempMin)}° / {Math.round(data.current.tempMax)}°
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <NavIcon name="clock" className="size-3.5" />
                    {formatTime(data.current.observedAt, data.timezoneOffset)}
                  </span>
                  {air && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${AQI_CLASS[air.aqi] ?? 'bg-white/20'}`}
                    >
                      Không khí {air.label.toLowerCase()} · AQI {air.aqi}/5
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Link
              to={`${ROUTES.CHAT}?mode=food`}
              className="group flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              <span className="text-primary flex size-11 shrink-0 items-center justify-center rounded-xl bg-white">
                <NavIcon name="food" className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="font-heading block font-bold">Ăn gì cho thời tiết này?</span>
                <span className="block text-xs text-white/75">
                  Gợi ý theo {data.location.name} và thể trạng của bạn
                </span>
              </span>
              <NavIcon
                name="arrow-right"
                className="ml-1 size-5 shrink-0 transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15">
              <NavIcon name="weather" className="size-8" />
            </span>
            <div>
              <p className="font-heading text-2xl font-bold">Thời tiết nơi bạn ở</p>
              <p className="text-sm text-white/75">{statusText}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
