import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Input, MedicalDisclaimer } from '@/components/common'
import { RecordCard, UploadDropzone } from '@/components/records'
import { ROUTES } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearRecordErrors, fetchRecords, uploadRecord } from '@/redux/slices/recordsSlice'
import type { RecordType } from '@/types'

/** Hồ sơ bệnh án (DM-01, DM-02): upload ảnh in máy → AI đọc → timeline theo ngày khám */
export function RecordsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, listStatus, listError, uploading, uploadError } = useAppSelector((s) => s.records)
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number | ''>('')

  useEffect(() => {
    if (listStatus === 'idle') void dispatch(fetchRecords())
    return () => void dispatch(clearRecordErrors())
  }, [dispatch, listStatus])

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const r of items) if (r.visitDate) set.add(Number(r.visitDate.slice(0, 4)))
    return [...set].sort((a, b) => b - a)
  }, [items])

  // Lọc phía client: danh sách một người dùng nhỏ, tránh gọi API mỗi phím
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((r) => {
      if (year && (!r.visitDate || Number(r.visitDate.slice(0, 4)) !== year)) return false
      if (!needle) return true
      const hay = [r.diagnosis, r.facility, r.notes, ...r.medications.map((m) => m.name)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [items, q, year])

  const onUpload = async (files: File[], type?: RecordType) => {
    const result = await dispatch(uploadRecord({ files, type }))
    if (uploadRecord.fulfilled.match(result)) {
      navigate(ROUTES.RECORD_DETAIL.replace(':id', result.payload.id))
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl">Hồ sơ bệnh án</h1>
        <p className="text-neutral-600">
          Chụp đơn thuốc, phiếu khám, kết quả xét nghiệm in máy. Trợ lý AI đọc và bóc tách, bạn kiểm
          tra lại rồi lưu. Hồ sơ đã lưu giúp trợ lý hiểu tiền sử của bạn khi trò chuyện.
        </p>
      </div>

      {uploadError && <Alert variant="error">{uploadError}</Alert>}
      <UploadDropzone uploading={uploading} onUpload={onUpload} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Tìm kiếm"
            placeholder="Chẩn đoán, cơ sở, tên thuốc..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {years.length > 0 && (
          <div className="space-y-1.5">
            <span className="font-heading text-primary block text-sm font-semibold">Năm</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setYear('')}
                className={
                  year === ''
                    ? 'bg-primary rounded-full px-3 py-1.5 text-xs font-semibold text-white'
                    : 'hover:border-primary rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700'
                }
              >
                Tất cả
              </button>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={
                    year === y
                      ? 'bg-primary rounded-full px-3 py-1.5 text-xs font-semibold text-white'
                      : 'hover:border-primary rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700'
                  }
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {listStatus === 'failed' && listError && <Alert variant="error">{listError}</Alert>}

      {listStatus === 'loading' && items.length === 0 ? (
        <p className="text-sm text-neutral-500">Đang tải hồ sơ...</p>
      ) : visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          {items.length === 0
            ? 'Chưa có hồ sơ nào. Tải ảnh đầu tiên ở phía trên.'
            : 'Không có hồ sơ khớp bộ lọc.'}
        </div>
      ) : (
        <ol className="relative space-y-3 border-l border-neutral-200 pl-5">
          {visible.map((r) => (
            <li key={r.id} className="relative">
              <span className="bg-secondary absolute top-5 -left-[1.6rem] size-2.5 rounded-full ring-4 ring-white" />
              <RecordCard record={r} />
            </li>
          ))}
        </ol>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
