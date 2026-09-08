import axios from 'axios'
import { STORAGE_KEYS } from '@/constants/storage'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
