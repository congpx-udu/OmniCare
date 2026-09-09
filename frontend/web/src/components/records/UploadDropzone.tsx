import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Button } from '@/components/common'
import { RECORD_IMAGE_MAX_MB, RECORD_IMAGE_TYPES, RECORD_TYPE_LABELS } from '@/constants'
import type { RecordType } from '@/types'
import { cn } from '@/utils'

interface UploadDropzoneProps {
  uploading?: boolean
  onUpload: (file: File, type?: RecordType) => void
}

/** Kéo thả / chọn / chụp ảnh bệnh án, xem trước rồi bấm "Đọc bằng AI" */
export function UploadDropzone({ uploading = false, onUpload }: UploadDropzoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [type, setType] = useState<RecordType | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const pick = (f: File | undefined) => {
    if (!f) return
    if (!(RECORD_IMAGE_TYPES as readonly string[]).includes(f.type)) {
      setError('Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP')
      return
    }
    if (f.size > RECORD_IMAGE_MAX_MB * 1024 * 1024) {
      setError(`Ảnh tối đa ${RECORD_IMAGE_MAX_MB} MB`)
      return
    }
    setError(null)
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0])

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files?.[0])
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const submit = () => {
    if (file) onUpload(file, type || undefined)
  }

  return (
    <div className="rounded-card bg-surface border border-neutral-200 p-4 sm:p-5">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-10 text-center transition',
            dragging ? 'border-secondary bg-secondary-50' : 'border-neutral-300',
          )}
        >
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
              hoặc chọn ảnh từ máy / chụp bằng điện thoại. JPEG, PNG, WEBP tối đa{' '}
              {RECORD_IMAGE_MAX_MB} MB.
            </p>
          </div>
          <label
            htmlFor={inputId}
            className="bg-primary hover:bg-primary-600 font-heading cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            Chọn ảnh
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={RECORD_IMAGE_TYPES.join(',')}
            capture="environment"
            onChange={onChange}
            className="sr-only"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={preview ?? undefined}
            alt="Ảnh đã chọn"
            className="max-h-64 w-full rounded-lg border border-neutral-200 object-contain sm:w-56"
          />
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-sm text-neutral-700">
              <span className="font-semibold">{file.name}</span> ·{' '}
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="space-y-1.5">
              <span className="font-heading text-primary block text-sm font-semibold">
                Loại tài liệu (tùy chọn, AI vẫn tự nhận dạng)
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RECORD_TYPE_LABELS) as RecordType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(type === t ? '' : t)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs transition',
                      type === t
                        ? 'border-primary bg-primary text-white'
                        : 'hover:border-primary border-neutral-300 text-neutral-700',
                    )}
                  >
                    {RECORD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button onClick={submit} loading={uploading}>
                Đọc bằng AI
              </Button>
              <Button variant="ghost" onClick={reset} disabled={uploading}>
                Chọn ảnh khác
              </Button>
            </div>
            {uploading && (
              <p className="text-xs text-neutral-500">
                Đang đọc ảnh, thường mất 5–20 giây. Ảnh không được gửi cho bên thứ ba ngoài dịch vụ
                AI đã cấu hình.
              </p>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-danger mt-2 text-xs">{error}</p>}
    </div>
  )
}
