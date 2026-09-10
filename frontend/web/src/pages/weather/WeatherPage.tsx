import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  EmptyState,
  IconButton,
  MedicalDisclaimer,
  PageHeader,
  SectionCard,
} from '@/components/common'
import { NavIcon } from '@/components/layout'
import {
  CurrentWeatherCard,
  DailyForecast,
  HourlyStrip,
  WeatherInsightCard,
} from '@/components/weather'
import { useLocationBar } from '@/components/weather/useLocationBar'
import { ROUTES } from '@/constants'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchWeather, fetchWeatherInsight } from '@/redux/slices/weatherSlice'
import type { WeatherLocationQuery } from '@/types'

/**
 * Trang Thời tiết (AI-02): tự định vị khi mở trang; trình duyệt từ chối thì nhập tay thành phố.
 * Vị trí chỉ nhớ trong phiên.
 */
export function WeatherPage() {
  const dispatch = useAppDispatch()
  const { data, query, status, error, insight, insightStatus, insightError } = useAppSelector(
    (s) => s.weather,
  )
  const geo = useGeolocation()
  const askedGeo = useRef(false)

  const locate = useCallback(() => {
    geo.request((c) => void dispatch(fetchWeather({ lat: c.lat, lon: c.lng })))
  }, [geo, dispatch])

  // Chưa có vị trí trong phiên → xin định vị ngay khi mở trang (chỉ một lần)
  useEffect(() => {
    if (query || askedGeo.current) return
    askedGeo.current = true
    locate()
  }, [query, locate])

  useEffect(() => {
    if (query && !data && status === 'idle') void dispatch(fetchWeather(query))
  }, [dispatch, query, data, status])

  useEffect(() => {
    if (data && query && insightStatus === 'idle') void dispatch(fetchWeatherInsight(query))
  }, [dispatch, data, query, insightStatus])

  const retryInsight = useCallback(() => {
    if (query) void dispatch(fetchWeatherInsight(query))
  }, [dispatch, query])

  const select = useCallback(
    (q: WeatherLocationQuery) => void dispatch(fetchWeather(q)),
    [dispatch],
  )

  const loading = status === 'loading'
  const location = useLocationBar({
    onSelect: select,
    onLocate: locate,
    loading,
    locating: geo.loading,
    geoError: geo.error,
    defaultOpen: !query && !geo.loading && Boolean(geo.error),
  })

  const placeName = data?.location.name ?? null
  const subtitle = geo.loading
    ? 'Đang xác định vị trí...'
    : placeName
      ? placeName
      : geo.error
        ? 'Không lấy được vị trí tự động'
        : 'Chưa có vị trí'

  return (
    <section className="space-y-5">
      <PageHeader icon="weather" title="Thời tiết" subtitle={subtitle} actions={location.actions} />
      {location.panel}

      <Link to={`${ROUTES.CHAT}?mode=food`} className="block">
        <SectionCard tone="teal" lift className="flex items-center gap-4 py-4">
          <span className="bg-surface text-secondary flex size-11 shrink-0 items-center justify-center rounded-2xl">
            <NavIcon name="food" className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-secondary-700 truncate font-bold">
              Ăn gì cho thời tiết này?
            </p>
            <p className="truncate text-sm text-neutral-600">
              Gợi ý theo {placeName ?? 'nơi bạn ở'} hôm nay và thể trạng của bạn
            </p>
          </div>
          <span
            aria-hidden
            className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-full text-white"
          >
            <NavIcon name="arrow-right" className="size-5" />
          </span>
        </SectionCard>
      </Link>

      {status === 'failed' && error && <Alert variant="error">{error}</Alert>}

      {(loading || geo.loading) && !data && (
        <div
          className="rounded-card h-56 animate-pulse bg-neutral-200"
          aria-busy
          aria-label="Đang tải thời tiết"
        />
      )}

      {data && (
        <div className={loading ? 'space-y-5 opacity-60 transition' : 'space-y-5 transition'}>
          <CurrentWeatherCard data={data} />
          <WeatherInsightCard
            insight={insight}
            status={insightStatus}
            error={insightError}
            onRetry={retryInsight}
          />
          <HourlyStrip items={data.hourly} timezoneOffset={data.timezoneOffset} />
          <DailyForecast items={data.daily} />
        </div>
      )}

      {!data && !loading && !geo.loading && (
        <EmptyState
          icon="pin"
          title="Chưa có vị trí"
          hint="Định vị tự động hoặc nhập tên thành phố để xem thời tiết."
          action={
            <IconButton
              icon="target"
              label="Định vị"
              variant="primary"
              size="lg"
              onClick={locate}
              tooltipSide="top"
            />
          }
        />
      )}

      <MedicalDisclaimer />
    </section>
  )
}
