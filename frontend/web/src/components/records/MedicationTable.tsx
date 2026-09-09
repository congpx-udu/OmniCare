import type { Medication } from '@/types'

interface MedicationTableProps {
  value: Medication[]
  onChange: (next: Medication[]) => void
  disabled?: boolean
}

const COLS: Array<{ key: keyof Medication; label: string; placeholder: string; w: string }> = [
  { key: 'name', label: 'Tên thuốc', placeholder: 'Amoxicillin 500mg', w: 'w-[26%] min-w-48' },
  { key: 'dose', label: 'Liều mỗi lần', placeholder: '1 viên', w: 'w-[11%] min-w-24' },
  {
    key: 'frequency',
    label: 'Số lần / ngày',
    placeholder: '3 lần/ngày sau ăn',
    w: 'w-[18%] min-w-36',
  },
  { key: 'quantity', label: 'Số lượng', placeholder: '21 viên', w: 'w-[11%] min-w-24' },
  { key: 'duration', label: 'Số ngày', placeholder: '7 ngày', w: 'w-[11%] min-w-24' },
  { key: 'instructions', label: 'Cách dùng / lưu ý', placeholder: 'Uống sau ăn', w: 'min-w-44' },
]

const EMPTY: Medication = {
  name: '',
  dose: null,
  frequency: null,
  quantity: null,
  duration: null,
  instructions: null,
}

const cell =
  'bg-surface focus:border-tertiary w-full rounded-md border border-neutral-200 px-2.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:bg-neutral-50'

/** Bảng thuốc rõ ràng từng cột (tên, liều, số lần, số lượng, số ngày, cách dùng); người dùng sửa tay sau OCR */
export function MedicationTable({ value, onChange, disabled }: MedicationTableProps) {
  const set = (i: number, key: keyof Medication, v: string) => {
    onChange(value.map((m, idx) => (idx === i ? { ...m, [key]: v === '' ? null : v } : m)))
  }
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { ...EMPTY }])

  return (
    <div className="space-y-2">
      <div className="rounded-card bg-surface overflow-x-auto border border-neutral-200">
        <table className="w-full min-w-[56rem] border-collapse text-left">
          <thead className="bg-surface-muted">
            <tr>
              <th className="w-10 px-3 py-2 text-center text-xs font-semibold text-neutral-500">
                STT
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={`px-2 py-2 text-xs font-semibold text-neutral-500 ${c.w}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {value.map((m, i) => (
              <tr key={i}>
                <td className="px-3 py-1.5 text-center text-sm text-neutral-500">{i + 1}</td>
                {COLS.map((c) => (
                  <td key={c.key} className="px-2 py-1.5">
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
                <td className="px-2 py-1.5 text-center">
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
            {value.length === 0 && (
              <tr>
                <td
                  colSpan={COLS.length + 2}
                  className="px-3 py-4 text-center text-xs text-neutral-500"
                >
                  Chưa có thuốc nào. Bấm "Thêm thuốc" nếu đơn có thuốc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
