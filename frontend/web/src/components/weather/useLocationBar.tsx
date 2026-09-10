import { useState, type FormEvent } from 'react'
import { IconButton, Input, SectionCard } from '@/components/common'
import type { WeatherLocationQuery } from '@/types'

interface LocationBarProps {
  onSelect: (query: WeatherLocationQuery) => void
  /** Định vị lại bằng trình duyệt */
  onLocate: () => void
  loading?: boolean
  locating?: boolean
  /** Lỗi định vị (bị từ chối, không hỗ trợ) để gợi ý nhập tay */
  geoError?: string | null
  /** Mở sẵn ô nhập thành phố (khi chưa có vị trí) */
  defaultOpen?: boolean
  /** Nút đặt trên nền tối (banner): dùng kính mờ trắng */
  onDark?: boolean
}

/**
 * Điều khiển vị trí: 2 nút icon (đổi vị trí / định vị lại) + ô nhập thành phố có thể mở.
 * `actions` đặt vào PageHeader, `panel` đặt ngay dưới header.
 */
export function useLocationBar({
  onSelect,
  onLocate,
  loading = false,
  locating = false,
  geoError,
  defaultOpen = false,
  onDark = false,
}: LocationBarProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [city, setCity] = useState('')
  const [cityError, setCityError] = useState<string | null>(null)

  const submitCity = (e: FormEvent) => {
    e.preventDefault()
    const value = city.trim()
    if (value.length < 2) {
      setCityError('Nhập tên thành phố, ví dụ: Hà Nội')
      return
    }
    setCityError(null)
    onSelect({ city: value })
    setCity('')
    setOpen(false)
  }

  const actions = (
    <>
      <IconButton
        icon="pencil"
        label="Đổi vị trí"
        variant={onDark ? 'glass' : 'outline'}
        active={open}
        onClick={() => setOpen((v) => !v)}
      />
      <IconButton
        icon="target"
        label="Định vị lại"
        variant={onDark ? 'glass' : 'soft'}
        loading={locating}
        disabled={loading}
        onClick={onLocate}
      />
    </>
  )

  const panel = open ? (
    <SectionCard className="p-4">
      <form onSubmit={submitCity} noValidate className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Thành phố"
            name="city"
            placeholder="Hà Nội, Đà Nẵng, Hồ Chí Minh..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={cityError ?? undefined}
            autoComplete="off"
            autoFocus
          />
        </div>
        <IconButton
          type="submit"
          icon="search"
          label="Xem thời tiết"
          variant="primary"
          loading={loading}
          className="mb-[1px]"
        />
      </form>
      {geoError && (
        <p className="mt-2 text-xs text-neutral-500">Không lấy được vị trí tự động: {geoError}</p>
      )}
    </SectionCard>
  ) : null

  return { actions, panel, open }
}
