import type { RecordStatus, RecordType } from '@/types'

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  prescription: 'Đơn thuốc',
  medical_record: 'Bệnh án / phiếu khám',
  lab_result: 'Kết quả xét nghiệm',
  other: 'Tài liệu khác',
}

export const RECORD_STATUS_LABELS: Record<
  RecordStatus,
  { label: string; tone: 'info' | 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Đang đọc', tone: 'info' },
  needs_review: { label: 'Chờ xác nhận', tone: 'warning' },
  done: { label: 'Đã xác nhận', tone: 'success' },
  failed: { label: 'Đọc lỗi', tone: 'error' },
}

/** Ảnh cho phép upload (trùng với middleware backend) */
export const RECORD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const RECORD_IMAGE_MAX_MB = 10
