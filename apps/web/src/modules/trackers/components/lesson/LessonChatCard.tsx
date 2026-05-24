import { useEffect, useState } from 'react'

import { useChatWithLessonTutor } from '../../hooks/useTrackers'
import type { LessonChatMessage } from '../../types/tracker.types'

import { DEFAULT_CHAT_GREETING } from '../../constants/lesson-compiler.constants'
import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'

export default function LessonChatCard({
  lessonTitle,
  trackerId,
  subtopicId,
}: {
  lessonTitle: string
  trackerId: string
  subtopicId: string
}) {
  const chatMutation = useChatWithLessonTutor()
  const [message, setMessage] = useState('')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [messages, setMessages] = useState<LessonChatMessage[]>([
    { role: 'assistant', content: DEFAULT_CHAT_GREETING },
  ])

  useEffect(() => {
    if (!zoomOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [zoomOpen])

  const sendMessage = () => {
    const trimmed = message.trim()
    if (!trimmed || chatMutation.isPending) return

    const nextMessages: LessonChatMessage[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ]
    setMessages(nextMessages)
    setMessage('')

    const apiMessages = nextMessages.filter(
      (item) => item.content !== DEFAULT_CHAT_GREETING
    )

    chatMutation.mutate(
      { trackerId, subtopicId, messages: apiMessages },
      {
        onSuccess: (response) => {
          setMessages((current) => [
            ...current,
            { role: 'assistant', content: response.data.answer },
          ])
        },
        onError: (error) => {
          setMessages((current) => [
            ...current,
            { role: 'assistant', content: `I could not answer right now. ${error.message}` },
          ])
        },
      }
    )
  }

  const renderMessages = (large = false) => (
    <div className={cn('flex flex-col gap-4 overflow-y-auto pr-1', large ? 'max-h-[58vh]' : 'max-h-90')}>
      {messages.map((item, index) => {
        const isUser = item.role === 'user'
        return (
          <div key={`${item.role}-${index}`} className={cn('flex items-end gap-3', isUser && 'flex-row-reverse')}>
            {!isUser && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(26,23,20,0.09)] text-[12px] text-[#b84c2b] dark:bg-white/9 dark:text-[#e8816a]">
                🤖
              </div>
            )}
            <div
              className={cn(
                'px-4 py-3 leading-normal',
                large ? 'max-w-[78%] text-[14px]' : 'max-w-[85%] text-[13px]',
                isUser
                  ? 'rounded-[16px_16px_4px_16px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]'
                  : 'rounded-[16px_16px_16px_4px] bg-[rgba(26,23,20,0.09)] text-[#1a1714] dark:bg-white/9 dark:text-[#f2f0eb]'
              )}
            >
              <MathText>{item.content}</MathText>
            </div>
          </div>
        )
      })}
      {chatMutation.isPending && (
        <div className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">Scribe AI is thinking...</div>
      )}
    </div>
  )

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setMessage('Explain this lesson in simple words')}
        className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        Explain simply
      </button>
      <button
        type="button"
        onClick={() => setMessage('Give me a practical example')}
        className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        Show examples
      </button>
    </div>
  )

  const renderChatInput = () => (
    <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-[#e0d0c5] bg-white px-3 py-1.5 transition focus-within:border-[#e8816a] focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-white/9 dark:bg-[#252320]">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') sendMessage() }}
        placeholder="Send a message..."
        className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-[#1a1714] outline-none placeholder:text-[#6b5f58]/60 dark:text-[#f2f0eb] dark:placeholder:text-[#9b9a92]/60"
      />
      <button
        type="button"
        onClick={sendMessage}
        disabled={chatMutation.isPending}
        className="flex h-8 w-8 items-center justify-center text-[#b84c2b] transition hover:translate-x-0.5 hover:scale-110 disabled:cursor-wait disabled:opacity-50 dark:text-[#e8816a]"
      >
        ➤
      </button>
    </div>
  )

  return (
    <>
      <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="mb-5 flex items-center justify-between border-b border-[#e0d0c5] pb-3.5 dark:border-white/9">
          <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            Ask about {lessonTitle}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0d0c5] text-[13px] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
              aria-label="Open chat in large view"
              title="Open large chat"
            >
              ⤢
            </button>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          </div>
        </div>
        <div className="mb-5">{renderMessages()}</div>
        <div className="mb-4">{renderQuickActions()}</div>
        {renderChatInput()}
      </section>

      {zoomOpen && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Large lesson chat"
        >
          <div className="relative flex h-[min(760px,92vh)] w-[min(920px,96vw)] flex-col rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#1e1c19]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e0d0c5] px-6 py-4 dark:border-white/9 max-[640px]:px-4">
              <div>
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  Scribe AI Chat
                </div>
                <h3 className="mt-1 line-clamp-1 text-[18px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  {lessonTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                aria-label="Close large chat"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden px-6 py-5 max-[640px]:px-4">
              {renderMessages(true)}
            </div>
            <div className="border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9 max-[640px]:px-4">
              <div className="mb-3">{renderQuickActions()}</div>
              {renderChatInput()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── ReflectionPracticeCard ──────────────────────────────────────────────────
