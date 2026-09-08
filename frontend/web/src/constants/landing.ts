import featuresBg from '@/assets/landing/features-bg.jpg'
import heroBg from '@/assets/landing/hero-bg.jpg'
import persona1 from '@/assets/landing/persona-1.jpg'
import persona2 from '@/assets/landing/persona-2.jpg'
import personasBg from '@/assets/landing/personas-bg.jpg'
import { ROUTES } from './routes'

/**
 * Ảnh landing page. Hiện là placeholder gradient theo bảng màu.
 * Thay ảnh thật: đổi file trong src/assets/landing/ (giữ tên) hoặc đổi URL ở đây.
 * Khuyến nghị: hero/features 1920×1080, personasBg 1280×1600 (dọc), persona-1/2 900×1000.
 */
export const LANDING_IMAGES = {
  hero: heroBg,
  features: featuresBg,
  personasBg,
  persona1,
  persona2,
} as const

/** Focal point ngang (0–1) của ảnh nền khi ảnh rộng hơn section */
export const LANDING_FOCAL = {
  hero: { mobile: 0.7, desktop: 0.8 },
  features: { mobile: 0.65, desktop: 0.8 },
} as const

/** 3 thanh nổi bật trên hero */
export const HERO_BARS = ['Chatbot triệu chứng', 'OCR đơn thuốc', 'Gợi ý theo bối cảnh'] as const

/** 4 thẻ tính năng ở cuối màn 2 */
export const FEATURE_CARDS: ReadonlyArray<{ name: string; num: string | null; active: boolean }> = [
  { name: 'Chat\nsức khỏe', num: '01', active: true },
  { name: 'Số hóa\nđơn thuốc', num: '02', active: false },
  { name: 'Thực đơn\n& vận động', num: '03', active: false },
  { name: 'Nhắc\nuống thuốc', num: null, active: false },
]

/** Menu ngang landing (navbar + panel mobile) */
export const LANDING_MENU = [
  { href: '#hero', label: 'Trang chủ' },
  { href: '#features', label: 'Tính năng' },
  { href: '#personas', label: 'Dành cho ai' },
  { href: ROUTES.LOGIN, label: 'Đăng nhập', route: true },
  { href: ROUTES.REGISTER, label: 'Đăng ký', route: true },
] as const
