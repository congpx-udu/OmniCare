import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Alert, MedicalDisclaimer } from '@/components/common'
import {
  CurrentWeatherCard,
  DailyForecast,
  HourlyStrip,
  LocationBar,
  WeatherInsightCard,
} from '@/components/weather'
import { ROUTES } from '@/constants'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchWeather, fetchWeatherInsight } from '@/redux/slices/weatherSlice'
import type { WeatherLocationQuery } from '@/types'

/**
 * Trang Thời tiết (AI-02): tự định vị khi mở trang để hiện thời tiết tại chỗ của người dùng;
 * trình duyệt từ chối thì nhập tay thành phố. Vị trí chỉ nhớ trong phiên.
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

  // Có vị trí nhớ từ phiên này mà chưa có dữ liệu thì tự tải lại
  useEffect(() => {
    if (query && !data && status === 'idle') void dispatch(fetchWeather(query))
  }, [dispatch, query, data, status])

  // Có thời tiết rồi thì hỏi AI "ảnh hưởng đến bạn" (backend cache 30 phút)
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
  const placeName = data?.location.name ?? 'nơi bạn ở'

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl">Thời tiết</h1>
          <LocationBar
            onSelect={select}
            onLocate={locate}
            loading={loading}
            locating={geo.loading}
            currentName={data?.location.name}
            geoError={geo.error}
            defaultOpen={!query && !geo.loading && Boolean(geo.error)}
          />
        </div>

        <Link
          to={`${ROUTES.CHAT}?mode=food`}
          className="card-3d rounded-card bg-secondary-50 border-secondary/30 flex flex-col gap-3 border p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 className="text-secondary-700 text-lg">Ăn gì cho thời tiết này?</h3>
            <p className="text-sm text-neutral-600">
              Trợ lý AI sẽ gợi ý món ăn hợp với {placeName} hôm nay và thể trạng của bạn.
            </p>
          </div>
          <span className="bg-secondary hover:bg-secondary-600 font-heading inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition">
            Gợi ý món ăn
          </span>
        </Link>
      </div>

      {status === 'failed' && error && <Alert variant="error">{error}</Alert>}

      {(loading || geo.loading) && !data && (
        <div
          className="rounded-card h-56 animate-pulse bg-neutral-200"
          aria-busy
          aria-label="Đang tải thời tiết"
        />
      )}

      {data && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="space-y-6">
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
        </div>
      )}

      {!data && !loading && !geo.loading && (
        <div className="rounded-card border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Chưa có vị trí. Bấm "Định vị lại" hoặc "Đổi vị trí" để nhập tên thành phố.
        </div>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
