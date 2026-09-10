import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, EmptyState, IconButton, MedicalDisclaimer, PageBanner } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { RecordCard, UploadDropzone } from '@/components/records'
import { ROUTES } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearRecordErrors, fetchRecords, uploadRecord } from '@/redux/slices/recordsSlice'
import { cn } from '@/utils'

/** Hồ sơ bệnh án (DM-01, DM-02): upload ảnh in máy → AI đọc → danh sách theo ngày khám */
export function RecordsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, listStatus, listError, uploading, uploadError } = useAppSelector((s) => s.records)
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [showUpload, setShowUpload] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

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

  const onUpload = async (files: File[]) => {
    const result = await dispatch(uploadRecord({ files }))
    if (uploadRecord.fulfilled.match(result)) {
      navigate(ROUTES.RECORD_DETAIL.replace(':id', result.payload.id))
    }
  }

  const uploadOpen = showUpload || items.length === 0
  const filtering = year !== ''

  return (
    <section className="space-y-5">
      <PageBanner
        icon="clipboard"
        title="Hồ sơ bệnh án"
        subtitle={`${items.length} bệnh án · AI đọc đơn thuốc, phiếu khám in máy`}
        actions={
          <>
            {years.length > 0 && (
              <IconButton
                icon="filter"
                label="Lọc theo năm"
                variant="glass"
                active={showFilter || filtering}
                onClick={() => setShowFilter((v) => !v)}
              />
            )}
            <IconButton
              icon={uploadOpen && items.length > 0 ? 'close' : 'upload'}
              label={uploadOpen && items.length > 0 ? 'Đóng khung tải' : 'Tải bệnh án'}
              variant="glass"
              active={uploadOpen && items.length > 0}
              onClick={() => setShowUpload((v) => !v)}
              disabled={items.length === 0}
            />
          </>
        }
      />

      {uploadError && <Alert variant="error">{uploadError}</Alert>}
      {uploadOpen && <UploadDropzone uploading={uploading} onUpload={onUpload} />}

      {items.length > 0 && (
        <div className="space-y-3">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm hồ sơ</span>
            <NavIcon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm chẩn đoán, thuốc..."
              className="bg-surface focus:border-tertiary focus:ring-tertiary/30 w-full rounded-xl border border-neutral-200 py-2.5 pr-3.5 pl-10 text-sm shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
            />
          </label>

          {(showFilter || filtering) && years.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Lọc theo năm"
            >
              <NavIcon name="calendar" className="text-secondary mr-1 size-4" />
              {(['', ...years] as Array<number | ''>).map((y) => (
                <button
                  key={String(y)}
                  type="button"
                  aria-pressed={year === y}
                  onClick={() => setYear(y)}
                  className={cn(
                    'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    year === y
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface hover:border-primary border border-neutral-200 text-neutral-700',
                  )}
                >
                  {y === '' ? 'Tất cả' : y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {listStatus === 'failed' && listError && <Alert variant="error">{listError}</Alert>}

      {listStatus === 'loading' && items.length === 0 ? (
        <div className="space-y-3" aria-busy aria-label="Đang tải hồ sơ">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-card h-24 animate-pulse bg-neutral-200" />
          ))}
        </div>
      ) : items.length === 0 && listStatus !== 'loading' ? null : visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="Không có hồ sơ khớp"
          hint="Thử từ khóa khác hoặc bỏ lọc năm."
          action={
            filtering || q ? (
              <IconButton
                icon="close"
                label="Bỏ lọc"
                variant="outline"
                onClick={() => {
                  setQ('')
                  setYear('')
                }}
              />
            ) : undefined
          }
        />
      ) : (
        <ol className="grid gap-3 md:grid-cols-2">
          {visible.map((r) => (
            <li key={r.id}>
              <RecordCard record={r} />
            </li>
          ))}
        </ol>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
