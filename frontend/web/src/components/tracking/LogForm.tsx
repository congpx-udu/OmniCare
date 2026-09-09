import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, Input } from '@/components/common'
import { ACTIVITY_LABELS, MOOD_LABELS } from '@/constants'
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

/** Form nhập nhật ký một ngày: mọi trường không bắt buộc, để trống = không ghi */
export function LogForm({ date, onDateChange, existing, saving, onSave }: LogFormProps) {
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const current = form ?? fromLog(existing)
  const patch = (p: Partial<FormState>) => setForm({ ...current, ...p })
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
    <form
      onSubmit={submit}
      noValidate
      className="rounded-card bg-surface space-y-4 border border-neutral-200 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg">Nhật ký hôm nay</h2>
        <div className="w-44">
          <Input
            label="Ngày"
            type="date"
            max={today}
            value={date}
            onChange={(e) => {
              setForm(null)
              onDateChange(e.target.value)
            }}
          />
        </div>
      </div>

      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            label="Cân nặng (kg)"
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="65"
            value={current.weightKg}
            onChange={onChange}
          />
          <Input
            label="Huyết áp tâm thu"
            name="systolic"
            type="number"
            inputMode="numeric"
            placeholder="120"
            value={current.systolic}
            onChange={onChange}
          />
          <Input
            label="Huyết áp tâm trương"
            name="diastolic"
            type="number"
            inputMode="numeric"
            placeholder="80"
            value={current.diastolic}
            onChange={onChange}
          />
          <Input
            label="Nhịp tim (bpm)"
            name="heartRate"
            type="number"
            inputMode="numeric"
            placeholder="72"
            value={current.heartRate}
            onChange={onChange}
          />
          <Input
            label="Đường huyết (mmol/L)"
            name="glucose"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="5.4"
            value={current.glucose}
            onChange={onChange}
          />
          <Input
            label="Giờ ngủ"
            name="sleepHours"
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="7"
            value={current.sleepHours}
            onChange={onChange}
          />
          <Input
            label="Vận động (phút)"
            name="activityMinutes"
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={current.activityMinutes}
            onChange={onChange}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="activityType"
              className="font-heading text-primary block text-sm font-semibold"
            >
              Loại vận động
            </label>
            <select
              id="activityType"
              name="activityType"
              value={current.activityType}
              onChange={onChange}
              className="bg-surface focus:border-tertiary focus:ring-tertiary/40 w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">Không ghi</option>
              {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="font-heading text-primary block text-sm font-semibold">
            Cảm nhận hôm nay
          </span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cảm nhận hôm nay">
            {[1, 2, 3, 4, 5].map((m) => {
              const on = current.mood === m
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => patch({ mood: on ? null : m })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm transition',
                    on
                      ? 'border-primary bg-primary text-white'
                      : 'hover:border-primary border-neutral-300 text-neutral-700',
                  )}
                >
                  {MOOD_LABELS[m].emoji} {MOOD_LABELS[m].label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="note" className="font-heading text-primary block text-sm font-semibold">
            Ghi chú
          </label>
          <textarea
            id="note"
            name="note"
            rows={2}
            maxLength={500}
            placeholder="Ví dụ: hôm nay đau đầu nhẹ buổi chiều, uống ít nước..."
            value={current.note}
            onChange={onChange}
            className="bg-surface focus:border-tertiary focus:ring-tertiary/40 w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </fieldset>

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={saving}>
          {existing ? 'Cập nhật nhật ký' : 'Lưu nhật ký'}
        </Button>
        {form && (
          <Button type="button" variant="ghost" onClick={() => setForm(null)} disabled={saving}>
            Hủy thay đổi
          </Button>
        )}
      </div>
    </form>
  )
}
