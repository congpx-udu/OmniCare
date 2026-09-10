import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AssistantAvatar, ChatInput, MessageBubble } from '@/components/chat'
import type { ChatSendExtra } from '@/components/chat/ChatInput'
import { Alert, IconButton, MedicalDisclaimer, PageBanner } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { CHAT_GREETING, CHAT_MODES, EMERGENCY_HOTLINE } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearChatError, clearThread, fetchHistory, sendChat } from '@/redux/slices/chatSlice'
import { fetchProfile } from '@/redux/slices/profileSlice'
import { fetchWeather } from '@/redux/slices/weatherSlice'
import type { ChatMode } from '@/types'

/** Luồng hợp nhất: một cuộc trò chuyện hỏi được cả triệu chứng lẫn món ăn */
const MODE: ChatMode = 'health'
const config = CHAT_MODES.find((m) => m.mode === MODE)!

/** Câu mở đầu khi vào từ lối tắt "Gợi ý món ăn" (?mode=food) */
const FOOD_PREFILL = 'Hôm nay nên ăn gì cho hợp thời tiết và thể trạng của tôi?'

/** Trợ lý sức khỏe AI: một khung chat, AI tự hiểu mỗi lượt đang hỏi triệu chứng hay món ăn; disclaimer ghim cố định (AI-04) */
export function ChatPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const thread = useAppSelector((s) => s.chat.threads[MODE])
  const weather = useAppSelector((s) => s.weather)
  const profile = useAppSelector((s) => s.profile)

  const [prefill, setPrefill] = useState<{ text: string; nonce: number } | null>(null)
  const prefillCounter = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  const applyStarter = useCallback((text: string) => {
    prefillCounter.current += 1
    setPrefill({ text, nonce: prefillCounter.current })
  }, [])

  // ?mode=food từ Dashboard / Thời tiết: điền sẵn câu hỏi món ăn rồi bỏ tham số
  const urlMode = params.get('mode')
  useEffect(() => {
    if (!urlMode) return
    if (urlMode === 'food') applyStarter(FOOD_PREFILL)
    setParams({}, { replace: true })
  }, [urlMode, applyStarter, setParams])

  useEffect(() => {
    if (thread.status === 'idle') void dispatch(fetchHistory(MODE))
  }, [dispatch, thread.status])

  useEffect(() => {
    if (profile.status === 'idle') void dispatch(fetchProfile())
  }, [dispatch, profile.status])

  useEffect(() => {
    if (weather.query && !weather.data && weather.status === 'idle') {
      void dispatch(fetchWeather(weather.query))
    }
  }, [dispatch, weather.query, weather.data, weather.status])

  // Cuộn xuống tin mới nhất
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread.messages.length, thread.sending])

  const send = useCallback(
    (text: string, extra: ChatSendExtra) => {
      void dispatch(
        sendChat({
          mode: MODE,
          message: text,
          feeling: extra.feeling,
          pantry: extra.pantry,
          location: weather.query ?? undefined,
        }),
      )
    },
    [dispatch, weather.query],
  )

  const clear = () => {
    if (window.confirm('Xóa toàn bộ lịch sử trò chuyện?')) void dispatch(clearThread(MODE))
  }

  const empty = thread.messages.length === 0
  const loadingHistory = thread.status === 'loading' && empty

  return (
    <section className="flex h-[calc(100vh-7rem)] min-h-[32rem] flex-col lg:h-[calc(100vh-4rem)]">
      <PageBanner
        icon="chat"
        title={config.title}
        subtitle={config.description}
        className="rounded-[1.25rem] p-5 sm:p-5"
        actions={
          !empty ? (
            <IconButton icon="trash" label="Xóa lịch sử" variant="glass" onClick={clear} />
          ) : undefined
        }
      />

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto py-4" aria-live="polite">
        {loadingHistory && (
          <p className="text-center text-sm text-neutral-500">Đang tải lịch sử...</p>
        )}

        {!loadingHistory && empty && (
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div className="bg-surface max-w-[85%] rounded-2xl rounded-tl-md border border-neutral-200 px-4 py-3 text-sm text-neutral-800 shadow-sm sm:max-w-[80%]">
              <span className="bg-secondary-50 text-secondary-700 mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                Thông tin
              </span>
              <p>{CHAT_GREETING}</p>
            </div>
          </div>
        )}

        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} onFollowUp={applyStarter} />
        ))}

        {thread.sending && (
          <div className="flex items-start gap-3">
            <AssistantAvatar />
            <div className="bg-surface rounded-2xl rounded-tl-md border border-neutral-200 px-4 py-3 text-sm text-neutral-500 shadow-sm">
              <span className="inline-flex gap-1" aria-label="Trợ lý đang trả lời">
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:120ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {thread.error && (
        <Alert variant="error">
          {thread.error}{' '}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => dispatch(clearChatError(MODE))}
          >
            Đóng
          </button>
        </Alert>
      )}

      <div className="space-y-3 pt-2">
        {empty && !loadingHistory && (
          <div className="flex flex-wrap gap-2">
            {config.starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applyStarter(s)}
                className="bg-surface hover:border-secondary hover:text-secondary inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-sm text-neutral-700 shadow-sm transition"
              >
                <NavIcon
                  name={/ăn|món/i.test(s) ? 'food' : 'stethoscope'}
                  className="text-secondary size-4 shrink-0"
                />
                {s}
              </button>
            ))}
          </div>
        )}

        <ChatInput
          mode={MODE}
          placeholder={config.placeholder}
          sending={thread.sending}
          disabled={loadingHistory}
          prefill={prefill}
          onSend={send}
        />

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500">
          <NavIcon name="info" className="size-3.5 shrink-0" />
          Chỉ mang tính tham khảo. Gọi {EMERGENCY_HOTLINE} khi khẩn cấp.
        </p>
        <MedicalDisclaimer />
      </div>
    </section>
  )
}
