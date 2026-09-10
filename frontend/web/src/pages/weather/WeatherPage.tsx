import { useCallback, useEffect, useRef } from 'react'
import { Alert, EmptyState, IconButton, MedicalDisclaimer } from '@/components/common'
import { DailyForecast, HourlyStrip, WeatherInsightCard } from '@/components/weather'
import { useLocationBar } from '@/components/weather/useLocationBar'
import { WeatherHero } from '@/components/weather/WeatherHero'
import { WeatherMetrics } from '@/components/weather/WeatherMetrics'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchWeather, fetchWeatherInsight } from '@/redux/slices/weatherSlice'
import type { WeatherLocationQuery } from '@/types'

/**
 * Trang Thời tiết (bento như Tổng quan): banner nhiệt độ + vị trí, 8 ô chỉ số + 24h + 5 ngày bên trái,
 * "Ảnh hưởng đến bạn" bên phải cao bằng cột trái. Tự định vị khi mở trang; từ chối thì nhập thành phố.
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
    onDark: true,
  })

  const statusText = geo.loading
    ? 'Đang xác định vị trí của bạn...'
    : loading
      ? 'Đang tải thời tiết...'
      : geo.error
        ? 'Không lấy được vị trí tự động, hãy nhập tên thành phố'
        : 'Chưa có vị trí'

  return (
    <div className="space-y-6">
      <WeatherHero data={data} statusText={statusText} actions={location.actions} />
      {location.panel}

      {status === 'failed' && error && <Alert variant="error">{error}</Alert>}

      {(loading || geo.loading) && !data && (
        <div className="grid gap-4 lg:grid-cols-4" aria-busy aria-label="Đang tải thời tiết">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-card h-20 animate-pulse bg-neutral-200" />
          ))}
        </div>
      )}

      {data && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <WeatherMetrics data={data} />
              <HourlyStrip items={data.hourly} timezoneOffset={data.timezoneOffset} />
              <DailyForecast items={data.daily} />
            </div>

            {/* Ở xl: cột phải cao đúng bằng cột trái, nội dung dư cuộn bên trong thẻ */}
            <div className="relative xl:col-span-4">
              <div className="xl:absolute xl:inset-0">
                <WeatherInsightCard
                  insight={insight}
                  status={insightStatus}
                  error={insightError}
                  onRetry={retryInsight}
                  compact
                />
              </div>
            </div>
          </div>
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
    </div>
  )
}
