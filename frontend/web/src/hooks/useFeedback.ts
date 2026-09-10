import { useContext } from 'react'
import { FeedbackContext } from '@/context/feedbackContext'

/** toast() thông báo ngắn và confirm() hộp thoại xác nhận (thay window.confirm) */
export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback phải dùng bên trong FeedbackProvider')
  return ctx
}
