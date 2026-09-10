import { useEffect, useId, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { vi } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { NavIcon } from '@/components/layout/NavIcon'
import { cn } from '@/utils'

interface DatePickerProps {
  /** yyyy-mm-dd hoặc '' */
  value: string
  onChange: (value: string) => void
  label?: string
  /** Chỉ hiện nhãn cho trình đọc màn hình (khi đặt trong header) */
  hideLabel?: boolean
  placeholder?: string
  /** yyyy-mm-dd */
  min?: string
  max?: string
  error?: string
  hint?: string
  disabled?: boolean
  /** Cho phép xóa ngày đã chọn */
  clearable?: boolean
  className?: string
}

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromYmd = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined
}
const display = (s: string) => {
  const d = fromYmd(s)
  return d
    ? d.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : ''
}

/** Chọn ngày bằng lịch (react-day-picker, tiếng Việt), giá trị yyyy-mm-dd; nút mở có icon lịch */
export function DatePicker({
  value,
  onChange,
  label,
  hideLabel = false,
  placeholder = 'Chọn ngày',
  min,
  max,
  error,
  hint,
  disabled,
  clearable = false,
  className,
}: DatePickerProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = fromYmd(value)
  const minDate = min ? fromYmd(min) : undefined
  const maxDate = max ? fromYmd(max) : undefined

  // Đóng khi bấm ra ngoài hoặc Esc
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'font-heading text-primary mb-1.5 block text-sm font-semibold',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error) || undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'bg-surface flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border px-3 text-left text-sm transition',
          'focus-visible:ring-tertiary/40 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-danger' : 'hover:border-secondary border-neutral-300',
          open && 'border-secondary ring-secondary/25 ring-2',
        )}
      >
        <NavIcon name="calendar" className="text-secondary size-4 shrink-0" />
        <span className={cn('flex-1 truncate', value ? 'text-neutral-900' : 'text-neutral-400')}>
          {value ? display(value) : placeholder}
        </span>
        {clearable && value ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Xóa ngày"
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onChange('')
              }
            }}
            className="hover:text-danger flex size-6 items-center justify-center rounded-md text-neutral-400"
          >
            <NavIcon name="close" className="size-3.5" />
          </span>
        ) : (
          <NavIcon name="chevron-down" className="size-4 shrink-0 text-neutral-400" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chọn ngày"
          className="bg-surface absolute right-0 z-40 mt-2 rounded-2xl border border-neutral-200 p-3 shadow-[0_24px_48px_-20px_rgba(11,37,69,0.45)]"
        >
          <DayPicker
            mode="single"
            locale={vi}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected ?? maxDate ?? new Date()}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={maxDate ?? new Date(new Date().getFullYear() + 5, 11)}
            onSelect={(d) => {
              onChange(d ? toYmd(d) : '')
              if (d) setOpen(false)
            }}
            footer={
              <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="cursor-pointer text-neutral-500 hover:underline"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  disabled={Boolean(maxDate && maxDate < new Date(new Date().toDateString()))}
                  onClick={() => {
                    onChange(toYmd(new Date()))
                    setOpen(false)
                  }}
                  className="text-secondary cursor-pointer font-semibold hover:underline disabled:opacity-50"
                >
                  Hôm nay
                </button>
              </div>
            }
          />
        </div>
      )}
      {error ? (
        <p className="text-danger mt-1.5 text-xs">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  )
}
