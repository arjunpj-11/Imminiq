import { useEffect, useMemo, useState } from 'react'

import {
  useChatWithLessonTutor,
  useVerifyLessonAnswer,
} from '../../../../hooks/trackers/useTrackers'
import type {
  GeneratedLesson,
  VerifyLessonAnswerResponse,
} from '../../types/tracker.types'

import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'

export default function ReflectionPracticeCard({
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
