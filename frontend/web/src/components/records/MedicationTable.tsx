import type { Medication } from '@/types'

interface MedicationTableProps {
  value: Medication[]
  onChange: (next: Medication[]) => void
  disabled?: boolean
}

const COLS: Array<{ key: keyof Medication; label: string; placeholder: string; w: string }> = [
  { key: 'name', label: 'Tên thuốc', placeholder: 'Amoxicillin 500mg', w: 'min-w-44' },
  { key: 'dose', label: 'Liều', placeholder: '1 viên', w: 'min-w-24' },
  { key: 'frequency', label: 'Số lần / ngày', placeholder: '3 lần/ngày sau ăn', w: 'min-w-36' },
  { key: 'duration', label: 'Thời gian', placeholder: '7 ngày', w: 'min-w-24' },
  { key: 'instructions', label: 'Lưu ý', placeholder: 'Uống nhiều nước', w: 'min-w-40' },
]

const EMPTY: Medication = {
  name: '',
  dose: null,
  frequency: null,
  duration: null,
  instructions: null,
}

const cell =
  'bg-surface focus:border-tertiary w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:bg-neutral-50'

/** Bảng thuốc cho người dùng sửa tay sau OCR: thêm, xóa dòng, sửa từng ô */
export function MedicationTable({ value, onChange, disabled }: MedicationTableProps) {
  const set = (i: number, key: keyof Medication, v: string) => {
    const next = value.map((m, idx) => (idx === i ? { ...m, [key]: v === '' ? null : v } : m))
    onChange(next)
  }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { ...EMPTY }])

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className="w-6 px-1 text-xs font-semibold text-neutral-500">#</th>
              {COLS.map((c) => (
                <th key={c.key} className={`px-1 text-xs font-semibold text-neutral-500 ${c.w}`}>
                  {c.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {value.map((m, i) => (
              <tr key={i}>
                <td className="px-1 text-xs text-neutral-500">{i + 1}</td>
                {COLS.map((c) => (
                  <td key={c.key} className="px-1">
                    <input
                      value={m[c.key] ?? ''}
                      onChange={(e) => set(i, c.key, e.target.value)}
                      placeholder={c.placeholder}
                      disabled={disabled}
                      aria-label={`${c.label} thuốc ${i + 1}`}
                      className={cell}
                    />
                  </td>
                ))}
                <td className="px-1">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={disabled}
                    aria-label={`Xóa thuốc ${i + 1}`}
                    className="text-danger rounded p-1 text-sm hover:bg-neutral-100 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {value.length === 0 && (
        <p className="text-xs text-neutral-500">Chưa có thuốc nào. Thêm dòng nếu đơn có thuốc.</p>
      )}
      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="text-secondary text-sm font-semibold hover:underline disabled:opacity-50"
      >
        + Thêm thuốc
      </button>
    </div>
  )
}
