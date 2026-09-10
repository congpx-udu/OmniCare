import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, DatePicker, IconButton, SectionCard, Tooltip } from '@/components/common'
import { NavIcon, type NavIconName } from '@/components/layout'
import { ACTIVITY_ICONS, ACTIVITY_LABELS, MOOD_LABELS } from '@/constants'
import type { UpsertLogPayload } from '@/services/trackingService'
import type { ActivityType, HealthLog } from '@/types'
import { cn } from '@/utils'

interface LogFormProps {
  date: string
  onDateChange: (date: string) => void
  existing: HealthLog | null
  saving?: boolean
  onSave: (date: string, payload: UpsertLogPayload) => void
}

interface FormState {
  weightKg: string
  systolic: string
  diastolic: string
  heartRate: string
  glucose: string
  sleepHours: string
  activityMinutes: string
  activityType: ActivityType | ''
  mood: number | null
  note: string
}

const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v))

function fromLog(l: HealthLog | null): FormState {
  return {
    weightKg: str(l?.weightKg),
    systolic: str(l?.systolic),
    diastolic: str(l?.diastolic),
    heartRate: str(l?.heartRate),
    glucose: str(l?.glucose),
    sleepHours: str(l?.sleepHours),
    activityMinutes: str(l?.activityMinutes),
    activityType: l?.activityType ?? '',
    mood: l?.mood ?? null,
    note: l?.note ?? '',
  }
}

const num = (s: string) => {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

interface MetricInputProps {
  icon: NavIconName
  label: string
  unit: string
  name: keyof FormState
  value: string
  placeholder: string
  step?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

/** Ô nhập một chỉ số: icon đầu, nhãn ngắn, đơn vị nhỏ bên phải */
function MetricInput({
  icon,
  label,
  unit,
  name,
  value,
  placeholder,
  step,
  onChange,
}: MetricInputProps) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className="bg-surface focus-within:border-tertiary focus-within:ring-tertiary/30 flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 transition focus-within:ring-2"
    >
      <span className="bg-secondary-50 text-secondary flex size-9 shrink-0 items-center justify-center rounded-lg">
        <NavIcon name={icon} className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
          {label}
        </span>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="font-heading text-primary w-full bg-transparent text-lg font-bold placeholder:font-normal placeholder:text-neutral-300 focus:outline-none"
        />
      </span>
      <span className="shrink-0 text-xs text-neutral-400">{unit}</span>
    </label>
  )
}

/** Form nhập nhật ký một ngày: mọi trường không bắt buộc, để trống = không ghi */
export function LogForm({ date, onDateChange, existing, saving, onSave }: LogFormProps) {
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const noteId = useId()
  const current = form ?? fromLog(existing)
  const patch = (p: Partial<FormState>) => setForm({ ...current, ...p })
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    patch({ [e.target.name]: e.target.value } as Partial<FormState>)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const sys = num(current.systolic)
    const dia = num(current.diastolic)
    if (sys !== null && dia !== null && sys <= dia) {
      setError('Huyết áp tâm thu phải lớn hơn tâm trương')
      return
    }
    setError(null)
    onSave(date, {
      weightKg: num(current.weightKg),
      systolic: sys,
      diastolic: dia,
      heartRate: num(current.heartRate),
      glucose: num(current.glucose),
      sleepHours: num(current.sleepHours),
      activityMinutes: num(current.activityMinutes),
      activityType: current.activityType || null,
      mood: current.mood,
      note: current.note.trim() || null,
    })
    setForm(null)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <SectionCard
      icon="calendar"
      title={existing ? 'Sửa nhật ký' : 'Ghi nhật ký'}
      id="log-form"
      actions={
        <DatePicker
          label="Ngày ghi nhật ký"
          hideLabel
          value={date}
          max={today}
          className="w-52"
          onChange={(d) => {
            if (!d) return
            setForm(null)
            onDateChange(d)
          }}
        />
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricInput
              icon="scale"
              label="Cân nặng"
              unit="kg"
              name="weightKg"
              step="0.1"
              placeholder="65"
              value={current.weightKg}
              onChange={onChange}
            />
            <MetricInput
              icon="heart"
              label="Tâm thu"
              unit="mmHg"
              name="systolic"
              placeholder="120"
              value={current.systolic}
              onChange={onChange}
            />
            <MetricInput
              icon="heart"
              label="Tâm trương"
              unit="mmHg"
              name="diastolic"
              placeholder="80"
              value={current.diastolic}
              onChange={onChange}
            />
            <MetricInput
              icon="activity"
              label="Nhịp tim"
              unit="bpm"
              name="heartRate"
              placeholder="72"
              value={current.heartRate}
              onChange={onChange}
            />
            <MetricInput
              icon="droplet"
              label="Đường huyết"
              unit="mmol/L"
              name="glucose"
              step="0.1"
              placeholder="5.4"
              value={current.glucose}
              onChange={onChange}
            />
            <MetricInput
              icon="bed"
              label="Giấc ngủ"
              unit="giờ"
              name="sleepHours"
              step="0.5"
              placeholder="7"
              value={current.sleepHours}
              onChange={onChange}
            />
            <MetricInput
              icon="walk"
              label="Vận động"
              unit="phút"
              name="activityMinutes"
              placeholder="30"
              value={current.activityMinutes}
              onChange={onChange}
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
              Loại vận động
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Loại vận động">
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((k) => {
                const on = current.activityType === k
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => patch({ activityType: on ? '' : k })}
                    className={cn(
                      'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition',
                      'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:outline-none',
                      on
                        ? 'border-secondary bg-secondary text-white'
                        : 'bg-surface hover:border-secondary hover:text-secondary border-neutral-200 text-neutral-700',
                    )}
                  >
                    <NavIcon name={ACTIVITY_ICONS[k]} className="size-4" />
                    {ACTIVITY_LABELS[k]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
              Cảm nhận hôm nay
            </span>
            <div className="flex gap-2" role="radiogroup" aria-label="Cảm nhận hôm nay">
              {[1, 2, 3, 4, 5].map((m) => {
                const on = current.mood === m
                const { label, tone } = MOOD_LABELS[m]
                return (
                  <Tooltip key={m} label={label} side="top">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={label}
                      onClick={() => patch({ mood: on ? null : m })}
                      className={cn(
                        'flex size-11 cursor-pointer items-center justify-center rounded-full border transition',
                        'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:outline-none',
                        on
                          ? 'border-primary bg-primary text-white'
                          : cn('bg-surface hover:border-primary border-neutral-200', tone),
                      )}
                    >
                      <NavIcon
                        name="smile"
                        className="size-5"
                        style={{ opacity: 0.55 + m * 0.09 }}
                      />
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={noteId}
              className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase"
            >
              Ghi chú
            </label>
            <textarea
              id={noteId}
              name="note"
              rows={2}
              maxLength={500}
              placeholder="Ví dụ: đau đầu nhẹ buổi chiều, uống ít nước..."
              value={current.note}
              onChange={onChange}
              className="bg-surface focus:border-tertiary focus:ring-tertiary/30 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
        </fieldset>

        {error && (
          <p className="text-danger flex items-center gap-1.5 text-sm" role="alert">
            <NavIcon name="alert" className="size-4" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          {form && (
            <IconButton
              icon="close"
              label="Hủy thay đổi"
              variant="ghost"
              onClick={() => setForm(null)}
              disabled={saving}
              tooltipSide="top"
            />
          )}
          <Button type="submit" loading={saving}>
            <NavIcon name="save" className="size-4" />
            Lưu
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
