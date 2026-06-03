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

// shared input / label styles — dark theme
const inputClass =
  'w-full rounded-[12px] border border-white/10 bg-[#141412] px-4 py-3 text-sm text-[#f2f0eb] outline-none transition placeholder:text-[#6b6560] focus:border-[#e8816a]'

const labelClass =
  "mb-2 block font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#9b9a92]"

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
    () => typeof window !== 'undefined' && localStorage.getItem('imminiq_sb') === 'closed'
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
    () => tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    [tagsText]
  )

  const updateQuestion = <K extends keyof QuestionDraft>(
    index: number,
    key: K,
    value: QuestionDraft[K]
  ) => {
    setQuestions((current) =>
      current.map((q, i) => {
        if (i !== index) return q
        if (key === 'type') {
          const nextType = value as QuestionType
          return {
            ...q,
            type: nextType,
            options: nextType === 'mcq' ? (q.options.length === 4 ? q.options : ['', '', '', '']) : [],
            correctAnswer: nextType === 'coding' ? '' : q.correctAnswer,
          }
        }
        return { ...q, [key]: value }
      })
    )
  }

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((current) =>
      current.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
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
    if (title.trim().length < 3) return 'Title must be at least 3 characters.'
    if (timeLimitMinutes < 5 || timeLimitMinutes > 180) return 'Time limit must be between 5 and 180 minutes.'
    if (passingScore < 1 || passingScore > 100) return 'Passing score must be between 1 and 100.'
    if (tags.length > 10) return 'Maximum 10 tags are allowed.'
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const n = i + 1
      if (q.question.trim().length < 5) return `Question ${n} must be at least 5 characters.`
      if (q.points < 1) return `Question ${n} must have at least 1 point.`
      if (q.type === 'mcq') {
        const opts = q.options.map((o) => o.trim())
        if (opts.length !== 4 || opts.some((o) => !o)) return `Question ${n} must have exactly 4 filled options.`
        if (!q.correctAnswer.trim()) return `Question ${n} needs a correct answer.`
        if (!opts.includes(q.correctAnswer.trim())) return `Question ${n} correct answer must exactly match one option.`
      }
      if (q.type === 'short_answer' && !q.correctAnswer.trim()) return `Question ${n} needs a correct answer.`
    }
    return ''
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const validationError = validateForm()
    if (validationError) { setError(validationError); return }

    const payload: CreateMockTestPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      visibility,
      timeLimitMinutes,
      passingScore,
      tags,
      trackerId: trackerId.trim() || undefined,
      questions: questions.map((q) => ({
        type: q.type,
        question: q.question.trim(),
        options: q.type === 'mcq' ? q.options.map((o) => o.trim()) : undefined,
        correctAnswer:
          q.type === 'coding'
            ? q.correctAnswer.trim() || undefined
            : q.correctAnswer.trim(),
        explanation: q.explanation.trim() || undefined,
        difficulty: q.difficulty,
        points: q.points,
      })),
    }

    const response = await createMutation.mutateAsync(payload)
    navigate(`/mock-tests/${response.data._id}`)
  }

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
            <div className="mx-auto mt-5.5 flex w-[min(1060px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ── page header ── */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8816a]" />
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#9b9a92]">
                      Manual mock test
                    </span>
                  </div>
                  <h1 className="mt-3 font-['Playfair_Display',serif] text-[38px] font-black leading-tight text-[#f2f0eb]">
                    Create your <span className="text-[#e8816a]">own test</span>
                  </h1>
                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6b6560]">
                    Add MCQ, short answer, or coding questions and save them as a timed mock test.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/mock-tests')}
                  className="self-start rounded-[14px] border border-white/10 bg-white/5 px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-[#f2f0eb] transition hover:-translate-y-px hover:border-white/20"
                >
                  Back to tests
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── test details card ── */}
                <section className="rounded-2xl border border-white/10 bg-[#1c1a18] p-6">
                  <h2 className="font-['Playfair_Display',serif] text-[24px] font-black text-[#f2f0eb]">
                    Test details
                  </h2>

                  <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <label>
                      <span className={labelClass}>Title</span>
                      <input
                        className={inputClass}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="JavaScript fundamentals mock test"
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Tags (comma separated)</span>
                      <input
                        className={inputClass}
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="javascript, arrays, interview"
                      />
                    </label>

                    <label className="lg:col-span-2">
                      <span className={labelClass}>Description</span>
                      <textarea
                        className={`${inputClass} min-h-24 resize-none`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Short note about what this test covers"
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Difficulty</span>
                      <select
                        className={inputClass}
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                      >
                        {DIFFICULTY_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className={labelClass}>Visibility</span>
                      <select
                        className={inputClass}
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as TestVisibility)}
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
                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
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
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                      />
                    </label>

                    <label className="lg:col-span-2">
                      <span className={labelClass}>Tracker ID (optional)</span>
                      <input
                        className={inputClass}
                        value={trackerId}
                        onChange={(e) => setTrackerId(e.target.value)}
                        placeholder="Paste tracker id only if this test belongs to a tracker"
                      />
                    </label>
                  </div>
                </section>

                {/* ── questions section ── */}
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.16em] text-[#9b9a92]">
                        Questions
                      </div>
                      <h2 className="mt-1 font-['Playfair_Display',serif] text-[26px] font-black text-[#f2f0eb]">
                        {questions.length} question{questions.length === 1 ? '' : 's'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-2 self-start rounded-[14px] bg-[#e8816a] px-5 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d]"
                    >
                      <span className="text-lg leading-none">+</span>
                      Add question
                    </button>
                  </div>

                  {questions.map((q, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-[#1c1a18] p-5"
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <h3 className="font-['Playfair_Display',serif] text-[20px] font-black text-[#f2f0eb]">
                          Question {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          disabled={questions.length === 1}
                          className="rounded-[10px] border border-white/10 px-3 py-2 text-xs font-bold text-[#9b9a92] transition hover:border-white/20 hover:text-[#f2f0eb] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <label>
                          <span className={labelClass}>Type</span>
                          <select
                            className={inputClass}
                            value={q.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value as QuestionType)}
                          >
                            {QUESTION_TYPE_OPTIONS.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span className={labelClass}>Difficulty</span>
                          <select
                            className={inputClass}
                            value={q.difficulty}
                            onChange={(e) => updateQuestion(index, 'difficulty', e.target.value as DifficultyLevel)}
                          >
                            {DIFFICULTY_OPTIONS.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span className={labelClass}>Points</span>
                          <input
                            className={inputClass}
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) => updateQuestion(index, 'points', Number(e.target.value))}
                          />
                        </label>

                        <label className="lg:col-span-3">
                          <span className={labelClass}>Question</span>
                          <textarea
                            className={`${inputClass} min-h-27 resize-none`}
                            value={q.question}
                            onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            placeholder="Write the question here"
                          />
                        </label>

                        {q.type === 'mcq' && (
                          <div className="grid grid-cols-1 gap-3 lg:col-span-3 lg:grid-cols-2">
                            {q.options.map((option, oi) => (
                              <label key={oi}>
                                <span className={labelClass}>Option {oi + 1}</span>
                                <input
                                  className={inputClass}
                                  value={option}
                                  onChange={(e) => updateOption(index, oi, e.target.value)}
                                  placeholder={`Option ${oi + 1}`}
                                />
                              </label>
                            ))}
                          </div>
                        )}

                        <label className="lg:col-span-3">
                          <span className={labelClass}>
                            {q.type === 'coding' ? 'Expected approach (optional)' : 'Correct answer'}
                          </span>
                          <input
                            className={inputClass}
                            value={q.correctAnswer}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            placeholder={
                              q.type === 'mcq'
                                ? 'Must exactly match one option'
                                : q.type === 'coding'
                                  ? 'Optional expected approach'
                                  : 'Keyword, phrase, or expected answer'
                            }
                          />
                        </label>

                        <label className="lg:col-span-3">
                          <span className={labelClass}>Explanation (optional)</span>
                          <textarea
                            className={`${inputClass} min-h-23 resize-none`}
                            value={q.explanation}
                            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                            placeholder="Explain why the answer is correct"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>

                {/* ── errors ── */}
                {error && (
                  <div className="rounded-[14px] border border-[#e8816a]/30 bg-[#e8816a]/10 px-4 py-3 text-sm font-semibold text-[#e8816a]">
                    {error}
                  </div>
                )}

                {createMutation.isError && (
                  <div className="rounded-[14px] border border-[#e8816a]/30 bg-[#e8816a]/10 px-4 py-3 text-sm font-semibold text-[#e8816a]">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : 'Failed to create mock test.'}
                  </div>
                )}

                {/* ── sticky footer ── */}
                <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1c1a18]/95 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#6b6560]">
                    Save this test with {questions.length} question{questions.length === 1 ? '' : 's'}.
                  </p>

                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-[14px] bg-[#e8816a] px-6 py-3 font-['Playfair_Display',serif] text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-[#d9522d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create mock test'}
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