import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChatInput, ContextBar, MessageBubble, ModeSwitch } from '@/components/chat'
import { Alert, MedicalDisclaimer } from '@/components/common'
import { CHAT_MODES } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  clearChatError,
  clearThread,
  fetchHistory,
  sendChat,
  setActiveMode,
} from '@/redux/slices/chatSlice'
import { fetchProfile } from '@/redux/slices/profileSlice'
import { fetchWeather } from '@/redux/slices/weatherSlice'
import type { ChatMode } from '@/types'

function isMode(v: string | null): v is ChatMode {
  return v === 'food' || v === 'symptom'
}

/** Trợ lý AI: hai luồng (cảm nhận cơ thể / gợi ý món ăn) trong một khung, disclaimer ghim cố định (AI-04) */
export function ChatPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const { activeMode, threads } = useAppSelector((s) => s.chat)
  const weather = useAppSelector((s) => s.weather)
  const profile = useAppSelector((s) => s.profile)

  // ?mode= trên URL (từ trang Thời tiết, Dashboard) ưu tiên hơn state
  const urlMode = params.get('mode')
  const mode: ChatMode = isMode(urlMode) ? urlMode : activeMode
  const thread = threads[mode]
  const config = CHAT_MODES.find((m) => m.mode === mode)!

  const [prefill, setPrefill] = useState<{ text: string; nonce: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMode(urlMode) && urlMode !== activeMode) dispatch(setActiveMode(urlMode))
  }, [dispatch, urlMode, activeMode])

  useEffect(() => {
    if (thread.status === 'idle') void dispatch(fetchHistory(mode))
  }, [dispatch, mode, thread.status])

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

  const changeMode = (next: ChatMode) => {
    dispatch(setActiveMode(next))
    setParams({ mode: next }, { replace: true })
  }

  const send = useCallback(
    (text: string, extra: { feeling?: string; pantry?: string[] }) => {
      void dispatch(
        sendChat({
          mode,
          message: text,
          feeling: extra.feeling,
          pantry: extra.pantry,
          location: weather.query ?? undefined,
        }),
      )
    },
    [dispatch, mode, weather.query],
  )

  const prefillCounter = useRef(0)
  const applyStarter = (text: string) => {
    prefillCounter.current += 1
    setPrefill({ text, nonce: prefillCounter.current })
  }

  const clear = () => {
    if (window.confirm('Xóa toàn bộ lịch sử của luồng này?')) void dispatch(clearThread(mode))
  }

  return (
    <section className="flex h-[calc(100vh-7rem)] min-h-[32rem] flex-col gap-3 lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Trợ lý AI</h1>
          <p className="text-sm text-neutral-600">{config.description}</p>
        </div>
        <ModeSwitch value={mode} onChange={changeMode} disabled={thread.sending} />
      </div>

      <ContextBar mode={mode} weather={weather.data} profile={profile.profile} />

      <div
        ref={listRef}
        className="rounded-card bg-surface-muted/60 flex-1 space-y-3 overflow-y-auto border border-neutral-200 p-3 sm:p-4"
        aria-live="polite"
      >
        {thread.status === 'loading' && thread.messages.length === 0 && (
          <p className="text-center text-sm text-neutral-500">Đang tải lịch sử...</p>
        )}

        {thread.status !== 'loading' && thread.messages.length === 0 && (
          <div className="mx-auto max-w-md space-y-4 py-8 text-center">
            <h2 className="text-primary text-lg">{config.title}</h2>
            <p className="text-sm text-neutral-600">
              Bắt đầu bằng một gợi ý hoặc tự mô tả bên dưới.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {config.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applyStarter(s)}
                  className="bg-surface hover:border-secondary hover:text-secondary rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} onFollowUp={applyStarter} />
        ))}

        {thread.sending && (
          <div className="flex justify-start">
            <div className="bg-surface rounded-2xl rounded-bl-md border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
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
            onClick={() => dispatch(clearChatError(mode))}
          >
            Đóng
          </button>
        </Alert>
      )}

      <ChatInput
        mode={mode}
        placeholder={config.placeholder}
        sending={thread.sending}
        disabled={thread.status === 'loading' && thread.messages.length === 0}
        prefill={prefill}
        onSend={send}
      />

      <div className="flex items-center justify-between gap-3">
        <MedicalDisclaimer />
        {thread.messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-danger shrink-0 text-xs hover:underline"
          >
            Xóa lịch sử
          </button>
        )}
      </div>
    </section>
  )
}
