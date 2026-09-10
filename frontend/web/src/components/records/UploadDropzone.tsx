import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Button, IconButton } from '@/components/common'
import { NavIcon } from '@/components/layout'
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

  return (
    <div className="rounded-card bg-surface space-y-4 border border-neutral-200 p-4 shadow-sm sm:p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-card flex flex-col items-center justify-center gap-3 border-2 border-dashed px-4 text-center transition',
          pages.length ? 'py-5' : 'py-10',
          dragging ? 'border-secondary bg-secondary-50' : 'border-neutral-300',
        )}
      >
        {!pages.length && (
          <>
            <span className="bg-secondary-50 text-secondary flex size-16 items-center justify-center rounded-full">
              <NavIcon name="upload" className="size-8" />
            </span>
            <p className="font-heading text-primary font-semibold">
              Kéo thả ảnh đơn thuốc, phiếu khám vào đây
            </p>
            <p className="text-xs text-neutral-500">
              JPEG, PNG, WEBP · ≤ {RECORD_IMAGE_MAX_MB} MB/ảnh · tối đa {RECORD_MAX_PAGES} trang
            </p>
          </>
        )}
        <label
          htmlFor={inputId}
          className={cn(
            'font-heading inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
            'focus-within:ring-tertiary focus-within:ring-2 focus-within:ring-offset-2',
            pages.length
              ? 'text-primary hover:bg-primary-50 border border-neutral-300'
              : 'bg-primary hover:bg-primary-600 text-white',
          )}
        >
          <NavIcon name={pages.length ? 'plus' : 'image'} className="size-4" />
          {pages.length ? 'Thêm trang' : 'Chọn ảnh'}
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

      {pages.length > 0 && (
        <ol className="flex flex-wrap gap-3">
          {pages.map((p, i) => (
            <li
              key={p.preview}
              className="bg-surface relative w-32 rounded-xl border border-neutral-200 p-1.5 shadow-sm"
            >
              <img
                src={p.preview}
                alt={`Trang ${i + 1}`}
                className="h-36 w-full rounded-lg object-cover"
              />
              <span className="bg-primary/85 absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="absolute top-2.5 right-2.5">
                <IconButton
                  icon="close"
                  label={`Bỏ trang ${i + 1}`}
                  size="sm"
                  variant="danger"
                  tooltipSide="left"
                  onClick={() => removeAt(i)}
                  disabled={uploading}
                  className="bg-surface/90"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <IconButton
                  icon="chevron-left"
                  label="Chuyển lên trước"
                  size="sm"
                  variant="ghost"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || uploading}
                />
                <span className="truncate text-[11px] text-neutral-500" title={p.file.name}>
                  {(p.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <IconButton
                  icon="chevron-right"
                  label="Chuyển ra sau"
                  size="sm"
                  variant="ghost"
                  onClick={() => move(i, 1)}
                  disabled={i === pages.length - 1 || uploading}
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      {pages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={submit} loading={uploading}>
            <NavIcon name="sparkles" className="size-4" />
            Đọc bằng AI{pages.length > 1 ? ` (${pages.length} trang)` : ''}
          </Button>
          <IconButton
            icon="trash"
            label="Bỏ hết ảnh"
            variant="ghost"
            onClick={reset}
            disabled={uploading}
          />
          {uploading && <span className="text-xs text-neutral-500">Thường mất 5–30 giây...</span>}
        </div>
      )}
      {error && (
        <p className="text-danger flex items-start gap-1.5 text-xs" role="alert">
          <NavIcon name="alert" className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
