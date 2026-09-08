import type { CSSProperties, ReactNode, Ref } from 'react'
import type { MaskPosition } from '@/hooks/useMaskPositions'
import { cn } from '@/utils'

interface MaskedCardProps {
  bgImage: string
  position?: MaskPosition
  /** Chiều rộng ảnh khi scale theo chiều cao section (từ useImageWidth) */
  imageWidth: number
  /** 0–1: phần ảnh dư theo chiều ngang sẽ dịch về phía này */
  focalX: number
  /** 0–1: phần ảnh dư theo chiều dọc (khi ảnh phải scale theo chiều rộng) */
  focalY?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
  cardRef?: Ref<HTMLDivElement>
}

/**
 * Card hiển thị một "cửa sổ" của ảnh nền chung cho cả section.
 * Nhiều card đặt cạnh nhau tạo hiệu ứng khảm (mosaic) liền mạch.
 * Ảnh được scale kiểu "cover" toàn section: theo chiều cao, nếu vẫn hẹp hơn section thì theo chiều rộng.
 */
export function MaskedCard({
  bgImage,
  position,
  imageWidth,
  focalX,
  focalY = 0.5,
  className,
  style,
  children,
  cardRef,
}: MaskedCardProps) {
  let bgStyle: CSSProperties
  if (position && position.sh > 0 && imageWidth > 0) {
    const scale = imageWidth < position.sw ? position.sw / imageWidth : 1
    const w = imageWidth * scale
    const h = position.sh * scale
    const offsetX = Math.max(0, w - position.sw) * focalX
    const offsetY = Math.max(0, h - position.sh) * focalY
    bgStyle = {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: `${w}px ${h}px`,
      backgroundPosition: `-${position.x + offsetX}px -${position.y + offsetY}px`,
      backgroundRepeat: 'no-repeat',
    }
  } else {
    // Trước khi đo xong: hiện ảnh cover bình thường để không bị trống
    bgStyle = { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }
  }
  return (
    <div
      ref={cardRef}
      className={cn('bg-surface-muted', className)}
      style={{ ...bgStyle, ...style }}
    >
      {children}
    </div>
  )
}
