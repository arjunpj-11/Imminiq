import { useEffect, useMemo, useState } from 'react'
import { getUserFacingError } from '../../../../../lib/user-facing-error'

import {
  useAskLessonQuestionSolutionDoubt,
  useClearLessonQuestionSolutionDoubts,
  useGenerateLessonQuestionSolution,
  useGenerateLessonQuestions,
  useLessonAnswerAttempts,
  useLessonGeneratedQuestions,
  useLessonQuestionSolution,
  useLessonQuestionSolutionDoubts,
  useVerifyLessonAnswer,
} from '../../hooks/useTrackers'
import type {
  IGeneratedLesson,
  VerifyLessonAnswerResponse,
} from '../../types/tracker.types'

import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'
import ConfirmDialog from '../ConfirmDialog'
import { MicButton } from '../../../../../components/input/VoiceInputButton'
import { useVoiceInput } from '../../../../../hooks/useVoiceInput'
import {
  formatDateTime,
  formatVerdict,
  getAttemptCorrectedAnswer,
  getAttemptFeedback,
  uniqueQuestions,
} from './reflection-practice.utils'

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReflectionPracticeCard({
  lesson,
  trackerId,
  subtopicId,
}: {
  lesson: IGeneratedLesson
  trackerId: string
  subtopicId: string
}) {
  const generatedQuestionsQuery = useLessonGeneratedQuestions(
    trackerId,
    subtopicId
  )
  const answerAttemptsQuery = useLessonAnswerAttempts(
    trackerId,
    subtopicId
  )

  const generateQuestionMutation = useGenerateLessonQuestions()
  const generateSolutionMutation = useGenerateLessonQuestionSolution()
  const doubtMutation = useAskLessonQuestionSolutionDoubt()
  const clearSolutionDoubtsMutation =
    useClearLessonQuestionSolutionDoubts()
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

  const generatedQuestions = useMemo(() => {
    return generatedQuestionsQuery.data?.map((item) => item.question) ?? []
  }, [generatedQuestionsQuery.data])

  const questions = useMemo(() => {
    return uniqueQuestions([...baseQuestions, ...generatedQuestions])
  }, [baseQuestions, generatedQuestions])

  const [selectedQuestion, setSelectedQuestion] = useState(
    baseQuestions[0] || ''
  )
  const [answer, setAnswer] = useState('')
  const [verification, setVerification] = useState<
    VerifyLessonAnswerResponse['data'] | null
  >(null)
  const [solution, setSolution] = useState('')
  const [solutionQuestion, setSolutionQuestion] = useState('')
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [doubt, setDoubt] = useState('')
  const [clearDoubtsConfirmOpen, setClearDoubtsConfirmOpen] = useState(false)

  const selectedSolutionQuery = useLessonQuestionSolution(
    trackerId,
    subtopicId,
    solutionQuestion || selectedQuestion
  )

  const solutionDoubtsQuery = useLessonQuestionSolutionDoubts(
    trackerId,
    subtopicId,
    solutionQuestion || selectedQuestion
  )

  const answerVoice = useVoiceInput((transcript) =>
    setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript))
  )

  const doubtVoice = useVoiceInput((transcript) =>
    setDoubt((prev) => (prev ? `${prev} ${transcript}` : transcript))
  )

  const selectedQuestionAttempts = useMemo(() => {
    return (
      answerAttemptsQuery.data?.filter(
        (attempt) => attempt.question === selectedQuestion
      ) ?? []
    )
  }, [answerAttemptsQuery.data, selectedQuestion])

  const savedSolutionText = selectedSolutionQuery.data?.solution || ''
  const activeSolution = solution || savedSolutionText
  const activeSolutionQuestion = solutionQuestion || selectedQuestion

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
    generateQuestionMutation.mutate({
      trackerId,
      subtopicId,
      count: 5,
    })
  }

  const verifyAnswer = () => {
    const trimmed = answer.trim()

    if (!trimmed) return

    verifyAnswerMutation.mutate(
      {
        trackerId,
        subtopicId,
        question: selectedQuestion,
        answer: trimmed,
      },
      {
        onSuccess: (response) => setVerification(response.data),
      }
    )
  }

  const generateSolution = (question: string) => {
    setSelectedQuestion(question)
    setSolutionQuestion(question)
    setSolution('')
    setDoubt('')
    setSolutionOpen(true)

    generateSolutionMutation.mutate(
      {
        trackerId,
        subtopicId,
        question,
      },
      {
        onSuccess: (response) => {
          setSolution(response.data.solution)
        },

        onError: (error) => {
          setSolution(getUserFacingError(error, 'Could not generate the solution. Please try again.'))
        },
      }
    )
  }

  const askDoubtAboutSolution = () => {
    const trimmed = doubt.trim()

    if (!trimmed || !activeSolution || !activeSolutionQuestion) return

    doubtMutation.mutate(
      {
        trackerId,
        subtopicId,
        question: activeSolutionQuestion,
        message: trimmed,
      },
      {
        onSuccess: () => {
          setDoubt('')
        },
      }
    )
  }

  const clearSolutionDoubts = () => {
    if (
      clearSolutionDoubtsMutation.isPending ||
      !activeSolutionQuestion ||
      !solutionDoubtsQuery.data ||
      solutionDoubtsQuery.data.length === 0
    ) {
      return
    }

    setClearDoubtsConfirmOpen(true)
  }

  const confirmClearSolutionDoubts = () => {
    if (
      clearSolutionDoubtsMutation.isPending ||
      !activeSolutionQuestion ||
      !solutionDoubtsQuery.data ||
      solutionDoubtsQuery.data.length === 0
    ) {
      return
    }

    clearSolutionDoubtsMutation.mutate(
      {
        trackerId,
        subtopicId,
        question: activeSolutionQuestion,
      },
      {
        onSuccess: async () => {
          setDoubt('')
          await solutionDoubtsQuery.refetch()
          setClearDoubtsConfirmOpen(false)
        },
      }
    )
  }

  const closeClearDoubtsConfirm = () => {
    if (clearSolutionDoubtsMutation.isPending) return

    setClearDoubtsConfirmOpen(false)
  }

  const verdictLabel = verification
    ? formatVerdict(verification.verdict)
    : ''

  const renderPreviousAttempts = () => (
    <div className="mt-5 rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 dark:border-(--border-subtle) dark:bg-(--surface-card)">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
            Previous Responses
          </h4>

          <p className="mt-1 text-[11.5px] text-(--text-secondary) dark:text-(--text-secondary)">
            Only submitted answers are saved. Draft typing is not stored.
          </p>
        </div>

        <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
          {selectedQuestionAttempts.length} Attempts
        </span>
      </div>

      {answerAttemptsQuery.isLoading ? (
        <div className="rounded-xl border border-dashed border-(--border-subtle) bg-white/60 px-4 py-5 text-center text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)">
          Loading previous responses...
        </div>
      ) : selectedQuestionAttempts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-subtle) bg-white/60 px-4 py-5 text-center text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)">
          No previous responses for this question yet.
        </div>
      ) : (
        <div className="max-h-90 space-y-3 overflow-y-auto pr-1">
          {selectedQuestionAttempts.map((attempt) => {
            const feedback = getAttemptFeedback(attempt)
            const correctedAnswer = getAttemptCorrectedAnswer(attempt)

            return (
              <article
                key={attempt._id}
                className="rounded-2xl border border-(--border-subtle) bg-white p-4 dark:border-(--border-subtle) dark:bg-(--surface-elevated)"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1a1714] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-white dark:bg-[#f2f0eb] dark:text-[#141412]">
                      Attempt {attempt.attemptNumber}
                    </span>

                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em]',
                        attempt.isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)'
                      )}
                    >
                      Score {attempt.score}/100
                    </span>
                  </div>

                  <span className="text-[10.5px] text-(--text-secondary) dark:text-(--text-secondary)">
                    {formatDateTime(attempt.createdAt)}
                  </span>
                </div>

                <div>
                  <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Your Answer
                  </div>

                  <MathText className="text-[12.5px] leading-[1.65] text-(--text-primary) dark:text-(--text-primary)">
                    {attempt.answer}
                  </MathText>
                </div>

                {feedback && (
                  <div className="mt-3 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3 dark:border-(--border-subtle) dark:bg-(--surface-card)">
                    <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                      Feedback
                    </div>

                    <MathText className="text-[12.5px] leading-[1.65] text-(--text-secondary) dark:text-[#d8d6cf]">
                      {feedback}
                    </MathText>
                  </div>
                )}

                {correctedAnswer && (
                  <div className="mt-3 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3 dark:border-(--border-subtle) dark:bg-(--surface-card)">
                    <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                      Corrected Answer
                    </div>

                    <MathText className="text-[12.5px] leading-[1.65] text-(--text-secondary) dark:text-[#d8d6cf]">
                      {correctedAnswer}
                    </MathText>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <>
      <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
              Practice Questions
            </div>

            <h2 className="mt-1 font-ui text-[24px] font-extrabold">
              Type your answer and verify it
            </h2>

            <p className="mt-2 max-w-2xl text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              Select a question, type your answer, and let Scribe AI correct
              and improve it. Your submitted attempts are saved as history.
            </p>
          </div>

          <button
            type="button"
            onClick={generateMoreQuestions}
            disabled={generateQuestionMutation.isPending}
            className="rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {generateQuestionMutation.isPending
              ? 'Generating...'
              : 'Generate More Questions'}
          </button>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex h-full min-h-140 flex-col overflow-hidden rounded-lg border-[1.5px] border-(--border-subtle) bg-white p-4 dark:border-(--border-subtle) dark:bg-(--surface-elevated) lg:h-205">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  Question Set
                </h3>

                <p className="mt-1 text-[11.5px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
                  Click a question card to select it.
                </p>
              </div>

              <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                {questions.length} Questions
              </span>
            </div>

            {generatedQuestionsQuery.isLoading ? (
              <div className="mb-3 rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
                Loading saved generated questions...
              </div>
            ) : null}

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              {questions.map((question, index) => {
                const active = selectedQuestion === question
                const attemptCount =
                  answerAttemptsQuery.data?.filter(
                    (attempt) => attempt.question === question
                  ).length ?? 0

                return (
                  <article
                    key={`${question}-${index}`}
                    onClick={() => handleSelectQuestion(question)}
                    className={cn(
                      'cursor-pointer rounded-2xl border-[1.5px] p-4 transition hover:-translate-y-0.5 hover:border-(--brand-500)',
                      active
                        ? 'border-(--brand-500) bg-[rgba(184,76,43,0.06)] dark:border-(--brand-500) dark:bg-[rgba(232,129,106,0.08)]'
                        : 'border-(--border-subtle) bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-card)'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
                        Question {index + 1}
                      </div>

                      <div className="flex items-center gap-2">
                        {attemptCount > 0 && (
                          <span className="rounded-full border border-(--border-subtle) px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-(--text-secondary) dark:border-(--border-subtle) dark:text-(--text-secondary)">
                            {attemptCount} Try
                            {attemptCount > 1 ? 's' : ''}
                          </span>
                        )}

                        {active && (
                          <span className="rounded-full bg-(--brand-500) px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-white dark:bg-(--brand-500) dark:text-[#141412]">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>

                    <MathText className="text-[13.5px] leading-[1.6] text-(--text-primary) dark:text-(--text-primary)">
                      {question}
                    </MathText>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="flex h-full min-h-140 flex-col overflow-hidden rounded-lg border-[1.5px] border-(--border-subtle) bg-white p-4 dark:border-(--border-subtle) dark:bg-(--surface-elevated) lg:h-205">
            <div className="mb-3 shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
              Your Answer
            </div>

            <MathText className="mb-4 shrink-0 rounded-md border border-(--border-subtle) bg-(--surface-card) p-4 text-[13px] leading-[1.6] text-(--text-primary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)">
              {selectedQuestion}
            </MathText>

            <div className="relative shrink-0">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={
                  answerVoice.isListening
                    ? 'Listening... speak your answer'
                    : 'Type your answer here...'
                }
                className="min-h-44 w-full resize-none rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 pr-16 text-[13px] leading-[1.6] text-(--text-primary) outline-none transition focus:border-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)"
              />

              <div className="absolute bottom-3 right-3">
                <MicButton
                  isListening={answerVoice.isListening}
                  isSupported={answerVoice.isSupported}
                  onToggle={answerVoice.toggle}
                  size="sm"
                />
              </div>
            </div>

            <div className="mt-3 flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={verifyAnswer}
                disabled={verifyAnswerMutation.isPending || !answer.trim()}
                className="rounded-md bg-(--brand-500) px-3 py-2 text-[11px] font-bold text-[#fdf8f5] transition hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
              >
                {verifyAnswerMutation.isPending
                  ? 'Checking...'
                  : 'Verify Answer'}
              </button>

              <button
                type="button"
                onClick={() => generateSolution(selectedQuestion)}
                disabled={
                  generateSolutionMutation.isPending || !selectedQuestion
                }
                className="rounded-md border border-(--border-subtle) px-3 py-2 text-[11px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) disabled:cursor-wait disabled:opacity-60 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              >
                {generateSolutionMutation.isPending
                  ? 'Opening...'
                  : 'Generate Solution'}
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              {verification ? (
                <div className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 dark:border-(--border-subtle) dark:bg-(--surface-card)">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-[15px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                      {verdictLabel}
                    </h4>

                    <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                      Score {verification.score}/100
                    </span>
                  </div>

                  <MathText className="mt-3 text-[13px] leading-[1.65] text-(--text-secondary) dark:text-[#d8d6cf]">
                    {verification.feedback}
                  </MathText>

                  <div className="mt-4 rounded-xl border border-(--border-subtle) bg-white p-4 dark:border-(--border-subtle) dark:bg-(--surface-elevated)">
                    <h5 className="mb-2 text-[13px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                      Corrected Answer
                    </h5>

                    <MathText className="text-[13px] leading-[1.65] text-(--text-secondary) dark:text-[#d8d6cf]">
                      {verification.correctedAnswer}
                    </MathText>
                  </div>

                  {verification.keyPoints.length > 0 && (
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-[13px] text-(--text-secondary) dark:text-[#d8d6cf]">
                      {verification.keyPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="flex min-h-56 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) p-6 text-center dark:border-(--border-subtle) dark:bg-(--surface-card)">
                  <div>
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                      ✍️
                    </div>

                    <p className="text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      Your AI feedback will appear here
                    </p>

                    <p className="mt-1 max-w-sm text-[12px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                      Type your answer above and click verify to get score,
                      correction, and key points.
                    </p>
                  </div>
                </div>
              )}

              {renderPreviousAttempts()}
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={clearDoubtsConfirmOpen}
        title="Clear solution doubts?"
        description="This will permanently remove all saved doubts and AI replies for this generated solution. Your answer attempts and solution will not be affected."
        confirmText="Clear doubts"
        cancelText="Keep doubts"
        variant="danger"
        isLoading={clearSolutionDoubtsMutation.isPending}
        onClose={closeClearDoubtsConfirm}
        onConfirm={confirmClearSolutionDoubts}
      />

      {solutionOpen && (
        <div
          className="fixed inset-0 z-130 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Generated solution"
        >
          <div className="relative flex h-[min(820px,94vh)] w-[min(980px,96vw)] flex-col rounded-3xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-3) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle) max-[640px]:px-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Generated Solution
                </div>

                <MathText className="mt-1 line-clamp-2 text-[18px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  {activeSolutionQuestion}
                </MathText>
              </div>

              <button
                type="button"
                onClick={() => setSolutionOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
                aria-label="Close solution"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[640px]:px-4">
              <div className="rounded-lg border-[1.5px] border-(--border-subtle) bg-white p-5 dark:border-(--border-subtle) dark:bg-(--surface-elevated)">
                <h4 className="mb-3 text-[15px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  Solution
                </h4>

                {(generateSolutionMutation.isPending ||
                  selectedSolutionQuery.isLoading) &&
                !activeSolution ? (
                  <p className="text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                    Loading a saved solution or generating a new one...
                  </p>
                ) : (
                  <MathText className="text-[13.5px] leading-[1.75] text-(--text-secondary) dark:text-[#d8d6cf]">
                    {activeSolution || 'No solution generated yet.'}
                  </MathText>
                )}
              </div>

              <div className="mt-5 rounded-lg border-[1.5px] border-(--border-subtle) bg-white p-5 dark:border-(--border-subtle) dark:bg-(--surface-elevated)">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-[15px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                    Ask doubt about this solution
                  </h4>

                  <button
                    type="button"
                    onClick={clearSolutionDoubts}
                    disabled={
                      clearSolutionDoubtsMutation.isPending ||
                      doubtMutation.isPending ||
                      !solutionDoubtsQuery.data ||
                      solutionDoubtsQuery.data.length === 0
                    }
                    className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-red-400"
                  >
                    {clearSolutionDoubtsMutation.isPending
                      ? 'Clearing'
                      : 'Clear Doubts'}
                  </button>
                </div>

                <p className="mb-3 text-[12px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                  These doubts are saved separately for this exact question
                  solution.
                </p>

                {solutionDoubtsQuery.isLoading ? (
                  <div className="mb-4 rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
                    Loading saved solution doubts...
                  </div>
                ) : solutionDoubtsQuery.data &&
                  solutionDoubtsQuery.data.length > 0 ? (
                  <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                    {solutionDoubtsQuery.data.map((item) => {
                      const isUser = item.role === 'user'

                      return (
                        <div
                          key={item._id}
                          className={cn(
                            'flex items-end gap-3',
                            isUser && 'flex-row-reverse'
                          )}
                        >
                          {!isUser && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(26,23,20,0.09)] text-[12px] text-(--brand-500) dark:bg-white/9 dark:text-(--brand-500)">
                              🤖
                            </div>
                          )}

                          <div
                            className={cn(
                              'max-w-[82%] px-4 py-3 text-[13px] leading-normal',
                              isUser
                                ? 'rounded-[16px_16px_4px_16px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)'
                                : 'rounded-[16px_16px_16px_4px] bg-[rgba(26,23,20,0.09)] text-(--text-primary) dark:bg-white/9 dark:text-(--text-primary)'
                            )}
                          >
                            <MathText>{item.content}</MathText>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-4 py-4 text-center text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
                    No doubts asked for this solution yet.
                  </div>
                )}

                {clearSolutionDoubtsMutation.isPending && (
                  <div className="mb-4 text-[12px] text-red-500 dark:text-red-400">
                    Clearing solution doubts...
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={doubt}
                    onChange={(event) => setDoubt(event.target.value)}
                    disabled={clearSolutionDoubtsMutation.isPending}
                    placeholder={
                      doubtVoice.isListening
                        ? 'Listening... speak your doubt'
                        : 'Example: I did not understand the second point...'
                    }
                    className="min-h-28 w-full resize-none rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-3 pr-16 text-[13px] text-(--text-primary) outline-none transition focus:border-(--brand-500) disabled:cursor-not-allowed disabled:opacity-60 dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)"
                  />

                  <div className="absolute bottom-3 right-3">
                    <MicButton
                      isListening={doubtVoice.isListening}
                      isSupported={doubtVoice.isSupported}
                      onToggle={doubtVoice.toggle}
                      size="sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={askDoubtAboutSolution}
                  disabled={
                    doubtMutation.isPending ||
                    clearSolutionDoubtsMutation.isPending ||
                    !doubt.trim() ||
                    !activeSolution
                  }
                  className="mt-3 rounded-xl bg-(--brand-500) px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
                >
                  {doubtMutation.isPending ? 'Answering...' : 'Ask Doubt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
