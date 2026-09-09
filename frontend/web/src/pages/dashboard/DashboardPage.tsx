import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Alert, MedicalDisclaimer } from '@/components/common'
import { ShortcutCard, SleepBarsCard, StatCard, WeightTrendCard } from '@/components/dashboard'
import { RecordCard } from '@/components/records'
import { CurrentWeatherCard, WeatherInsightCard } from '@/components/weather'
import { BMI_LABELS, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchProfile } from '@/redux/slices/profileSlice'
import { fetchRecords } from '@/redux/slices/recordsSlice'
import { fetchAdvice, fetchLogs } from '@/redux/slices/trackingSlice'
import { fetchWeather, fetchWeatherInsight } from '@/redux/slices/weatherSlice'
import type { NavIconName } from '@/components/layout/NavIcon'

const SHORTCUTS: ReadonlyArray<{ to: string; icon: NavIconName; title: string; desc: string }> = [
  {
    to: `${ROUTES.CHAT}?mode=symptom`,
    icon: 'chat',
    title: 'Trợ lý sức khỏe AI',
    desc: 'Mô tả triệu chứng để nhận dự đoán, cảnh báo và gợi ý chuyên khoa.',
  },
  {
    to: `${ROUTES.CHAT}?mode=food`,
    icon: 'food',
    title: 'Gợi ý món ăn hôm nay',
    desc: 'Thực đơn phù hợp thời tiết, giờ giấc và tình trạng sức khỏe.',
  },
  {
    to: ROUTES.WEATHER,
    icon: 'weather',
    title: 'Dự báo thời tiết',
    desc: 'Theo dõi thời tiết và khuyến nghị sức khỏe theo ngày.',
  },
  {
    to: ROUTES.RECORDS,
    icon: 'scan',
    title: 'Hồ sơ bệnh án',
    desc: 'Tải lên ảnh bệnh án, đơn thuốc và lưu trữ an toàn.',
  },
]

/** Màu chữ cho AQI 1-5 của OpenWeather */
const AQI_TONE: Record<number, string> = {
  1: 'text-secondary-700',
  2: 'text-secondary-600',
  3: 'text-warning',
  4: 'text-danger',
  5: 'text-danger',
}

