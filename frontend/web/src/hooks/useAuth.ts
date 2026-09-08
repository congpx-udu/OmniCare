import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { logout as logoutAction } from '@/redux/slices/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { token, user, status, error } = useAppSelector((s) => s.auth)
  const logout = useCallback(() => dispatch(logoutAction()), [dispatch])
  return {
    token,
    user,
    status,
    error,
    isAuthenticated: Boolean(token),
    /** true khi có token nhưng chưa xác minh xong với /auth/me */
    isVerifying: Boolean(token) && !user && status !== 'failed',
    logout,
  }
}
