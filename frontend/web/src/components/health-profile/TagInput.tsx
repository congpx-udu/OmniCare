import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/utils'

interface TagInputProps {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  /** Gợi ý bấm nhanh; ẩn những mục đã chọn */
  suggestions?: readonly string[]
  placeholder?: string
  hint?: string
  error?: string
  maxTags?: number
}

/** Nhập danh sách tag (bệnh nền, dị ứng): gõ rồi Enter/dấu phẩy, hoặc bấm gợi ý */
export function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Nhập rồi nhấn Enter',
  hint,
  error,
  maxTags = 30,
}: TagInputProps) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const has = (tag: string) => value.some((v) => v.toLowerCase() === tag.toLowerCase())

  const add = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ')
    if (!tag || has(tag) || value.length >= maxTags) return
    onChange([...value, tag])
  }

  const remove = (tag: string) => onChange(value.filter((v) => v !== tag))

  const commitDraft = () => {
    if (draft.trim()) add(draft)
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitDraft()
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      remove(value[value.length - 1])
    }
  }

  const visibleSuggestions = suggestions.filter((s) => !has(s))

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-heading text-primary block text-sm font-semibold">
        {label}
      </label>
      <div
        className={cn(
          'bg-surface flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2',
          'focus-within:ring-tertiary/40 transition focus-within:ring-2',
          error ? 'border-danger' : 'focus-within:border-tertiary border-neutral-300',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-primary-50 text-primary inline-flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Xóa ${tag}`}
              className="hover:bg-primary-100 rounded-full p-0.5 leading-none"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commitDraft}
          placeholder={value.length ? '' : placeholder}
          aria-invalid={Boolean(error) || undefined}
          className="min-w-32 flex-1 bg-transparent py-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
      {visibleSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="hover:border-secondary hover:text-secondary rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 transition"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {error ? (
        <p className="text-danger text-xs">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  )
}
