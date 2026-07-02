import { cn } from '../../../lib/cn'

import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import { CheckCircleIcon, HintIcon } from '../components/MockTestAttemptIcons'
import { MockTestAttemptFooter, MockTestAttemptHeader } from '../components/MockTestAttemptChrome'
import { useCountdown } from '../hooks/useCountdown'

import {
  useFinishMockTestAttempt,
  useMockTestAttemptQuestions,
  useRunMockTestCode,
  useSubmitMockTestAnswer,
  useSubmitMockTestCode,
} from '../hooks/useMockTests'

import {
  buildCompilerOutput,
  COMPILER_LANGUAGES,
  findCompilerLanguage,
  formatJsonValue,
  getStarterCode,
  type Confidence,
} from '../utils/mock-test-attempt.utils'

import type {
  MockTestCodeRunResponse,
  MockTestCodingLanguage,
  PublicMockTestQuestion,
  StartAttemptResponse,
} from '../types/mock-tests.types'

export default function MockTestAttemptPage() {
  const { attemptId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const initial = location.state as StartAttemptResponse | undefined
  const shouldFetch = !initial?.questions?.length && Boolean(attemptId)
  const questionsQuery = useMockTestAttemptQuestions(
    shouldFetch ? attemptId : undefined
  )

  const questions = useMemo<PublicMockTestQuestion[]>(() => {
    if (initial?.questions?.length) return initial.questions

    return (questionsQuery.data || []) as PublicMockTestQuestion[]
  }, [initial?.questions, questionsQuery.data])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visited, setVisited] = useState<Set<number>>(new Set([0]))
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [confidence, setConfidence] = useState<Record<number, Confidence>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())

  const [languageByQuestion, setLanguageByQuestion] = useState<
    Record<string, MockTestCodingLanguage>
  >({})
  const [codeByQuestion, setCodeByQuestion] = useState<Record<string, string>>(
    {}
  )
  const [codeResultByQuestion, setCodeResultByQuestion] = useState<
    Record<string, MockTestCodeRunResponse | null>
  >({})
  const [codeFeedbackByQuestion, setCodeFeedbackByQuestion] = useState<
    Record<string, string>
  >({})
  const [compilerExpanded, setCompilerExpanded] = useState(false)

  const submitMutation = useSubmitMockTestAnswer()
  const runCodeMutation = useRunMockTestCode()
  const submitCodeMutation = useSubmitMockTestCode()
  const finishMutation = useFinishMockTestAttempt()
  const timerDisplay = useCountdown(3600)

  const totalQuestions = questions.length || 15
  const question = questions[currentIndex]
  const isMCQ = question?.type === 'mcq' && Boolean(question.options?.length)
  const isCoding = question?.type === 'coding' && Boolean(question.coding)

  const selectedLanguage = useMemo(() => {
    if (!question?._id) return COMPILER_LANGUAGES[0]

    return findCompilerLanguage(
      languageByQuestion[question._id] || question.coding?.language
    )
  }, [languageByQuestion, question])

  const currentCode = useMemo(() => {
    if (!question?._id) return ''

    return (
      codeByQuestion[question._id] ||
      getStarterCode(question, selectedLanguage.value)
    )
  }, [codeByQuestion, question, selectedLanguage.value])

  const currentCodeResult = question?._id
    ? codeResultByQuestion[question._id]
    : null

  const currentCodeFeedback = question?._id
    ? codeFeedbackByQuestion[question._id]
    : ''

  const lineCount = Math.max(1, currentCode.split('\n').length)



  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return

      setCurrentIndex(index)
      setVisited((prev) => new Set([...prev, index]))
    },
    [totalQuestions]
  )

  const submitAnswer = async () => {
    if (!question || !attemptId || isCoding) return

    const answer = answers[question._id]?.trim()
    if (!answer) return

    await submitMutation.mutateAsync({
      attemptId,
      payload: { questionId: question._id, answer },
    })
  }

  const runCode = () => {
    if (!question?._id || !question.coding || !attemptId) return

    runCodeMutation.mutate(
      {
        attemptId,
        questionId: question._id,
        payload: {
          sourceCode: currentCode,
          language: selectedLanguage.value,
          languageId: selectedLanguage.languageId,
        },
      },
      {
        onSuccess: (response) => {
          setCodeResultByQuestion((prev) => ({
            ...prev,
            [question._id]: response.data,
          }))

          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: response.data.passed
              ? 'Visible test cases passed.'
              : `${response.data.passedCount}/${response.data.totalCount} visible test cases passed.`,
          }))
        },

        onError: (error) => {
          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: error.message,
          }))
        },
      }
    )
  }

  const submitCode = () => {
    if (!question?._id || !question.coding || !attemptId) return

    submitCodeMutation.mutate(
      {
        attemptId,
        questionId: question._id,
        payload: {
          sourceCode: currentCode,
          language: selectedLanguage.value,
          languageId: selectedLanguage.languageId,
        },
      },
      {
        onSuccess: (response) => {
          setAnswers((prev) => ({
            ...prev,
            [question._id]: currentCode,
          }))

          setCodeResultByQuestion((prev) => ({
            ...prev,
            [question._id]: response.data,
          }))

          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]:
              response.data.feedback ||
              (response.data.isCorrect
                ? 'Accepted. All test cases passed.'
                : `${response.data.passedCount}/${response.data.totalCount} test cases passed.`),
          }))
        },

        onError: (error) => {
          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: error.message,
          }))
        },
      }
    )
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

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!question?._id) return

    const nextLanguage = findCompilerLanguage(event.target.value)

    setLanguageByQuestion((prev) => ({
      ...prev,
      [question._id]: nextLanguage.value,
    }))

    setCodeByQuestion((prev) => ({
      ...prev,
      [question._id]: getStarterCode(question, nextLanguage.value),
    }))

    setCodeResultByQuestion((prev) => ({
      ...prev,
      [question._id]: null,
    }))

    setCodeFeedbackByQuestion((prev) => ({
      ...prev,
      [question._id]: `Compiler language changed to ${nextLanguage.label}`,
    }))
  }

  const handleCodeChange = (value: string) => {
    if (!question?._id) return

    setCodeByQuestion((prev) => ({
      ...prev,
      [question._id]: value,
    }))
  }

  const isLoading = shouldFetch && questionsQuery.isLoading
  const isFinishing = finishMutation.isPending
  const isSubmitting = submitMutation.isPending
  const isRunningCode = runCodeMutation.isPending
  const isSubmittingCode = submitCodeMutation.isPending



  return (
    <AppShellBoundary withFooter={false} withBottomNav={false}>
      <div className="flex h-[calc(100vh-88px)] min-h-0 flex-col overflow-hidden">
        <MockTestAttemptHeader
          timerDisplay={timerDisplay}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          questions={questions}
          answers={answers}
          flagged={flagged}
          visited={visited}
          isFinishing={isFinishing}
          canFinish={Boolean(attemptId)}
          onToggleFlag={toggleFlag}
          onFinish={finish}
          onGoTo={goTo}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-[min(1060px,calc(100%-48px))] py-5 max-[640px]:w-[calc(100%-20px)]">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]"
                  />
                ))}
              </div>
            ) : questionsQuery.isError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
                Failed to load attempt questions.
              </div>
            ) : !question ? (
              <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18] dark:text-[#9b9a92]">
                No questions found for this attempt.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                    <div className="mb-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.13em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Question {currentIndex + 1} of {totalQuestions}
                      {question.type &&
                        ` · ${question.type.replace('_', ' ')}`}
                      {question.points && ` · ${question.points} pts`}
                    </div>

                    <h2 className="font-['Playfair_Display',serif] text-[26px] font-black leading-snug text-[#1a1714] max-[640px]:text-[22px] dark:text-[#f2f0eb]">
                      {question.question}
                    </h2>

                    {isCoding && question.coding && (
                      <div className="mt-5 rounded-[14px] border border-[#e0d0c5] bg-[#f5ede4] p-5 dark:border-white/9 dark:bg-[#252320]">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                            Sample test cases
                          </p>

                          <span className="rounded-full border border-[#e0d0c5] bg-[#fdf8f5] px-2.5 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.08em] text-[#6b5f58] dark:border-white/10 dark:bg-[#141412] dark:text-[#9b9a92]">
                            {question.coding.functionName}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {question.coding.testCases
                            .filter((testCase) => !testCase.isHidden)
                            .slice(0, 2)
                            .map((testCase, index) => (
                              <div
                                key={index}
                                className="rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 font-['DM_Mono',monospace] text-[12px] leading-relaxed dark:border-white/9 dark:bg-[#141412]"
                              >
                                <div className="text-[#6b5f58] dark:text-[#9b9a92]">
                                  <span className="font-semibold text-[#b84c2b] dark:text-[#e8816a]">
                                    Input:
                                  </span>{' '}
                                  {formatJsonValue(testCase.input)}
                                </div>

                                <div className="mt-1 text-[#6b5f58] dark:text-[#9b9a92]">
                                  <span className="font-semibold text-[#b84c2b] dark:text-[#e8816a]">
                                    Expected:
                                  </span>{' '}
                                  {formatJsonValue(testCase.expectedOutput)}
                                </div>

                                {testCase.explanation && (
                                  <div className="mt-1 text-[#6b5f58] dark:text-[#9b9a92]">
                                    {testCase.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {!isMCQ && !isCoding && (
                      <>
                        <textarea
                          value={answers[question._id] || ''}
                          onChange={(event) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question._id]: event.target.value,
                            }))
                          }
                          rows={8}
                          className="mt-5 w-full resize-y rounded-xl border border-[#e0d0c5] bg-[#f5ede4] p-4 font-['DM_Mono',monospace] text-sm text-[#1a1714] outline-none transition placeholder:text-[#9b8f87] focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#6b6560] dark:focus:border-[#e8816a]"
                          placeholder="Type your answer…"
                        />

                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={
                            !answers[question._id]?.trim() || isSubmitting
                          }
                          className="mt-4 rounded-[10px] border border-[#e0d0c5] bg-[#f5ede4] px-5 py-2.5 text-sm font-bold text-[#1a1714] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-[#f2f0eb] dark:hover:bg-white/12"
                        >
                          {isSubmitting ? 'Saving…' : 'Save answer'}
                        </button>
                      </>
                    )}
                  </div>

                  {isCoding && question.coding && (
                    <section
                      className={cn(
                        'overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-[0_2px_16px_rgba(26,23,20,0.08)]',
                        compilerExpanded &&
                          'fixed inset-4 z-50 overflow-y-auto bg-[#111]'
                      )}
                    >
                      <div className="border-b border-white/10 bg-[#161616] px-5 py-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setCompilerExpanded((value) => !value)
                            }
                            className="rounded-md border border-white/10 bg-[#1e1e1e] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-wider text-[#888] transition hover:bg-[#2a2a2a] hover:text-[#d4d4d4]"
                          >
                            {compilerExpanded ? '⊡ Minimize' : '⛶ Maximize'}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#e8816a]">
                              Mock Test Compiler
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 font-['DM_Mono',monospace] text-[11px] text-[#888]">
                              <span>📄 {selectedLanguage.fileName}</span>
                              <span>·</span>
                              <span>{selectedLanguage.label}</span>
                            </div>
                          </div>

                          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111] px-2.5 py-1.5 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.08em] text-[#888]">
                            Language
                            <select
                              value={selectedLanguage.value}
                              onChange={handleLanguageChange}
                              className="cursor-pointer bg-transparent text-[11px] font-bold normal-case tracking-normal text-[#d4d4d4] outline-none"
                            >
                              {COMPILER_LANGUAGES.map((item) => (
                                <option
                                  key={item.value}
                                  value={item.value}
                                  className="bg-[#111] text-[#d4d4d4]"
                                >
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>

                      <div className="flex min-h-80 bg-[#111] py-4 font-['DM_Mono',monospace] text-[14px] text-[#d4d4d4]">
                        <div className="select-none px-4 text-right leading-[1.6] text-[#555]">
                          {Array.from({ length: lineCount }).map(
                            (_, index) => (
                              <div key={index}>{index + 1}</div>
                            )
                          )}
                        </div>

                        <textarea
                          value={currentCode}
                          onChange={(event) =>
                            handleCodeChange(event.target.value)
                          }
                          spellCheck={false}
                          className="min-h-80 flex-1 resize-none bg-transparent pr-4 font-['DM_Mono',monospace] text-[14px] leading-[1.6] text-[#d4d4d4] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-5 border-t border-white/10 bg-[#161616] p-5 max-[760px]:grid-cols-1">
                        <div>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={isRunningCode || !currentCode.trim()}
                              onClick={runCode}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#2e5a39] bg-[#1a3d24] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#4caf50] transition hover:bg-[#235230] hover:text-[#66bb6a] disabled:cursor-wait disabled:opacity-50"
                            >
                              ▶ {isRunningCode ? 'Running' : 'Run Code'}
                            </button>

                            <button
                              type="button"
                              disabled={
                                isSubmittingCode || !currentCode.trim()
                              }
                              onClick={submitCode}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#e8816a]/40 bg-[#b84c2b] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#963d22] disabled:cursor-wait disabled:opacity-50"
                            >
                              ✓{' '}
                              {isSubmittingCode
                                ? 'Submitting'
                                : 'Submit Code'}
                            </button>
                          </div>

                          {currentCodeFeedback && (
                            <div
                              className={cn(
                                'rounded-xl border p-4 text-[12px] leading-relaxed',
                                currentCodeResult?.passed
                                  ? 'border-[#2e5a39] bg-[#1a3d24]/70 text-[#9be3a6]'
                                  : 'border-[#ffbd2e]/30 bg-[#2d2614] text-[#ffdf8a]'
                              )}
                            >
                              {currentCodeFeedback}
                            </div>
                          )}

                          <pre className="mt-4 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0a0a0a] p-4 font-['DM_Mono',monospace] text-[12px] leading-[1.8] text-[#aaa]">
                            {buildCompilerOutput(currentCodeResult)}
                          </pre>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-widest text-[#888]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
                            Test case results
                          </div>

                          {!currentCodeResult ? (
                            <div className="rounded-xl border border-dashed border-white/10 bg-[#111] p-5 text-center text-[12px] text-[#888]">
                              Run or submit your code to see test case
                              results.
                            </div>
                          ) : (
                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                              {currentCodeResult.testCases.map(
                                (testCase) => (
                                  <div
                                    key={testCase.index}
                                    className={cn(
                                      'rounded-xl border p-3 font-["DM_Mono",monospace] text-[11.5px]',
                                      testCase.passed
                                        ? 'border-[#2e5a39] bg-[#101a13]'
                                        : 'border-[#ffbd2e]/30 bg-[#2d2614]'
                                    )}
                                  >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <span
                                        className={cn(
                                          'rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]',
                                          testCase.passed
                                            ? 'bg-[#1a3d24] text-[#4caf50]'
                                            : 'bg-[#3a2b12] text-[#ffbd2e]'
                                        )}
                                      >
                                        {testCase.passed
                                          ? 'Passed'
                                          : 'Failed'}
                                      </span>

                                      <span className="text-[#777]">
                                        Case {testCase.index + 1}
                                        {testCase.isHidden
                                          ? ' · hidden'
                                          : ''}
                                      </span>
                                    </div>

                                    {!testCase.isHidden && (
                                      <>
                                        <div className="text-[#aaa]">
                                          Input:{' '}
                                          {formatJsonValue(testCase.input)}
                                        </div>

                                        <div className="mt-1 text-[#aaa]">
                                          Expected:{' '}
                                          {formatJsonValue(
                                            testCase.expectedOutput
                                          )}
                                        </div>
                                      </>
                                    )}

                                    <div className="mt-1 text-[#aaa]">
                                      Actual:{' '}
                                      {formatJsonValue(
                                        testCase.actualOutput
                                      )}
                                    </div>

                                    {testCase.error && (
                                      <div className="mt-2 text-[#ff9b8a]">
                                        Error: {testCase.error}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-4">
                  {isMCQ && (
                    <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                      <p className="mb-3 flex items-center gap-2 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                        </svg>
                        {question.type.replace('_', ' ')} ·{' '}
                        {question.points} pts
                      </p>

                      <div className="flex flex-col gap-2">
                        {question.options!.map((option, i) => {
                          const selected = answers[question._id] === option

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question._id]: option,
                                }))
                              }
                              className={cn(
                                'flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-px',
                                selected
                                  ? 'border-[#b84c2b] bg-[rgba(184,76,43,0.08)] dark:border-[#e8816a] dark:bg-[#e8816a]/8'
                                  : 'border-[#e0d0c5] bg-[#f5ede4] hover:border-[#e8816a] dark:border-white/9 dark:bg-[#141412] dark:hover:border-white/20'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7px] border font-["DM_Mono",monospace] text-[11px] transition',
                                  selected
                                    ? 'border-[#b84c2b] bg-[#b84c2b] text-white dark:border-[#e8816a] dark:bg-[#e8816a]'
                                    : 'border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] dark:border-white/16 dark:bg-[#1c1a18] dark:text-[#9b9a92]'
                                )}
                              >
                                {['A', 'B', 'C', 'D'][i]}
                              </span>

                              <span className="text-[13px] text-[#1a1714] dark:text-[#f2f0eb]">
                                {option}
                              </span>

                              {selected && (
                                <span className="ml-auto">
                                  <CheckCircleIcon />
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={submitAnswer}
                        disabled={!answers[question._id] || isSubmitting}
                        className="mt-4 rounded-[10px] border border-[#e0d0c5] bg-[#f5ede4] px-5 py-2.5 text-sm font-bold text-[#1a1714] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-[#f2f0eb] dark:hover:bg-white/12"
                      >
                        {isSubmitting ? 'Saving…' : 'Save answer'}
                      </button>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/10 dark:bg-[#1c1a18]">
                    <p className="mb-3 font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Self-Confidence Level
                    </p>

                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((level) => {
                        const active = confidence[currentIndex] === level

                        const activeColor =
                          level === 'high'
                            ? 'border-[#2d6a47] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[#6fcb8a] dark:bg-[#6fcb8a]/8 dark:text-[#6fcb8a]'
                            : level === 'medium'
                              ? 'border-[#c98000] bg-[rgba(201,128,0,0.08)] text-[#c98000] dark:border-[#f0c060] dark:bg-[#f0c060]/8 dark:text-[#f0c060]'
                              : 'border-[#b84c2b] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[#e8816a] dark:bg-[#e8816a]/8 dark:text-[#e8816a]'

                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() =>
                              setConfidence((prev) => ({
                                ...prev,
                                [currentIndex]: level,
                              }))
                            }
                            className={cn(
                              'flex-1 rounded-[9px] border py-2 font-["DM_Sans",sans-serif] text-[11px] font-bold uppercase tracking-[0.06em] transition',
                              active
                                ? activeColor
                                : 'border-[#e0d0c5] bg-[#f5ede4] text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#141412] dark:text-[#9b9a92] dark:hover:border-white/20 dark:hover:text-[#f2f0eb]'
                            )}
                          >
                            {level}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.05)] p-5 dark:border-[#e8816a]/20 dark:bg-[#e8816a]/5"
                    style={{ borderLeft: '3px solid #b84c2b' }}
                  >
                    <p className="mb-2 flex items-center gap-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">
                      <HintIcon />
                      Hint
                    </p>

                    <p className="text-[12.5px] italic leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                      {isCoding
                        ? 'Run checks visible test cases. Submit checks all visible and hidden test cases.'
                        : 'Think about the most efficient approach before selecting your answer.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <MockTestAttemptFooter
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          questions={questions}
          answers={answers}
          onGoTo={goTo}
        />
      </div>
    </AppShellBoundary>
  )
}
