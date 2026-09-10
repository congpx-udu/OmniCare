import { createContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastInput {
  title: string
  /** Một dòng ngắn, tùy chọn */
  description?: string
  tone?: ToastTone
  /** ms, mặc định 3500 */
  duration?: number
}

export interface ConfirmInput {
  title: string
  description?: string
  /** Nhãn nút xác nhận, mặc định "Xác nhận" */
  confirmLabel?: string
  cancelLabel?: string
  /** Hành động phá hủy → nút đỏ */
  danger?: boolean
}

export interface FeedbackContextValue {
  toast: (input: ToastInput) => void
  /** Hộp thoại xác nhận; resolve true khi người dùng đồng ý */
  confirm: (input: ConfirmInput) => Promise<boolean>
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null)
