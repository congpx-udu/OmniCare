import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  IconButton,
  Input,
  MedicalDisclaimer,
  PageBanner,
  PageHeader,
  SectionCard,
} from '@/components/common'
import { NavIcon } from '@/components/layout'
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
import type { MedicalRecord, MedicationTable as MedicationTableData, RecordType } from '@/types'
import { formatDate } from '@/utils'

interface FormState {
  type: RecordType
  facility: string
  doctor: string
  visitDate: string
  diagnosis: string
  medicationTable: MedicationTableData
  notes: string
}

function toForm(r: MedicalRecord): FormState {
  return {
    type: r.type,
    facility: r.facility ?? '',
    doctor: r.doctor ?? '',
    visitDate: r.visitDate ?? '',
    diagnosis: r.diagnosis ?? '',
    medicationTable: r.medicationTable,
    notes: r.notes ?? '',
  }
}

const textarea =
  'bg-surface focus:border-tertiary focus:ring-tertiary/30 w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none'

/** Chi tiết một hồ sơ: ảnh gốc bên trái, dữ liệu bóc tách cho sửa tay bên phải, xác nhận / đọc lại / xóa */
export function RecordDetailPage() {
  const { id = '' } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { current, currentStatus, currentError, saving, saveError } = useAppSelector(
    (s) => s.records,
  )
  const record = current?.id === id ? current : null
  const [page, setPage] = useState(0)
  const pageCount = record?.pages.length ?? 0
  const { url: imageUrl, error: imageError } = useRecordImage(record ? id : null, page)

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
    // Bỏ dòng trống hoàn toàn
    const rows = current_.medicationTable.rows.filter((r) =>
      Object.values(r).some((v) => v && v.trim()),
    )
    const result = await dispatch(
      updateRecord({
        id,
        payload: {
          facility: current_.facility.trim() || null,
          doctor: current_.doctor.trim() || null,
          visitDate: current_.visitDate || null,
          diagnosis: current_.diagnosis.trim() || null,
          medicationTable: { columns: current_.medicationTable.columns, rows },
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

  const back = () => navigate(ROUTES.RECORDS)

  if (currentStatus === 'failed' && !record) {
    return (
      <section className="space-y-4">
        <PageHeader
          icon="clipboard"
          title="Không mở được hồ sơ"
          actions={<IconButton icon="chevron-left" label="Quay lại danh sách" onClick={back} />}
        />
        <Alert variant="error">{currentError}</Alert>
      </section>
    )
  }

  if (!record || !current_) {
    return (
      <section className="space-y-5" aria-busy aria-label="Đang tải hồ sơ">
        <div className="h-12 w-2/3 animate-pulse rounded-xl bg-neutral-200" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="rounded-card h-80 animate-pulse bg-neutral-200" />
          <div className="rounded-card h-80 animate-pulse bg-neutral-200" />
        </div>
      </section>
    )
  }

  const dirty = form !== null
  const subtitle = [
    record.visitDate ? formatDate(record.visitDate) : null,
    record.facility,
    RECORD_TYPE_LABELS[record.type],
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="space-y-5">
      <PageBanner
        icon="clipboard"
        title="Chi tiết bệnh án"
        subtitle={[record.diagnosis, subtitle].filter(Boolean).join(' · ')}
        leading={
          <IconButton
            icon="chevron-left"
            label="Quay lại danh sách"
            variant="glass"
            onClick={back}
          />
        }
        actions={
          <>
            <IconButton
              icon="sparkles"
              label="Đọc lại bằng AI"
              variant="glass"
              onClick={reprocess}
              disabled={saving}
            />
            <IconButton
              icon="trash"
              label="Xóa hồ sơ"
              variant="glass"
              className="hover:bg-danger/60"
              onClick={remove}
              disabled={saving}
            />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={record.status} />
        {record.confidence !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
            <NavIcon name="sparkles" className="size-3.5" />
            Tin cậy {Math.round(record.confidence * 100)}%
          </span>
        )}
        {pageCount > 1 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
            <NavIcon name="image" className="size-3.5" />
            {pageCount} trang
          </span>
        )}
      </div>

      {record.status === 'needs_review' && (
        <Alert variant="warning" className="flex items-start gap-2">
          <NavIcon name="eye" className="mt-0.5 size-4 shrink-0" />
          <span>Đối chiếu với ảnh gốc, sửa chỗ sai rồi bấm Xác nhận & lưu.</span>
        </Alert>
      )}
      {record.status === 'failed' && (
        <Alert variant="error" className="flex items-start gap-2">
          <NavIcon name="alert" className="mt-0.5 size-4 shrink-0" />
          <span>{record.errorMessage ?? 'Đọc ảnh thất bại.'} Đọc lại hoặc nhập tay.</span>
        </Alert>
      )}
      {record.warnings.length > 0 && (
        <Alert variant="info" className="flex items-start gap-2">
          <NavIcon name="info" className="mt-0.5 size-4 shrink-0" />
          <ul className="list-disc pl-4">
            {record.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Alert>
      )}
      {saveError && <Alert variant="error">{saveError}</Alert>}
      {saved && !dirty && (
        <Alert variant="success" className="flex items-center gap-2">
          <NavIcon name="check" className="size-4" />
          Đã lưu
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <SectionCard
          icon="image"
          title={pageCount > 1 ? `Ảnh gốc · ${page + 1}/${pageCount}` : 'Ảnh gốc'}
          className="self-start"
          actions={
            <>
              {pageCount > 1 && (
                <>
                  <IconButton
                    icon="chevron-left"
                    label="Trang trước"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  />
                  <IconButton
                    icon="chevron-right"
                    label="Trang sau"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page === pageCount - 1}
                  />
                </>
              )}
              {imageUrl && (
                <IconButton
                  icon="search"
                  label={zoom ? 'Thu nhỏ' : 'Phóng to'}
                  size="sm"
                  active={zoom}
                  onClick={() => setZoom((z) => !z)}
                />
              )}
            </>
          }
        >
          {imageError ? (
            <p className="text-danger text-sm">{imageError}</p>
          ) : imageUrl ? (
            <div className={zoom ? 'max-h-[80vh] overflow-auto rounded-lg' : 'overflow-hidden'}>
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
        </SectionCard>

        <form onSubmit={(e) => void save(true, e)} noValidate className="min-w-0">
          <SectionCard icon="stethoscope" title="Thông tin khám">
            <fieldset disabled={saving} className="min-w-0 space-y-4">
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
                  className={textarea}
                />
              </div>
            </fieldset>
          </SectionCard>
        </form>
      </div>

      {/* Thuốc và lời dặn: toàn chiều rộng để bảng thuốc đọc rõ từng cột */}
      <form
        onSubmit={(e) => void save(true, e)}
        noValidate
        className="min-w-0 space-y-5"
        aria-label="Thuốc và lời dặn"
      >
        <SectionCard
          icon="pill"
          title="Thuốc"
          actions={
            current_.medicationTable.rows.length > 0 ? (
              <span className="bg-secondary-50 text-secondary-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                {current_.medicationTable.rows.length} dòng
              </span>
            ) : undefined
          }
        >
          <fieldset disabled={saving} className="min-w-0 space-y-4">
            <MedicationTable
              value={current_.medicationTable}
              onChange={(medicationTable) => patch({ medicationTable })}
              disabled={saving}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="notes"
                className="font-heading text-primary block text-sm font-semibold"
              >
                Lời dặn
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={current_.notes}
                onChange={onChange}
                className={textarea}
              />
            </div>
          </fieldset>
        </SectionCard>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="lg" loading={saving}>
            <NavIcon name="check" className="size-5" />
            Xác nhận & lưu
          </Button>
          {dirty && (
            <>
              <IconButton
                icon="save"
                label="Lưu nháp"
                variant="outline"
                size="lg"
                onClick={() => void save(false)}
                disabled={saving}
              />
              <IconButton
                icon="close"
                label="Hủy thay đổi"
                variant="ghost"
                size="lg"
                onClick={() => setForm(null)}
                disabled={saving}
              />
            </>
          )}
        </div>
      </form>

      {record.rawText && (
        <details className="rounded-card bg-surface border border-neutral-200 p-4 shadow-sm">
          <summary className="font-heading text-primary inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <NavIcon name="eye" className="size-4" />
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
