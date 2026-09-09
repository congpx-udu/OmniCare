import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import type { ChatMode, HealthProfile, WeatherSnapshot } from '@/types'

interface ContextBarProps {
  mode: ChatMode
  weather: WeatherSnapshot | null
  profile: HealthProfile | null
}

/** Thanh ngữ cảnh AI đang dùng: vị trí + thời tiết, hồ sơ (dị ứng, bệnh nền). Mỗi mục dẫn tới trang cập nhật. */
export function ContextBar({ mode, weather, profile }: ContextBarProps) {
  const chips: Array<{ key: string; text: string; to: string; muted?: boolean }> = []

  if (weather) {
    chips.push({
      key: 'weather',
      text: `${weather.location.name} · ${Math.round(weather.current.temp)}° ${weather.current.description}`,
      to: ROUTES.WEATHER,
    })
  } else {
    chips.push({
      key: 'weather',
      text: 'Chưa có thời tiết, chọn vị trí',
      to: ROUTES.WEATHER,
      muted: true,
    })
  }

  if (profile) {
    const bits: string[] = []
    if (profile.age !== null) bits.push(`${profile.age} tuổi`)
    if (profile.bmi !== null) bits.push(`BMI ${profile.bmi}`)
    if (profile.chronicConditions.length)
      bits.push(`bệnh nền: ${profile.chronicConditions.join(', ')}`)
    if (mode === 'food' && profile.allergies.length)
      bits.push(`dị ứng: ${profile.allergies.join(', ')}`)
    chips.push({
      key: 'profile',
      text: bits.length ? bits.join(' · ') : 'Hồ sơ trống, hãy bổ sung',
      to: ROUTES.PROFILE,
      muted: !bits.length,
    })
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Ngữ cảnh trợ lý đang dùng">
      {chips.map((c) => (
        <Link
          key={c.key}
          to={c.to}
          title="Cập nhật"
          className={
            c.muted
              ? 'hover:border-tertiary rounded-full border border-dashed border-neutral-300 px-3 py-1 text-xs text-neutral-500'
              : 'bg-tertiary-50 text-tertiary-700 hover:bg-tertiary-100 max-w-full truncate rounded-full px-3 py-1 text-xs'
          }
        >
          {c.text}
        </Link>
      ))}
    </div>
  )
}
