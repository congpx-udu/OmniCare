import { Link } from 'react-router-dom'
import { NavIcon } from '@/components/layout'
import { WeatherIcon } from '@/components/weather'
import { ROUTES } from '@/constants'
import type { WeatherSnapshot } from '@/types'

interface HeroBannerProps {
  name: string
  weather: WeatherSnapshot | null
  weatherLoading: boolean
}

function greeting(hour: number) {
  if (hour < 11) return 'Chào buổi sáng'
  if (hour < 14) return 'Chào buổi trưa'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

const AQI_LABEL_CLASS: Record<number, string> = {
  1: 'bg-secondary-300/30 text-white',
  2: 'bg-secondary-300/30 text-white',
  3: 'bg-warning/30 text-white',
  4: 'bg-danger/40 text-white',
  5: 'bg-danger/40 text-white',
}

/** Banner đầu Tổng quan: lời chào theo giờ, ngày, thời tiết hiện tại và 2 lối tắt chính */
export function HeroBanner({ name, weather, weatherLoading }: HeroBannerProps) {
  const now = new Date()
  const date = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
  const air = weather?.airQuality ?? null

  return (
    <section className="from-primary via-primary-700 to-secondary-700 relative overflow-hidden rounded-[1.5rem] bg-linear-to-br p-6 text-white shadow-[0_24px_48px_-20px_rgba(11,37,69,0.5)] sm:p-8">
      {/* Vòng sáng trang trí */}
      <span
        aria-hidden
        className="bg-secondary-300/20 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
      />
      <span
        aria-hidden
        className="bg-tertiary-300/20 pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/70 capitalize">{date}</p>
          <h1 className="mt-1 text-3xl leading-tight font-bold text-white sm:text-4xl">
            {greeting(now.getHours())}, {name}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to={ROUTES.CHAT}
              className="font-heading text-primary inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-neutral-100 active:scale-95"
            >
              <NavIcon name="chat" className="size-5" />
              Hỏi trợ lý AI
            </Link>
            <Link
              to={ROUTES.TRACKING}
              className="font-heading inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <NavIcon name="plus" className="size-5" />
              Ghi nhật ký hôm nay
            </Link>
          </div>
        </div>

        <Link
          to={ROUTES.WEATHER}
          aria-label="Xem thời tiết"
          className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur transition hover:bg-white/15"
        >
          {weather ? (
            <>
              <WeatherIcon
                code={weather.current.icon}
                alt={weather.current.description}
                className="size-16"
              />
              <div className="min-w-0">
                <p className="font-heading text-4xl leading-none font-bold">
                  {Math.round(weather.current.temp)}°
                </p>
                <p className="mt-1 truncate text-sm text-white/80">{weather.current.description}</p>
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/60">
                  <NavIcon name="pin" className="size-3.5 shrink-0" />
                  {weather.location.name}
                </p>
              </div>
              {air && (
                <span
                  className={`ml-1 hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${AQI_LABEL_CLASS[air.aqi] ?? 'bg-white/20'}`}
                >
                  AQI {air.aqi}/5
                </span>
              )}
            </>
          ) : (
            <>
              <span className="flex size-12 items-center justify-center rounded-xl bg-white/15">
                <NavIcon name="pin" className="size-6" />
              </span>
              <div>
                <p className="font-heading font-semibold">
                  {weatherLoading ? 'Đang tải thời tiết...' : 'Chọn vị trí'}
                </p>
                <p className="text-xs text-white/70">Để nhận lưu ý theo thời tiết hôm nay</p>
              </div>
            </>
          )}
        </Link>
      </div>
    </section>
  )
}
