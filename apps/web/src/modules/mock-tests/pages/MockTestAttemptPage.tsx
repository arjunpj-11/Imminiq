// ============================================================
// MockTestAttemptPage.tsx — fixed chrome, scrollable content
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import BottomNav from '../../../components/layout/BottomNav'

import {
  useFinishMockTestAttempt,
  useMockTestAttemptQuestions,
  useSubmitMockTestAnswer,
} from '../hooks/useMockTests'

import type {
  PublicMockTestQuestion,
  StartAttemptResponse,
} from '../types/mock-tests.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const NoiseOverlay = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      backgroundSize: '180px',
    }}
  />
)

function useCountdown(initialSeconds: number) {
  const [secs, setSecs] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const FlagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8816a" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const HintIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4m0 4h.01" />
  </svg>
)

type Confidence = 'low' | 'medium' | 'high' | null

export default function MockTestAttemptPage() {
  const { attemptId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
  )

  const initial = location.state as StartAttemptResponse | undefined
  const shouldFetch = !initial?.questions?.length && Boolean(attemptId)
  const questionsQuery = useMockTestAttemptQuestions(shouldFetch ? attemptId : undefined)
  const questions = useMemo<PublicMockTestQuestion[]>(() => {
    if (initial?.questions?.length) return initial.questions
    return (questionsQuery.data || []) as PublicMockTestQuestion[]
  }, [initial?.questions, questionsQuery.data])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(new Set([0]))
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [confidence, setConfidence] = useState<Record<number, Confidence>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())

  const submitMutation = useSubmitMockTestAnswer()
  const finishMutation = useFinishMockTestAttempt()
  const timerDisplay = useCountdown(3600)

  const totalQuestions = questions.length || 15

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalQuestions) return
    setCurrentIndex(index)
    setVisited((prev) => new Set([...prev, index]))
  }, [totalQuestions])

  const question = questions[currentIndex]
  const isMCQ = Boolean(question?.options?.length)

  const submitAnswer = async () => {
    if (!question || !attemptId) return
    const answer = answers[question._id]?.trim()
    if (!answer) return
    await submitMutation.mutateAsync({ attemptId, payload: { questionId: question._id, answer } })
  }

  const finish = async () => {
    if (!attemptId) return
    await finishMutation.mutateAsync({ attemptId })
    navigate(`/mock-tests/attempts/${attemptId}/result`)
  }

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) {
        next.delete(currentIndex)
      } else {
        next.add(currentIndex)
      }
      return next
    })
  }

  const isLoading = shouldFetch && questionsQuery.isLoading
  const isFinishing = finishMutation.isPending
  const isSubmitting = submitMutation.isPending

  const qNumCls = (i: number) => {
    if (i === currentIndex) return 'border-[#e8816a] bg-[#e8816a] font-bold text-white'
    const q = questions[i]
    if (q && answers[q._id]) return 'border-[#6fcb8a] text-[#6fcb8a]'
    if (flagged.has(i)) return 'border-[#f0c060] text-[#f0c060]'
    if (visited.has(i)) return 'border-white/16 bg-[#252320] text-[#f2f0eb]'
    return 'border-white/9 text-[#9b9a92]'
  }

  return (
    // h-screen + overflow-hidden: the page NEVER grows beyond the viewport
    <div className="relative h-screen overflow-hidden bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />

      {/* Full-height flex row: sidebar | main */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((c) => {
              const next = !c
              if (typeof window !== 'undefined')
                localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        {/*
          main: flex column, h-full, overflow-hidden
          ┌─────────────────────┐
          │ TopBar (shrink-0)   │
          │ exam header (shrink)│
          │ q-navigator (shrink)│
          │ ─────────────────── │
          │ question area       │ ← flex-1, overflow-y-auto (ONLY this scrolls)
          │ ─────────────────── │
          │ prev/next (shrink-0)│
          └─────────────────────┘
        */}
        <main
          className={cn(
            'flex h-full min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          {/* ① TopBar — fixed height, never scrolls */}
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={0}
            userName="Achu"
            userInitials="AC"
            userLevel="Free Scholar"
            isGuest={false}
          />

          {/* ② Exam chrome — shrinks to content, never scrolls */}
          <div className="w-full shrink-0 border-b border-white/8 bg-[#141412]">
            <div className="mx-auto w-[min(1060px,calc(100%-48px))] max-[640px]:w-[calc(100%-20px)]">

              {/* title row */}
              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                      Attempt
                    </span>
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-[22px] font-black leading-tight text-[#f2f0eb]">
                    Mock test <span className="text-[#e8816a]">in progress</span>
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/16 px-3.5 py-1.5 font-['DM_Mono',monospace] text-[14px] tracking-[0.12em] text-[#f2f0eb]">
                    {timerDisplay}
                  </div>
                  <button
                    type="button"
                    onClick={toggleFlag}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition',
                      flagged.has(currentIndex)
                        ? 'border-[#f0c060] text-[#f0c060]'
                        : 'border-white/16 text-[#9b9a92] hover:border-[#e8816a] hover:text-[#e8816a]'
                    )}
                  >
                    <FlagIcon />
                    Flag
                  </button>
                  <button
                    type="button"
                    onClick={finish}
                    disabled={isFinishing || !attemptId}
                    className="rounded-xl bg-[#e8816a] px-4 py-1.5 font-['Playfair_Display',serif] text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFinishing ? 'Finishing…' : 'Finish test'}
                  </button>
                </div>
              </div>

              {/* question navigator */}
              <div className="flex flex-wrap gap-1.5 pb-4">
                {Array.from({ length: totalQuestions }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-["DM_Mono",monospace] text-[11px] transition',
                      qNumCls(i)
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ③ Question content — THIS IS THE ONLY THING THAT SCROLLS */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-[min(1060px,calc(100%-48px))] py-5 max-[640px]:w-[calc(100%-20px)]">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
                  ))}
                </div>
              ) : questionsQuery.isError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                  Failed to load attempt questions.
                </div>
              ) : !question ? (
                <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
                  No questions found for this attempt.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">

                  {/* LEFT — question */}
                  <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6">
                    <div className="mb-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                      Question {currentIndex + 1} of {totalQuestions}
                      {question.type && ` · ${question.type.replace('_', ' ')}`}
                      {question.points && ` · ${question.points} pts`}
                    </div>

                    <h2 className="font-['Playfair_Display',serif] text-[26px] font-black leading-snug text-[#f2f0eb] max-[640px]:text-[22px]">
                      {question.question}
                    </h2>

                    {question.type === 'coding' && (
                      <div className="mt-5 rounded-[14px] border border-white/9 bg-[#252320] p-5">
                        <p className="mb-3 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#9b9a92]">
                          Example Case
                        </p>
                        <div className="font-['DM_Mono',monospace] text-[12px] leading-relaxed text-[#c8c4bc]">
                          <span className="font-semibold text-[#e8816a]">Input:</span>
                          {'  '}Write your approach or code below.
                        </div>
                      </div>
                    )}

                    {!isMCQ && (
                      <>
                        <textarea
                          value={answers[question._id] || ''}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [question._id]: e.target.value }))
                          }
                          rows={8}
                          className="mt-5 w-full resize-y rounded-xl border border-white/10 bg-[#141412] p-4 font-['DM_Mono',monospace] text-sm text-[#f2f0eb] outline-none transition placeholder:text-[#6b6560] focus:border-[#e8816a]"
                          placeholder={
                            question.type === 'coding'
                              ? 'Write your approach or code answer…'
                              : 'Type your answer…'
                          }
                        />
                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={!answers[question._id]?.trim() || isSubmitting}
                          className="mt-4 rounded-[10px] bg-white/8 px-5 py-2.5 text-sm font-bold text-[#f2f0eb] transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving…' : 'Save answer'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* RIGHT — options + meta */}
                  <div className="space-y-4">
                    {isMCQ && (
                      <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5">
                        <p className="mb-3 flex items-center gap-2 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#9b9a92]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                          </svg>
                          {question.type.replace('_', ' ')} · {question.points} pts
                        </p>

                        <div className="flex flex-col gap-2">
                          {question.options!.map((option, i) => {
                            const selected = answers[question._id] === option
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [question._id]: option }))}
                                className={cn(
                                  'flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition',
                                  selected
                                    ? 'border-[#e8816a] bg-[#e8816a]/8'
                                    : 'border-white/9 bg-[#141412] hover:border-white/20'
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7px] border font-["DM_Mono",monospace] text-[11px] transition',
                                    selected
                                      ? 'border-[#e8816a] bg-[#e8816a] text-white'
                                      : 'border-white/16 bg-[#1c1a18] text-[#9b9a92]'
                                  )}
                                >
                                  {['A', 'B', 'C', 'D'][i]}
                                </span>
                                <span className="text-[13px] text-[#f2f0eb]">{option}</span>
                                {selected && <span className="ml-auto"><CheckCircleIcon /></span>}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={!answers[question._id] || isSubmitting}
                          className="mt-4 rounded-[10px] bg-white/8 px-5 py-2.5 text-sm font-bold text-[#f2f0eb] transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving…' : 'Save answer'}
                        </button>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5">
                      <p className="mb-3 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#9b9a92]">
                        Self-Confidence Level
                      </p>
                      <div className="flex gap-1.5">
                        {(['low', 'medium', 'high'] as const).map((level) => {
                          const active = confidence[currentIndex] === level
                          const activeColor =
                            level === 'high'
                              ? 'border-[#6fcb8a] bg-[#6fcb8a]/8 text-[#6fcb8a]'
                              : level === 'medium'
                              ? 'border-[#f0c060] bg-[#f0c060]/8 text-[#f0c060]'
                              : 'border-[#e8816a] bg-[#e8816a]/8 text-[#e8816a]'
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() =>
                                setConfidence((prev) => ({ ...prev, [currentIndex]: level }))
                              }
                              className={cn(
                                'flex-1 rounded-[9px] border py-2 font-["DM_Sans",sans-serif] text-[11px] font-bold uppercase tracking-[0.06em] transition',
                                active
                                  ? activeColor
                                  : 'border-white/9 bg-[#141412] text-[#9b9a92] hover:border-white/20 hover:text-[#f2f0eb]'
                              )}
                            >
                              {level}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e8816a]/20 bg-[#e8816a]/5 p-5" style={{ borderLeft: '3px solid #e8816a' }}>
                      <p className="mb-2 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#e8816a]">
                        <HintIcon />
                        Hint
                      </p>
                      <p className="text-[12.5px] italic leading-relaxed text-[#9b9a92]">
                        Think about the most efficient approach before selecting your answer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ④ Prev / Next — fixed height, never scrolls, always visible */}
          <div className="shrink-0 border-t border-white/8 bg-[#141412]">
            <div className="mx-auto flex w-[min(1060px,calc(100%-48px))] items-center justify-between py-4 max-[640px]:w-[calc(100%-20px)]">
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-[10px] border border-white/16 px-5 py-2.5 text-[13px] font-semibold text-[#f2f0eb] transition hover:border-[#e8816a] hover:text-[#e8816a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="flex flex-col items-center gap-1.5">
                <span className="font-['DM_Sans',sans-serif] text-[12px] text-[#9b9a92]">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalQuestions }).map((_, i) => {
                    const q = questions[i]
                    const done = (q && answers[q._id]) || i === currentIndex
                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition',
                          done ? 'bg-[#e8816a]' : 'bg-white/16'
                        )}
                      />
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === totalQuestions - 1}
                className="flex items-center gap-2 rounded-[14px] bg-[#e8816a] px-5 py-2.5 font-['Playfair_Display',serif] text-[14px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next question →
              </button>
            </div>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
  )
}