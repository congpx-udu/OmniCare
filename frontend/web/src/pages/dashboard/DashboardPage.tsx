import { useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, EmptyState, IconButton, MedicalDisclaimer, SectionCard } from '@/components/common'
import {
  HeroBanner,
  ShortcutCard,
  SleepBarsCard,
  StatCard,
  WeightTrendCard,
} from '@/components/dashboard'
import { NavIcon } from '@/components/layout'
import { RecordCard } from '@/components/records'
import { WeatherInsightCard } from '@/components/weather'
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
    title: 'Hỏi triệu chứng',
    desc: 'Đánh giá sơ bộ',
  },
  { to: `${ROUTES.CHAT}?mode=food`, icon: 'food', title: 'Gợi ý món ăn', desc: 'Theo thời tiết' },
  { to: ROUTES.RECORDS, icon: 'upload', title: 'Tải bệnh án', desc: 'AI đọc đơn thuốc' },
  { to: ROUTES.PROFILE, icon: 'profile', title: 'Hồ sơ cá nhân', desc: 'Bệnh nền, dị ứng' },
]

/** Màu chữ cho AQI 1-5 của OpenWeather */
const AQI_TONE: Record<number, string> = {
  1: 'text-secondary-700',
  2: 'text-secondary-600',
  3: 'text-warning',
  4: 'text-danger',
  5: 'text-danger',
}

/** Trang Tổng quan (bento): banner chào + thời tiết, chỉ số & biểu đồ bên trái, AI/bệnh án/nhật ký bên phải */
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
    <div className="space-y-6">
      <HeroBanner
        name={user?.fullName ?? 'bạn'}
        weather={weather.data}
        weatherLoading={weather.status === 'loading'}
      />

      {needsProfile && (
        <Alert variant="warning" className="flex items-center gap-2">
          <NavIcon name="info" className="size-4 shrink-0" />
          <span>
            Hồ sơ cá nhân chưa có chiều cao và ngày sinh.{' '}
            <Link to={ROUTES.PROFILE} className="font-semibold underline">
              Hoàn thiện ngay
            </Link>
          </span>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Cột trái: chỉ số + biểu đồ */}
        <div className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {SHORTCUTS.map((s) => (
              <ShortcutCard key={s.to} {...s} />
            ))}
          </div>
        </div>

        {/* Cột phải: AI hôm nay, nhật ký, bệnh án */}
        <div className="space-y-6 xl:col-span-4">
          {weather.data && (
            <WeatherInsightCard
              insight={weather.insight}
              status={weather.insightStatus}
              error={weather.insightError}
              onRetry={retryInsight}
              compact
            />
          )}

          <SectionCard
            icon="activity"
            title="Nhật ký sức khỏe"
            actions={
              <IconButton
                icon="arrow-right"
                label="Mở theo dõi sức khỏe"
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.TRACKING)}
              />
            }
          >
            {latestAdvice ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="bg-secondary h-full rounded-full transition-[width]"
                      style={{
                        width: `${latestAdvice.suggestions.length ? (doneCount / latestAdvice.suggestions.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-secondary-700 text-xs font-semibold whitespace-nowrap">
                    {doneCount}/{latestAdvice.suggestions.length} đề xuất
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-neutral-700">{latestAdvice.summary}</p>
                {nextSuggestion && (
                  <p className="bg-secondary-50 text-secondary-700 flex items-start gap-2 rounded-xl px-3 py-2 text-sm">
                    <NavIcon name="sparkles" className="mt-0.5 size-4 shrink-0" />
                    <span className="font-semibold">{nextSuggestion.title}</span>
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon="activity"
                title="Chưa có phân tích"
                hint="Ghi nhật ký vài ngày rồi nhờ AI phân tích."
                className="py-6"
              />
            )}
          </SectionCard>

          <SectionCard
            icon="clipboard"
            title="Bệnh án gần nhất"
            actions={
              <IconButton
                icon="arrow-right"
                label="Xem tất cả bệnh án"
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.RECORDS)}
              />
            }
          >
            {latestRecord ? (
              <RecordCard record={latestRecord} />
            ) : (
              <EmptyState
                icon="upload"
                title={records.listStatus === 'loading' ? 'Đang tải...' : 'Chưa có bệnh án'}
                className="py-6"
                action={
                  <IconButton
                    icon="upload"
                    label="Tải bệnh án"
                    variant="primary"
                    onClick={() => navigate(ROUTES.RECORDS)}
                  />
                }
              />
            )}
          </SectionCard>
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  )
}
