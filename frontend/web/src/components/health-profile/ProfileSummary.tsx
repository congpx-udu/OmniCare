import { NavIcon, type NavIconName } from '@/components/layout'
import { BMI_LABELS, GENDER_OPTIONS } from '@/constants'
import type { HealthProfile } from '@/types'
import { cn } from '@/utils'

interface ProfileSummaryProps {
  profile: HealthProfile
}

function bmiLabel(bmi: number) {
  return BMI_LABELS.find((b) => bmi < b.max) ?? BMI_LABELS[BMI_LABELS.length - 1]
}

/** Chip màu theo tone chữ của BMI_LABELS */
const CHIP_CLASS: Record<string, string> = {
  'text-secondary-700': 'bg-secondary-50 text-secondary-700',
  'text-warning': 'bg-warning/10 text-warning',
  'text-danger': 'bg-danger/10 text-danger',
}

interface Stat {
  key: string
  icon: NavIconName
  label: string
  value: string
  chip?: { text: string; tone: string }
  sub?: string
}

/** Ô thống kê nhanh: icon + số to + nhãn nhỏ (BMI, tuổi, giới tính, bệnh nền, dị ứng) */
export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const label = profile.bmi !== null ? bmiLabel(profile.bmi) : null
  const bmiSub =
    profile.weightKg !== null
      ? `${profile.weightKg} kg${profile.weightDate ? ` · ${profile.weightDate.slice(8, 10)}/${profile.weightDate.slice(5, 7)}` : ''}`
      : profile.heightCm === null
        ? 'Cần chiều cao'
        : 'Chưa có cân nặng'

  const stats: Stat[] = [
    {
      key: 'bmi',
      icon: 'scale',
      label: 'BMI',
      value: profile.bmi !== null ? profile.bmi.toFixed(1) : '—',
      chip: label ? { text: label.label, tone: label.tone } : undefined,
      sub: bmiSub,
    },
    {
      key: 'age',
      icon: 'cake',
      label: 'Tuổi',
      value: profile.age !== null ? String(profile.age) : '—',
    },
    {
      key: 'gender',
      icon: 'gender',
      label: 'Giới tính',
      value: GENDER_OPTIONS.find((g) => g.value === profile.gender)?.label ?? '—',
    },
    {
      key: 'chronic',
      icon: 'stethoscope',
      label: 'Bệnh nền',
      value: String(profile.chronicConditions.length),
    },
    {
      key: 'allergy',
      icon: 'alert',
      label: 'Dị ứng',
      value: String(profile.allergies.length),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => {
        const card = (
          <div className="rounded-card bg-surface flex h-full w-full flex-col gap-2 border border-neutral-200 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-secondary-50 text-secondary flex size-9 shrink-0 items-center justify-center rounded-xl">
                <NavIcon name={s.icon} className="size-5" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {s.label}
              </span>
            </div>
            <p className="font-heading text-primary text-2xl font-bold">{s.value}</p>
            {s.chip && (
              <span
                className={cn(
                  'inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold',
                  CHIP_CLASS[s.chip.tone] ?? 'bg-neutral-100 text-neutral-600',
                )}
              >
                {s.chip.text}
              </span>
            )}
            {s.sub && <p className="text-xs text-neutral-500">{s.sub}</p>}
          </div>
        )
        return <div key={s.key}>{card}</div>
      })}
    </div>
  )
}
