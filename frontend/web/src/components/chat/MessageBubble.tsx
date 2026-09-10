import { AssistantAvatar } from './AssistantAvatar'
import { AssistantContent } from './AssistantContent'
import { NavIcon } from '@/components/layout'
import { useChatImage } from '@/hooks/useChatImage'
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

/** Một ảnh đính kèm (tải sau xác thực) hoặc ảnh xem trước khi đang gửi */
function AttachmentImage({
  messageId,
  index,
  preview,
}: {
  messageId: string | null
  index: number
  preview?: string
}) {
  const { url, error } = useChatImage(messageId, index, preview)
  if (error) {
    return (
      <span className="flex size-28 items-center justify-center rounded-xl bg-white/10 text-white/60">
        <NavIcon name="image" className="size-6" />
      </span>
    )
  }
  if (!url) return <span className="size-28 animate-pulse rounded-xl bg-white/15" />
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label={`Mở ảnh ${index + 1}`}>
      <img
        src={url}
        alt={`Ảnh đính kèm ${index + 1}`}
        className="size-28 rounded-xl border border-white/20 object-cover transition hover:opacity-90"
      />
    </a>
  )
}

/** Tin của user căn phải (navy, có ảnh đính kèm); tin trợ lý có avatar bên trái, nhãn nhỏ phía trên */
export function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const mine = message.role === 'user'
  if (mine) {
    const pending = message.id.startsWith('pending-')
    const previews = message.previews ?? []
    const count = pending ? previews.length : message.attachments.length
    return (
      <div className="flex justify-end">
        <div className="bg-primary max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm text-white sm:max-w-[75%]">
          {count > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {Array.from({ length: count }, (_, i) => (
                <AttachmentImage
                  key={i}
                  messageId={pending ? null : message.id}
                  index={i}
                  preview={pending ? previews[i] : undefined}
                />
              ))}
            </div>
          )}
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
