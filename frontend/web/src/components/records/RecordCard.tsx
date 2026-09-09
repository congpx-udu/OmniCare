import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { RECORD_TYPE_LABELS, ROUTES } from '@/constants'
import type { MedicalRecord } from '@/types'
import { formatDate } from '@/utils'

interface RecordCardProps {
  record: MedicalRecord
}

/** Một mục trên timeline hồ sơ bệnh án */
export function RecordCard({ record }: RecordCardProps) {
  const meds = record.medications.map((m) => m.name)
  return (
    <Link
      to={ROUTES.RECORD_DETAIL.replace(':id', record.id)}
      className="rounded-card bg-surface hover:border-primary-200 block border border-neutral-200 p-4 transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            {RECORD_TYPE_LABELS[record.type]}
            {record.visitDate ? ` · ${formatDate(record.visitDate)}` : ' · Chưa rõ ngày khám'}
          </p>
          <h3 className="text-primary mt-0.5 truncate text-base">
            {record.diagnosis ?? record.facility ?? 'Chưa có chẩn đoán'}
          </h3>
          {record.facility && record.diagnosis && (
            <p className="truncate text-sm text-neutral-600">{record.facility}</p>
          )}
        </div>
        <StatusBadge status={record.status} />
      </div>
      {meds.length > 0 && (
        <p className="mt-2 truncate text-xs text-neutral-500">
          {meds.length} thuốc: {meds.slice(0, 4).join(', ')}
          {meds.length > 4 ? '...' : ''}
        </p>
      )}
      {record.status === 'failed' && record.errorMessage && (
        <p className="text-danger mt-2 text-xs">{record.errorMessage}</p>
      )}
    </Link>
  )
}
