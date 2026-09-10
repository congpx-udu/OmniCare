import { useEffect, useState } from 'react'
import { Alert, Button, MedicalDisclaimer } from '@/components/common'
import { AdviceCard, LogForm, LogHistory, TrendChart } from '@/components/tracking'
import { METRICS, type MetricKey } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  analyzeLogs,
  clearTrackingErrors,
  fetchAdvice,
  fetchLogs,
  removeLog,
  saveLog,
  toggleSuggestion,
} from '@/redux/slices/trackingSlice'
import type { UpsertLogPayload } from '@/services/trackingService'

const today = () => new Date().toISOString().slice(0, 10)

/** Theo dõi sức khỏe: nhật ký chỉ số + hoạt động → AI phân tích, đề xuất cải thiện; biểu đồ SVG */
export function TrackingPage() {
  const dispatch = useAppDispatch()
  const {
    logs,
    logsStatus,
    logsError,
    saving,
    saveError,
    advice,
    adviceStatus,
    analyzing,
    analyzeError,
  } = useAppSelector((s) => s.tracking)
  const weather = useAppSelector((s) => s.weather)

  const [date, setDate] = useState(today())
  const [metric, setMetric] = useState<MetricKey>('weightKg')
  const [range, setRange] = useState<7 | 30>(30)

  useEffect(() => {
    if (logsStatus === 'idle') void dispatch(fetchLogs(90))
    if (adviceStatus === 'idle') void dispatch(fetchAdvice())
    return () => void dispatch(clearTrackingErrors())
  }, [dispatch, logsStatus, adviceStatus])

  const existing = logs.find((l) => l.date === date) ?? null
  const latest = advice[0] ?? null
  const availableMetrics = METRICS.filter((m) =>
    logs.some((l) => m.fields.some((f) => l[f] !== null)),
  )

  const onSave = (d: string, payload: UpsertLogPayload) =>
    void dispatch(saveLog({ date: d, payload }))
  const onDelete = (d: string) => {
    if (window.confirm('Xóa nhật ký ngày này?')) void dispatch(removeLog(d))
  }
  const analyze = () =>
    void dispatch(analyzeLogs({ days: 30, location: weather.query ?? undefined }))

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl">Theo dõi sức khỏe</h1>
        <p className="text-neutral-600">
          Ghi lại chỉ số và hoạt động mỗi ngày. Trợ lý AI đọc nhật ký 30 ngày cùng hồ sơ và thời
          tiết để nhận xét xu hướng và đề xuất việc nên làm trong những ngày tới.
        </p>
      </div>

      {saveError && <Alert variant="error">{saveError}</Alert>}
      <LogForm
        date={date}
        onDateChange={setDate}
        existing={existing}
        saving={saving}
        onSave={onSave}
      />

      <div className="rounded-card from-primary to-primary-700 flex flex-col gap-3 bg-linear-to-br p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg text-white">Nhờ AI phân tích</h2>
          <p className="text-sm text-white/80">
            Dựa trên {logs.length} ngày nhật ký, hồ sơ cá nhân
            {weather.data ? ` và thời tiết ${weather.data.location.name}` : ''}. Mất khoảng 5–10
            giây.
          </p>
        </div>
        <Button
          variant="inverted"
          onClick={analyze}
          loading={analyzing}
          disabled={logs.length === 0}
        >
          Phân tích & đề xuất
        </Button>
      </div>
      {analyzeError && <Alert variant="error">{analyzeError}</Alert>}

      {latest && (
        <AdviceCard
          advice={latest}
          onToggle={(index, done) =>
            void dispatch(toggleSuggestion({ id: latest.id, index, done }))
          }
        />
      )}

      <div className="rounded-card bg-surface space-y-3 border border-neutral-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg">Xu hướng</h2>
          <div className="flex gap-1">
            {([7, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={
                  range === r
                    ? 'bg-primary rounded-full px-3 py-1 text-xs font-semibold text-white'
                    : 'hover:border-primary rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700'
                }
              >
                {r} ngày
              </button>
            ))}
          </div>
        </div>
        {availableMetrics.length === 0 ? (
          <p className="text-sm text-neutral-500">Chưa có chỉ số nào để vẽ biểu đồ.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Chỉ số">
              {availableMetrics.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={metric === m.key}
                  onClick={() => setMetric(m.key)}
                  className={
                    metric === m.key
                      ? 'bg-secondary rounded-full px-3 py-1 text-xs font-semibold text-white'
                      : 'hover:border-secondary rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700'
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
            <TrendChart
              metric={
                availableMetrics.some((m) => m.key === metric) ? metric : availableMetrics[0].key
              }
              logs={logs}
              days={range}
            />
          </>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg">Nhật ký gần đây</h2>
        {logsStatus === 'failed' && logsError && <Alert variant="error">{logsError}</Alert>}
        <LogHistory logs={logs} onPick={setDate} onDelete={onDelete} />
      </div>

      {advice.length > 1 && (
        <details className="rounded-card bg-surface border border-neutral-200 p-4">
          <summary className="font-heading text-primary cursor-pointer text-sm font-semibold">
            Các lần phân tích trước ({advice.length - 1})
          </summary>
          <div className="mt-3 space-y-3">
            {advice.slice(1).map((a) => (
              <AdviceCard
                key={a.id}
                advice={a}
                compact
                onToggle={(index, done) =>
                  void dispatch(toggleSuggestion({ id: a.id, index, done }))
                }
              />
            ))}
          </div>
        </details>
      )}

      <MedicalDisclaimer />
    </section>
  )
}
