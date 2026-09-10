import { AssistantAvatar } from './AssistantAvatar'
import { AssistantContent } from './AssistantContent'
import type { ChatMessage } from '@/types'
import { cn } from '@/utils'

interface MessageBubbleProps {
  message: ChatMessage
  onFollowUp?: (question: string) => void
}

function timeOf(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Nhãn nhỏ trên bong bóng trợ lý theo ý định lượt trả lời */
function tagOf(message: ChatMessage) {
  const intent = message.meta?.intent ?? (message.mode === 'food' ? 'food' : 'symptom')
  if (intent === 'food') return 'Gợi ý món ăn'
  if (intent === 'symptom' && message.meta && message.meta.riskLevel !== 'none')
    return 'Đánh giá sơ bộ'
  return 'Thông tin'
}

/** Tin của user căn phải (navy); tin trợ lý có avatar bên trái, nền trắng, nhãn nhỏ phía trên */
export function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const mine = message.role === 'user'
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm text-white sm:max-w-[75%]">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="mt-1.5 text-[10px] text-white/60">{timeOf(message.createdAt)}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div
        className={cn(
          'bg-surface max-w-[85%] rounded-2xl rounded-tl-md border border-neutral-200 px-4 py-3 text-sm text-neutral-800 shadow-sm',
          'sm:max-w-[80%]',
        )}
      >
        <span className="bg-secondary-50 text-secondary-700 mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
          {tagOf(message)}
        </span>
        <AssistantContent
          mode={message.mode}
          content={message.content}
          meta={message.meta}
          onFollowUp={onFollowUp}
        />
        <p className="mt-1.5 text-[10px] text-neutral-400">{timeOf(message.createdAt)}</p>
      </div>
    </div>
  )
}
