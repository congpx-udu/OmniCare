import { BMI_LABELS, GENDER_OPTIONS } from '@/constants'
import type { HealthProfile } from '@/types'
import { cn } from '@/utils'

interface ProfileSummaryProps {
  profile: HealthProfile
}

function bmiLabel(bmi: number) {
  return BMI_LABELS.find((b) => bmi < b.max) ?? BMI_LABELS[BMI_LABELS.length - 1]
}

/** Thẻ chỉ số nhanh: BMI, tuổi, số bệnh nền/dị ứng đã khai báo */
export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const label = profile.bmi !== null ? bmiLabel(profile.bmi) : null
  const stats = [
    {
      title: 'BMI',
      value: profile.bmi !== null ? profile.bmi.toFixed(1) : '—',
      sub: label ? label.label : 'Cần chiều cao và cân nặng',
      tone: label?.tone,
    },
    {
      title: 'Tuổi',
      value: profile.age !== null ? String(profile.age) : '—',
      sub: profile.age !== null ? 'tuổi' : 'Cần ngày sinh',
    },
    {
      title: 'Giới tính',
      value: GENDER_OPTIONS.find((g) => g.value === profile.gender)?.label ?? '—',
      sub: profile.gender ? 'đã khai báo' : 'Chưa khai báo',
    },
    {
      title: 'Bệnh nền',
      value: String(profile.chronicConditions.length),
      sub: profile.chronicConditions.length ? 'mục đã khai báo' : 'Chưa khai báo',
    },
    {
      title: 'Dị ứng',
      value: String(profile.allergies.length),
      sub: profile.allergies.length ? 'mục đã khai báo' : 'Chưa khai báo',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.title} className="rounded-card bg-surface border border-neutral-200 p-4">
          <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            {s.title}
          </p>
          <p className="font-heading text-primary mt-1 text-2xl font-bold">{s.value}</p>
          <p className={cn('text-xs text-neutral-500', s.tone)}>{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
