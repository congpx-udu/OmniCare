import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'
import { cn } from '@/utils'
import {
  FeedbackContext,
  type ConfirmInput,
  type FeedbackContextValue,
  type ToastInput,
  type ToastTone,
} from './feedbackContext'

interface ToastItem extends ToastInput {
  id: number
}

interface PendingConfirm extends ConfirmInput {
  resolve: (ok: boolean) => void
}

const TONE: Record<ToastTone, { icon: NavIconName; box: string; iconBox: string }> = {
  success: {
    icon: 'check',
    box: 'border-secondary/30',
    iconBox: 'bg-secondary-50 text-secondary-700',
  },
  error: { icon: 'alert', box: 'border-danger/30', iconBox: 'bg-danger/10 text-danger' },
  info: { icon: 'info', box: 'border-tertiary/30', iconBox: 'bg-tertiary-50 text-tertiary-700' },
  warning: { icon: 'alert', box: 'border-warning/40', iconBox: 'bg-warning/10 text-warning' },
}

/** Toast (góc dưới phải, tự tắt) + hộp thoại xác nhận dùng chung toàn app */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const counter = useRef(0)
  const confirmBtn = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      counter.current += 1
      const id = counter.current
      setToasts((list) => [...list.slice(-3), { ...input, id }])
      window.setTimeout(() => dismiss(id), input.duration ?? 3500)
    },
    [dismiss],
  )

  const confirm = useCallback(
    (input: ConfirmInput) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...input, resolve })
      }),
    [],
  )

  const settle = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  // Esc đóng hộp thoại; đưa focus vào nút xác nhận khi mở
  useEffect(() => {
    if (!pending) return
    confirmBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') settle(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  const value = useMemo<FeedbackContextValue>(() => ({ toast, confirm }), [toast, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => {
          const tone = TONE[t.tone ?? 'info']
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'bg-surface pointer-events-auto flex items-start gap-3 rounded-2xl border p-3 shadow-[0_16px_40px_-16px_rgba(11,37,69,0.45)]',
                'motion-safe:animate-[toast-in_220ms_cubic-bezier(0.2,0.8,0.2,1)]',
                tone.box,
              )}
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-xl',
                  tone.iconBox,
                )}
              >
                <NavIcon name={tone.icon} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-primary text-sm font-semibold">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-neutral-600">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={() => dismiss(t.id)}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                <NavIcon name="close" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirm dialog */}
      {pending && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => settle(false)}
            className="bg-primary-900/50 absolute inset-0 backdrop-blur-[2px]"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="bg-surface relative w-full max-w-md rounded-3xl p-6 shadow-[0_32px_64px_-24px_rgba(11,37,69,0.6)] motion-safe:animate-[toast-in_200ms_ease-out]"
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                  pending.danger ? 'bg-danger/10 text-danger' : 'bg-secondary-50 text-secondary',
                )}
              >
                <NavIcon name={pending.danger ? 'trash' : 'info'} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="confirm-title" className="text-lg">
                  {pending.title}
                </h2>
                {pending.description && (
                  <p className="mt-1 text-sm text-neutral-600">{pending.description}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="font-heading text-primary hover:bg-primary-50 h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold transition"
              >
                {pending.cancelLabel ?? 'Hủy'}
              </button>
              <button
                ref={confirmBtn}
                type="button"
                onClick={() => settle(true)}
                className={cn(
                  'font-heading h-11 cursor-pointer rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition active:scale-95',
                  'focus-visible:ring-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  pending.danger
                    ? 'bg-danger hover:bg-danger/90'
                    : 'bg-primary hover:bg-primary-600',
                )}
              >
                {pending.confirmLabel ?? 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}
