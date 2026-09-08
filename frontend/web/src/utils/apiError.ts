import axios from 'axios'

/** Lấy message người dùng đọc được từ lỗi Axios / backend { success:false, message } */
export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, thử lại sau') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.code === 'ECONNABORTED') return 'Máy chủ phản hồi quá lâu, thử lại sau'
    if (!error.response) return 'Không kết nối được máy chủ'
  }
  return fallback
}
