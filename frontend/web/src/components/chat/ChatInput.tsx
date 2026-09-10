import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { IconButton } from '@/components/common'
import { TagInput } from '@/components/health-profile'
import { NavIcon } from '@/components/layout'
import { PANTRY_SUGGESTIONS } from '@/constants'
import type { ChatMode } from '@/types'
import { cn } from '@/utils'

export interface ChatSendExtra {
  /** Cảm nhận hôm nay (luồng symptom cũ) */
  feeling?: string
  /** Tủ bếp mức 1: nguyên liệu đang có, không lưu lại */
  pantry?: string[]
  /** Ảnh kèm tin (≤ 4) */
  images?: File[]
}

interface ChatInputProps {
  mode: ChatMode
  placeholder: string
  disabled?: boolean
  sending?: boolean
  /** Giá trị điền sẵn từ bên ngoài (câu hỏi gợi ý, chip), thay đổi sẽ ghi đè ô nhập */
  prefill?: { text: string; nonce: number } | null
  /** Các câu người dùng đã gửi (cũ → mới) để ↑ gọi lại */
  history?: string[]
  onSend: (text: string, extra: ChatSendExtra) => void
}

const PANTRY_MAX = 30
const IMAGE_MAX = 4
const IMAGE_MAX_BYTES = 10 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Picked {
  file: File
  url: string
}

/**
 * Ô nhập chat: Enter gửi, Shift+Enter xuống dòng; dán / chọn / kéo thả ảnh (≤ 4);
 * ↑ khi ô trống gọi lại câu đã gửi (↓ đi ngược lại); Ctrl+Z khi ô trống khôi phục nội dung vừa xóa hoặc vừa gửi.
 */
