import type { NavIconName } from '@/components/layout/NavIcon'
import { ROUTES } from './routes'

/** Menu ngang landing (navbar + panel mobile). Mục có `route` là đường dẫn nội bộ. */
export const LANDING_MENU = [
  { href: '#features', label: 'Tính năng' },
  { href: '#how', label: 'Cách hoạt động' },
  { href: '#personas', label: 'Dành cho ai' },
  { href: '#faq', label: 'Câu hỏi' },
] as const

/** Chip nhỏ dưới tiêu đề hero */
export const HERO_HIGHLIGHTS: ReadonlyArray<{ icon: NavIconName; label: string }> = [
  { icon: 'stethoscope', label: 'Đánh giá triệu chứng' },
  { icon: 'scan', label: 'Đọc đơn thuốc bằng AI' },
  { icon: 'food', label: 'Gợi ý bữa ăn' },
  { icon: 'activity', label: 'Theo dõi chỉ số' },
]

/** Con số tạo niềm tin ở hero */
export const HERO_STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '5', label: 'Tính năng trong một ứng dụng' },
  { value: '24/7', label: 'Trợ lý luôn sẵn sàng' },
  { value: '~3s', label: 'Đọc xong một đơn thuốc' },
]

export interface FeatureItem {
  icon: NavIconName
  title: string
  desc: string
  /** Thẻ lớn chiếm 2 cột trên desktop */
  wide?: boolean
  to?: string
}

/** Lưới tính năng kiểu bento */
export const FEATURES: ReadonlyArray<FeatureItem> = [
  {
    icon: 'chat',
    title: 'Trợ lý sức khỏe AI',
    desc: 'Kể triệu chứng hoặc gửi ảnh, AI đánh giá mức độ, gợi ý chuyên khoa và nơi nên khám. Cùng khung chat đó hỏi luôn hôm nay nên ăn gì.',
    wide: true,
  },
  {
    icon: 'scan',
    title: 'Số hóa đơn thuốc',
    desc: 'Chụp đơn thuốc hay phiếu khám, AI đọc và lập bảng thuốc để bạn kiểm tra rồi lưu.',
  },
  {
    icon: 'weather',
    title: 'Theo thời tiết nơi bạn ở',
    desc: 'Nhiệt độ, độ ẩm và chất lượng không khí thành lời khuyên cụ thể cho hôm nay.',
  },
  {
    icon: 'activity',
    title: 'Nhật ký sức khỏe',
    desc: 'Ghi cân nặng, huyết áp, giấc ngủ và xem xu hướng bằng biểu đồ.',
  },
  {
    icon: 'basket',
    title: 'Nấu từ đồ đang có',
    desc: 'Kể nguyên liệu trong bếp, AI gợi ý món nấu được và thứ cần mua thêm.',
  },
]

/** Ba bước dùng thử */
export const STEPS: ReadonlyArray<{ icon: NavIconName; title: string; desc: string }> = [
  {
    icon: 'user',
    title: 'Tạo hồ sơ',
    desc: 'Vài thông tin cơ bản: chiều cao, ngày sinh, bệnh nền và dị ứng.',
  },
  {
    icon: 'chat',
    title: 'Hỏi trợ lý',
    desc: 'Mô tả điều bạn đang gặp hoặc gửi ảnh, nhận đánh giá sơ bộ ngay.',
  },
  {
    icon: 'activity',
    title: 'Theo dõi mỗi ngày',
    desc: 'Ghi chỉ số, xem xu hướng và nhận đề xuất cải thiện từ AI.',
  },
]

/** Nhóm người dùng */
export const PERSONAS: ReadonlyArray<{ icon: NavIconName; name: string; desc: string }> = [
  {
    icon: 'heart',
    name: 'Người bận rộn',
    desc: 'Chưa cần đi khám nhưng muốn biết dấu hiệu này có đáng lo không.',
  },
  {
    icon: 'stethoscope',
    name: 'Người có bệnh nền',
    desc: 'Cần bữa ăn và vận động hợp với huyết áp, đường huyết của mình.',
  },
  {
    icon: 'clipboard',
    name: 'Người chăm sóc gia đình',
    desc: 'Giữ đơn thuốc, phiếu khám của cả nhà ở một nơi, tìm lại trong vài giây.',
  },
]

/** Câu hỏi thường gặp */
export const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'OmniCare có thay bác sĩ được không?',
    a: 'Không. OmniCare chỉ đưa thông tin tham khảo sơ bộ và luôn khuyên bạn gặp nhân viên y tế khi cần. Khi phát hiện dấu hiệu nguy hiểm, ứng dụng nhắc gọi 115 ngay.',
  },
  {
    q: 'Dữ liệu sức khỏe của tôi có an toàn không?',
    a: 'Hồ sơ, ảnh và lịch sử chat chỉ tài khoản của bạn xem được. Khi gửi ngữ cảnh cho AI, ứng dụng không gửi kèm tên, số điện thoại hay email.',
  },
  {
    q: 'AI đọc được loại đơn thuốc nào?',
    a: 'Đơn thuốc và phiếu khám in máy, chụp rõ nét, tối đa 8 trang cho một bộ hồ sơ. Kết quả luôn để bạn kiểm tra và sửa trước khi lưu.',
  },
  {
    q: 'Tôi có phải trả phí không?',
    a: 'Bản hiện tại miễn phí. Bạn chỉ cần số điện thoại để tạo tài khoản.',
  },
]

/** Liên kết ở footer */
export const FOOTER_LINKS: ReadonlyArray<{ label: string; href: string; route?: boolean }> = [
  { label: 'Tính năng', href: '#features' },
  { label: 'Cách hoạt động', href: '#how' },
  { label: 'Câu hỏi thường gặp', href: '#faq' },
  { label: 'Đăng nhập', href: ROUTES.LOGIN, route: true },
  { label: 'Đăng ký', href: ROUTES.REGISTER, route: true },
]
