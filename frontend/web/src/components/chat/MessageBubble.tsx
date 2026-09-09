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

export function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const mine = message.role === 'user'
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%]',
          mine
            ? 'bg-primary rounded-br-md text-white'
            : 'bg-surface rounded-bl-md border border-neutral-200 text-neutral-800',
        )}
      >
        {mine ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <AssistantContent
            mode={message.mode}
            content={message.content}
            meta={message.meta}
            onFollowUp={onFollowUp}
          />
        )}
        <p className={cn('mt-1.5 text-[10px]', mine ? 'text-white/60' : 'text-neutral-400')}>
          {timeOf(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
