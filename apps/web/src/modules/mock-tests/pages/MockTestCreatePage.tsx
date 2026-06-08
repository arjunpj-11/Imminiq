// ============================================================
// MockTestCreatePage.tsx — aligned with Trackers design
// ============================================================

import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useCreateMockTest } from '../hooks/useMockTests'
import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from '../constants/mock-tests.constants'

import type {
  CreateMockTestPayload,
  DifficultyLevel,
  QuestionType,
  TestVisibility,
} from '../types/mock-tests.types'

type QuestionDraft = {
  type: QuestionType
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: DifficultyLevel
  points: number
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const emptyQuestion = (): QuestionDraft => ({
  type: 'mcq',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  difficulty: 'medium',
  points: 1,
})

const inputClass =
  'w-full rounded-[12px] border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3 text-sm text-[#1a1714] outline-none transition placeholder:text-[#9b8f87] focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#6b6560] dark:focus:border-[#e8816a]'

const labelClass =
  "mb-2 block font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]"

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

export default function MockTestCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateMockTest()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [visibility, setVisibility] = useState<TestVisibility>('private')
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
  const [passingScore, setPassingScore] = useState(60)
  const [tagsText, setTagsText] = useState('')
  const [trackerId, setTrackerId] = useState('')
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()])
  const [error, setError] = useState('')

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsText]
  )

  const updateQuestion = <K extends keyof QuestionDraft>(
    index: number,
    key: K,
    value: QuestionDraft[K]
  ) => {
    setQuestions((current) =>
      current.map((question, currentIndex) => {
        if (currentIndex !== index) return question

        if (key === 'type') {
          const nextType = value as QuestionType

          return {
            ...question,
            type: nextType,
            options:
              nextType === 'mcq'
                ? question.options.length === 4
                  ? question.options
                  : ['', '', '', '']
                : [],
            correctAnswer:
              nextType === 'coding' ? '' : question.correctAnswer,
          }
        }

        return { ...question, [key]: value }
      })
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question, currentIndex) =>
        currentIndex !== questionIndex
          ? question
          : {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option
              ),
            }
      )
    )
  }

  const addQuestion = () => {
    if (questions.length >= 100) return

    setQuestions((current) => [...current, emptyQuestion()])
  }

  const removeQuestion = (index: number) => {
    setQuestions((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index)
    )
  }

  const validateForm = () => {
    if (title.trim().length < 3) {
      return 'Title must be at least 3 characters.'
    }

    if (timeLimitMinutes < 5 || timeLimitMinutes > 180) {
      return 'Time limit must be between 5 and 180 minutes.'
    }

    if (passingScore < 1 || passingScore > 100) {
      return 'Passing score must be between 1 and 100.'
    }

    if (tags.length > 10) {
      return 'Maximum 10 tags are allowed.'
    }

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index]
      const number = index + 1

      if (question.question.trim().length < 5) {
        return `Question ${number} must be at least 5 characters.`
      }

      if (question.points < 1) {
        return `Question ${number} must have at least 1 point.`
      }

      if (question.type === 'mcq') {
        const options = question.options.map((option) => option.trim())

        if (options.length !== 4 || options.some((option) => !option)) {
          return `Question ${number} must have exactly 4 filled options.`
        }

        if (!question.correctAnswer.trim()) {
          return `Question ${number} needs a correct answer.`
        }

        if (!options.includes(question.correctAnswer.trim())) {
          return `Question ${number} correct answer must exactly match one option.`
        }
      }

      if (question.type === 'short_answer' && !question.correctAnswer.trim()) {
        return `Question ${number} needs a correct answer.`
      }
    }

    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    const payload: CreateMockTestPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      visibility,
      timeLimitMinutes,
      passingScore,
      tags,
      trackerId: trackerId.trim() || undefined,
      questions: questions.map((question) => ({
        type: question.type,
        question: question.question.trim(),
        options:
          question.type === 'mcq'
            ? question.options.map((option) => option.trim())
            : undefined,
        correctAnswer:
          question.type === 'coding'
            ? question.correctAnswer.trim() || undefined
            : question.correctAnswer.trim(),
        explanation: question.explanation.trim() || undefined,
        difficulty: question.difficulty,
        points: question.points,
      })),
    }

    const response = await createMutation.mutateAsync(payload)
    navigate(`/mock-tests/${response.data._id}`)
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <NoiseOverlay />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((current) => {
              const next = !current

              if (typeof window !== 'undefined') {
                localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              }

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
            streakDays={0}
            userName="Achu"
            userInitials="AC"
            userLevel="Free Scholar"
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(1060px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              {/* ── page header ── */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />

                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#9b9a92]">
                      Manual mock test
                    </span>
                  </div>

                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#1a1714] dark:text-[#f2f0eb]">
                    Create your{' '}
                    <span className="text-[#b84c2b] dark:text-[#e8816a]">
                      own test
                    </span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b5f58] dark:text-[#6b6560]">
                    Add MCQ, short answer, or coding questions and save them as a
                    timed mock test.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/mock-tests')}
                  className="self-start rounded-[14px] border border-[#e0d0c5] bg-[#fdf8f5] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-[#1a1714] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-px hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/10 dark:bg-white/5 dark:text-[#f2f0eb] dark:shadow-none dark:hover:border-white/20"
                >
                  Back to tests
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── test details card ── */}
                <section className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                  <h2 className="font-['Playfair_Display',serif] text-[24px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                    Test details
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <label>
                      <span className={labelClass}>Title</span>
                      <input
                        className={inputClass}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="JavaScript fundamentals mock test"
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Tags (comma separated)</span>
                      <input
                        className={inputClass}
                        value={tagsText}
                        onChange={(event) => setTagsText(event.target.value)}
                        placeholder="javascript, arrays, interview"
                      />
                    </label>

                    <label className="lg:col-span-2">
                      <span className={labelClass}>Description</span>
                      <textarea
                        className={`${inputClass} min-h-24 resize-none`}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Short note about what this test covers"
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Difficulty</span>
                      <select
                        className={inputClass}
                        value={difficulty}
                        onChange={(event) =>
                          setDifficulty(event.target.value as DifficultyLevel)
                        }
                      >
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className={labelClass}>Visibility</span>
                      <select
                        className={inputClass}
                        value={visibility}
                        onChange={(event) =>
                          setVisibility(event.target.value as TestVisibility)
                        }
                      >
                        <option value="private">private</option>
                        <option value="public">public</option>
                      </select>
                    </label>

                    <label>
                      <span className={labelClass}>Time limit (minutes)</span>
                      <input
                        className={inputClass}
                        type="number"
                        min={5}
                        max={180}
                        value={timeLimitMinutes}
                        onChange={(event) =>
                          setTimeLimitMinutes(Number(event.target.value))
                        }
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Passing score (%)</span>
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        max={100}
                        value={passingScore}
                        onChange={(event) =>
                          setPassingScore(Number(event.target.value))
                        }
                      />
                    </label>

                    <label className="lg:col-span-2">
                      <span className={labelClass}>Tracker ID (optional)</span>
                      <input
                        className={inputClass}
                        value={trackerId}
                        onChange={(event) => setTrackerId(event.target.value)}
                        placeholder="Paste tracker id only if this test belongs to a tracker"
                      />
                    </label>
                  </div>
                </section>

                {/* ── questions section ── */}
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.16em] text-[#6b5f58] dark:text-[#9b9a92]">
                        Questions
                      </div>

                      <h2 className="mt-1 font-['Playfair_Display',serif] text-[26px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                        {questions.length} question
                        {questions.length === 1 ? '' : 's'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-2 self-start rounded-[14px] bg-[#b84c2b] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
                    >
                      <span className="text-lg leading-none">+</span>
                      Add question
                    </button>
                  </div>

                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]"
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <h3 className="font-['Playfair_Display',serif] text-[20px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
                          Question {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          disabled={questions.length === 1}
                          className="rounded-[10px] border border-[#e0d0c5] bg-[#f5ede4] px-3 py-2 text-xs font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-transparent dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <label>
                          <span className={labelClass}>Type</span>
                          <select
                            className={inputClass}
                            value={question.type}
                            onChange={(event) =>
                              updateQuestion(
                                index,
                                'type',
                                event.target.value as QuestionType
                              )
                            }
                          >
                            {QUESTION_TYPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span className={labelClass}>Difficulty</span>
                          <select
                            className={inputClass}
                            value={question.difficulty}
                            onChange={(event) =>
                              updateQuestion(
                                index,
                                'difficulty',
                                event.target.value as DifficultyLevel
                              )
                            }
                          >
                            {DIFFICULTY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span className={labelClass}>Points</span>
                          <input
                            className={inputClass}
                            type="number"
                            min={1}
                            value={question.points}
                            onChange={(event) =>
                              updateQuestion(
                                index,
                                'points',
                                Number(event.target.value)
                              )
                            }
                          />
                        </label>

                        <label className="lg:col-span-3">
                          <span className={labelClass}>Question</span>
                          <textarea
                            className={`${inputClass} min-h-27 resize-none`}
                            value={question.question}
                            onChange={(event) =>
                              updateQuestion(index, 'question', event.target.value)
                            }
                            placeholder="Write the question here"
                          />
                        </label>

                        {question.type === 'mcq' && (
                          <div className="grid grid-cols-1 gap-3 lg:col-span-3 lg:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex}>
                                <span className={labelClass}>
                                  Option {optionIndex + 1}
                                </span>

                                <input
                                  className={inputClass}
                                  value={option}
                                  onChange={(event) =>
                                    updateOption(
                                      index,
                                      optionIndex,
                                      event.target.value
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                              </label>
                            ))}
                          </div>
                        )}

                        <label className="lg:col-span-3">
                          <span className={labelClass}>
                            {question.type === 'coding'
                              ? 'Expected approach (optional)'
                              : 'Correct answer'}
                          </span>

                          <input
                            className={inputClass}
                            value={question.correctAnswer}
                            onChange={(event) =>
                              updateQuestion(
                                index,
                                'correctAnswer',
                                event.target.value
                              )
                            }
                            placeholder={
                              question.type === 'mcq'
                                ? 'Must exactly match one option'
                                : question.type === 'coding'
                                  ? 'Optional expected approach'
                                  : 'Keyword, phrase, or expected answer'
                            }
                          />
                        </label>

                        <label className="lg:col-span-3">
                          <span className={labelClass}>
                            Explanation (optional)
                          </span>

                          <textarea
                            className={`${inputClass} min-h-23 resize-none`}
                            value={question.explanation}
                            onChange={(event) =>
                              updateQuestion(
                                index,
                                'explanation',
                                event.target.value
                              )
                            }
                            placeholder="Explain why the answer is correct"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>

                {/* ── errors ── */}
                {error && (
                  <div className="rounded-[14px] border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] px-4 py-3 text-sm font-semibold text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
                    {error}
                  </div>
                )}

                {createMutation.isError && (
                  <div className="rounded-[14px] border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] px-4 py-3 text-sm font-semibold text-[#b84c2b] dark:border-[#e8816a]/30 dark:bg-[#e8816a]/10 dark:text-[#e8816a]">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : 'Failed to create mock test.'}
                  </div>
                )}

                {/* ── sticky footer ── */}
                <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5]/95 p-4 shadow-[0_10px_40px_rgba(26,23,20,0.10)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#1c1a18]/95 dark:shadow-none">
                  <p className="text-sm text-[#6b5f58] dark:text-[#6b6560]">
                    Save this test with {questions.length} question
                    {questions.length === 1 ? '' : 's'}.
                  </p>

                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-[14px] bg-[#b84c2b] px-6 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:shadow-none dark:hover:bg-[#d9522d]"
                  >
                    {createMutation.isPending
                      ? 'Creating...'
                      : 'Create mock test'}
                  </button>
                </div>
              </form>

              <AppFooter />
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}