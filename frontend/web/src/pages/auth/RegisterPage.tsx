import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PasswordToggle } from '@/components/auth'
import { Alert, Button, Input } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/redux/hooks'
import { clearAuthError, register } from '@/redux/slices/authSlice'
import { issuesToFieldErrors, registerFormSchema } from '@/validators/auth'

const EMPTY_FORM = { fullName: '', phone: '', email: '', password: '', confirmPassword: '' }

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, status, error } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => () => void dispatch(clearAuthError()), [dispatch])

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = registerFormSchema.safeParse(form)
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues))
      return
    }
    setFieldErrors({})
    const { confirmPassword: _confirm, ...payload } = parsed.data
    const result = await dispatch(register(payload))
    if (register.fulfilled.match(result)) {
      // Theo yêu cầu: đăng ký xong quay về trang đăng nhập, điền sẵn số điện thoại
      navigate(ROUTES.LOGIN, { replace: true, state: { registeredPhone: result.payload.phone } })
    }
  }

  const passwordType = showPassword ? 'text' : 'password'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl">Tạo tài khoản</h1>
        <p className="text-sm text-neutral-500">
          Đăng ký bằng số điện thoại. Chỉ mất chưa đến một phút.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Họ và tên"
          name="fullName"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={onChange}
          error={fieldErrors.fullName}
          autoFocus
        />
        <Input
          label="Số điện thoại"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0912 345 678"
          value={form.phone}
          onChange={onChange}
          error={fieldErrors.phone}
        />
        <Input
          label="Email (không bắt buộc)"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          value={form.email}
          onChange={onChange}
          error={fieldErrors.email}
        />
        <Input
          label="Mật khẩu"
          name="password"
          type={passwordType}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          value={form.password}
          onChange={onChange}
          error={fieldErrors.password}
          rightSlot={
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          }
        />
        <Input
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          type={passwordType}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={onChange}
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" size="lg" fullWidth loading={status === 'loading'}>
          Đăng ký
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Đã có tài khoản?{' '}
        <Link to={ROUTES.LOGIN} className="text-secondary font-semibold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
