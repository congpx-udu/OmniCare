import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeProvider'
import { store } from '@/redux/store'
import { router } from '@/routes'

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  )
}
