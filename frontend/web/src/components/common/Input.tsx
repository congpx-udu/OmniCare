import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  rightSlot?: ReactNode
}

/** Ô nhập có nhãn, thông báo lỗi và slot bên phải (ví dụ nút hiện mật khẩu) */
export function Input({ label, error, hint, rightSlot, className, id, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="font-heading text-primary block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'bg-surface w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400',
            'focus:ring-tertiary/40 transition focus:ring-2 focus:outline-none',
            error
              ? 'border-danger focus:border-danger'
              : 'focus:border-tertiary border-neutral-300',
            rightSlot ? 'pr-11' : null,
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-danger text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
