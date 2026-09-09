import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/common'
import { SYMPTOM_CHIPS } from '@/constants'
import type { ChatMode } from '@/types'

interface ChatInputProps {
  mode: ChatMode
  placeholder: string
  disabled?: boolean
  sending?: boolean
  /** Giá trị điền sẵn từ bên ngoài (câu hỏi gợi ý, chip), thay đổi sẽ ghi đè ô nhập */
  prefill?: { text: string; nonce: number } | null
  onSend: (text: string, feeling?: string) => void
}

/** Ô nhập chat: Enter gửi, Shift+Enter xuống dòng; luồng cảm nhận có chip triệu chứng + ô cảm nhận */
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
  const [appliedNonce, setAppliedNonce] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Áp giá trị điền sẵn một lần cho mỗi nonce (tránh setState trong effect)
  if (prefill && prefill.nonce !== appliedNonce) {
    setAppliedNonce(prefill.nonce)
    setText(prefill.text)
  }

  const submit = () => {
    const value = text.trim()
    if (!value || disabled || sending) return
    onSend(value, mode === 'symptom' && feeling.trim() ? feeling.trim() : undefined)
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
      <div className="bg-surface focus-within:border-tertiary focus-within:ring-tertiary/40 flex items-end gap-2 rounded-xl border border-neutral-300 p-2 transition focus-within:ring-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          aria-label="Nội dung tin nhắn"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        <Button type="submit" loading={sending} disabled={disabled || !text.trim()}>
          Gửi
        </Button>
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
      <p className="text-[11px] text-neutral-400">Enter để gửi, Shift+Enter để xuống dòng.</p>
    </form>
  )
}
