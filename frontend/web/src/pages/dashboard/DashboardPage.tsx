import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Alert, MedicalDisclaimer } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchProfile } from '@/redux/slices/profileSlice'
import { fetchRecords } from '@/redux/slices/recordsSlice'
import { fetchAdvice } from '@/redux/slices/trackingSlice'
import { fetchWeather } from '@/redux/slices/weatherSlice'
import { BodyMetricsCard } from '@/components/health-profile'
import { RecordCard } from '@/components/records'
import { WeatherSummaryCard } from '@/components/weather'

const SHORTCUTS = [
  {
    to: `${ROUTES.CHAT}?mode=symptom`,
    title: 'Hỏi AI về cảm nhận hôm nay',
    desc: 'Mô tả triệu chứng, nhận nhóm vấn đề có thể liên quan, mức độ và nơi nên khám.',
    accent: 'bg-secondary',
  },
  {
    to: `${ROUTES.CHAT}?mode=food`,
    title: 'Gợi ý bữa ăn hôm nay',
    desc: 'Món ăn hợp thời tiết tại nơi bạn ở, tránh dị ứng và bệnh nền.',
    accent: 'bg-secondary-300',
  },
  {
    to: ROUTES.RECORDS,
    title: 'Hồ sơ bệnh án',
    desc: 'Chụp đơn thuốc, bệnh án in máy để OCR và lưu hồ sơ.',
    accent: 'bg-tertiary',
  },
  {
    to: ROUTES.TRACKING,
    title: 'Theo dõi sức khỏe',
    desc: 'Ghi chỉ số, hoạt động mỗi ngày; AI phân tích và đề xuất cải thiện.',
    accent: 'bg-tertiary-700',
  },
  {
    to: ROUTES.PROFILE,
    title: 'Hồ sơ sức khỏe',
    desc: 'Chiều cao, cân nặng, bệnh nền, dị ứng để AI cá nhân hóa lời khuyên.',
    accent: 'bg-primary',
  },
]

/** Trang đầu tiên sau đăng nhập. Giai đoạn 5 sẽ thêm nhắc thuốc, chỉ số, cảnh báo thời tiết. */
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

  // Có vị trí nhớ trong phiên thì tải thời tiết cho thẻ tổng quan
  useEffect(() => {
    if (weather.query && !weather.data && weather.status === 'idle') {
      void dispatch(fetchWeather(weather.query))
    }
  }, [dispatch, weather.query, weather.data, weather.status])

  useEffect(() => {
    if (records.listStatus === 'idle') void dispatch(fetchRecords({ limit: 3 }))
  }, [dispatch, records.listStatus])

  useEffect(() => {
    if (tracking.adviceStatus === 'idle') void dispatch(fetchAdvice())
  }, [dispatch, tracking.adviceStatus])

  const latestAdvice = tracking.advice[0] ?? null
  const latestRecord = records.items[0] ?? null
  const needsProfile = profile !== null && !profile.isComplete
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">Xin chào, {user?.fullName ?? 'bạn'} 👋</h1>
        <p className="text-neutral-600">
          Trợ lý sức khỏe của bạn đã sẵn sàng. Chọn một tính năng để bắt đầu.
        </p>
      </div>

      {needsProfile && (
        <Alert variant="warning">
          Hồ sơ sức khỏe của bạn chưa đủ chiều cao, cân nặng và ngày sinh.{' '}
          <Link to={ROUTES.PROFILE} className="font-semibold underline">
            Hoàn thiện ngay
          </Link>{' '}
          để trợ lý AI đưa ra gợi ý sát với thể trạng của bạn.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <BodyMetricsCard profile={profile} />
        <WeatherSummaryCard
          data={weather.data}
          loading={weather.status === 'loading'}
          insightSummary={weather.insight?.summary ?? null}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-card bg-surface hover:border-primary-200 border border-neutral-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className={`mb-4 block h-1.5 w-10 rounded-full ${s.accent}`} />
            <h3 className="group-hover:text-secondary text-lg">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{s.desc}</p>
          </Link>
        ))}
      </div>

      {latestAdvice && (
        <Link
          to={ROUTES.TRACKING}
          className="rounded-card bg-surface hover:border-primary-200 block border border-neutral-200 p-5 transition hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg">Nhật ký sức khỏe</h3>
            <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
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

      <MedicalDisclaimer />
    </section>
  )
}
