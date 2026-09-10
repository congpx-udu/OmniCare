import { Link } from 'react-router-dom'
import { BMI_LABELS, GENDER_OPTIONS, ROUTES } from '@/constants'
import type { HealthProfile } from '@/types'
import { cn } from '@/utils'

interface BodyMetricsCardProps {
  profile: HealthProfile | null
}

/** Thẻ Chỉ số cơ thể cho Dashboard: BMI, cân nặng, tuổi, giới tính; bấm để sang hồ sơ */
export function BodyMetricsCard({ profile }: BodyMetricsCardProps) {
  const bmi = profile?.bmi ?? null
  const label = bmi !== null ? (BMI_LABELS.find((b) => bmi < b.max) ?? BMI_LABELS.at(-1)) : null
  const items = [
    {
      k: 'BMI',
      v: bmi !== null ? bmi.toFixed(1) : '—',
      sub: label?.label ?? 'Cần số đo',
      tone: label?.tone,
    },
    {
      k: 'Cân nặng',
      v:
        profile?.weightKg !== null && profile?.weightKg !== undefined
          ? `${profile.weightKg} kg`
          : '—',
      sub: profile?.weightDate ? `nhật ký ${profile.weightDate.slice(5)}` : undefined,
    },
    {
      k: 'Tuổi',
      v: profile?.age !== null && profile?.age !== undefined ? String(profile.age) : '—',
    },
    {
      k: 'Giới tính',
      v: GENDER_OPTIONS.find((g) => g.value === profile?.gender)?.label ?? '—',
    },
  ]
  return (
    <Link
      to={ROUTES.PROFILE}
      className="rounded-card bg-surface hover:border-primary-200 block border border-neutral-200 p-5 transition hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg">Chỉ số cơ thể</h3>
        <span className="text-secondary text-sm font-semibold">Cập nhật →</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.k}>
            <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              {it.k}
            </dt>
            <dd className="font-heading text-primary text-xl font-bold">{it.v}</dd>
            {'sub' in it && it.sub && (
              <dd className={cn('text-xs text-neutral-500', it.tone)}>{it.sub}</dd>
            )}
          </div>
        ))}
      </dl>
    </Link>
  )
}
