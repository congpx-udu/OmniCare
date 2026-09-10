import { useEffect, useState } from 'react'
import { Alert, IconButton, MedicalDisclaimer, PageHeader, SectionCard } from '@/components/common'
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
import { formatDate } from '@/utils'

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
  ).map((m) => m.key)
  const activeMetric = availableMetrics.includes(metric) ? metric : availableMetrics[0]
  const lastLog = logs.at(-1) ?? null

  const onSave = (d: string, payload: UpsertLogPayload) =>
    void dispatch(saveLog({ date: d, payload }))
  const onDelete = (d: string) => {
    if (window.confirm('Xóa nhật ký ngày này?')) void dispatch(removeLog(d))
  }
  const analyze = () =>
    void dispatch(analyzeLogs({ days: 30, location: weather.query ?? undefined }))
  const pick = (d: string) => {
    setDate(d)
    document.getElementById('log-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="space-y-5">
      <PageHeader
        icon="activity"
        title="Theo dõi sức khỏe"
        subtitle={
          logs.length
            ? `${logs.length} ngày nhật ký · cập nhật ${formatDate(lastLog!.date)}`
            : 'Chưa có nhật ký'
        }
        actions={
          <>
            <IconButton icon="plus" label="Ghi hôm nay" onClick={() => pick(today())} />
            <IconButton
              icon="sparkles"
              label="Nhờ AI phân tích"
              variant="primary"
              loading={analyzing}
              disabled={logs.length === 0}
              onClick={analyze}
            />
          </>
        }
      />

      {saveError && <Alert variant="error">{saveError}</Alert>}
      {analyzeError && <Alert variant="error">{analyzeError}</Alert>}

      <LogForm
        date={date}
        onDateChange={setDate}
        existing={existing}
        saving={saving}
        onSave={onSave}
      />

      {latest && (
        <AdviceCard
          advice={latest}
          onToggle={(index, done) =>
            void dispatch(toggleSuggestion({ id: latest.id, index, done }))
          }
        />
      )}

      {activeMetric && (
        <TrendChart
          metric={activeMetric}
          available={availableMetrics}
          onMetricChange={setMetric}
          logs={logs}
          days={range}
          onDaysChange={setRange}
        />
      )}

      <SectionCard icon="clock" title="Nhật ký gần đây">
        {logsStatus === 'failed' && logsError && (
          <Alert variant="error" className="mb-3">
            {logsError}
          </Alert>
        )}
        <LogHistory logs={logs} onPick={pick} onDelete={onDelete} />
      </SectionCard>

      {advice.length > 1 && (
        <details className="group">
          <summary className="font-heading text-primary hover:bg-primary-50 inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-full px-3 text-sm font-semibold">
            <svg
              viewBox="0 0 24 24"
              className="size-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            Phân tích trước ({advice.length - 1})
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
