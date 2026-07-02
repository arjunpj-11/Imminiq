import { useEffect, useMemo, useRef, useState } from 'react'

import {
  useChatWithLessonTutor,
  useClearLessonChatHistory,
  useLessonChatHistory,
} from '../../hooks/useTrackers'
import type { PersistedLessonChatMessage } from '../../types/tracker.types'

import { DEFAULT_CHAT_GREETING } from '../../constants/lesson-compiler.constants'
import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'
import ConfirmDialog from '../ConfirmDialog'

import { useVoiceInput } from '../../hooks/useVoiceInput'

type LocalLessonChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

import { MicButton } from './VoiceInputButton'

// ─── Component ───────────────────────────────────────────────────────────────

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
  const clearChatMutation = useClearLessonChatHistory()
  const chatHistoryQuery = useLessonChatHistory(trackerId, subtopicId)

  const sendLockRef = useRef(false)

  const [message, setMessage] = useState('')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [localMessages, setLocalMessages] = useState<
    LocalLessonChatMessage[]
  >([])
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const voice = useVoiceInput((transcript) =>
    setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
  )

  const savedMessages = useMemo<LocalLessonChatMessage[]>(() => {
    return (
      chatHistoryQuery.data?.map((item: PersistedLessonChatMessage) => ({
        role: item.role,
        content: item.content,
      })) ?? []
    )
  }, [chatHistoryQuery.data])

  const messages = useMemo<LocalLessonChatMessage[]>(() => {
    return [
      { role: 'assistant', content: DEFAULT_CHAT_GREETING },
      ...savedMessages,
      ...localMessages,
    ]
  }, [savedMessages, localMessages])

  const hasSavedMessages = savedMessages.length > 0

  const isChatBusy =
    isSending || chatMutation.isPending || clearChatMutation.isPending

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

    if (!trimmed || chatMutation.isPending || sendLockRef.current) {
      return
    }

    sendLockRef.current = true
    setIsSending(true)

    const apiMessages = [
      ...savedMessages,
      ...localMessages,
      { role: 'user' as const, content: trimmed },
    ]

    setLocalMessages([{ role: 'user', content: trimmed }])
    setMessage('')

    chatMutation.mutate(
      {
        trackerId,
        subtopicId,
        messages: apiMessages,
      },
      {
        onSuccess: async () => {
          await chatHistoryQuery.refetch()
          setLocalMessages([])
        },

        onError: (error) => {
          setLocalMessages([
            {
              role: 'assistant',
              content: `I could not answer right now. ${error.message}`,
            },
          ])
        },

        onSettled: () => {
          sendLockRef.current = false
          setIsSending(false)
        },
      }
    )
  }

  const clearChatHistory = () => {
    if (clearChatMutation.isPending || isSending || !hasSavedMessages) {
      return
    }

    setClearConfirmOpen(true)
  }

  const confirmClearChatHistory = () => {
    if (clearChatMutation.isPending || isSending || !hasSavedMessages) {
      return
    }

    clearChatMutation.mutate(
      {
        trackerId,
        subtopicId,
      },
      {
        onSuccess: async () => {
          setLocalMessages([])
          await chatHistoryQuery.refetch()
          setClearConfirmOpen(false)
        },
      }
    )
  }

  const closeClearConfirm = () => {
    if (clearChatMutation.isPending) return

    setClearConfirmOpen(false)
  }

  const renderMessages = (large = false) => (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto pr-1',
        large ? 'max-h-[58vh]' : 'max-h-90'
      )}
    >
      {chatHistoryQuery.isLoading && localMessages.length === 0 && (
        <div className="rounded-2xl border border-[#e0d0c5] bg-white/60 px-4 py-3 text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-white/5 dark:text-[#9b9a92]">
          Loading previous chat...
        </div>
      )}

      {messages.map((item, index) => {
        const isUser = item.role === 'user'

        return (
          <div
            key={`${item.role}-${index}-${item.content.slice(0, 24)}`}
            className={cn(
              'flex items-end gap-3',
              isUser && 'flex-row-reverse'
            )}
          >
            {!isUser && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(26,23,20,0.09)] text-[12px] text-[#b84c2b] dark:bg-white/9 dark:text-[#e8816a]">
                🤖
              </div>
            )}

            <div
              className={cn(
                'px-4 py-3 leading-normal',
                large
                  ? 'max-w-[78%] text-[14px]'
                  : 'max-w-[85%] text-[13px]',
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

      {isSending && (
        <div className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
          Scribe AI is thinking...
        </div>
      )}

      {clearChatMutation.isPending && (
        <div className="text-[12px] text-red-500 dark:text-red-400">
          Clearing chat history...
        </div>
      )}
    </div>
  )

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          setMessage('Explain this lesson in simple words')
        }
        disabled={isChatBusy}
        className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        Explain simply
      </button>

      <button
        type="button"
        onClick={() => setMessage('Give me a practical example')}
        disabled={isChatBusy}
        className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
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
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()

            if (!isChatBusy) {
              sendMessage()
            }
          }
        }}
        disabled={clearChatMutation.isPending}
        placeholder={
          voice.isListening ? 'Listening...' : 'Send a message...'
        }
        className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-[#1a1714] outline-none placeholder:text-[#6b5f58]/60 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#f2f0eb] dark:placeholder:text-[#9b9a92]/60"
      />

      <MicButton
        isListening={voice.isListening}
        isSupported={voice.isSupported}
        onToggle={voice.toggle}
        size="sm"
      />

      <button
        type="button"
        onClick={sendMessage}
        disabled={isChatBusy}
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
              onClick={clearChatHistory}
              disabled={!hasSavedMessages || isChatBusy}
              className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-red-400"
            >
              {clearChatMutation.isPending ? 'Clearing' : 'Clear'}
            </button>

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

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear lesson chat?"
        description="This will permanently remove the saved chat history for this lesson. Your lesson content and progress will not be affected."
        confirmText="Clear chat"
        cancelText="Keep chat"
        variant="danger"
        isLoading={clearChatMutation.isPending}
        onClose={closeClearConfirm}
        onConfirm={confirmClearChatHistory}
      />

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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearChatHistory}
                  disabled={!hasSavedMessages || isChatBusy}
                  className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-red-400"
                >
                  {clearChatMutation.isPending ? 'Clearing' : 'Clear'}
                </button>

                <button
                  type="button"
                  onClick={() => setZoomOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                  aria-label="Close large chat"
                >
                  ✕
                </button>
              </div>
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