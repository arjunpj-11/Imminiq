import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import PageLoadingScreen from '../../../components/ui/PageLoadingScreen'

import { useDashboardSummary } from '../../../hooks/dashboard/useDashboardSummary'
import {
  useChatWithLessonTutor,
  useGetCodeHint,
  useGetOptimizedSolution,
  useRunLessonCode,
  useSubmitLessonCode,
  useTrackerLesson,
  useUpdateSubtopicProgress,
  useVerifyLessonAnswer,
} from '../../../hooks/trackers/useTrackers'

import type {
  GeneratedLesson,
  GetOptimizedSolutionResponse,
  LessonChatMessage,
  SubmitLessonCodeResponse,
  VerifyLessonAnswerResponse,
} from '../../../types/tracker.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

type LessonLocationState = {
  returnToRoadmapStack?: unknown[]
}

type CompilerLanguageOption = {
  label: string
  value: string
  fileName: string
  languageId: number
}

const COMPILER_LANGUAGES: CompilerLanguageOption[] = [
  { label: 'JavaScript', value: 'javascript', fileName: 'main.js', languageId: 63 },
  { label: 'TypeScript', value: 'typescript', fileName: 'main.ts', languageId: 74 },
  { label: 'Python', value: 'python', fileName: 'main.py', languageId: 71 },
  { label: 'Java', value: 'java', fileName: 'Main.java', languageId: 62 },
  { label: 'C++', value: 'cpp', fileName: 'main.cpp', languageId: 54 },
  { label: 'C', value: 'c', fileName: 'main.c', languageId: 50 },
]

const DEFAULT_CHAT_GREETING = 'Hello Scholar! Ask me anything about this lesson.'

const getRoadmapStackStorageKey = (trackerId?: string) =>
  `imminiq_roadmap_stack_${trackerId || 'unknown'}`

const getInitials = (name: string) =>
  name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const formatLessonType = (value: string) =>
  value.split('_').join(' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const formatMathTextToHtml = (value: string) => {
  let html = escapeHtml(value)

  html = html.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, equation: string) =>
      `<div class="my-4 overflow-x-auto rounded-xl border border-[#e0d0c5] bg-[#fffaf6] px-4 py-3 text-center font-['DM_Mono',monospace] text-[15px] text-[#1a1714] dark:border-white/9 dark:bg-[#141412] dark:text-[#f2f0eb]">${equation.trim()}</div>`
  )
  html = html.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_match, equation: string) =>
      `<div class="my-4 overflow-x-auto rounded-xl border border-[#e0d0c5] bg-[#fffaf6] px-4 py-3 text-center font-['DM_Mono',monospace] text-[15px] text-[#1a1714] dark:border-white/9 dark:bg-[#141412] dark:text-[#f2f0eb]">${equation.trim()}</div>`
  )
  html = html.replace(
    /\\\((.*?)\\\)/g,
    (_match, equation: string) =>
      `<span class="mx-1 rounded-md bg-[rgba(184,76,43,0.08)] px-1.5 py-0.5 font-['DM_Mono',monospace] text-[0.95em] text-[#8a3d24] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#f5a090]">${equation.trim()}</span>`
  )
  html = html.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    (_match, numerator: string, denominator: string) =>
      `<span class="inline-flex translate-y-[0.25em] flex-col items-center justify-center px-1 font-['DM_Mono',monospace] leading-none"><span class="border-b border-current px-1 pb-0.5 text-[0.82em]">${numerator}</span><span class="px-1 pt-0.5 text-[0.82em]">${denominator}</span></span>`
  )
  html = html.replace(/\^\{([^{}]+)\}/g, (_match, power: string) => `<sup>${power}</sup>`)
  html = html.replace(/_\{([^{}]+)\}/g, (_match, sub: string) => `<sub>${sub}</sub>`)
  html = html.replace(/\^([a-zA-Z0-9+\-=]+)/g, (_match, power: string) => `<sup>${power}</sup>`)
  html = html.replace(/_([a-zA-Z0-9+\-=]+)/g, (_match, sub: string) => `<sub>${sub}</sub>`)
  html = html.replace(/\\times/g, '×')
  html = html.replace(/\\div/g, '÷')
  html = html.replace(/\\pm/g, '±')
  html = html.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
  html = html.replace(/\\leq/g, '≤')
  html = html.replace(/\\geq/g, '≥')
  html = html.replace(/\\neq/g, '≠')
  html = html.replace(/\\alpha/g, 'α')
  html = html.replace(/\\beta/g, 'β')
  html = html.replace(/\\theta/g, 'θ')
  html = html.replace(/\\pi/g, 'π')
  html = html.replace(/\n/g, '<br />')

  return html
}

function MathText({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'math-text whitespace-pre-wrap',
        '[&_sup]:text-[0.72em] [&_sup]:align-super',
        '[&_sub]:text-[0.72em] [&_sub]:align-sub',
        className
      )}
      dangerouslySetInnerHTML={{ __html: formatMathTextToHtml(children) }}
    />
  )
}

