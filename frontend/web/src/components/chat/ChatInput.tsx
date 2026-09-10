import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { IconButton } from '@/components/common'
import { TagInput } from '@/components/health-profile'
import { NavIcon } from '@/components/layout'
import { PANTRY_SUGGESTIONS } from '@/constants'
import type { ChatMode } from '@/types'

export interface ChatSendExtra {
  /** Cảm nhận hôm nay (luồng symptom cũ) */
  feeling?: string
  /** Tủ bếp mức 1: nguyên liệu đang có, không lưu lại */
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
 * Nút tủ bếp (icon giỏ) mở ô tag "Nguyên liệu đang có"; nút gửi dạng icon.
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
  // Tủ bếp giữ trong phiên làm việc, không lưu localStorage
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
    onSend(value, { pantry: pantry.length ? pantry : undefined })
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

  const foodish = mode !== 'symptom'
  const showPantry = foodish && pantryOpen
  const showPantrySummary = foodish && !pantryOpen && pantry.length > 0

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {showPantrySummary && (
        <div className="bg-secondary-50 border-secondary/30 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs text-neutral-700">
          <NavIcon name="basket" className="text-secondary size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-semibold">Tủ bếp:</span> {pantry.join(', ')}
          </span>
          <IconButton
            icon="pencil"
            label="Sửa tủ bếp"
            size="sm"
            variant="ghost"
            tooltipSide="top"
            onClick={() => setPantryOpen(true)}
          />
          <IconButton
            icon="close"
            label="Bỏ tủ bếp"
            size="sm"
            variant="ghost"
            tooltipSide="top"
            onClick={() => setPantry([])}
          />
        </div>
      )}

      {showPantry && (
        <div className="bg-surface rounded-card border border-neutral-200 p-3 shadow-sm">
          <TagInput
            label="Nguyên liệu đang có (tủ bếp)"
            value={pantry}
            onChange={setPantry}
            suggestions={PANTRY_SUGGESTIONS}
            placeholder="Ví dụ: trứng gà, cà chua... rồi Enter"
            hint="Món gợi ý ưu tiên những thứ này và nêu rõ cần mua thêm gì. Không lưu lại."
            maxTags={PANTRY_MAX}
          />
          <div className="mt-2 flex justify-end gap-2">
            {pantry.length > 0 && (
              <IconButton
                icon="trash"
                label="Bỏ hết nguyên liệu"
                size="sm"
                variant="ghost"
                tooltipSide="top"
                onClick={() => setPantry([])}
              />
            )}
            <IconButton
              icon="check"
              label="Xong"
              size="sm"
              variant="soft"
              tooltipSide="top"
              onClick={() => setPantryOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="bg-surface focus-within:border-secondary focus-within:ring-secondary/25 flex items-end gap-2 rounded-2xl border border-neutral-200 p-2 shadow-sm transition focus-within:ring-2">
        {foodish && (
          <IconButton
            icon="basket"
            label="Nấu từ nguyên liệu đang có"
            variant="ghost"
            tooltipSide="top"
            active={pantryOpen || pantry.length > 0}
            disabled={disabled}
            onClick={() => setPantryOpen((v) => !v)}
          />
        )}
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
        <IconButton
          icon="send"
          label="Gửi"
          variant="primary"
          type="submit"
          tooltipSide="top"
          loading={sending}
          disabled={disabled || !text.trim()}
        />
      </div>
    </form>
  )
}
