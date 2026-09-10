import { EMERGENCY_HOTLINE, RISK_LABELS } from '@/constants'
import type { AssistantMeta, ChatMode } from '@/types'
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

/** Nội dung trả lời của AI: văn bản + phần có cấu trúc theo luồng (thẻ món ăn / mức độ, chuyên khoa) */
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
          className="bg-danger flex items-start gap-3 rounded-lg px-4 py-3 text-white shadow"
        >
          <span className="font-heading text-2xl leading-none font-bold">!</span>
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
          className={cn('space-y-2 rounded-lg border px-3.5 py-3 text-sm', TONE_CLASS[risk.tone])}
        >
          <p className="font-heading font-semibold">
            <span className="mr-2 rounded-full bg-white/70 px-2 py-0.5 text-xs">{risk.badge}</span>
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
            <p>
              {meta.suggestedSpecialty && (
                <>
                  Chuyên khoa gợi ý:{' '}
                  <span className="font-semibold">{meta.suggestedSpecialty}</span>
                </>
              )}
              {meta.suggestedSpecialty && meta.facilityType ? ' · ' : ''}
              {meta.facilityType && (
                <>
                  Nơi nên đến: <span className="font-semibold">{meta.facilityType}</span>
                </>
              )}
            </p>
          )}
        </div>
      )}

      {showFood && meta && (
        <div className="grid gap-2 sm:grid-cols-2">
          {meta.meals.map((m) => (
            <div key={m.name} className="rounded-card bg-surface border border-neutral-200 p-3.5">
              <p className="font-heading text-primary font-semibold">{m.name}</p>
              <p className="mt-1 text-sm text-neutral-700">{m.why}</p>
              {m.ingredients.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">
                  Nguyên liệu: {m.ingredients.join(', ')}
                </p>
              )}
              {m.missing && m.missing.length > 0 && (
                <p className="text-secondary-700 mt-1 text-xs">
                  Cần mua thêm: {m.missing.join(', ')}
                </p>
              )}
              {m.notes && <p className="text-warning mt-1 text-xs">Lưu ý: {m.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {mode !== 'symptom' && meta && meta.activities.length > 0 && (
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">Vận động gợi ý:</span> {meta.activities.join(' · ')}
        </p>
      )}

      {meta && meta.followUpQuestions.length > 0 && onFollowUp && (
        <div className="flex flex-wrap gap-2 pt-1">
          {meta.followUpQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onFollowUp(q)}
              className="hover:border-secondary hover:text-secondary rounded-full border border-neutral-300 px-3 py-1 text-left text-xs text-neutral-700 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
