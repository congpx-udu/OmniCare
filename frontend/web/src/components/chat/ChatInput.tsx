import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { TagInput } from '@/components/health-profile'
import { PANTRY_SUGGESTIONS, SYMPTOM_CHIPS } from '@/constants'
import type { ChatMode } from '@/types'

export interface ChatSendExtra {
  /** Cảm nhận hôm nay (luồng symptom) */
  feeling?: string
  /** Tủ bếp mức 1: nguyên liệu đang có (luồng food), không lưu lại */
  pantry?: string[]
}

interface ChatInputProps {
  mode: ChatMode
  placeholder: string
  disabled?: boolean
  sending?: boolean
  /** Giá trị điền sẵn từ bên ngoài (câu hỏi gợi ý, chip), thay đổi sẽ ghi đè ô nhập */
  prefill?: { text: string; nonce: number } | null
  onSend: (text: string, extra: ChatSendExtra) => void
}

const PANTRY_MAX = 30

/**
 * Ô nhập chat: Enter gửi, Shift+Enter xuống dòng.
 * Luồng cảm nhận: chip triệu chứng + ô cảm nhận. Luồng món ăn: ô tag "Nguyên liệu đang có" (tủ bếp).
 */
export function ChatInput({
  mode,
  placeholder,
  disabled,
  sending,
  prefill,
  onSend,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [feeling, setFeeling] = useState('')
  // Tủ bếp giữ trong phiên làm việc (đổi luồng vẫn còn), không lưu localStorage
  const [pantry, setPantry] = useState<string[]>([])
  const [pantryOpen, setPantryOpen] = useState(false)
  const [appliedNonce, setAppliedNonce] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Áp giá trị điền sẵn một lần cho mỗi nonce (tránh setState trong effect)
  if (prefill && prefill.nonce !== appliedNonce) {
    setAppliedNonce(prefill.nonce)
    setText(prefill.text)
  }

  // Sau khi điền sẵn, đưa con trỏ vào ô nhập để Enter gửi được ngay
  useEffect(() => {
    if (prefill) textareaRef.current?.focus()
  }, [prefill])

  const submit = () => {
    const value = text.trim()
    if (!value || disabled || sending) return
    const extra: ChatSendExtra =
      mode === 'symptom'
        ? { feeling: feeling.trim() || undefined }
        : { pantry: pantry.length ? pantry : undefined }
    onSend(value, extra)
    setText('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const addChip = (chip: string) => {
    setText((t) => {
      const base = t.trim()
      if (base.toLowerCase().includes(chip)) return t
      return base ? `${base}, ${chip}` : `Tôi bị ${chip}`
    })
    textareaRef.current?.focus()
  }

  const foodish = mode !== 'symptom'
  const showPantry = foodish && pantryOpen
  const showPantrySummary = foodish && !pantryOpen && pantry.length > 0

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {mode === 'symptom' && (
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOM_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => addChip(c)}
              className="hover:border-secondary hover:text-secondary rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 transition disabled:opacity-50"
            >
              + {c}
            </button>
          ))}
        </div>
      )}

      {showPantrySummary && (
        <div className="bg-surface flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700">
          <span aria-hidden>🧺</span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold">Tủ bếp:</span> {pantry.join(', ')}
          </span>
          <button
            type="button"
            onClick={() => setPantryOpen(true)}
            className="text-secondary shrink-0 hover:underline"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={() => setPantry([])}
            className="shrink-0 text-neutral-500 hover:underline"
          >
            Bỏ
          </button>
        </div>
      )}

      {foodish && !showPantry && !showPantrySummary && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPantryOpen(true)}
          className="hover:border-secondary hover:text-secondary inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition disabled:opacity-50"
        >
          <span aria-hidden>🧺</span> Nấu từ nguyên liệu đang có
        </button>
      )}

      {showPantry && (
        <div className="bg-surface rounded-xl border border-neutral-200 p-3">
          <TagInput
            label="Nguyên liệu đang có (tủ bếp)"
            value={pantry}
            onChange={setPantry}
            suggestions={PANTRY_SUGGESTIONS}
            placeholder="Ví dụ: trứng gà, cà chua... rồi Enter"
            hint="Món gợi ý sẽ ưu tiên dùng những thứ này và nêu rõ cần mua thêm gì. Không lưu lại."
            maxTags={PANTRY_MAX}
          />
          <div className="mt-2 flex justify-end gap-3 text-xs">
            {pantry.length > 0 && (
              <button
                type="button"
                onClick={() => setPantry([])}
                className="text-neutral-500 hover:underline"
              >
                Bỏ hết
              </button>
            )}
            <button
              type="button"
              onClick={() => setPantryOpen(false)}
              className="text-secondary hover:underline"
            >
              Xong
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface focus-within:border-secondary focus-within:ring-secondary/25 flex items-end gap-2 rounded-2xl border border-neutral-200 p-2 pl-3 shadow-sm transition focus-within:ring-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            foodish && pantry.length ? 'Ví dụ: Bữa tối nay nấu gì từ những thứ này?' : placeholder
          }
          rows={1}
          disabled={disabled}
          aria-label="Nội dung tin nhắn"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={disabled || sending || !text.trim()}
          aria-label="Gửi"
          className="bg-secondary-100 text-secondary hover:bg-secondary-200 flex size-10 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50"
        >
          {sending ? (
            <span className="border-secondary size-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4z" />
            </svg>
          )}
        </button>
      </div>
      {mode === 'symptom' && (
        <input
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          maxLength={300}
          disabled={disabled}
          placeholder="Cảm nhận chung hôm nay (tùy chọn): mệt, uể oải, bình thường..."
          aria-label="Cảm nhận hôm nay"
          className="bg-surface focus:border-tertiary w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />
      )}
      {foodish && pantry.length > 0 && (
        <p className="text-[11px] text-neutral-400">
          Đang gợi ý theo {pantry.length} nguyên liệu trong tủ bếp.
        </p>
      )}
    </form>
  )
}
