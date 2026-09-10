import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AssistantAvatar, ChatInput, ChatSidebar, MessageBubble } from '@/components/chat'
import type { ChatSendExtra } from '@/components/chat/ChatInput'
import { Alert, IconButton, MedicalDisclaimer } from '@/components/common'
import { NavIcon } from '@/components/layout'
import { CHAT_GREETING, CHAT_MODES, EMERGENCY_HOTLINE } from '@/constants'
import { useFeedback } from '@/hooks/useFeedback'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearChatError, clearThread, fetchHistory, sendChat } from '@/redux/slices/chatSlice'
import { fetchProfile } from '@/redux/slices/profileSlice'
import { fetchRecords } from '@/redux/slices/recordsSlice'
import { fetchWeather } from '@/redux/slices/weatherSlice'
import type { ChatMode } from '@/types'

/** Luồng hợp nhất: một cuộc trò chuyện hỏi được cả triệu chứng lẫn món ăn */
const MODE: ChatMode = 'health'
const config = CHAT_MODES.find((m) => m.mode === MODE)!

/** Câu mở đầu khi vào từ lối tắt "Gợi ý món ăn" (?mode=food) */
const FOOD_PREFILL = 'Hôm nay nên ăn gì cho hợp thời tiết và thể trạng của tôi?'

/**
 * Trợ lý sức khỏe AI: khung chat cao cố định (chỉ cuộn bên trong), cột ngữ cảnh bên phải (xl),
 * gửi được ảnh; disclaimer ghim cố định (AI-04).
 */
export function ChatPage() {
  const dispatch = useAppDispatch()
  const { toast, confirm: ask } = useFeedback()
  const [params, setParams] = useSearchParams()
  const thread = useAppSelector((s) => s.chat.threads[MODE])
  const weather = useAppSelector((s) => s.weather)
  const profile = useAppSelector((s) => s.profile)
  const records = useAppSelector((s) => s.records)

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
    if (records.listStatus === 'idle') void dispatch(fetchRecords({ limit: 3 }))
  }, [dispatch, records.listStatus])

  useEffect(() => {
    if (weather.query && !weather.data && weather.status === 'idle') {
      void dispatch(fetchWeather(weather.query))
    }
  }, [dispatch, weather.query, weather.data, weather.status])

  // Cuộn xuống tin mới nhất (chỉ trong khung, không cuộn trang)
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread.messages.length, thread.sending])

  const send = useCallback(
    (text: string, extra: ChatSendExtra) => {
      const previews = extra.images?.map((f) => URL.createObjectURL(f))
      void dispatch(
        sendChat({
          mode: MODE,
          message: text,
          feeling: extra.feeling,
          pantry: extra.pantry,
          images: extra.images,
          previews,
          location: weather.query ?? undefined,
        }),
      ).finally(() => {
        // Tin optimistic đã được thay bằng bản server → thu hồi URL xem trước
        for (const u of previews ?? []) URL.revokeObjectURL(u)
      })
    },
    [dispatch, weather.query],
  )

  const clear = async () => {
    const ok = await ask({
      title: 'Xóa toàn bộ lịch sử trò chuyện?',
      description: 'Tin nhắn và ảnh đã gửi sẽ bị xóa, AI sẽ không nhớ những gì bạn đã kể.',
      confirmLabel: 'Xóa lịch sử',
      danger: true,
    })
    if (!ok) return
    const result = await dispatch(clearThread(MODE))
    if (clearThread.fulfilled.match(result))
      toast({ title: 'Đã xóa lịch sử trò chuyện', tone: 'info' })
  }

  const history = useMemo(
    () =>
      thread.messages
        .filter((m) => m.role === 'user' && !m.id.startsWith('pending-'))
        .map((m) => m.content),
    [thread.messages],
  )

  const empty = thread.messages.length === 0
  const loadingHistory = thread.status === 'loading' && empty

  return (
    // Chiều cao trừ padding của <main> và footer AppLayout: trang không cuộn, chỉ cuộn trong khung chat
    <div className="flex h-[calc(100dvh-11.5rem)] min-h-[30rem] gap-6 lg:h-[calc(100dvh-8.75rem)]">
      <section className="bg-surface rounded-card flex min-h-0 min-w-0 flex-1 flex-col border border-neutral-200 shadow-sm">
        <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 sm:px-5">
          <AssistantAvatar className="size-10" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg leading-tight sm:text-xl">{config.title}</h1>
            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span
                className={
                  thread.sending
                    ? 'bg-warning size-2 animate-pulse rounded-full'
                    : 'bg-secondary size-2 rounded-full'
                }
                aria-hidden
              />
              {thread.sending
                ? 'Đang trả lời...'
                : 'Sẵn sàng · hỏi triệu chứng, món ăn hoặc gửi ảnh'}
            </p>
          </div>
          {!empty && (
            <IconButton
              icon="trash"
              label="Xóa lịch sử"
              variant="ghost"
              onClick={clear}
              className="hover:text-danger hover:bg-danger/10"
            />
          )}
        </header>

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
          aria-live="polite"
        >
          {loadingHistory && (
            <p className="text-center text-sm text-neutral-500">Đang tải lịch sử...</p>
          )}

          {!loadingHistory && empty && (
            <div className="flex items-start gap-3">
              <AssistantAvatar />
              <div className="bg-surface-muted/60 max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-neutral-800 sm:max-w-[80%]">
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
              <div className="bg-surface-muted/60 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-neutral-500">
                <span className="inline-flex gap-1" aria-label="Trợ lý đang trả lời">
                  <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
                  <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:120ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-neutral-200 px-4 pt-3 pb-3 sm:px-5">
          {thread.error && (
            <Alert variant="error" className="flex items-center justify-between gap-3">
              <span>{thread.error}</span>
              <IconButton
                icon="close"
                label="Đóng thông báo"
                size="sm"
                variant="ghost"
                onClick={() => dispatch(clearChatError(MODE))}
              />
            </Alert>
          )}

          {empty && !loadingHistory && (
            <div className="flex [scrollbar-width:thin] gap-2 overflow-x-auto pb-1 xl:hidden">
              {config.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applyStarter(s)}
                  className="hover:border-secondary hover:text-secondary inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 transition"
                >
                  <NavIcon
                    name={/ăn|món/i.test(s) ? 'food' : 'stethoscope'}
                    className="text-secondary size-3.5 shrink-0"
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
            history={history}
            onSend={send}
          />

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-neutral-500">
            <NavIcon name="info" className="size-3.5 shrink-0" />
            Chỉ mang tính tham khảo. Gọi {EMERGENCY_HOTLINE} khi khẩn cấp.
          </p>
          <MedicalDisclaimer />
        </div>
      </section>

      <div className="hidden w-80 shrink-0 xl:block">
        <ChatSidebar
          weather={weather.data}
          profile={profile.profile}
          recordCount={records.items.length}
          starters={config.starters}
          onStarter={applyStarter}
        />
      </div>
    </div>
  )
}
