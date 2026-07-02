import { useEffect, useMemo, useState } from 'react'

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
  GeneratedLesson,
  VerifyLessonAnswerResponse,
} from '../../types/tracker.types'

import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'
import ConfirmDialog from '../ConfirmDialog'
import { MicButton, useVoiceInput } from './VoiceInputButton'
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
  lesson: GeneratedLesson
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
          setSolution(`Could not generate solution. ${error.message}`)
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
    <div className="mt-5 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
            Previous Responses
          </h4>

          <p className="mt-1 text-[11.5px] text-[#6b5f58] dark:text-[#9b9a92]">
            Only submitted answers are saved. Draft typing is not stored.
          </p>
        </div>

        <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
          {selectedQuestionAttempts.length} Attempts
        </span>
      </div>

      {answerAttemptsQuery.isLoading ? (
        <div className="rounded-xl border border-dashed border-[#e0d0c5] bg-white/60 px-4 py-5 text-center text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-white/5 dark:text-[#9b9a92]">
          Loading previous responses...
        </div>
      ) : selectedQuestionAttempts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e0d0c5] bg-white/60 px-4 py-5 text-center text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-white/5 dark:text-[#9b9a92]">
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
                className="rounded-2xl border border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1a1714] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-white dark:bg-[#f2f0eb] dark:text-[#141412]">
                      Attempt {attempt.attemptNumber}
                    </span>

                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 font-[\'DM_Mono\',monospace] text-[8px] uppercase tracking-[0.08em]',
                        attempt.isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]'
                      )}
                    >
                      Score {attempt.score}/100
                    </span>
                  </div>

                  <span className="text-[10.5px] text-[#6b5f58] dark:text-[#9b9a92]">
                    {formatDateTime(attempt.createdAt)}
                  </span>
                </div>

                <div>
                  <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                    Your Answer
                  </div>

                  <MathText className="text-[12.5px] leading-[1.65] text-[#1a1714] dark:text-[#f2f0eb]">
                    {attempt.answer}
                  </MathText>
                </div>

                {feedback && (
                  <div className="mt-3 rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Feedback
                    </div>

                    <MathText className="text-[12.5px] leading-[1.65] text-[#6b5f58] dark:text-[#d8d6cf]">
                      {feedback}
                    </MathText>
                  </div>
                )}

                {correctedAnswer && (
                  <div className="mt-3 rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 dark:border-white/9 dark:bg-[#1e1c19]">
                    <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Corrected Answer
                    </div>

                    <MathText className="text-[12.5px] leading-[1.65] text-[#6b5f58] dark:text-[#d8d6cf]">
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
              Select a question, type your answer, and let Scribe AI correct
              and improve it. Your submitted attempts are saved as history.
            </p>
          </div>

          <button
            type="button"
            onClick={generateMoreQuestions}
            disabled={generateQuestionMutation.isPending}
            className="rounded-xl bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            {generateQuestionMutation.isPending
              ? 'Generating...'
              : 'Generate More Questions'}
          </button>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex h-full min-h-140 flex-col overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320] lg:h-205">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Question Set
                </h3>

                <p className="mt-1 text-[11.5px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                  Click a question card to select it.
                </p>
              </div>

              <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                {questions.length} Questions
              </span>
            </div>

            {generatedQuestionsQuery.isLoading ? (
              <div className="mb-3 rounded-xl border border-dashed border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]">
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

                      <div className="flex items-center gap-2">
                        {attemptCount > 0 && (
                          <span className="rounded-full border border-[#e0d0c5] px-2 py-0.5 font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.08em] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">
                            {attemptCount} Try
                            {attemptCount > 1 ? 's' : ''}
                          </span>
                        )}

                        {active && (
                          <span className="rounded-full bg-[#b84c2b] px-2 py-0.5 font-['DM_Mono',monospace] text-[7px] uppercase tracking-[0.08em] text-white dark:bg-[#e8816a] dark:text-[#141412]">
                            Selected
                          </span>
                        )}
                      </div>
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

            <div className="relative shrink-0">
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={
                  answerVoice.isListening
                    ? 'Listening... speak your answer'
                    : 'Type your answer here...'
                }
                className="min-h-44 w-full resize-none rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 pr-16 text-[13px] leading-[1.6] text-[#1a1714] outline-none transition focus:border-[#e8816a] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
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
                className="rounded-[10px] bg-[#b84c2b] px-3 py-2 text-[11px] font-bold text-[#fdf8f5] transition hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
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
                className="rounded-[10px] border border-[#e0d0c5] px-3 py-2 text-[11px] font-bold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] disabled:cursor-wait disabled:opacity-60 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
              >
                {generateSolutionMutation.isPending
                  ? 'Opening...'
                  : 'Generate Solution'}
              </button>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              {verification ? (
                <div className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      {verdictLabel}
                    </h4>

                    <span className="rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                      Score {verification.score}/100
                    </span>
                  </div>

                  <MathText className="mt-3 text-[13px] leading-[1.65] text-[#6b5f58] dark:text-[#d8d6cf]">
                    {verification.feedback}
                  </MathText>

                  <div className="mt-4 rounded-xl border border-[#e0d0c5] bg-white p-4 dark:border-white/9 dark:bg-[#252320]">
                    <h5 className="mb-2 text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      Corrected Answer
                    </h5>

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
                <div className="flex min-h-56 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-6 text-center dark:border-white/9 dark:bg-[#1e1c19]">
                  <div>
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                      ✍️
                    </div>

                    <p className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                      Your AI feedback will appear here
                    </p>

                    <p className="mt-1 max-w-sm text-[12px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
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
          <div className="relative flex h-[min(820px,94vh)] w-[min(980px,96vw)] flex-col rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:border-white/10 dark:bg-[#1e1c19]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e0d0c5] px-6 py-4 dark:border-white/9 max-[640px]:px-4">
              <div>
                <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                  Generated Solution
                </div>

                <MathText className="mt-1 line-clamp-2 text-[18px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  {activeSolutionQuestion}
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
                <h4 className="mb-3 text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  Solution
                </h4>

                {(generateSolutionMutation.isPending ||
                  selectedSolutionQuery.isLoading) &&
                !activeSolution ? (
                  <p className="text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                    Loading a saved solution or generating a new one...
                  </p>
                ) : (
                  <MathText className="text-[13.5px] leading-[1.75] text-[#6b5f58] dark:text-[#d8d6cf]">
                    {activeSolution || 'No solution generated yet.'}
                  </MathText>
                )}
              </div>

              <div className="mt-5 rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white p-5 dark:border-white/9 dark:bg-[#252320]">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
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
                    className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.08em] text-[#6b5f58] transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-red-400"
                  >
                    {clearSolutionDoubtsMutation.isPending
                      ? 'Clearing'
                      : 'Clear Doubts'}
                  </button>
                </div>

                <p className="mb-3 text-[12px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                  These doubts are saved separately for this exact question
                  solution.
                </p>

                {solutionDoubtsQuery.isLoading ? (
                  <div className="mb-4 rounded-xl border border-dashed border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]">
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
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(26,23,20,0.09)] text-[12px] text-[#b84c2b] dark:bg-white/9 dark:text-[#e8816a]">
                              🤖
                            </div>
                          )}

                          <div
                            className={cn(
                              'max-w-[82%] px-4 py-3 text-[13px] leading-normal',
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
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-dashed border-[#e0d0c5] bg-[#fdf8f5] px-4 py-4 text-center text-[12px] text-[#6b5f58] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92]">
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
                    className="min-h-28 w-full resize-none rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-3 pr-16 text-[13px] text-[#1a1714] outline-none transition focus:border-[#e8816a] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb]"
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
                  className="mt-3 rounded-xl bg-[#b84c2b] px-4 py-2.5 text-[12px] font-bold text-[#fdf8f5] shadow-[0_4px_12px_rgba(184,76,43,0.28)] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
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