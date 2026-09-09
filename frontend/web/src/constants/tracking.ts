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

export const MOOD_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Rất tệ', emoji: '😞' },
  2: { label: 'Không ổn', emoji: '😕' },
  3: { label: 'Bình thường', emoji: '😐' },
  4: { label: 'Khá tốt', emoji: '🙂' },
  5: { label: 'Rất tốt', emoji: '😄' },
}

export type MetricKey =
  'weightKg' | 'bloodPressure' | 'heartRate' | 'glucose' | 'sleepHours' | 'activityMinutes'

/** Các chỉ số vẽ biểu đồ xu hướng; bloodPressure là cặp systolic/diastolic */
export const METRICS: ReadonlyArray<{
  key: MetricKey
  label: string
  unit: string
  fields: Array<keyof HealthLog>
  color: string
}> = [
  {
    key: 'weightKg',
    label: 'Cân nặng',
    unit: 'kg',
    fields: ['weightKg'],
    color: 'var(--color-primary)',
  },
  {
    key: 'bloodPressure',
    label: 'Huyết áp',
    unit: 'mmHg',
    fields: ['systolic', 'diastolic'],
    color: 'var(--color-danger)',
  },
  {
    key: 'heartRate',
    label: 'Nhịp tim',
    unit: 'bpm',
    fields: ['heartRate'],
    color: 'var(--color-warning)',
  },
  {
    key: 'glucose',
    label: 'Đường huyết',
    unit: 'mmol/L',
    fields: ['glucose'],
    color: 'var(--color-tertiary)',
  },
  {
    key: 'sleepHours',
    label: 'Giấc ngủ',
    unit: 'giờ',
    fields: ['sleepHours'],
    color: 'var(--color-secondary)',
  },
  {
    key: 'activityMinutes',
    label: 'Vận động',
    unit: 'phút',
    fields: ['activityMinutes'],
    color: 'var(--color-secondary-700)',
  },
]

export const ALERT_TONE: Record<AlertLevel, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  urgent: 'error',
}

export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  activity: 'Vận động',
  sleep: 'Giấc ngủ',
  diet: 'Ăn uống',
  checkup: 'Đi khám',
  other: 'Khác',
}
