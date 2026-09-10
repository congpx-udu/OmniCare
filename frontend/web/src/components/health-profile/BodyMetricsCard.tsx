import { useNavigate } from 'react-router-dom'
import { IconButton, SectionCard } from '@/components/common'
import { NavIcon, type NavIconName } from '@/components/layout'
import { BMI_LABELS, GENDER_OPTIONS, ROUTES } from '@/constants'
import type { HealthProfile } from '@/types'
import { cn } from '@/utils'

interface BodyMetricsCardProps {
  profile: HealthProfile | null
}

/** Thẻ Chỉ số cơ thể: BMI, cân nặng (từ nhật ký), tuổi, giới tính — ô icon, nút sang hồ sơ */
export function BodyMetricsCard({ profile }: BodyMetricsCardProps) {
  const navigate = useNavigate()
  const bmi = profile?.bmi ?? null
  const label = bmi !== null ? (BMI_LABELS.find((b) => bmi < b.max) ?? BMI_LABELS.at(-1)) : null
  const items: Array<{ icon: NavIconName; k: string; v: string; sub?: string; tone?: string }> = [
    {
      icon: 'scale',
      k: 'BMI',
      v: bmi !== null ? bmi.toFixed(1) : '—',
      sub: label?.label ?? 'Cần số đo',
      tone: label?.tone,
    },
    {
      icon: 'activity',
      k: 'Cân nặng',
      v:
        profile?.weightKg !== null && profile?.weightKg !== undefined
          ? `${profile.weightKg} kg`
          : '—',
      sub: profile?.weightDate ? `nhật ký ${profile.weightDate.slice(5)}` : undefined,
    },
    {
      icon: 'cake',
      k: 'Tuổi',
      v: profile?.age !== null && profile?.age !== undefined ? String(profile.age) : '—',
    },
    {
      icon: 'gender',
      k: 'Giới tính',
      v: GENDER_OPTIONS.find((g) => g.value === profile?.gender)?.label ?? '—',
    },
  ]
  return (
    <SectionCard
      icon="heart"
      title="Chỉ số cơ thể"
      lift
      actions={
        <IconButton
          icon="pencil"
          label="Cập nhật hồ sơ"
          size="sm"
          onClick={() => navigate(ROUTES.PROFILE)}
        />
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.k} className="flex items-start gap-2.5">
            <span className="bg-secondary-50 text-secondary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <NavIcon name={it.icon} className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {it.k}
              </dt>
              <dd className="font-heading text-primary text-lg font-bold">{it.v}</dd>
              {it.sub && <dd className={cn('text-xs text-neutral-500', it.tone)}>{it.sub}</dd>}
            </div>
          </div>
        ))}
      </dl>
    </SectionCard>
  )
}
