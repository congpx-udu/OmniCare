import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { NavIcon, type NavIconName } from '@/components/layout'
import { RECORD_TYPE_LABELS, ROUTES } from '@/constants'
import type { MedicalRecord, RecordType } from '@/types'
import { formatDate } from '@/utils'

interface RecordCardProps {
  record: MedicalRecord
}

const TYPE_ICON: Record<RecordType, NavIconName> = {
  prescription: 'pill',
  medical_record: 'stethoscope',
  lab_result: 'droplet',
  other: 'clipboard',
}

/** Thẻ hồ sơ trên danh sách / Dashboard: icon loại, ngày, chẩn đoán (2 dòng), cơ sở, chip thuốc, trạng thái */
export function RecordCard({ record }: RecordCardProps) {
  const medCount = record.medications.length
  return (
    <Link
      to={ROUTES.RECORD_DETAIL.replace(':id', record.id)}
      aria-label={`Mở hồ sơ ${record.diagnosis ?? RECORD_TYPE_LABELS[record.type]}`}
      className="card-3d rounded-card bg-surface hover:border-primary-200 flex gap-4 border border-neutral-200 p-4"
    >
      <span
        className="bg-secondary-50 text-secondary flex size-11 shrink-0 items-center justify-center rounded-xl"
        title={RECORD_TYPE_LABELS[record.type]}
      >
        <NavIcon name={TYPE_ICON[record.type]} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500">
            <NavIcon name="calendar" className="size-3.5" />
            {record.visitDate ? formatDate(record.visitDate) : 'Chưa rõ ngày'}
          </span>
          <StatusBadge status={record.status} className="ml-auto" />
        </div>
        <h3 className="text-primary mt-1 line-clamp-2 text-base leading-snug">
          {record.diagnosis ?? record.facility ?? RECORD_TYPE_LABELS[record.type]}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          {record.facility && record.diagnosis && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <NavIcon name="hospital" className="size-3.5 shrink-0" />
              <span className="truncate">{record.facility}</span>
            </span>
          )}
          {medCount > 0 && (
            <span className="bg-secondary-50 text-secondary-700 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
              <NavIcon name="pill" className="size-3.5" />
              {medCount} thuốc
            </span>
          )}
        </div>
        {record.status === 'failed' && record.errorMessage && (
          <p className="text-danger mt-2 line-clamp-1 text-xs">{record.errorMessage}</p>
        )}
      </div>
    </Link>
  )
}
