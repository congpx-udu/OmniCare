import { Link } from 'react-router-dom'
import { NavIcon, type NavIconName } from '@/components/layout'
import { ROUTES } from '@/constants'
import type { HealthProfile, WeatherSnapshot } from '@/types'
import { cn } from '@/utils'

interface ChatSidebarProps {
  weather: WeatherSnapshot | null
  profile: HealthProfile | null
  recordCount: number
  starters: readonly string[]
  onStarter: (text: string) => void
}

interface Row {
  icon: NavIconName
  label: string
  value: string
  to: string
  muted?: boolean
}

/** Cột phải trang chat: ngữ cảnh AI đang dùng (bấm để cập nhật) + câu hỏi gợi ý + mẹo */
export function ChatSidebar({
  weather,
  profile,
  recordCount,
  starters,
  onStarter,
}: ChatSidebarProps) {
  const rows: Row[] = [
    {
      icon: 'weather',
      label: 'Thời tiết',
      value: weather
        ? `${weather.location.name} · ${Math.round(weather.current.temp)}° ${weather.current.description}`
        : 'Chưa có vị trí',
      to: ROUTES.WEATHER,
      muted: !weather,
    },
    {
      icon: 'profile',
      label: 'Thể trạng',
      value: profile
        ? [
            profile.age !== null ? `${profile.age} tuổi` : null,
            profile.bmi !== null ? `BMI ${profile.bmi}` : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'Chưa có hồ sơ'
        : 'Chưa có hồ sơ',
      to: ROUTES.PROFILE,
      muted: !profile || (profile.age === null && profile.bmi === null),
    },
    {
      icon: 'stethoscope',
      label: 'Bệnh nền',
      value: profile?.chronicConditions.length ? profile.chronicConditions.join(', ') : 'Không có',
      to: ROUTES.PROFILE,
      muted: !profile?.chronicConditions.length,
    },
    {
      icon: 'alert',
      label: 'Dị ứng',
      value: profile?.allergies.length ? profile.allergies.join(', ') : 'Không có',
      to: ROUTES.PROFILE,
      muted: !profile?.allergies.length,
    },
    {
      icon: 'clipboard',
      label: 'Bệnh án',
      value: recordCount ? `${recordCount} bệnh án đã lưu` : 'Chưa có',
      to: ROUTES.RECORDS,
      muted: !recordCount,
    },
  ]

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <section className="rounded-card bg-surface border border-neutral-200 p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <NavIcon name="sparkles" className="text-secondary size-4" />
          AI đang dùng ngữ cảnh
        </h2>
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label}>
              <Link
                to={r.to}
                className="hover:bg-secondary-50 group flex items-start gap-2.5 rounded-xl px-2 py-1.5 transition"
              >
                <span className="bg-secondary-50 text-secondary flex size-7 shrink-0 items-center justify-center rounded-lg">
                  <NavIcon name={r.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                    {r.label}
                  </span>
                  <span
                    className={cn(
                      'block truncate text-sm',
                      r.muted ? 'text-neutral-400 italic' : 'text-neutral-800',
                    )}
                  >
                    {r.value}
                  </span>
                </span>
                <NavIcon
                  name="chevron-right"
                  className="group-hover:text-secondary mt-2 size-4 shrink-0 text-neutral-300 transition"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card bg-surface border border-neutral-200 p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <NavIcon name="chat" className="text-secondary size-4" />
          Hỏi nhanh
        </h2>
        <ul className="space-y-1.5">
          {starters.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onStarter(s)}
                className="hover:border-secondary hover:text-secondary flex w-full cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-700 transition"
              >
                <NavIcon
                  name={/ăn|món/i.test(s) ? 'food' : 'stethoscope'}
                  className="text-secondary size-4 shrink-0"
                />
                <span className="truncate">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card bg-secondary-50 border-secondary/30 border p-4 text-xs text-neutral-700">
        <h2 className="text-secondary-700 mb-2 flex items-center gap-2 text-sm font-bold">
          <NavIcon name="info" className="size-4" />
          Mẹo
        </h2>
        <ul className="space-y-1.5">
          <li className="flex gap-2">
            <NavIcon name="image" className="mt-0.5 size-3.5 shrink-0" />
            Dán hoặc kéo ảnh món ăn, vùng da, đơn thuốc vào ô chat (tối đa 4 ảnh).
          </li>
          <li className="flex gap-2">
            <NavIcon name="basket" className="mt-0.5 size-3.5 shrink-0" />
            Bấm giỏ để kể nguyên liệu đang có, AI gợi ý món nấu được ngay.
          </li>
          <li className="flex gap-2">
            <NavIcon name="chevron-down" className="mt-0.5 size-3.5 shrink-0 rotate-180" />Ô trống:
            nhấn ↑ để gọi lại câu đã hỏi, Ctrl+Z để lấy lại nội dung vừa xóa.
          </li>
        </ul>
      </section>
    </aside>
  )
}
