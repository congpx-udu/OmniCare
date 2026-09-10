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

/** Luồng hợp nhất 'health' là luồng duy nhất hiển thị; food/symptom giữ cấu hình cho lịch sử cũ */
export const CHAT_MODES: readonly ChatModeConfig[] = [
  {
    mode: 'health',
    label: 'Trợ lý sức khỏe AI',
    title: 'Trợ lý sức khỏe AI',
    description: 'Dự đoán triệu chứng · cảnh báo · gợi ý chuyên gia · món ăn hợp thể trạng',
    placeholder: 'Mô tả triệu chứng hoặc hỏi hôm nay nên ăn gì...',
    starters: [
      'Tôi bị sốt và ho 2 ngày nay',
      'Dạo này tôi mất ngủ, hay căng thẳng',
      'Tôi thấy đau đầu và chóng mặt',
      'Tôi bị đau bụng, buồn nôn từ tối qua',
      'Hôm nay nên ăn gì cho hợp thời tiết?',
    ],
  },
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

/** Gợi ý nguyên liệu thường có trong tủ bếp (Tủ bếp mức 1, chỉ là gợi ý nhập liệu) */
export const PANTRY_SUGGESTIONS = [
  'trứng gà',
  'thịt heo',
  'thịt gà',
  'cá',
  'đậu phụ',
  'cà chua',
  'rau cải',
  'hành lá',
  'tỏi',
  'gừng',
  'gạo',
  'bún',
  'mì',
  'khoai tây',
  'bí đỏ',
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

/** Lời chào mở đầu khung chat hợp nhất (chưa có lịch sử) */
export const CHAT_GREETING =
  'Xin chào! Mình là trợ lý sức khỏe OmniCare. Hãy mô tả triệu chứng bạn đang gặp — mình sẽ đưa ra dự đoán sơ bộ, cảnh báo và gợi ý chuyên khoa phù hợp. Bạn cũng có thể hỏi hôm nay nên ăn gì, mình sẽ gợi ý theo thời tiết, thể trạng và những gì bạn vừa kể.'
