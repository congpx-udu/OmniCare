import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PasswordToggle } from '@/components/auth'
import { Alert, Button, Input } from '@/components/common'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/redux/hooks'
import { clearAuthError, login } from '@/redux/slices/authSlice'
import { issuesToFieldErrors, loginFormSchema } from '@/validators/auth'

interface LocationState {
  from?: string
  registeredPhone?: string
}

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const { isAuthenticated, status, error } = useAuth()

  const [phone, setPhone] = useState(state.registeredPhone ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Xóa lỗi cũ của slice khi rời trang
  useEffect(() => () => void dispatch(clearAuthError()), [dispatch])

  if (isAuthenticated) return <Navigate to={state.from ?? ROUTES.DASHBOARD} replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = loginFormSchema.safeParse({ phone, password })
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues))
      return
    }
    setFieldErrors({})
    const result = await dispatch(login(parsed.data))
    if (login.fulfilled.match(result)) navigate(state.from ?? ROUTES.DASHBOARD, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl">Đăng nhập</h1>
        <p className="text-sm text-neutral-500">Dùng số điện thoại đã đăng ký để tiếp tục.</p>
      </div>

      {state.registeredPhone && !error && (
        <Alert variant="success">Đăng ký thành công. Hãy đăng nhập để bắt đầu.</Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Số điện thoại"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
          autoFocus={!state.registeredPhone}
        />
        <Input
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoFocus={Boolean(state.registeredPhone)}
          rightSlot={
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          }
        />
        <Button type="submit" size="lg" fullWidth loading={status === 'loading'}>
          Đăng nhập
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Chưa có tài khoản?{' '}
        <Link to={ROUTES.REGISTER} className="text-secondary font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
