import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  Alert,
  IconButton,
  Input,
  MedicalDisclaimer,
  PageHeader,
  SectionCard,
} from '@/components/common'
import { ProfileSummary, TagInput } from '@/components/health-profile'
import { NavIcon, type NavIconName } from '@/components/layout'
import { ALLERGY_SUGGESTIONS, CHRONIC_CONDITION_SUGGESTIONS, GENDER_OPTIONS } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateUser } from '@/redux/slices/authSlice'
import { fetchProfile, resetSaveStatus, saveProfile } from '@/redux/slices/profileSlice'
import type { Gender, HealthProfile } from '@/types'
import { issuesToFieldErrors } from '@/validators/auth'
import { cn } from '@/utils'
import { profileFormSchema } from '@/validators/profile'

interface FormState {
  fullName: string
  email: string
  heightCm: string
  dateOfBirth: string
  gender: Gender | null
  chronicConditions: string[]
  allergies: string[]
}

const EMPTY_FORM: FormState = {
  fullName: '',
  email: '',
  heightCm: '',
  dateOfBirth: '',
  gender: null,
  chronicConditions: [],
  allergies: [],
}

function toFormState(p: HealthProfile): FormState {
  return {
    fullName: p.fullName,
    email: p.email ?? '',
    heightCm: p.heightCm?.toString() ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    gender: p.gender,
    chronicConditions: p.chronicConditions,
    allergies: p.allergies,
  }
}

const FORM_ID = 'profile-form'

/** Ô nhập có icon bên trái */
function IconField({ icon, children }: { icon: NavIconName; children: ReactNode }) {
  return (
    <div className="relative">
      <NavIcon
        name={icon}
        className="text-secondary pointer-events-none absolute top-[2.35rem] left-3.5 z-10 size-4"
      />
      {children}
    </div>
  )
}

/** Icon giới tính: dùng NavIcon 'gender' chung, khác nhau ở nhãn/tooltip */
const GENDER_ICON: Record<Gender, NavIconName> = {
  male: 'gender',
  female: 'gender',
  other: 'user',
}

/**
 * Hồ sơ cá nhân: tài khoản + thể trạng nền (ngày sinh, chiều cao, giới tính, bệnh nền, dị ứng).
 * Cân nặng và chỉ số biến động ghi ở Theo dõi sức khỏe.
 */
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
    if (saveProfile.fulfilled.match(result)) {
      setForm(null)
      dispatch(updateUser({ fullName: result.payload.fullName, email: result.payload.email }))
    }
  }

  const loading = status === 'loading' && !profile
  const dirty = form !== null
  const inputClass = 'pl-10'

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon="profile"
        title={profile?.fullName || 'Hồ sơ cá nhân'}
        subtitle={profile?.phone}
        actions={
          <>
            {dirty && (
              <IconButton
                icon="close"
                label="Hủy thay đổi"
                variant="ghost"
                onClick={() => {
                  setForm(null)
                  setFieldErrors({})
                }}
              />
            )}
            <IconButton
              icon="save"
              label="Lưu hồ sơ"
              variant="primary"
              type="submit"
              form={FORM_ID}
              loading={saveStatus === 'loading'}
              disabled={loading || !dirty}
            />
          </>
        }
      />

      {profile && <ProfileSummary profile={profile} />}

      {status === 'failed' && !profile && (
        <Alert variant="error">
          <span className="flex items-center gap-2">
            <NavIcon name="alert" className="size-4 shrink-0" />
            {error}
          </span>
        </Alert>
      )}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
        aria-busy={loading}
      >
        <fieldset disabled={loading} className="space-y-5">
          <SectionCard icon="user" title="Tài khoản">
            <div className="grid gap-4 sm:grid-cols-2">
              <IconField icon="user">
                <Input
                  label="Họ và tên"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={current.fullName}
                  onChange={onChange}
                  error={fieldErrors.fullName}
                  className={inputClass}
                />
              </IconField>
              <IconField icon="phone">
                <Input
                  label="Số điện thoại"
                  name="phone"
                  value={profile?.phone ?? ''}
                  readOnly
                  disabled
                  hint="Dùng để đăng nhập, không đổi được."
                  className={inputClass}
                />
              </IconField>
              <IconField icon="mail">
                <Input
                  label="Email (tùy chọn)"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ban@example.com"
                  value={current.email}
                  onChange={onChange}
                  error={fieldErrors.email}
                  className={inputClass}
                />
              </IconField>
            </div>
          </SectionCard>

          <SectionCard icon="ruler" title="Thể trạng">
            <div className="grid gap-4 sm:grid-cols-2">
              <IconField icon="cake">
                <Input
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={current.dateOfBirth}
                  onChange={onChange}
                  error={fieldErrors.dateOfBirth}
                  className={inputClass}
                />
              </IconField>
              <IconField icon="ruler">
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
                  hint={
                    profile?.weightKg !== null && profile?.weightKg !== undefined
                      ? `Cân nặng ${profile.weightKg} kg từ nhật ký${profile.weightDate ? ` ${profile.weightDate}` : ''}.`
                      : 'Cân nặng ghi ở Theo dõi sức khỏe.'
                  }
                  className={inputClass}
                />
              </IconField>
            </div>

            <div className="mt-4 space-y-1.5">
              <span className="font-heading text-primary block text-sm font-semibold">
                Giới tính
              </span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Giới tính">
                {GENDER_OPTIONS.map((g) => {
                  const selected = current.gender === g.value
                  return (
                    <button
                      key={g.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={g.label}
                      onClick={() => patch({ gender: selected ? null : g.value })}
                      className={cn(
                        'inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition',
                        'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                        selected
                          ? 'border-primary bg-primary text-white'
                          : 'bg-surface hover:border-primary border-neutral-300 text-neutral-700',
                      )}
                    >
                      <NavIcon name={GENDER_ICON[g.value]} className="size-4" />
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon="stethoscope" title="Bệnh nền & dị ứng">
            <div className="space-y-5">
              <TagInput
                label="Bệnh nền"
                value={current.chronicConditions}
                onChange={(chronicConditions) => patch({ chronicConditions })}
                suggestions={CHRONIC_CONDITION_SUGGESTIONS}
                placeholder="Ví dụ: Tăng huyết áp"
                error={fieldErrors.chronicConditions}
              />
              <TagInput
                label="Dị ứng"
                value={current.allergies}
                onChange={(allergies) => patch({ allergies })}
                suggestions={ALLERGY_SUGGESTIONS}
                placeholder="Ví dụ: Hải sản"
                error={fieldErrors.allergies}
              />
            </div>
          </SectionCard>
        </fieldset>

        {saveStatus === 'failed' && error && (
          <Alert variant="error">
            <span className="flex items-center gap-2">
              <NavIcon name="alert" className="size-4 shrink-0" />
              {error}
            </span>
          </Alert>
        )}
        {saveStatus === 'succeeded' && (
          <Alert variant="success">
            <span className="flex items-center gap-2">
              <NavIcon name="check" className="size-4 shrink-0" />
              Đã lưu hồ sơ.
            </span>
          </Alert>
        )}
      </form>

      <MedicalDisclaimer />
    </section>
  )
}