export function ChatInput({
  mode,
  placeholder,
  disabled,
  sending,
  prefill,
  history = [],
  onSend,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [pantry, setPantry] = useState<string[]>([])
  const [pantryOpen, setPantryOpen] = useState(false)
  const [images, setImages] = useState<Picked[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [appliedNonce, setAppliedNonce] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // Nội dung vừa gửi / vừa xóa sạch để Ctrl+Z lấy lại; vị trí đang duyệt lịch sử bằng ↑/↓
  const restoreRef = useRef<string | null>(null)
  const histIdx = useRef<number | null>(null)
  const lastText = useRef('')

  if (prefill && prefill.nonce !== appliedNonce) {
    setAppliedNonce(prefill.nonce)
    setText(prefill.text)
  }

  useEffect(() => {
    if (prefill) textareaRef.current?.focus()
  }, [prefill])

  // Thu hồi object URL khi gỡ ảnh / unmount
  useEffect(() => {
    return () => {
      for (const p of images) URL.revokeObjectURL(p.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (files: FileList | File[] | null | undefined) => {
    if (!files) return
    const next: Picked[] = []
    let err: string | null = null
    for (const f of Array.from(files)) {
      if (!IMAGE_TYPES.includes(f.type)) {
        err = 'Chỉ nhận ảnh JPEG, PNG, WEBP'
        continue
      }
      if (f.size > IMAGE_MAX_BYTES) {
        err = 'Mỗi ảnh tối đa 10 MB'
        continue
      }
      if (images.length + next.length >= IMAGE_MAX) {
        err = `Tối đa ${IMAGE_MAX} ảnh mỗi tin`
        break
      }
      next.push({ file: f, url: URL.createObjectURL(f) })
    }
    if (next.length) setImages((cur) => [...cur, ...next])
    setImageError(err)
    textareaRef.current?.focus()
  }

  const removeImage = (url: string) => {
    setImages((cur) => {
      const target = cur.find((p) => p.url === url)
      if (target) URL.revokeObjectURL(target.url)
      return cur.filter((p) => p.url !== url)
    })
  }

  const submit = () => {
    const value = text.trim()
    if ((!value && images.length === 0) || disabled || sending) return
    onSend(value || 'Bạn xem giúp mình ảnh này nhé.', {
      pantry: pantry.length ? pantry : undefined,
      images: images.length ? images.map((p) => p.file) : undefined,
    })
    restoreRef.current = value
    histIdx.current = null
    setText('')
    setImages([])
    setImageError(null)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    // Xóa sạch ô nhập → nhớ lại để Ctrl+Z khôi phục
    if (v === '' && lastText.current.trim()) restoreRef.current = lastText.current
    lastText.current = v
    histIdx.current = null
    setText(v)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
      return
    }
    // Ctrl+Z / Cmd+Z khi ô trống: khôi phục nội dung vừa gửi hoặc vừa xóa
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && text === '') {
      if (restoreRef.current) {
        e.preventDefault()
        setText(restoreRef.current)
        lastText.current = restoreRef.current
        restoreRef.current = null
      }
      return
    }
    // ↑ / ↓ duyệt lại các câu đã gửi (chỉ khi ô trống hoặc đang duyệt)
    if (history.length && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const browsing = histIdx.current !== null
      if (!browsing && text !== '') return
      e.preventDefault()
      let idx = histIdx.current ?? history.length
      idx += e.key === 'ArrowUp' ? -1 : 1
      if (idx < 0) idx = 0
      if (idx >= history.length) {
        histIdx.current = null
        setText('')
        lastText.current = ''
        return
      }
      histIdx.current = idx
      setText(history[idx])
      lastText.current = history[idx]
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (el) el.setSelectionRange(el.value.length, el.value.length)
      })
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) {
      e.preventDefault()
      addFiles(files)
    }
  }

  const onDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const foodish = mode !== 'symptom'
  const canSend = (text.trim().length > 0 || images.length > 0) && !disabled && !sending

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className="space-y-2"
    >
      {pantryOpen && (
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

      <div
        className={cn(
          'bg-surface rounded-2xl border shadow-sm transition',
          dragOver
            ? 'border-secondary ring-secondary/25 ring-2'
            : 'focus-within:border-secondary focus-within:ring-secondary/25 border-neutral-200 focus-within:ring-2',
        )}
      >
        {(images.length > 0 || imageError) && (
          <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
            {images.map((p, i) => (
              <div key={p.url} className="group relative">
                <img
                  src={p.url}
                  alt={`Ảnh đính kèm ${i + 1}`}
                  className="size-16 rounded-xl border border-neutral-200 object-cover"
                />
                <button
                  type="button"
                  aria-label={`Bỏ ảnh ${i + 1}`}
                  onClick={() => removeImage(p.url)}
                  className="bg-primary hover:bg-danger absolute -top-1.5 -right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full text-white shadow transition"
                >
                  <NavIcon name="close" className="size-3.5" />
                </button>
              </div>
            ))}
            {imageError && <p className="text-danger text-xs">{imageError}</p>}
          </div>
        )}

        <div className="flex items-end gap-1.5 p-2 pl-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <IconButton
            icon="image"
            label="Gửi ảnh (hoặc dán / kéo thả)"
            variant="ghost"
            tooltipSide="top"
            active={images.length > 0}
            disabled={disabled || images.length >= IMAGE_MAX}
            onClick={() => fileRef.current?.click()}
          />
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
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder={
              images.length
                ? 'Bạn muốn hỏi gì về ảnh này?'
                : foodish && pantry.length
                  ? 'Ví dụ: Bữa tối nay nấu gì từ những thứ này?'
                  : placeholder
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
            disabled={!canSend}
          />
        </div>
      </div>

      {(pantry.length > 0 || images.length > 0) && !pantryOpen && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-neutral-500">
          {pantry.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <NavIcon name="basket" className="size-3.5" />
              Tủ bếp: {pantry.join(', ')}
            </span>
          )}
          {images.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <NavIcon name="image" className="size-3.5" />
              {images.length}/{IMAGE_MAX} ảnh
            </span>
          )}
        </p>
      )}
    </form>
  )
}
