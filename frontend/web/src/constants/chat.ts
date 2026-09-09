import type { ChatMode, RiskLevel } from '@/types'

export interface ChatModeConfig {
  mode: ChatMode
  label: string
  title: string
  description: string
  placeholder: string
  /** Gợi ý bấm nhanh khi khung chat trống */
  starters: readonly string[]
}

/** Hai luồng trong một khung chat (SITEMAP 3.5) */
export const CHAT_MODES: readonly ChatModeConfig[] = [
  {
    mode: 'symptom',
    label: 'Cảm nhận cơ thể',
    title: 'Hôm nay bạn cảm thấy thế nào?',
    description:
      'Mô tả triệu chứng, trợ lý hỏi thêm để làm rõ rồi gợi ý nhóm vấn đề có thể liên quan, mức độ và nơi nên khám.',
    placeholder: 'Ví dụ: Tôi đau đầu từ sáng, hơi buồn nôn...',
    starters: [
      'Tôi bị đau đầu và mệt mỏi hai ngày nay',
      'Tôi ho khan kéo dài, không sốt',
      'Tôi đau bụng âm ỉ sau khi ăn',
      'Tôi khó ngủ và hay hồi hộp',
    ],
  },
  {
    mode: 'food',
    label: 'Gợi ý món ăn',
    title: 'Ăn gì hôm nay?',
    description:
      'Gợi ý món ăn hợp với thời tiết tại vị trí của bạn, tránh dị ứng và cân nhắc bệnh nền trong hồ sơ.',
    placeholder: 'Ví dụ: Bữa tối nhẹ cho ngày nóng?',
    starters: [
      'Bữa tối nay nên ăn gì?',
      'Món nhẹ, mát cho ngày nắng nóng',
      'Bữa sáng nhanh và đủ chất',
      'Món ấm cho ngày mưa lạnh',
    ],
  },
]

/** Chip triệu chứng nhanh cho luồng cảm nhận cơ thể (chỉ là gợi ý nhập liệu) */
export const SYMPTOM_CHIPS = [
  'đau đầu',
  'sốt',
  'ho',
  'đau họng',
  'mệt mỏi',
  'đau bụng',
  'buồn nôn',
  'chóng mặt',
  'khó ngủ',
  'đau lưng',
] as const

export const RISK_LABELS: Record<
  RiskLevel,
  { label: string; badge: string; tone: 'info' | 'success' | 'warning' | 'error' }
> = {
  none: { label: 'Chưa có triệu chứng cụ thể', badge: 'Trò chuyện', tone: 'info' },
  home: { label: 'Có thể theo dõi tại nhà', badge: 'Theo dõi', tone: 'success' },
  doctor: { label: 'Nên đi khám sớm', badge: 'Đi khám', tone: 'warning' },
  emergency: { label: 'Cần cấp cứu ngay', badge: 'Cấp cứu', tone: 'error' },
}

export const EMERGENCY_HOTLINE = '115'