/** Trang Tổng quan: chỉ số nhanh, biểu đồ 7 ngày, thời tiết + ảnh hưởng, bệnh án, nhật ký, lối tắt */
export function DashboardPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const { profile, status } = useAppSelector((s) => s.profile)
  const weather = useAppSelector((s) => s.weather)
  const records = useAppSelector((s) => s.records)
  const tracking = useAppSelector((s) => s.tracking)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchProfile())
  }, [dispatch, status])

  // Có vị trí nhớ trong phiên thì tải thời tiết, sau đó hỏi AI "ảnh hưởng đến bạn"
  useEffect(() => {
    if (weather.query && !weather.data && weather.status === 'idle') {
      void dispatch(fetchWeather(weather.query))
    }
  }, [dispatch, weather.query, weather.data, weather.status])

  useEffect(() => {
    if (weather.data && weather.query && weather.insightStatus === 'idle') {
      void dispatch(fetchWeatherInsight(weather.query))
    }
  }, [dispatch, weather.data, weather.query, weather.insightStatus])

  const retryInsight = useCallback(() => {
    if (weather.query) void dispatch(fetchWeatherInsight(weather.query))
  }, [dispatch, weather.query])

  useEffect(() => {
    if (records.listStatus === 'idle') void dispatch(fetchRecords({ limit: 3 }))
  }, [dispatch, records.listStatus])

  useEffect(() => {
    if (tracking.logsStatus === 'idle') void dispatch(fetchLogs(30))
  }, [dispatch, tracking.logsStatus])

  useEffect(() => {
    if (tracking.adviceStatus === 'idle') void dispatch(fetchAdvice())
  }, [dispatch, tracking.adviceStatus])

  const logs = tracking.logs
  // Nhật ký sắp xếp tăng dần theo ngày, lấy giá trị gần nhất có ghi
  const latestHeartRate = [...logs].reverse().find((l) => l.heartRate !== null)?.heartRate ?? null
  const latestSleep = [...logs].reverse().find((l) => l.sleepHours !== null)?.sleepHours ?? null
  const air = weather.data?.airQuality ?? null
  const bmi = profile?.bmi ?? null
  const bmiLabel = bmi !== null ? (BMI_LABELS.find((b) => bmi < b.max) ?? BMI_LABELS.at(-1)) : null

  const latestAdvice = tracking.advice[0] ?? null
  const latestRecord = records.items[0] ?? null
  const needsProfile = profile !== null && !profile.isComplete

  return (
    <section className="space-y-6">
      <h1 className="font-mono text-2xl font-semibold tracking-[0.12em] uppercase sm:text-3xl">
        Xin chào, {user?.fullName ?? 'bạn'}
      </h1>

      {needsProfile && (
        <Alert variant="warning">
          Hồ sơ sức khỏe của bạn chưa đủ chiều cao, cân nặng và ngày sinh.{' '}
          <Link to={ROUTES.PROFILE} className="font-semibold underline">
            Hoàn thiện ngay
          </Link>{' '}
          để trợ lý AI đưa ra gợi ý sát với thể trạng của bạn.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nhịp tim"
          icon="heart"
          value={latestHeartRate !== null ? String(latestHeartRate) : '—'}
          unit={latestHeartRate !== null ? 'bpm' : undefined}
          sub={latestHeartRate === null ? 'Chưa ghi' : undefined}
          to={ROUTES.TRACKING}
        />
        <StatCard
          label="Giấc ngủ"
          icon="moon"
          value={latestSleep !== null ? latestSleep.toFixed(1) : '—'}
          unit={latestSleep !== null ? 'giờ' : undefined}
          sub={latestSleep === null ? 'Chưa ghi' : undefined}
          to={ROUTES.TRACKING}
        />
        <StatCard
          label="Chất lượng không khí"
          icon="wind"
          value={air ? air.label : '—'}
          sub={air ? `AQI ${air.aqi}/5 · PM2.5 ${air.pm25}` : 'Chọn vị trí'}
          tone={air ? AQI_TONE[air.aqi] : undefined}
          to={ROUTES.WEATHER}
        />
        <StatCard
          label="BMI"
          icon="scale"
          value={bmi !== null ? bmi.toFixed(1) : '—'}
          sub={bmiLabel?.label ?? 'Cần số đo'}
          tone={bmiLabel?.tone}
          to={ROUTES.PROFILE}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeightTrendCard logs={logs} profileWeightKg={profile?.weightKg ?? null} />
        <SleepBarsCard logs={logs} />
      </div>

      {weather.data ? (
        <>
          <CurrentWeatherCard data={weather.data} />
          <WeatherInsightCard
            insight={weather.insight}
            status={weather.insightStatus}
            error={weather.insightError}
            onRetry={retryInsight}
          />
        </>
      ) : (
        <Link
          to={ROUTES.WEATHER}
          className="rounded-card bg-surface-cream hover:border-primary-200 flex items-center justify-between border border-neutral-200/80 p-5 transition hover:shadow-md"
        >
          <div>
            <h3 className="text-lg">Thời tiết & ảnh hưởng đến bạn</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {weather.status === 'loading'
                ? 'Đang tải thời tiết...'
                : 'Chọn vị trí để xem thời tiết, chất lượng không khí và lưu ý sức khỏe hôm nay.'}
            </p>
          </div>
          <span className="text-secondary shrink-0 text-sm font-semibold">Chọn vị trí →</span>
        </Link>
      )}

      {latestRecord && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">Bệnh án gần nhất</h2>
            <Link
              to={ROUTES.RECORDS}
              className="text-secondary text-sm font-semibold hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <RecordCard record={latestRecord} />
        </div>
      )}

      {latestAdvice && (
        <Link
          to={ROUTES.TRACKING}
          className="rounded-card bg-surface hover:border-primary-200 block border border-neutral-200 p-5 transition hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg">Nhật ký sức khỏe</h3>
            <span className="bg-secondary-50 text-secondary-700 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {latestAdvice.suggestions.filter((s) => s.done).length}/
              {latestAdvice.suggestions.length} đề xuất đã làm
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-700">{latestAdvice.summary}</p>
          {latestAdvice.suggestions.find((s) => !s.done) && (
            <p className="text-primary mt-2 text-sm font-semibold">
              Tiếp theo: {latestAdvice.suggestions.find((s) => !s.done)!.title}
            </p>
          )}
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {SHORTCUTS.map((s) => (
          <ShortcutCard key={s.to} {...s} />
        ))}
      </div>

      <MedicalDisclaimer />
    </section>
  )
}
