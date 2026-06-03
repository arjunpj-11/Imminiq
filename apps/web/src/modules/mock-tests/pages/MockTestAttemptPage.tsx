// ============================================================
// MockTestAttemptPage.tsx — aligned with Trackers design
// ============================================================
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
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

export default function MockTestAttemptPage() {
  const { attemptId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
  )

  const initial = location.state as StartAttemptResponse | undefined
  const shouldFetchQuestions = !initial?.questions?.length && Boolean(attemptId)
  const questionsQuery = useMockTestAttemptQuestions(
    shouldFetchQuestions ? attemptId : undefined
  )

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const submitMutation = useSubmitMockTestAnswer()
  const finishMutation = useFinishMockTestAttempt()

  const questions = useMemo<PublicMockTestQuestion[]>(() => {
    if (initial?.questions?.length) return initial.questions
    return (questionsQuery.data || []) as PublicMockTestQuestion[]
  }, [initial?.questions, questionsQuery.data])

  const submitAnswer = async (questionId: string) => {
    const answer = answers[questionId]?.trim()
    if (!answer || !attemptId) return
    await submitMutation.mutateAsync({ attemptId, payload: { questionId, answer } })
  }

  const finish = async () => {
    if (!attemptId) return
    await finishMutation.mutateAsync({ attemptId })
    navigate(`/mock-tests/attempts/${attemptId}/result`)
  }

  const isLoading = shouldFetchQuestions && questionsQuery.isLoading
  const isSubmitting = submitMutation.isPending
  const isFinishing = finishMutation.isPending

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#141412] text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => {
              const next = !current
              if (typeof window !== 'undefined') localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
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
          <TopBar onMenuClick={() => setSidebarOpen(true)} streakDays={0} userName="Achu" userInitials="AC" userLevel="Free Scholar" isGuest={false} />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(860px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── page header ── */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                      Attempt
                    </span>
                  </div>
                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#f2f0eb]">
                    Mock test <span className="text-[#e8816a]">attempt</span>
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={finish}
                  disabled={isFinishing || !attemptId}
                  className="self-start rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFinishing ? 'Finishing...' : 'Finish test'}
                </button>
              </div>

              {/* ── questions ── */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-52 animate-pulse rounded-2xl border border-white/10 bg-[#1c1a18]" />
                  ))}
                </div>
              ) : questionsQuery.isError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                  Failed to load attempt questions.
                </div>
              ) : questions.length ? (
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const currentAnswer = answers[question._id] || ''
                    const hasAnswer = currentAnswer.trim().length > 0

                    return (
                      <article
                        key={question._id}
                        className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5 transition hover:border-white/20"
                      >
                        {/* meta */}
                        <div className="mb-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#9b9a92]">
                          Question {index + 1} · {question.type.replace('_', ' ')} · {question.points} pts
                        </div>

                        <h2 className="font-['Playfair_Display',serif] text-[20px] font-black leading-snug text-[#f2f0eb]">
                          {question.question}
                        </h2>

                        {/* MCQ options */}
                        {question.options?.length ? (
                          <div className="mt-4 grid gap-2">
                            {question.options.map((option) => (
                              <label
                                key={option}
                                className={cn(
                                  'flex cursor-pointer items-center gap-3 rounded-xl border bg-[#141412] p-3 text-[13px] transition',
                                  answers[question._id] === option
                                    ? 'border-[#e8816a] bg-[#e8816a]/5'
                                    : 'border-white/8 hover:border-white/20'
                                )}
                              >
                                <input
                                  type="radio"
                                  name={question._id}
                                  value={option}
                                  checked={answers[question._id] === option}
                                  onChange={() =>
                                    setAnswers((current) => ({ ...current, [question._id]: option }))
                                  }
                                  className="accent-[#e8816a]"
                                />
                                <span className="text-[#f2f0eb]">{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={currentAnswer}
                            onChange={(e) =>
                              setAnswers((current) => ({ ...current, [question._id]: e.target.value }))
                            }
                            rows={5}
                            className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-[#141412] p-4 text-sm text-[#f2f0eb] outline-none transition placeholder:text-[#6b6560] focus:border-[#e8816a]"
                            placeholder={
                              question.type === 'coding'
                                ? 'Write your approach or code answer...'
                                : 'Type your answer...'
                            }
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => submitAnswer(question._id)}
                          disabled={!hasAnswer || isSubmitting}
                          className="mt-4 rounded-[10px] bg-white/8 px-4 py-2.5 text-sm font-bold text-[#f2f0eb] transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving...' : 'Save answer'}
                        </button>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6 text-[#9b9a92]">
                  No questions found for this attempt.
                </div>
              )}

              <AppFooter />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}