import { NavIcon, type NavIconName } from '@/components/layout'
import { EMERGENCY_HOTLINE, RISK_LABELS } from '@/constants'
import type { AssistantMeta, ChatMode, RiskLevel } from '@/types'
import { cn } from '@/utils'

interface AssistantContentProps {
  mode: ChatMode
  content: string
  meta: AssistantMeta | null
  onFollowUp?: (question: string) => void
}

const TONE_CLASS = {
  info: 'bg-tertiary-50 text-tertiary-700 border-tertiary/30',
  success: 'bg-secondary-50 text-secondary-700 border-secondary/30',
  warning: 'bg-warning/10 text-warning border-warning/40',
  error: 'bg-danger/10 text-danger border-danger/40',
} as const

/** Icon theo mức độ: theo dõi tại nhà → ống nghe, nên đi khám → bệnh viện, cấp cứu → cảnh báo */
const RISK_ICON: Record<RiskLevel, NavIconName> = {
  none: 'info',
  home: 'stethoscope',
  doctor: 'hospital',
  emergency: 'alert',
}

/** Nội dung trả lời của AI: văn bản + khối đánh giá mức độ / thẻ món ăn, icon-first */
export function AssistantContent({ mode, content, meta, onFollowUp }: AssistantContentProps) {
  const risk = meta ? RISK_LABELS[meta.riskLevel] : null
  const isEmergency = meta?.riskLevel === 'emergency'
  // Khối triệu chứng khi có đánh giá mức độ; khối món ăn khi có món — không phụ thuộc luồng
  const showSymptom = mode !== 'food' && meta !== null && meta.riskLevel !== 'none' && risk !== null
  const showFood = mode !== 'symptom' && meta !== null && meta.meals.length > 0

  return (
    <div className="space-y-3">
      {isEmergency && (
        <div
          role="alert"
          className="bg-danger flex items-start gap-3 rounded-xl px-4 py-3 text-white shadow"
        >
          <NavIcon name="alert" className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-heading font-bold">Dấu hiệu cần cấp cứu</p>
            <p className="text-sm">
              Gọi{' '}
              <a href={`tel:${EMERGENCY_HOTLINE}`} className="font-bold underline">
                {EMERGENCY_HOTLINE}
              </a>{' '}
              hoặc đến cơ sở cấp cứu gần nhất ngay. Đừng chờ trò chuyện thêm.
            </p>
          </div>
        </div>
      )}

      <p className="whitespace-pre-wrap">{content}</p>

      {showSymptom && meta && risk && (
        <div
          className={cn('space-y-2 rounded-xl border px-3.5 py-3 text-sm', TONE_CLASS[risk.tone])}
        >
          <p className="font-heading flex items-center gap-2 font-semibold">
            <NavIcon name={RISK_ICON[meta.riskLevel]} className="size-5 shrink-0" />
            {risk.label}
          </p>
          {meta.possibleConditions.length > 0 && (
            <ul className="space-y-1">
              {meta.possibleConditions.map((c) => (
                <li key={c.name}>
                  <span className="font-semibold">Có thể: {c.name}.</span> {c.why}
                </li>
              ))}
            </ul>
          )}
          {(meta.suggestedSpecialty || meta.facilityType) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {meta.suggestedSpecialty && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">
                  <NavIcon name="stethoscope" className="size-3.5" />
                  {meta.suggestedSpecialty}
                </span>
              )}
              {meta.facilityType && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">
                  <NavIcon name="hospital" className="size-3.5" />
                  {meta.facilityType}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {showFood && meta && (
        <div className="grid gap-2 sm:grid-cols-2">
          {meta.meals.map((m) => (
            <div key={m.name} className="rounded-card bg-surface border border-neutral-200 p-3.5">
              <p className="font-heading text-primary flex items-center gap-2 font-semibold">
                <span className="bg-secondary-50 text-secondary flex size-7 shrink-0 items-center justify-center rounded-lg">
                  <NavIcon name="food" className="size-4" />
                </span>
                {m.name}
              </p>
              <p className="mt-1.5 text-sm text-neutral-700">{m.why}</p>
              {m.ingredients.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">{m.ingredients.join(' · ')}</p>
              )}
              {m.missing && m.missing.length > 0 && (
                <p className="text-secondary-700 mt-1 flex items-start gap-1.5 text-xs">
                  <NavIcon name="basket" className="mt-0.5 size-3.5 shrink-0" />
                  <span>Mua thêm: {m.missing.join(', ')}</span>
                </p>
              )}
              {m.notes && (
                <p className="text-warning mt-1 flex items-start gap-1.5 text-xs">
                  <NavIcon name="info" className="mt-0.5 size-3.5 shrink-0" />
                  <span>{m.notes}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {mode !== 'symptom' && meta && meta.activities.length > 0 && (
        <p className="flex items-start gap-1.5 text-sm text-neutral-700">
          <NavIcon name="walk" className="text-secondary mt-0.5 size-4 shrink-0" />
          <span>{meta.activities.join(' · ')}</span>
        </p>
      )}

      {meta && meta.followUpQuestions.length > 0 && onFollowUp && (
        <div className="flex flex-wrap gap-2 pt-1">
          {meta.followUpQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onFollowUp(q)}
              className="hover:border-secondary hover:text-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-left text-xs text-neutral-700 transition"
            >
              <NavIcon name="chat" className="size-3.5 shrink-0" />
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
