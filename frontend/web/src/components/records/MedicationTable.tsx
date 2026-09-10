import { IconButton } from '@/components/common'
import { NavIcon } from '@/components/layout'
import type { MedicationTable as MedicationTableData } from '@/types'

interface MedicationTableProps {
  value: MedicationTableData
  onChange: (next: MedicationTableData) => void
  disabled?: boolean
}

const cell =
  'bg-surface focus:border-tertiary focus:ring-tertiary/30 w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none disabled:bg-neutral-50'

function slug(label: string, used: Set<string>) {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'col'
  let key = base
  let n = 2
  while (used.has(key)) key = `${base}_${n++}`
  return key
}

/**
 * Bảng thuốc sinh động theo cột mà AI đọc được từ tài liệu (mỗi bệnh viện in khác nhau).
 * Người dùng sửa từng ô, thêm/xóa dòng, thêm/xóa cột bằng nút icon.
 */
export function MedicationTable({ value, onChange, disabled }: MedicationTableProps) {
  const { columns, rows } = value

  const setCell = (ri: number, key: string, v: string) => {
    onChange({
      columns,
      rows: rows.map((r, i) => (i === ri ? { ...r, [key]: v === '' ? null : v } : r)),
    })
  }
  const removeRow = (ri: number) => onChange({ columns, rows: rows.filter((_, i) => i !== ri) })
  const addRow = () =>
    onChange({ columns, rows: [...rows, Object.fromEntries(columns.map((c) => [c.key, null]))] })

  const addColumn = () => {
    const label = window.prompt('Tên cột mới (ví dụ: Số lượng, Cách dùng)')?.trim()
    if (!label) return
    const key = slug(label, new Set(columns.map((c) => c.key)))
    onChange({
      columns: [...columns, { key, label }],
      rows: rows.map((r) => ({ ...r, [key]: null })),
    })
  }
  const removeColumn = (key: string) => {
    if (!window.confirm('Xóa cột này và toàn bộ dữ liệu trong cột?')) return
    onChange({
      columns: columns.filter((c) => c.key !== key),
      rows: rows.map((r) => {
        const { [key]: _omit, ...rest } = r
        return rest
      }),
    })
  }

  if (columns.length === 0) {
    return (
      <div className="rounded-card flex items-center justify-between gap-3 border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <NavIcon name="pill" className="size-4" />
          Tài liệu không có bảng thuốc
        </span>
        <IconButton icon="plus" label="Tạo bảng thuốc" onClick={addColumn} disabled={disabled} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-card bg-surface overflow-x-auto border border-neutral-200">
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth: `${8 + columns.length * 11}rem` }}
        >
          <thead className="bg-surface-muted">
            <tr>
              <th className="w-10 px-3 py-2 text-center text-xs font-semibold text-neutral-500">
                #
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="group px-2 py-1.5 text-xs font-semibold text-neutral-600"
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    <span className="opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                      <IconButton
                        icon="close"
                        label={`Xóa cột ${c.label}`}
                        size="sm"
                        variant="ghost"
                        onClick={() => removeColumn(c.key)}
                        disabled={disabled}
                        className="size-7"
                      />
                    </span>
                  </span>
                </th>
              ))}
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r, ri) => (
              <tr key={ri}>
                <td className="px-3 py-1.5 text-center text-sm text-neutral-500">{ri + 1}</td>
                {columns.map((c) => (
                  <td key={c.key} className="px-2 py-1.5">
                    <input
                      value={r[c.key] ?? ''}
                      onChange={(e) => setCell(ri, c.key, e.target.value)}
                      disabled={disabled}
                      aria-label={`${c.label}, dòng ${ri + 1}`}
                      className={cell}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <IconButton
                    icon="trash"
                    label={`Xóa dòng ${ri + 1}`}
                    size="sm"
                    variant="ghost"
                    tooltipSide="left"
                    onClick={() => removeRow(ri)}
                    disabled={disabled}
                    className="hover:text-danger hover:bg-danger/10"
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-3 py-4 text-center text-xs text-neutral-500"
                >
                  Chưa có dòng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <IconButton icon="plus" label="Thêm dòng thuốc" onClick={addRow} disabled={disabled} />
        <IconButton
          icon="sidebar"
          label="Thêm cột"
          variant="outline"
          onClick={addColumn}
          disabled={disabled}
        />
        <span className="text-xs text-neutral-500">Cột giữ đúng như trên tài liệu gốc</span>
      </div>
    </div>
  )
}
