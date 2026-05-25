import { useEffect, useRef, useState } from 'react'

import { useChatWithLessonTutor } from '../../hooks/useTrackers'
import type { LessonChatMessage } from '../../types/tracker.types'

import { DEFAULT_CHAT_GREETING } from '../../constants/lesson-compiler.constants'
import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'

// ─── Voice types ─────────────────────────────────────────────────────────────

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
      }
    }
  }
}

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null

  const speechWindow = window as SpeechRecognitionWindow

  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  )
}

// ─── Voice hook ──────────────────────────────────────────────────────────────

function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(() => Boolean(getSpeechRecognitionConstructor()))

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const shouldListenRef = useRef(false)
  const restartTimeoutRef = useRef<number | null>(null)

  const clearRestartTimeout = () => {
    if (restartTimeoutRef.current === null) return

    window.clearTimeout(restartTimeoutRef.current)
    restartTimeoutRef.current = null
  }

  const startListening = () => {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor()

    if (!SpeechRecognitionConstructor || !isSupported) return

    shouldListenRef.current = true
    clearRestartTimeout()

    try {
      recognitionRef.current?.abort()
    } catch {
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognitionConstructor()

    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null

      if (!shouldListenRef.current) return

      clearRestartTimeout()

      restartTimeoutRef.current = window.setTimeout(() => {
        if (shouldListenRef.current) {
          startListening()
        }
      }, 250)
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null

      if (!shouldListenRef.current) return

      clearRestartTimeout()

      restartTimeoutRef.current = window.setTimeout(() => {
        if (shouldListenRef.current) {
          startListening()
        }
      }, 450)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index]
        const transcript = result?.[0]?.transcript?.trim()

        if (result?.isFinal && transcript) {
          finalTranscript += ` ${transcript}`
        }
      }

      const cleanedTranscript = finalTranscript.trim()

      if (cleanedTranscript) {
        onTranscript(cleanedTranscript)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setIsListening(false)
      recognitionRef.current = null
    }
  }

  const stopListening = () => {
    shouldListenRef.current = false
    clearRestartTimeout()

    try {
      recognitionRef.current?.stop()
    } catch {
      recognitionRef.current = null
    }

    setIsListening(false)
  }

  const toggle = () => {
    if (shouldListenRef.current || isListening) {
      stopListening()
      return
    }

    startListening()
  }

  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      clearRestartTimeout()

      try {
        recognitionRef.current?.abort()
      } catch {
        recognitionRef.current = null
      }
    }
  }, [])

  return { isListening, isSupported, toggle }
}

// ─── SVG icons ───────────────────────────────────────────────────────────────

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 14.75c1.9 0 3.4-1.5 3.4-3.4v-5.2c0-1.9-1.5-3.4-3.4-3.4s-3.4 1.5-3.4 3.4v5.2c0 1.9 1.5 3.4 3.4 3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 10.75c0 3.45 2.8 6.25 6.25 6.25s6.25-2.8 6.25-6.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.75 21h6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="2.2"
        fill="currentColor"
      />
    </svg>
  )
}

// ─── Mic button ──────────────────────────────────────────────────────────────

function MicButton({
  isListening,
  isSupported,
  onToggle,
  size = 'md',
}: {
  isListening: boolean
  isSupported: boolean
  onToggle: () => void
  size?: 'sm' | 'md'
}) {
  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isListening ? 'Stop listening' : 'Voice input'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition',
        size === 'sm' ? 'h-9 w-9' : 'h-10 w-10',
        isListening
          ? 'border-red-400 bg-red-500/10 text-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.10)] dark:border-red-400/60 dark:text-red-400'
          : 'border-[#e0d0c5] text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
      )}
    >
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />

          <span className="absolute bottom-1.5 left-1/2 flex h-4 -translate-x-1/2 items-end gap-0.5">
            <span className="h-1.5 w-0.75 animate-[voiceWave_0.55s_ease-in-out_infinite] rounded-full bg-current opacity-70" />
            <span className="h-3 w-0.75 animate-[voiceWave_0.7s_ease-in-out_infinite] rounded-full bg-current opacity-90" />
            <span className="h-2 w-0.75 animate-[voiceWave_0.6s_ease-in-out_infinite] rounded-full bg-current opacity-80" />
            <span className="h-3.5 w-0.75 animate-[voiceWave_0.8s_ease-in-out_infinite] rounded-full bg-current opacity-90" />
          </span>

          <style>
            {`
              @keyframes voiceWave {
                0%, 100% {
                  transform: scaleY(0.45);
                }
                50% {
                  transform: scaleY(1.35);
                }
              }
            `}
          </style>
        </>
      )}

      <span className={cn('relative z-10', isListening && 'mb-3')}>
        {isListening ? (
          <StopIcon className="h-4 w-4" />
        ) : (
          <MicIcon className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'} />
        )}
      </span>
    </button>
  )
}

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
  const [message, setMessage] = useState('')
  const [zoomOpen, setZoomOpen] = useState(false)
  const [messages, setMessages] = useState<LessonChatMessage[]>([
    { role: 'assistant', content: DEFAULT_CHAT_GREETING },
  ])

  const voice = useVoiceInput((transcript) =>
    setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
  )

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
            {
              role: 'assistant',
              content: `I could not answer right now. ${error.message}`,
            },
          ])
        },
      }
    )
  }

  const renderMessages = (large = false) => (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto pr-1',
        large ? 'max-h-[58vh]' : 'max-h-90'
      )}
    >
      {messages.map((item, index) => {
        const isUser = item.role === 'user'

        return (
          <div
            key={`${item.role}-${index}`}
            className={cn('flex items-end gap-3', isUser && 'flex-row-reverse')}
          >
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
        <div className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
          Scribe AI is thinking...
        </div>
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
        onKeyDown={(event) => {
          if (event.key === 'Enter') sendMessage()
        }}
        placeholder={voice.isListening ? 'Listening...' : 'Send a message...'}
        className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-[#1a1714] outline-none placeholder:text-[#6b5f58]/60 dark:text-[#f2f0eb] dark:placeholder:text-[#9b9a92]/60"
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