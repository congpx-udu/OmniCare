import { useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Alert,
  EmptyState,
  IconButton,
  MedicalDisclaimer,
  PageHeader,
  SectionCard,
} from '@/components/common'
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
    icon: 'stethoscope',
    title: 'Hỏi trợ lý AI',
    desc: 'Mô tả triệu chứng để nhận đánh giá sơ bộ và gợi ý chuyên khoa',
  },
  {
    to: `${ROUTES.CHAT}?mode=food`,
    icon: 'food',
    title: 'Gợi ý món ăn',
    desc: 'Thực đơn hợp thời tiết, giờ giấc và thể trạng',
  },
  {
    to: ROUTES.WEATHER,
    icon: 'weather',
    title: 'Thời tiết',
    desc: 'Dự báo và khuyến nghị sức khỏe theo ngày',
  },
  {
    to: ROUTES.RECORDS,
    icon: 'scan',
    title: 'Bệnh án',
    desc: 'Tải ảnh đơn thuốc, phiếu khám để AI đọc và lưu trữ',
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

const todayLabel = () =>
  new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/** Trang Tổng quan: chỉ số nhanh, biểu đồ 7 ngày, thời tiết + ảnh hưởng, bệnh án, nhật ký, lối tắt */
export function DashboardPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
  const doneCount = latestAdvice?.suggestions.filter((s) => s.done).length ?? 0
  const nextSuggestion = latestAdvice?.suggestions.find((s) => !s.done) ?? null

  return (
    <section className="space-y-6">
      <PageHeader
        icon="home"
        title={`Xin chào, ${user?.fullName ?? 'bạn'}`}
        subtitle={todayLabel()}
      />

      {needsProfile && (
        <Alert variant="warning">
          Hồ sơ cá nhân chưa có chiều cao và ngày sinh.{' '}
          <Link to={ROUTES.PROFILE} className="font-semibold underline">
            Hoàn thiện ngay
          </Link>
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
          label="Không khí"
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
          sub={bmiLabel?.label ?? (profile?.heightCm ? 'Ghi cân nặng' : 'Cần chiều cao')}
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
        <SectionCard
          tone="cream"
          lift
          icon="pin"
          title={
            weather.status === 'loading' ? 'Đang tải thời tiết...' : 'Chọn vị trí để xem thời tiết'
          }
          actions={
            <IconButton
              icon="arrow-right"
              label="Mở trang Thời tiết"
              onClick={() => navigate(ROUTES.WEATHER)}
            />
          }
          className="cursor-pointer"
          onClick={() => navigate(ROUTES.WEATHER)}
        >
          <p className="text-sm text-neutral-600">
            Thời tiết, chất lượng không khí và lưu ý sức khỏe hôm nay.
          </p>
        </SectionCard>
      )}

      <SectionCard
        icon="clipboard"
        title="Bệnh án gần nhất"
        actions={
          <IconButton
            icon="arrow-right"
            label="Xem tất cả bệnh án"
            variant="ghost"
            onClick={() => navigate(ROUTES.RECORDS)}
          />
        }
      >
        {latestRecord ? (
          <RecordCard record={latestRecord} />
        ) : (
          <EmptyState
            icon="upload"
            title={records.listStatus === 'loading' ? 'Đang tải bệnh án...' : 'Chưa có bệnh án'}
            hint="Tải ảnh đơn thuốc hoặc phiếu khám để AI đọc và lưu trữ."
            action={
              <IconButton
                icon="upload"
                label="Tải bệnh án"
                variant="primary"
                size="lg"
                onClick={() => navigate(ROUTES.RECORDS)}
              />
            }
          />
        )}
      </SectionCard>

      {latestAdvice && (
        <SectionCard
          icon="activity"
          title="Nhật ký sức khỏe"
          actions={
            <>
              <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                {doneCount}/{latestAdvice.suggestions.length} đề xuất đã làm
              </span>
              <IconButton
                icon="arrow-right"
                label="Xem theo dõi sức khỏe"
                variant="ghost"
                onClick={() => navigate(ROUTES.TRACKING)}
              />
            </>
          }
        >
          <p className="line-clamp-2 text-sm text-neutral-700">{latestAdvice.summary}</p>
          {nextSuggestion && (
            <p className="text-primary mt-2 truncate text-sm font-semibold">
              Tiếp theo: {nextSuggestion.title}
            </p>
          )}
        </SectionCard>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {SHORTCUTS.map((s) => (
          <ShortcutCard key={s.to} {...s} />
        ))}
      </div>

      <MedicalDisclaimer />
    </section>
  )
}
