import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Button } from '@/components/common'
import { RECORD_IMAGE_MAX_MB, RECORD_IMAGE_TYPES, RECORD_MAX_PAGES } from '@/constants'
import { cn } from '@/utils'

interface UploadDropzoneProps {
  uploading?: boolean
  onUpload: (files: File[]) => void
}

interface Picked {
  file: File
  preview: string
}

/** Kéo thả / chọn / chụp nhiều trang của cùng một bộ hồ sơ, sắp thứ tự, rồi bấm "Đọc bằng AI" */
export function UploadDropzone({ uploading = false, onUpload }: UploadDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pages, setPages] = useState<Picked[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (list: FileList | null | undefined) => {
    if (!list?.length) return
    const next = [...pages]
    const errors: string[] = []
    for (const f of Array.from(list)) {
      if (next.length >= RECORD_MAX_PAGES) {
        errors.push(`Tối đa ${RECORD_MAX_PAGES} trang mỗi bộ hồ sơ`)
        break
      }
      if (!(RECORD_IMAGE_TYPES as readonly string[]).includes(f.type)) {
        errors.push(`${f.name}: chỉ chấp nhận JPEG, PNG, WEBP`)
        continue
      }
      if (f.size > RECORD_IMAGE_MAX_MB * 1024 * 1024) {
        errors.push(`${f.name}: tối đa ${RECORD_IMAGE_MAX_MB} MB`)
        continue
      }
      next.push({ file: f, preview: URL.createObjectURL(f) })
    }
    setPages(next)
    setError(errors.length ? errors.join(' · ') : null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const removeAt = (i: number) => {
    URL.revokeObjectURL(pages[i].preview)
    setPages(pages.filter((_, idx) => idx !== i))
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= pages.length) return
    const next = [...pages]
    ;[next[i], next[j]] = [next[j], next[i]]
    setPages(next)
  }

  const reset = () => {
    for (const p of pages) URL.revokeObjectURL(p.preview)
    setPages([])
    setError(null)
  }

  const submit = () => {
    if (pages.length) onUpload(pages.map((p) => p.file))
  }

  const dropArea = (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 text-center transition',
        pages.length ? 'py-5' : 'py-10',
        dragging ? 'border-secondary bg-secondary-50' : 'border-neutral-300',
      )}
    >
      {!pages.length && (
        <>
          <svg
            viewBox="0 0 24 24"
            className="text-secondary size-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v12m0-12-4 4m4-4 4 4" />
          </svg>
          <div>
            <p className="font-heading text-primary font-semibold">
              Kéo thả ảnh đơn thuốc, bệnh án vào đây
            </p>
            <p className="text-sm text-neutral-500">
              Chọn nhiều ảnh nếu hồ sơ có nhiều trang, AI sẽ đọc và gộp thành một kết quả. JPEG,
              PNG, WEBP tối đa {RECORD_IMAGE_MAX_MB} MB/ảnh, {RECORD_MAX_PAGES} trang.
            </p>
          </div>
        </>
      )}
      <label
        htmlFor={inputId}
        className={cn(
          'font-heading cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition',
          pages.length
            ? 'text-primary hover:bg-primary-50 border border-neutral-300'
            : 'bg-primary hover:bg-primary-600 text-white',
        )}
      >
        {pages.length ? '+ Thêm trang' : 'Chọn ảnh'}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={RECORD_IMAGE_TYPES.join(',')}
        capture="environment"
        onChange={onChange}
        disabled={uploading}
        className="sr-only"
      />
    </div>
  )

  return (
    <div className="rounded-card bg-surface space-y-4 border border-neutral-200 p-4 sm:p-5">
      {pages.length > 0 && (
        <ol className="flex flex-wrap gap-3">
          {pages.map((p, i) => (
            <li
              key={p.preview}
              className="relative w-32 rounded-lg border border-neutral-200 p-1.5 text-center"
            >
              <img
                src={p.preview}
                alt={`Trang ${i + 1}`}
                className="h-36 w-full rounded object-cover"
              />
              <p className="mt-1 truncate text-[11px] text-neutral-500" title={p.file.name}>
                Trang {i + 1} · {(p.file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <div className="mt-1 flex justify-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || uploading}
                  aria-label="Chuyển lên trước"
                  className="rounded px-1.5 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === pages.length - 1 || uploading}
                  aria-label="Chuyển ra sau"
                  className="rounded px-1.5 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={uploading}
                  aria-label={`Bỏ trang ${i + 1}`}
                  className="text-danger rounded px-1.5 text-xs hover:bg-neutral-100 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {dropArea}

      {pages.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={submit} loading={uploading}>
              Đọc {pages.length > 1 ? `${pages.length} trang` : ''} bằng AI
            </Button>
            <Button variant="ghost" onClick={reset} disabled={uploading}>
              Bỏ hết
            </Button>
          </div>
          {uploading && (
            <p className="text-xs text-neutral-500">
              Đang đọc {pages.length} trang, thường mất 5–30 giây. Ảnh không được gửi cho bên thứ ba
              ngoài dịch vụ AI đã cấu hình.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  )
}
