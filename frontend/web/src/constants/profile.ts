/** Gợi ý bấm nhanh trong form hồ sơ. Chỉ là nhãn nhập liệu, không phải lời khuyên y khoa. */
export const CHRONIC_CONDITION_SUGGESTIONS = [
  'Tăng huyết áp',
  'Đái tháo đường',
  'Hen suyễn',
  'Bệnh tim mạch',
  'Rối loạn mỡ máu',
  'Dạ dày',
  'Viêm khớp',
  'Bệnh thận',
] as const

export const ALLERGY_SUGGESTIONS = [
  'Hải sản',
  'Đậu phộng',
  'Sữa',
  'Trứng',
  'Phấn hoa',
  'Bụi nhà',
  'Penicillin',
  'Aspirin',
] as const

/** Phân loại BMI (ngưỡng WHO cho người châu Á), chỉ dùng để gắn nhãn hiển thị */
export const BMI_LABELS: ReadonlyArray<{ max: number; label: string; tone: string }> = [
  { max: 18.5, label: 'Thiếu cân', tone: 'text-warning' },
  { max: 23, label: 'Bình thường', tone: 'text-secondary-700' },
  { max: 25, label: 'Thừa cân', tone: 'text-warning' },
  { max: Infinity, label: 'Béo phì', tone: 'text-danger' },
]
