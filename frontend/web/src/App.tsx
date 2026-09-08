import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeProvider'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchMe } from '@/redux/slices/authSlice'
import { store } from '@/redux/store'
import { router } from '@/routes'

/** Khi tải trang mà đã có token: xác minh với /auth/me để lấy thông tin user */
function SessionBootstrap() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const user = useAppSelector((s) => s.auth.user)
  useEffect(() => {
    if (token && !user) void dispatch(fetchMe())
  }, [dispatch, token, user])
  return null
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SessionBootstrap />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  )
}
