import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert, Button, Input, MedicalDisclaimer } from '@/components/common'
import { ProfileSummary, TagInput } from '@/components/health-profile'
import { ALLERGY_SUGGESTIONS, CHRONIC_CONDITION_SUGGESTIONS, GENDER_OPTIONS } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchProfile, resetSaveStatus, saveProfile } from '@/redux/slices/profileSlice'
import type { Gender, HealthProfile } from '@/types'
import { issuesToFieldErrors } from '@/validators/auth'
import { cn } from '@/utils'
import { profileFormSchema } from '@/validators/profile'

interface FormState {
  heightCm: string
  weightKg: string
  dateOfBirth: string
  gender: Gender | null
  chronicConditions: string[]
  allergies: string[]
}

const EMPTY_FORM: FormState = {
  heightCm: '',
  weightKg: '',
  dateOfBirth: '',
  gender: null,
  chronicConditions: [],
  allergies: [],
}

function toFormState(p: HealthProfile): FormState {
  return {
    heightCm: p.heightCm?.toString() ?? '',
    weightKg: p.weightKg?.toString() ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    gender: p.gender,
    chronicConditions: p.chronicConditions,
    allergies: p.allergies,
  }
}

/** Form hồ sơ sức khỏe (DM-03): dữ liệu nền để AI cá nhân hóa gợi ý ở giai đoạn chat */
export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, status, saveStatus, error } = useAppSelector((s) => s.profile)

  const [form, setForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    void dispatch(fetchProfile())
    return () => void dispatch(resetSaveStatus())
  }, [dispatch])

  // Form được khởi tạo từ hồ sơ tải về; sau đó người dùng chỉnh sửa cục bộ
  const current = form ?? (profile ? toFormState(profile) : EMPTY_FORM)
  const patch = (partial: Partial<FormState>) => {
    setForm({ ...current, ...partial })
    if (saveStatus !== 'idle') dispatch(resetSaveStatus())
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    patch({ [name]: value } as Partial<FormState>)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = profileFormSchema.safeParse(current)
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues))
      return
    }
    setFieldErrors({})
    const result = await dispatch(saveProfile(parsed.data))
    if (saveProfile.fulfilled.match(result)) setForm(null)
  }

  const loading = status === 'loading' && !profile

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">Hồ sơ sức khỏe</h1>
        <p className="text-neutral-600">
          Thông tin này giúp trợ lý AI cá nhân hóa phân tích triệu chứng và gợi ý thực đơn, vận
          động. Bạn có thể để trống và bổ sung sau.
        </p>
      </div>

      {profile && <ProfileSummary profile={profile} />}

      {status === 'failed' && !profile && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-busy={loading}>
        <fieldset disabled={loading} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Chiều cao (cm)"
              name="heightCm"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={30}
              max={250}
              placeholder="170"
              value={current.heightCm}
              onChange={onChange}
              error={fieldErrors.heightCm}
            />
            <Input
              label="Cân nặng (kg)"
              name="weightKg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={2}
              max={500}
              placeholder="65"
              value={current.weightKg}
              onChange={onChange}
              error={fieldErrors.weightKg}
            />
            <Input
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={current.dateOfBirth}
              onChange={onChange}
              error={fieldErrors.dateOfBirth}
            />
          </div>

          <div className="space-y-1.5">
            <span className="font-heading text-primary block text-sm font-semibold">Giới tính</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Giới tính">
              {GENDER_OPTIONS.map((g) => {
                const selected = current.gender === g.value
                return (
                  <button
                    key={g.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => patch({ gender: selected ? null : g.value })}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-medium transition',
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'bg-surface hover:border-primary border-neutral-300 text-neutral-700',
                    )}
                  >
                    {g.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-neutral-500">Bấm lại để bỏ chọn.</p>
          </div>

          <TagInput
            label="Bệnh nền"
            value={current.chronicConditions}
            onChange={(chronicConditions) => patch({ chronicConditions })}
            suggestions={CHRONIC_CONDITION_SUGGESTIONS}
            placeholder="Ví dụ: Tăng huyết áp"
            hint="Gõ tên bệnh rồi nhấn Enter, hoặc chọn gợi ý bên dưới."
            error={fieldErrors.chronicConditions}
          />

          <TagInput
            label="Dị ứng"
            value={current.allergies}
            onChange={(allergies) => patch({ allergies })}
            suggestions={ALLERGY_SUGGESTIONS}
            placeholder="Ví dụ: Hải sản"
            hint="Thức ăn, thuốc hoặc tác nhân môi trường bạn bị dị ứng."
            error={fieldErrors.allergies}
          />
        </fieldset>

        {saveStatus === 'failed' && error && <Alert variant="error">{error}</Alert>}
        {saveStatus === 'succeeded' && <Alert variant="success">Đã lưu hồ sơ sức khỏe.</Alert>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {form && (
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Hủy thay đổi
            </Button>
          )}
          <Button type="submit" size="lg" loading={saveStatus === 'loading'} disabled={loading}>
            Lưu hồ sơ
          </Button>
        </div>
      </form>

      <MedicalDisclaimer />
    </section>
  )
}
