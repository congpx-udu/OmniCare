import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Input, MedicalDisclaimer } from '@/components/common'
import { MedicationTable, StatusBadge } from '@/components/records'
import { RECORD_TYPE_LABELS, ROUTES } from '@/constants'
import { useRecordImage } from '@/hooks/useRecordImage'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  clearCurrentRecord,
  clearRecordErrors,
  deleteRecord,
  fetchRecord,
  reprocessRecord,
  updateRecord,
} from '@/redux/slices/recordsSlice'
import type { MedicalRecord, Medication, RecordType } from '@/types'

interface FormState {
  type: RecordType
  facility: string
  doctor: string
  visitDate: string
  diagnosis: string
  medications: Medication[]
  notes: string
}

function toForm(r: MedicalRecord): FormState {
  return {
    type: r.type,
    facility: r.facility ?? '',
    doctor: r.doctor ?? '',
    visitDate: r.visitDate ?? '',
    diagnosis: r.diagnosis ?? '',
    medications: r.medications,
    notes: r.notes ?? '',
  }
}

/** Chi tiết một hồ sơ: ảnh gốc bên trái, dữ liệu bóc tách cho sửa tay bên phải, xác nhận / đọc lại / xóa */
export function RecordDetailPage() {
  const { id = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { current, currentStatus, currentError, saving, saveError } = useAppSelector(
    (s) => s.records,
  )
  const record = current?.id === id ? current : null
  const { url: imageUrl, error: imageError } = useRecordImage(record ? id : null)

  const [form, setForm] = useState<FormState | null>(null)
  const [zoom, setZoom] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void dispatch(fetchRecord(id))
    return () => {
      dispatch(clearRecordErrors())
      dispatch(clearCurrentRecord())
    }
  }, [dispatch, id])

  const current_ = form ?? (record ? toForm(record) : null)
  const patch = (partial: Partial<FormState>) => {
    if (!current_) return
    setForm({ ...current_, ...partial })
    setSaved(false)
  }
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    patch({ [e.target.name]: e.target.value } as Partial<FormState>)

  const save = async (confirm: boolean, e?: FormEvent) => {
    e?.preventDefault()
    if (!current_) return
    const meds = current_.medications
      .map((m) => ({ ...m, name: m.name.trim() }))
      .filter((m) => m.name)
    const result = await dispatch(
      updateRecord({
        id,
        payload: {
          type: current_.type,
          facility: current_.facility.trim() || null,
          doctor: current_.doctor.trim() || null,
          visitDate: current_.visitDate || null,
          diagnosis: current_.diagnosis.trim() || null,
          medications: meds,
          notes: current_.notes.trim() || null,
          confirm,
        },
      }),
    )
    if (updateRecord.fulfilled.match(result)) {
      setForm(null)
      setSaved(true)
    }
  }

  const reprocess = async () => {
    if (!window.confirm('Đọc lại ảnh bằng AI? Dữ liệu đã sửa tay sẽ bị thay thế.')) return
    const result = await dispatch(reprocessRecord(id))
    if (reprocessRecord.fulfilled.match(result)) setForm(null)
  }

  const remove = async () => {
    if (!window.confirm('Xóa hồ sơ này và ảnh gốc? Không thể hoàn tác.')) return
    const result = await dispatch(deleteRecord(id))
    if (deleteRecord.fulfilled.match(result)) navigate(ROUTES.RECORDS, { replace: true })
  }

  if (currentStatus === 'failed' && !record) {
    return (
      <section className="space-y-4">
        <Alert variant="error">{currentError}</Alert>
        <Link to={ROUTES.RECORDS} className="text-secondary text-sm font-semibold hover:underline">
          ← Về danh sách hồ sơ
        </Link>
      </section>
    )
  }

  if (!record || !current_) {
    return <p className="text-sm text-neutral-500">Đang tải hồ sơ...</p>
  }

  const dirty = form !== null

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={ROUTES.RECORDS}
            className="text-secondary text-xs font-semibold hover:underline"
          >
            ← Hồ sơ bệnh án
          </Link>
          <h1 className="mt-1 text-2xl">{record.diagnosis ?? RECORD_TYPE_LABELS[record.type]}</h1>
        </div>
        <StatusBadge status={record.status} />
      </div>

      {record.status === 'needs_review' && (
        <Alert variant="warning">
          AI đã đọc xong. Hãy đối chiếu với ảnh gốc, sửa chỗ sai rồi bấm "Xác nhận & lưu".
          {record.confidence !== null && ` Độ tin cậy: ${Math.round(record.confidence * 100)}%.`}
        </Alert>
      )}
      {record.status === 'failed' && (
        <Alert variant="error">
          {record.errorMessage ?? 'Đọc ảnh thất bại.'} Bạn có thể đọc lại hoặc nhập tay.
        </Alert>
      )}
      {record.warnings.length > 0 && (
        <Alert variant="info">
          <ul className="list-disc pl-4">
            {record.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Alert>
      )}
      {saveError && <Alert variant="error">{saveError}</Alert>}
      {saved && !dirty && <Alert variant="success">Đã lưu.</Alert>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Ảnh gốc */}
        <div className="rounded-card bg-surface self-start border border-neutral-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-primary text-sm font-semibold">Ảnh gốc</span>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setZoom((z) => !z)}
                className="text-secondary text-xs font-semibold hover:underline"
              >
                {zoom ? 'Thu nhỏ' : 'Phóng to'}
              </button>
            )}
          </div>
          {imageError ? (
            <p className="text-danger text-sm">{imageError}</p>
          ) : imageUrl ? (
            <div className={zoom ? 'max-h-[80vh] overflow-auto' : 'overflow-hidden'}>
              <img
                src={imageUrl}
                alt="Ảnh hồ sơ gốc"
                className={
                  zoom ? 'w-[200%] max-w-none' : 'max-h-[70vh] w-full rounded-lg object-contain'
                }
              />
            </div>
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
          )}
        </div>

        {/* Dữ liệu bóc tách */}
        <form onSubmit={(e) => void save(true, e)} noValidate className="min-w-0 space-y-4">
          <fieldset disabled={saving} className="min-w-0 space-y-4">
            <div className="space-y-1.5">
              <span className="font-heading text-primary block text-sm font-semibold">
                Loại tài liệu
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RECORD_TYPE_LABELS) as RecordType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => patch({ type: t })}
                    className={
                      current_.type === t
                        ? 'border-primary bg-primary rounded-full border px-3 py-1 text-xs text-white'
                        : 'hover:border-primary rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700'
                    }
                  >
                    {RECORD_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Cơ sở y tế"
                name="facility"
                value={current_.facility}
                onChange={onChange}
              />
              <Input label="Bác sĩ" name="doctor" value={current_.doctor} onChange={onChange} />
              <Input
                label="Ngày khám"
                name="visitDate"
                type="date"
                value={current_.visitDate}
                onChange={onChange}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="diagnosis"
                className="font-heading text-primary block text-sm font-semibold"
              >
                Chẩn đoán
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows={2}
                value={current_.diagnosis}
                onChange={onChange}
                className="bg-surface focus:border-tertiary focus:ring-tertiary/40 w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="font-heading text-primary block text-sm font-semibold">Thuốc</span>
              <MedicationTable
                value={current_.medications}
                onChange={(medications) => patch({ medications })}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="notes"
                className="font-heading text-primary block text-sm font-semibold"
              >
                Lời dặn / ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={current_.notes}
                onChange={onChange}
                className="bg-surface focus:border-tertiary focus:ring-tertiary/40 w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="lg" loading={saving}>
              Xác nhận & lưu
            </Button>
            {dirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void save(false)}
                disabled={saving}
              >
                Lưu nháp
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={reprocess} disabled={saving}>
              Đọc lại bằng AI
            </Button>
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="text-danger ml-auto text-sm hover:underline disabled:opacity-50"
            >
              Xóa hồ sơ
            </button>
          </div>
        </form>
      </div>

      {record.rawText && (
        <details className="rounded-card bg-surface border border-neutral-200 p-4">
          <summary className="font-heading text-primary cursor-pointer text-sm font-semibold">
            Văn bản AI đọc được
          </summary>
          <pre className="mt-3 max-h-80 overflow-auto text-xs whitespace-pre-wrap text-neutral-700">
            {record.rawText}
          </pre>
        </details>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