const getLanguageId = (language: string) => {
  const normalized = language.toLowerCase()
  if (normalized.includes('javascript') || normalized.includes('node') || normalized === 'js') return 63
  if (normalized.includes('typescript') || normalized === 'ts') return 74
  if (normalized.includes('python') || normalized === 'py') return 71
  if (normalized.includes('java')) return 62
  if (normalized.includes('cpp') || normalized.includes('c++')) return 54
  if (normalized === 'c') return 50
  return 63
}

const findCompilerLanguage = (language: string) => {
  const normalized = language.toLowerCase().trim()
  const languageId = getLanguageId(normalized)
  return (
    COMPILER_LANGUAGES.find((item) => {
      return (
        item.languageId === languageId ||
        normalized.includes(item.value) ||
        item.value.includes(normalized) ||
        item.label.toLowerCase() === normalized
      )
    }) || COMPILER_LANGUAGES[0]
  )
}

// ─── LessonChatCard ──────────────────────────────────────────────────────────

function LessonChatCard({
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

function ReflectionPracticeCard({
  lesson,
  trackerId,
  subtopicId,
}: {
  lesson: GeneratedLesson
  trackerId: string
  subtopicId: string
}) {
  const generateQuestionMutation = useChatWithLessonTutor()
  const generateSolutionMutation = useChatWithLessonTutor()
  const doubtMutation = useChatWithLessonTutor()
  const verifyAnswerMutation = useVerifyLessonAnswer()

  const baseQuestions = useMemo(() => {
    const qs = [
      lesson.practiceTask.description ||
        `Explain ${lesson.title} in your own words with one real example.`,
      `What are the most common mistakes learners make in ${lesson.title}?`,
      `Previous-year style question: Why is ${lesson.title} important for ${lesson.lessonType.replace('_', ' ')} preparation?`,
      `Interview-style question: How would you explain ${lesson.title} to a beginner?`,
      `Application question: Where would you use ${lesson.title} in a real project or interview scenario?`,
    ]
    return qs.filter(Boolean) as string[]
  }, [lesson])

  const [questions, setQuestions] = useState<string[]>(baseQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState(baseQuestions[0] || '')
  const [answer, setAnswer] = useState('')
  const [verification, setVerification] = useState<VerifyLessonAnswerResponse['data'] | null>(null)
  const [solution, setSolution] = useState('')
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [doubt, setDoubt] = useState('')
  const [doubtAnswer, setDoubtAnswer] = useState('')

  const handleSelectQuestion = (q: string) => {
    setSelectedQuestion(q)
    setAnswer('')
    setVerification(null)
  }

  useEffect(() => {
    if (!solutionOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSolutionOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [solutionOpen])

  const generateMoreQuestions = () => {
    generateQuestionMutation.mutate(
      {
        trackerId,
        subtopicId,
        messages: [
          {
            role: 'user',
            content: `
Generate 5 more practice questions for this lesson.

Lesson title:
${lesson.title}

Lesson summary:
${lesson.summary}

Lesson explanation:
${lesson.explanation}

The user is preparing for interviews / exams / previous-year style questions.

Rules:
- Questions must be specific to this lesson.
- Include conceptual, previous-year style, interview-style, application, and math-style questions where relevant.
- Use readable math notation where needed, like x^2, H_2O, a_n, \\frac{a}{b}, or $$E = mc^2$$.
- Return only the questions as a numbered list.
            `.trim(),
          },
        ],
      },
      {
        onSuccess: (response) => {
          const generated = response.data.answer
            .split('\n')
            .map((line) =>
              line.replace(/^\d+[).]\s*/, '').replace(/^[-*]\s*/, '').trim()
            )
            .filter(Boolean)
          setQuestions((current) => [...current, ...generated])
        },
      }
    )
  }

  const verifyAnswer = () => {
    const trimmed = answer.trim()
    if (!trimmed) return
    verifyAnswerMutation.mutate(
      { trackerId, subtopicId, question: selectedQuestion, answer: trimmed },
      { onSuccess: (response) => setVerification(response.data) }
    )
  }

  const generateSolution = (question: string) => {
    setSelectedQuestion(question)
    setSolution('')
    setDoubt('')
    setDoubtAnswer('')
    setSolutionOpen(true)

    generateSolutionMutation.mutate(
      {
        trackerId,
        subtopicId,
        messages: [
          {
            role: 'user',
            content: `
Generate a clear solution/answer for this question.

Lesson title:
${lesson.title}

Lesson explanation:
${lesson.explanation}

Question:
${question}

Rules:
- Answer in simple English.
- Make it useful for interview/exam preparation.
- Include key points the user should remember.
- If math is involved, format equations clearly using:
  - x^2 for powers
  - a_n for subscripts
  - \\frac{a}{b} for fractions
  - $$equation$$ for important standalone equations
- If relevant, include a short example.
            `.trim(),
          },
        ],
      },
      {
        onSuccess: (response) => setSolution(response.data.answer),
        onError: (error) => setSolution(`Could not generate solution. ${error.message}`),
      }
    )
  }

  const askDoubtAboutSolution = () => {
    const trimmed = doubt.trim()
    if (!trimmed || !solution) return

    doubtMutation.mutate(
      {
        trackerId,
        subtopicId,
        messages: [
          {
            role: 'user',
            content: `
I have a doubt about this solution.

Lesson:
${lesson.title}

Question:
${selectedQuestion}

Solution:
${solution}

My doubt:
${trimmed}

Please explain clearly and simply. If math is involved, use proper readable notation like x^2, a_n, \\frac{a}{b}, or $$equation$$.
            `.trim(),
          },
        ],
      },
      {
        onSuccess: (response) => setDoubtAnswer(response.data.answer),
        onError: (error) => setDoubtAnswer(`Could not answer doubt. ${error.message}`),
      }
    )
  }

  const verdictLabel = verification
    ? verification.verdict.split('_').join(' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : ''

  return (
    <>
      <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
              Practice Questions
            </div>
            <h2 className="mt-1 font-['Playfair_Display',serif] text-[24px] font-extrabold">
              Type your answer and verify it
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
              Select a question, type your answer, and let Scribe AI correct and improve it.
            </p>
          </div>
          <button
            type="button"
            onClick={generateMoreQuestions}
            disabled={generateQuestionMutation.isPending}
            className="rounded-xl bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {generateQuestionMutation.isPending ? 'Generating...' : 'Generate More Questions'}
          </button>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex h-full min-h-140 flex-col overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320] lg:h-205">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">Question Set</h3>
                <p className="mt-1 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                  Click a question card to select it.
                </p>
              </div>
              <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                {questions.length} Questions
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {questions.map((question, index) => {
                const active = selectedQuestion === question
                return (
                  <article
                    key={`${question}-${index}`}
                    onClick={() => handleSelectQuestion(question)}
                    className={cn(
                      'cursor-pointer rounded-2xl border-[1.5px] p-4 transition hover:-translate-y-0.5 hover:border-[#e8816a]',
                      active
                        ? 'border-[#e8816a] bg-[rgba(184,76,43,0.06)] dark:border-[#e8816a] dark:bg-[rgba(232,129,106,0.08)]'
                        : 'border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19]'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                        Question {index + 1}
                      </div>
                      {active && (
                        <span className="rounded-full bg-[#b84c2b] px-2 py-0.5 font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.08em] text-white dark:bg-[#e8816a] dark:text-[#141412]">
                          Selected
                        </span>
                      )}
                    </div>
                    <MathText className="text-[13.5px] leading-[1.6] text-[#1a1714] dark:text-[#f2f0eb]">
                      {question}
                    </MathText>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="flex h-full min-h-140 flex-col overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320] lg:h-205">
            <div className="mb-3 shrink-0 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
              Your Answer
            </div>
            <MathText className="mb-4 shrink-0 rounded-[14px] border border-[#e0d0c5] bg-[#fdf8f5] p-4 text-[13px] leading-[1.6] text-[#1a1714] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]">
              {selectedQuestion}
            </MathText>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer here..."
              className="min-h-44 shrink-0 resize-none rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 text-[13px] leading-[1.6] text-[#1a1714] outline-none transition focus:border-[#e8816a] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
            />
            <div className="mt-3 flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={verifyAnswer}
                disabled={verifyAnswerMutation.isPending || !answer.trim()}
                className="rounded-[10px] bg-[#b84c2b] px-3 py-2 text-[11px] font-bold text-[#fdf8f5] transition hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
              >
                {verifyAnswerMutation.isPending ? 'Checking...' : 'Verify Answer'}
              </button>
              <button
                type="button"
                onClick={() => generateSolution(selectedQuestion)}
                disabled={generateSolutionMutation.isPending}
                className="rounded-[10px] border border-[#e0d0c5] px-3 py-2 text-[11px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] disabled:cursor-wait disabled:opacity-60 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
              >
                Generate Solution
              </button>
            </div>

            {verification ? (
              <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/9 dark:bg-[#1e1c19]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">{verdictLabel}</h4>
                  <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    Score {verification.score}/100
                  </span>
                </div>
                <MathText className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#d8d6cf]">
                  {verification.feedback}
                </MathText>
                <div className="mt-4 rounded-xl border border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320]">
                  <h5 className="mb-2 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">Corrected Answer</h5>
                  <MathText className="text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#d8d6cf]">
                    {verification.correctedAnswer}
                  </MathText>
                </div>
                {verification.keyPoints.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-[#6b5f58] dark:text-[#d8d6cf]">
                    {verification.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="mt-5 flex min-h-0 flex-1 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-6 text-center dark:border-white/9 dark:bg-[#1e1c19]">
                <div>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    ✍️
                  </div>
                  <p className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Your AI feedback will appear here
                  </p>
                  <p className="mt-1 max-w-sm text-[12px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                    Type your answer above and click verify to get score, correction, and key points.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {solutionOpen && (
        <div
          className="fixed inset-0 z-130 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Generated solution"
        >
          <div className="relative flex h-[min(820px,94vh)] w-[min(980px,96vw)] flex-col rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#1e1c19]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e0d0c5] px-6 py-4 dark:border-white/9 max-[640px]:px-4">
              <div>
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  Generated Solution
                </div>
                <MathText className="mt-1 line-clamp-2 text-[18px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  {selectedQuestion}
                </MathText>
              </div>
              <button
                type="button"
                onClick={() => setSolutionOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                aria-label="Close solution"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4">
              <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-5 dark:border-white/9 dark:bg-[#252320]">
                <h4 className="mb-3 text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">Solution</h4>
                {generateSolutionMutation.isPending && !solution ? (
                  <p className="text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                    Generating a clear answer...
                  </p>
                ) : (
                  <MathText className="text-[13.5px] leading-[1.75] text-[#6b5f58] dark:text-[#d8d6cf]">
                    {solution || 'No solution generated yet.'}
                  </MathText>
                )}
              </div>
              <div className="mt-5 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-5 dark:border-white/9 dark:bg-[#252320]">
                <h4 className="mb-2 text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Ask doubt about this solution
                </h4>
                <textarea
                  value={doubt}
                  onChange={(event) => setDoubt(event.target.value)}
                  placeholder="Example: I did not understand the second point..."
                  className="min-h-28 w-full resize-none rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-3 text-[13px] text-[#1a1714] outline-none transition focus:border-[#e8816a] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
                />
                <button
                  type="button"
                  onClick={askDoubtAboutSolution}
                  disabled={doubtMutation.isPending || !doubt.trim() || !solution}
                  className="mt-3 rounded-xl bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
                >
                  {doubtMutation.isPending ? 'Answering...' : 'Ask Doubt'}
                </button>
                {doubtAnswer && (
                  <div className="mt-4 rounded-[14px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] p-4 text-[13px] leading-[1.7] text-[#6b5f58] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#f2f0eb]">
                    <MathText>{doubtAnswer}</MathText>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── CompilerCard ─────────────────────────────────────────────────────────────

function CompilerCard({
  trackerId,
  subtopicId,
  language,
  fileName,
  initialCode,
  practiceTitle,
  practiceDescription,
  expectedOutput,
}: {
  trackerId: string
  subtopicId: string
  language: string
  fileName: string
  initialCode: string
  practiceTitle: string
  practiceDescription: string
  expectedOutput?: string
}) {
  const runCodeMutation = useRunLessonCode()
  const submitCodeMutation = useSubmitLessonCode()
  const hintMutation = useGetCodeHint()
  const optimizedMutation = useGetOptimizedSolution()

  const initialLanguage = useMemo(() => findCompilerLanguage(language || 'javascript'), [language])

  const [selectedLanguage, setSelectedLanguage] = useState<CompilerLanguageOption>(initialLanguage)
  const [code, setCode] = useState(initialCode)
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState('> Ready to run your code')
  const [submitResult, setSubmitResult] = useState<SubmitLessonCodeResponse['data'] | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [hintItems, setHintItems] = useState<Array<{ mode: 'hint' | 'issue'; title: string; explanation: string }>>([])
  const [optimizedSolution, setOptimizedSolution] = useState<GetOptimizedSolutionResponse['data'] | null>(null)

  const displayFileName = selectedLanguage.fileName || fileName || 'main.js'

  const buildOutput = (data: {
    stdout?: string
    stderr?: string
    compileOutput?: string
    message?: string
    status?: { description: string }
    time?: string | null
    memory?: number | null
  }) => {
    return [
      data.stdout ? `STDOUT:\n${data.stdout}` : '',
      data.stderr ? `STDERR:\n${data.stderr}` : '',
      data.compileOutput ? `COMPILE OUTPUT:\n${data.compileOutput}` : '',
      data.message ? `MESSAGE:\n${data.message}` : '',
      data.status ? `STATUS: ${data.status.description}` : '',
      data.time ? `TIME: ${data.time}s` : '',
      data.memory ? `MEMORY: ${data.memory} KB` : '',
    ]
      .filter(Boolean)
      .join('\n\n')
  }

  const runCode = () => {
    runCodeMutation.mutate(
      { trackerId, subtopicId, sourceCode: code, languageId: selectedLanguage.languageId, language: selectedLanguage.value, stdin },
      {
        onSuccess: (response) => setOutput(buildOutput(response.data) || '> Code executed'),
        onError: (error) => setOutput(`> Error: ${error.message}`),
      }
    )
  }

  const submitCode = () => {
    submitCodeMutation.mutate(
      { trackerId, subtopicId, sourceCode: code, languageId: selectedLanguage.languageId, language: selectedLanguage.value, stdin },
      {
        onSuccess: (response) => {
          setSubmitResult(response.data)
          setOutput(buildOutput(response.data) || '> Code submitted')
          setOptimizedSolution(null)
          if (response.data.isCorrect) {
            setHintItems([])
            setHintCount(0)
          }
        },
        onError: (error) => setOutput(`> Submit Error: ${error.message}`),
      }
    )
  }

  const getHint = () => {
    hintMutation.mutate(
      {
        trackerId,
        subtopicId,
        sourceCode: code,
        actualOutput: submitResult?.actualOutput || submitResult?.stdout || output,
        errorOutput: submitResult?.stderr || submitResult?.compileOutput || submitResult?.message || '',
        hintCount,
      },
      {
        onSuccess: (response) => {
          setHintCount(response.data.hintCount)
          setHintItems((current) => [
            ...current,
            { mode: response.data.mode, title: response.data.title, explanation: response.data.explanation },
          ])
        },
      }
    )
  }

  const compareOptimized = () => {
    optimizedMutation.mutate(
      { trackerId, subtopicId, sourceCode: code, language: selectedLanguage.value },
      { onSuccess: (response) => setOptimizedSolution(response.data) }
    )
  }

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = COMPILER_LANGUAGES.find((item) => item.value === event.target.value) || COMPILER_LANGUAGES[0]
    setSelectedLanguage(nextLanguage)
    setOutput(`> Compiler language changed to ${nextLanguage.label}`)
    setSubmitResult(null)
    setHintItems([])
    setHintCount(0)
    setOptimizedSolution(null)
  }

  const lineCount = Math.max(1, code.split('\n').length)

  return (
    <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[#1e1e1e] shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#111]">
      <div className="border-b border-white/10 bg-[#161616] px-5 py-4 dark:bg-[#0a0a0a]">
        <div className="mb-4 rounded-[14px] border border-white/10 bg-[#111] p-4">
          <div className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#4caf50]">
            Coding Challenge
          </div>
          <h3 className="text-[16px] font-bold text-[#f2f0eb]">
            {practiceTitle || 'Solve this coding task'}
          </h3>
          <MathText className="mt-2 text-[13px] leading-[1.65] text-[#aaa]">
            {practiceDescription || 'Write code that solves the problem and submit it.'}
          </MathText>
          {expectedOutput && (
            <div className="mt-4 rounded-[10px] border border-white/10 bg-[#0a0a0a] p-3">
              <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#888]">
                Expected Output
              </div>
              <pre className="whitespace-pre-wrap font-['DM_Mono',monospace] text-[12px] text-[#d4d4d4]">
                {expectedOutput}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 font-['DM_Mono',monospace] text-[12px] text-[#888]">
              📄 {displayFileName}
            </div>
            <label className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111] px-2.5 py-1.5 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.08em] text-[#888]">
              Language
              <select
                value={selectedLanguage.value}
                onChange={handleLanguageChange}
                className="cursor-pointer bg-transparent text-[11px] font-bold normal-case tracking-normal text-[#d4d4d4] outline-none"
              >
                {COMPILER_LANGUAGES.map((item) => (
                  <option key={item.value} value={item.value} className="bg-[#111] text-[#d4d4d4]">
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={runCodeMutation.isPending}
              onClick={runCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#2e5a39] bg-[#1a3d24] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4caf50] transition hover:bg-[#235230] hover:text-[#66bb6a] disabled:cursor-wait disabled:opacity-50"
            >
              ▶ {runCodeMutation.isPending ? 'Running' : 'Run Code'}
            </button>
            <button
              type="button"
              disabled={submitCodeMutation.isPending}
              onClick={submitCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e8816a]/40 bg-[#b84c2b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-50"
            >
              ✓ {submitCodeMutation.isPending ? 'Submitting' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-60 bg-[#1e1e1e] py-4 font-['DM_Mono',monospace] text-[14px] text-[#d4d4d4] dark:bg-[#111]">
        <div className="select-none px-4 text-right leading-[1.6] text-[#555]">
          {Array.from({ length: lineCount }).map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          className="min-h-56 flex-1 resize-none bg-transparent pr-4 font-['DM_Mono',monospace] text-[14px] leading-[1.6] text-[#d4d4d4] outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-5 border-t border-white/10 bg-[#161616] p-5 dark:bg-[#0a0a0a] max-[640px]:grid-cols-1">
        <div>
          <label className="mb-2 block font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-widest text-[#888]">
            Input
          </label>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder="Optional stdin..."
            className="min-h-28 w-full resize-none rounded-lg border border-white/10 bg-[#111] p-3 font-['DM_Mono',monospace] text-[12px] text-[#aaa] outline-none focus:border-[#e8816a]"
          />
        </div>
        <div>
          <div className="mb-3 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-widest text-[#888]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
            Output
          </div>
          <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap font-['DM_Mono',monospace] text-[12.5px] leading-[1.8] text-[#aaa]">
            {output}
          </pre>
        </div>
      </div>

      {submitResult && (
        <div className="border-t border-white/10 bg-[#111] p-5">
          <div className={cn('rounded-[14px] border p-4', submitResult.isCorrect ? 'border-[#2e5a39] bg-[#1a3d24]/70' : 'border-[#ffbd2e]/30 bg-[#2d2614]')}>
            <h4 className="text-[14px] font-bold text-[#f2f0eb]">
              {submitResult.isCorrect ? '✅ Correct Output' : '⚠️ Not correct yet'}
            </h4>
            <p className="mt-2 text-[12.5px] leading-[1.6] text-[#aaa]">
              {submitResult.isCorrect
                ? 'Great job. Your output matches the expected result.'
                : 'Your code ran, but the output or behavior does not match the expected result. Try using hints first.'}
            </p>
            {!submitResult.isCorrect && (
              <button
                type="button"
                onClick={getHint}
                disabled={hintMutation.isPending}
                className="mt-4 rounded-[10px] border border-[#ffbd2e]/40 bg-[#3a2b12] px-3 py-2 text-[11px] font-bold text-[#ffbd2e] transition hover:bg-[#4a3616] disabled:cursor-wait disabled:opacity-60"
              >
                {hintMutation.isPending ? 'Thinking...' : hintCount >= 3 ? 'Reveal Issue' : `Get Hint ${hintCount + 1}/3`}
              </button>
            )}
            {submitResult.isCorrect && (
              <button
                type="button"
                onClick={compareOptimized}
                disabled={optimizedMutation.isPending}
                className="mt-4 rounded-[10px] border border-[#2e5a39] bg-[#1a3d24] px-3 py-2 text-[11px] font-bold text-[#4caf50] transition hover:bg-[#235230] disabled:cursor-wait disabled:opacity-60"
              >
                {optimizedMutation.isPending ? 'Comparing...' : 'Compare With Optimized Code'}
              </button>
            )}
          </div>

          {hintItems.length > 0 && (
            <div className="mt-4 space-y-3">
              {hintItems.map((item, index) => (
                <div key={`${item.mode}-${index}`} className="rounded-xl border border-white/10 bg-[#161616] p-4">
                  <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#ffbd2e]">
                    {item.mode === 'issue' ? 'Issue Revealed' : `Hint ${index + 1}`}
                  </div>
                  <h5 className="mt-1 text-[13px] font-bold text-[#f2f0eb]">{item.title}</h5>
                  <MathText className="mt-2 text-[12.5px] leading-[1.65] text-[#aaa]">{item.explanation}</MathText>
                </div>
              ))}
            </div>
          )}

          {optimizedSolution && (
            <div className="mt-4 rounded-[14px] border border-[#2e5a39] bg-[#101a13] p-4">
              <h4 className="text-[14px] font-bold text-[#4caf50]">Optimized Solution</h4>
              <p className="mt-2 text-[12.5px] leading-[1.6] text-[#aaa]">{optimizedSolution.explanation}</p>
              {optimizedSolution.improvements.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.5px] text-[#aaa]">
                  {optimizedSolution.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <pre className="mt-4 max-h-72 overflow-y-auto rounded-[10px] border border-white/10 bg-[#0a0a0a] p-4 font-['DM_Mono',monospace] text-[12.5px] leading-[1.7] text-[#d4d4d4]">
                {optimizedSolution.optimizedCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ─── LessonNavigationPreview ──────────────────────────────────────────────────

function LessonNavigationPreview({
  previousLesson,
  nextLesson,
  onOpenLesson,
  onComplete,
  completing,
  isCompleted,
}: {
  previousLesson: { _id: string; title: string } | null
  nextLesson: { _id: string; title: string } | null
  onOpenLesson: (id: string) => void
  onComplete: () => void
  completing: boolean
  isCompleted: boolean
}) {
  return (
    <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">Lesson Navigation</h3>
          <p className="mt-1 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
            Jump to the previous or next lesson quickly.
          </p>
        </div>
        <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
          Quick Jump
        </span>
      </div>

      <div className="space-y-3">
        {/* ── Mark as Complete / Completed badge ── */}
        {isCompleted ? (
          <div className="flex items-center gap-2 rounded-[14px] border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-4 py-3 dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4caf7d] text-[11px] text-white">
              ✓
            </span>
            <span className="text-[13px] font-bold text-[#2d6a47] dark:text-[#5cc98a]">
              Lesson Completed
            </span>
          </div>
        ) : (
          <button
            type="button"
            disabled={completing}
            onClick={onComplete}
            className="w-full rounded-[14px] bg-[#b84c2b] px-4 py-3.5 text-[13px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {completing ? 'Saving...' : '✓ Mark as Complete'}
          </button>
        )}

        {/* ── Previous lesson ── */}
        {previousLesson ? (
          <button
            type="button"
            onClick={() => onOpenLesson(previousLesson._id)}
            className="group w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.05)] dark:border-white/9 dark:bg-[#252320] dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
              Previous
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#1a1714] dark:text-[#f2f0eb]">
                {previousLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] text-[#6b5f58] transition group-hover:border-[#e8816a] group-hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:group-hover:text-[#e8816a]">
                ←
              </span>
            </div>
          </button>
        ) : (
          <div className="rounded-[14px] border-[1.5px] border-dashed border-[#e0d0c5] p-4 text-[12px] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
            This is the first lesson.
          </div>
        )}

        {/* ── Next lesson ── */}
        {nextLesson && (
          <button
            type="button"
            onClick={() => onOpenLesson(nextLesson._id)}
            className="group w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.05)] dark:border-white/9 dark:bg-[#252320] dark:hover:border-[rgba(232,129,106,0.25)] dark:hover:bg-[rgba(232,129,106,0.08)]"
          >
            <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
              Up Next
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="line-clamp-2 text-[13px] font-bold leading-[1.35] text-[#1a1714] dark:text-[#f2f0eb]">
                {nextLesson.title}
              </h4>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#b84c2b] text-white transition group-hover:translate-x-0.5 dark:bg-[#e8816a] dark:text-[#141412]">
                →
              </span>
            </div>
          </button>
        )}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerLessonPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { trackerId, subtopicId } = useParams<{
    trackerId: string
    subtopicId: string
  }>()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const queryClient = useQueryClient()
  const dashboardSummaryQuery = useDashboardSummary()
  const lessonQuery = useTrackerLesson(trackerId || '', subtopicId || '')
  const updateProgressMutation = useUpdateSubtopicProgress()

  const dashboardSummary = dashboardSummaryQuery.data
  const lessonData = lessonQuery.data

  const tracker = lessonData?.tracker
  const lessonNode = lessonData?.lessonNode
  const generatedLesson = lessonData?.generatedLesson

  // ── Local completion state ──────────────────────────────────────────────────
  // Initialized from server data. Flips to true immediately on mutation success
  // so the UI reacts instantly without waiting for a refetch.
  const [isCompleted, setIsCompleted] = useState(
    () => lessonNode?.status === 'completed'
  )

  // Keep in sync if the user navigates back to the same lesson from a fresh
  // server fetch (e.g. after returning from roadmap).
  useEffect(() => {
    if (lessonNode?.status === 'completed') {
      setIsCompleted(true)
    }
  }, [lessonNode?.status])
  // ───────────────────────────────────────────────────────────────────────────

  const codeForCompiler = useMemo(() => {
    return (
      generatedLesson?.practiceTask.starterCode ||
      generatedLesson?.codeExample.code ||
      '// Start coding here'
    )
  }, [generatedLesson])

  const isLoading = dashboardSummaryQuery.isLoading || lessonQuery.isLoading
  const hasError =
    dashboardSummaryQuery.isError || lessonQuery.isError || !trackerId || !subtopicId

  if (isLoading) {
    return (
      <PageLoadingScreen
        eyebrow="Lesson"
        title="Preparing your lesson"
        description="Loading Groq lesson, AI chat, and roadmap."
      />
    )
  }

  if (hasError || !dashboardSummary || !lessonData || !tracker || !lessonNode || !generatedLesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Lesson unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while fetching this lesson.
          </p>
        </div>
      </div>
    )
  }

  const userInitials = getInitials(dashboardSummary.user.fullName)

  const getReturnStack = () => {
    const state = location.state as LessonLocationState | null
    if (state?.returnToRoadmapStack?.length) return state.returnToRoadmapStack
    if (typeof window === 'undefined' || !trackerId) return []
    try {
      const raw = sessionStorage.getItem(getRoadmapStackStorageKey(trackerId))
      if (!raw) return []
      return JSON.parse(raw) as unknown[]
    } catch {
      return []
    }
  }


const markCompleted = () => {
  if (isCompleted) return

  updateProgressMutation.mutate(
    {
      trackerId,
      subtopicId,
      status: 'completed',
      timeSpentMinutes: generatedLesson.estimatedMinutes,
    },
    {
      onSuccess: () => {
        setIsCompleted(true)

         queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'current-roadmap'] })
  queryClient.invalidateQueries({ queryKey: ['trackers', 'roadmap', trackerId] })
  queryClient.invalidateQueries({ queryKey: ['trackers', 'list'] })


        lessonQuery.refetch()
      },
      onError: (error) => {
        console.error('❌ Mutation error:', error)
      },
    }
  )
}

  const goToLesson = (id: string) => {
    navigate(`/trackers/${trackerId}/lessons/${id}`, {
      state: { returnToRoadmapStack: getReturnStack() },
    })
  }

  const backToRoadmapLastLevel = () => {
    const stack = getReturnStack()
    navigate(`/trackers/${trackerId}/roadmap`, {
      state: { roadmapBreadcrumbStack: stack },
    })
  }

  const compilerKeywords = [
    tracker.title,
    lessonNode.title,
    lessonNode.description || '',
    generatedLesson.title,
    generatedLesson.summary,
    generatedLesson.lessonType,
  ]
    .join(' ')
    .toLowerCase()

  const showCompiler =
    generatedLesson.requiresCompiler ||
    generatedLesson.lessonType === 'coding' ||
    /\b(javascript|typescript|react|node|express|mongodb|mongoose|array|object|string|function|loop|promise|async|await|callback|closure|scope|hoisting|var|let|const|class|prototype|algorithm|dsa|coding|programming|implementation|debug)\b/.test(
      compilerKeywords
    )

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value
              localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={dashboardSummary.streak.current}
            userName={dashboardSummary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={dashboardSummary.user.avatarUrl || undefined}
            userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-6 grid w-[min(1280px,calc(100%-48px))] max-w-full grid-cols-[1fr_340px] gap-6 pb-8 max-[1024px]:grid-cols-1 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              <div className="flex min-w-0 flex-col gap-6">
                <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
                  <div className="mb-4 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                    Trackers › {tracker.title} › {lessonNode.topicTitle || 'Lesson'}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                      Groq Lesson
                    </span>
                    <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                      {formatLessonType(generatedLesson.lessonType)}
                    </span>
                    {showCompiler && (
                      <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                        Piston Compiler
                      </span>
                    )}
                    <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                      {generatedLesson.difficulty}
                    </span>
                  </div>

                  <h1 className="font-['Playfair_Display',serif] text-[clamp(32px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
                    {generatedLesson.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                    {generatedLesson.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-5 text-[12.5px] font-medium text-[#6b5f58] dark:text-[#9b9a92]">
                    <div>⏱ {generatedLesson.estimatedMinutes} min</div>
                    <div>◇ Level {lessonNode.depth}</div>
                    <div>★ +180 XP</div>
                  </div>
                </section>

                <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
                  <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                    ⬢ Scribe AI Explanation
                  </h2>
                  <MathText className="text-[15px] leading-[1.7] text-[#1a1714]/90 dark:text-[#f2f0eb]/90">
                    {generatedLesson.explanation}
                  </MathText>
                  <div className="mt-6 rounded-r-xl border-l-4 border-[#c98000] bg-[rgba(138,98,0,0.08)] p-5 dark:bg-[rgba(240,168,66,0.10)]">
                    <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#8a6200] dark:text-[#f0a842]">
                      💬 Insight
                    </h3>
                    <MathText className="text-[14px] italic leading-[1.55] text-[#1a1714]/85 dark:text-[#f2f0eb]/85">
                      {generatedLesson.insight}
                    </MathText>
                  </div>
                  {generatedLesson.codeExample.code && (
                    <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-[#1e1e1e] p-5 font-['DM_Mono',monospace] text-[13.5px] leading-[1.6] text-[#d4d4d4]">
                      <code>{generatedLesson.codeExample.code}</code>
                    </pre>
                  )}
                </section>

                {showCompiler ? (
                  <>
                    <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                      <h2 className="font-['Playfair_Display',serif] text-[24px] font-extrabold">
                        Coding Practice
                      </h2>
                      <MathText className="mt-2 text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                        {`${generatedLesson.practiceTask.title || 'Practice task'}: ${
                          generatedLesson.practiceTask.description || 'Try solving this using the compiler below.'
                        }`}
                      </MathText>
                    </section>
                    <CompilerCard
                      trackerId={trackerId}
                      subtopicId={subtopicId}
                      language={generatedLesson.codeExample.language}
                      fileName={generatedLesson.codeExample.fileName}
                      initialCode={codeForCompiler}
                      practiceTitle={generatedLesson.practiceTask.title}
                      practiceDescription={generatedLesson.practiceTask.description}
                      expectedOutput={generatedLesson.practiceTask.expectedOutput ?? ''}
                    />
                  </>
                ) : (
                  <ReflectionPracticeCard
                    lesson={generatedLesson}
                    trackerId={trackerId}
                    subtopicId={subtopicId}
                  />
                )}
              </div>

              <aside className="flex min-w-0 flex-col gap-6">
                <LessonChatCard
                  lessonTitle={generatedLesson.title}
                  trackerId={trackerId}
                  subtopicId={subtopicId}
                />

                <LessonNavigationPreview
                  previousLesson={lessonData.previousLesson}
                  nextLesson={lessonData.nextLesson}
                  onOpenLesson={goToLesson}
                  onComplete={markCompleted}
                  completing={updateProgressMutation.isPending}
                  isCompleted={isCompleted}
                />

                <button
                  type="button"
                  onClick={backToRoadmapLastLevel}
                  className="w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[12px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                >
                  Back to Current Roadmap Level
                </button>
              </aside>
            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}