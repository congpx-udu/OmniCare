import { useCallback, useEffect } from 'react'
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
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchWeather, fetchWeatherInsight } from '@/redux/slices/weatherSlice'
import type { WeatherLocationQuery } from '@/types'

/** Trang Thời tiết & vị trí (AI-02): hiện tại, 24 giờ, 5 ngày. Khối "ảnh hưởng đến bạn" sẽ thêm khi có AI (giai đoạn 3). */
export function WeatherPage() {
  const dispatch = useAppDispatch()
  const { data, query, status, error, insight, insightStatus, insightError } = useAppSelector(
    (s) => s.weather,
  )

  // Có vị trí nhớ từ phiên trước mà chưa có dữ liệu thì tự tải lại
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

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl">Thời tiết & vị trí</h1>
        <p className="text-neutral-600">
          Thời tiết tại nơi bạn ở được dùng để gợi ý món ăn và vận động phù hợp. Vị trí chỉ được lấy
          khi bạn bấm, và chỉ nhớ trong phiên này.
        </p>
      </div>

      <LocationBar onSelect={select} loading={loading} currentName={data?.location.name} />

      {status === 'failed' && error && <Alert variant="error">{error}</Alert>}

      {loading && !data && (
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
            <div className="rounded-card bg-secondary-50 border-secondary/30 flex flex-col gap-3 border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-secondary-700 text-lg">Ăn gì cho thời tiết này?</h3>
                <p className="text-sm text-neutral-600">
                  Trợ lý AI sẽ gợi ý món ăn hợp với {data.location.name} hôm nay và thể trạng của
                  bạn.
                </p>
              </div>
              <Link
                to={`${ROUTES.CHAT}?mode=food`}
                className="bg-secondary hover:bg-secondary-600 font-heading inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Gợi ý món ăn
              </Link>
            </div>
          </div>
        </div>
      )}

      {!data && status !== 'loading' && (
        <div className="rounded-card border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Chưa có vị trí. Bấm "Dùng vị trí hiện tại" hoặc nhập tên thành phố phía trên.
        </div>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
