import type { NavIconName } from '@/components/layout/NavIcon'
import type { ActivityType, AlertLevel, HealthLog, SuggestionCategory } from '@/types'

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walking: 'Đi bộ',
  running: 'Chạy bộ',
  cycling: 'Đạp xe',
  gym: 'Gym',
  yoga: 'Yoga',
  swimming: 'Bơi',
  sports: 'Thể thao',
  housework: 'Việc nhà',
  other: 'Khác',
}

/** Icon cho chip loại vận động (dùng icon có sẵn trong NavIcon) */
export const ACTIVITY_ICONS: Record<ActivityType, NavIconName> = {
  walking: 'walk',
  running: 'activity',
  cycling: 'target',
  gym: 'scale',
  yoga: 'smile',
  swimming: 'droplet',
  sports: 'heart',
  housework: 'home',
  other: 'more',
}

/** Cảm nhận 1 (rất tệ) → 5 (rất tốt): nhãn + màu chữ khi chọn */
export const MOOD_LABELS: Record<number, { label: string; tone: string }> = {
  1: { label: 'Rất tệ', tone: 'text-danger' },
  2: { label: 'Không ổn', tone: 'text-warning' },
  3: { label: 'Bình thường', tone: 'text-neutral-600' },
  4: { label: 'Khá tốt', tone: 'text-tertiary' },
  5: { label: 'Rất tốt', tone: 'text-secondary' },
}

export type MetricKey =
  'weightKg' | 'bloodPressure' | 'heartRate' | 'glucose' | 'sleepHours' | 'activityMinutes'

/** Các chỉ số vẽ biểu đồ xu hướng; bloodPressure là cặp systolic/diastolic */
export const METRICS: ReadonlyArray<{
  key: MetricKey
  label: string
  unit: string
  icon: NavIconName
  fields: Array<keyof HealthLog>
  color: string
}> = [
  {
    key: 'weightKg',
    label: 'Cân nặng',
    unit: 'kg',
    icon: 'scale',
    fields: ['weightKg'],
    color: 'var(--color-primary)',
  },
  {
    key: 'bloodPressure',
    label: 'Huyết áp',
    unit: 'mmHg',
    icon: 'heart',
    fields: ['systolic', 'diastolic'],
    color: 'var(--color-danger)',
  },
  {
    key: 'heartRate',
    label: 'Nhịp tim',
    unit: 'bpm',
    icon: 'activity',
    fields: ['heartRate'],
    color: 'var(--color-warning)',
  },
  {
    key: 'glucose',
    label: 'Đường huyết',
    unit: 'mmol/L',
    icon: 'droplet',
    fields: ['glucose'],
    color: 'var(--color-tertiary)',
  },
  {
    key: 'sleepHours',
    label: 'Giấc ngủ',
    unit: 'giờ',
    icon: 'bed',
    fields: ['sleepHours'],
    color: 'var(--color-secondary)',
  },
  {
    key: 'activityMinutes',
    label: 'Vận động',
    unit: 'phút',
    icon: 'walk',
    fields: ['activityMinutes'],
    color: 'var(--color-secondary-700)',
  },
]

export const ALERT_TONE: Record<AlertLevel, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  urgent: 'error',
}

export const ALERT_ICONS: Record<AlertLevel, NavIconName> = {
  info: 'info',
  warning: 'alert',
  urgent: 'alert',
}

export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  activity: 'Vận động',
  sleep: 'Giấc ngủ',
  diet: 'Ăn uống',
  checkup: 'Đi khám',
  other: 'Khác',
}

export const SUGGESTION_CATEGORY_ICONS: Record<SuggestionCategory, NavIconName> = {
  activity: 'walk',
  sleep: 'bed',
  diet: 'food',
  checkup: 'stethoscope',
  other: 'sparkles',
}
