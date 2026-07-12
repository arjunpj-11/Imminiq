import { type ChangeEvent, useMemo, useState } from 'react'
import { getUserFacingError } from '../../../../lib/user-facing-error'

import {
  useGetCodeHint,
  useGetOptimizedSolution,
  useLessonCodeSubmissions,
  useRunLessonCode,
  useSubmitLessonCode,
} from '../../hooks/useTrackers'
import type {
  GetOptimizedSolutionResponse,
  LessonCodeSubmission,
  SubmitLessonCodeResponse,
} from '../../types/tracker.types'

import { COMPILER_LANGUAGES } from '../../constants/lesson-compiler.constants'
import type { CompilerLanguageOption } from '../../types/lesson.types'
import { findCompilerLanguage } from '../../utils/lesson-formatters'
import { cn } from '../../utils/tracker-ui'
import MathText from './MathText'

const formatDateTime = (value?: string) => {
  if (!value) return ''

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const getSafeStatus = (
  status?: {
    id?: number
    description?: string
  } | null
) => {
  if (
    status &&
    typeof status.id === 'number' &&
    typeof status.description === 'string'
  ) {
    return {
      id: status.id,
      description: status.description,
    }
  }

  return {
    id: 0,
    description: 'Restored',
  }
}

// *** CHANGED: Modal for expanded submission details
function SubmissionModal({
  item,
  buildOutput,
  onClose,
  onRestore,
}: {
  item: LessonCodeSubmission
  buildOutput: (data: {
    stdout?: string
    stderr?: string
    compileOutput?: string
    message?: string
    status?: { description?: string } | null
    time?: string | null
    memory?: number | null
  }) => string
  onClose: () => void
  onRestore: (item: LessonCodeSubmission) => void
}) {
  const historyOutput =
    buildOutput({
      stdout: item.stdout,
      stderr: item.stderr,
      compileOutput: item.compileOutput,
      message: item.message,
      status: item.status,
      time: item.time,
      memory: item.memory,
    }) || '> No output saved'

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#161616] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em]",
                item.isCorrect
                  ? 'border border-[#2e5a39] bg-[#1a3d24] text-[#4caf50]'
                  : 'border border-[#ffbd2e]/40 bg-[#3a2b12] text-[#ffbd2e]'
              )}
            >
              {item.isCorrect ? 'Submit Passed' : 'Submit Failed'}
            </span>

            <span className="rounded-full border border-white/10 bg-[#1e1e1e] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#888]">
              {item.language}
            </span>

            {item.time && (
              <span className="rounded-full border border-white/10 bg-[#1e1e1e] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#888]">
                {item.time}s
              </span>
            )}

            <span className="text-[10.5px] text-[#666]">
              {formatDateTime(item.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onRestore(item)
                onClose()
              }}
              className="rounded-md border border-(--brand-500)/40 bg-(--brand-500)/20 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-(--brand-500) transition hover:bg-(--brand-500) hover:text-white"
            >
              Restore
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 bg-[#1e1e1e] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-[#888] transition hover:bg-[#2a2a2a] hover:text-[#d4d4d4]"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#777]">
                Code
              </div>

              <pre className="max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[#0a0a0a] p-3 font-mono text-[11.5px] leading-[1.7] text-[#d4d4d4]">
                {item.sourceCode}
              </pre>
            </div>

            <div>
              <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#777]">
                Output
              </div>

              <pre className="max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[#0a0a0a] p-3 font-mono text-[11.5px] leading-[1.7] text-[#aaa]">
                {historyOutput}
              </pre>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-[#161616] p-3">
            <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#777]">
              Submit Feedback
            </div>

            <p className="text-[12px] leading-[1.6] text-[#aaa]">
              {item.feedback ||
                (item.isCorrect
                  ? 'This submission passed.'
                  : 'This submission did not match the expected output.')}
            </p>

            {item.expectedOutput && (
              <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-[#0a0a0a] p-3 font-mono text-[11.5px] leading-[1.6] text-[#aaa]">
                Expected:
                {'\n'}
                {item.expectedOutput}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompilerCard({
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

  const codeHistoryQuery = useLessonCodeSubmissions(
    trackerId,
    subtopicId,
    'submit'
  )

  const initialLanguage = useMemo(
    () => findCompilerLanguage(language || 'javascript'),
    [language]
  )

  const [selectedLanguage, setSelectedLanguage] =
    useState<CompilerLanguageOption>(initialLanguage)
  const [code, setCode] = useState(initialCode)
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState('> Ready to run your code')
  const [submitResult, setSubmitResult] = useState<
    SubmitLessonCodeResponse['data'] | null
  >(null)
  const [hintCount, setHintCount] = useState(0)
  const [hintItems, setHintItems] = useState<
    Array<{
      mode: 'hint' | 'issue'
      title: string
      explanation: string
    }>
  >([])
  const [optimizedSolution, setOptimizedSolution] = useState<
    GetOptimizedSolutionResponse['data'] | null
  >(null)

  // *** CHANGED: state for the submission detail modal
  const [expandedSubmission, setExpandedSubmission] =
    useState<LessonCodeSubmission | null>(null)

  // *** CHANGED: state for the maximize overlay
  const [isMaximized, setIsMaximized] = useState(false)

  const displayFileName =
    selectedLanguage.fileName || fileName || 'main.js'

  const historyItems = codeHistoryQuery.data ?? []
  const submitCount = historyItems.length

  const buildOutput = (data: {
    stdout?: string
    stderr?: string
    compileOutput?: string
    message?: string
    status?: { description?: string } | null
    time?: string | null
    memory?: number | null
  }) => {
    return [
      data.stdout ? `STDOUT:\n${data.stdout}` : '',
      data.stderr ? `STDERR:\n${data.stderr}` : '',
      data.compileOutput
        ? `COMPILE OUTPUT:\n${data.compileOutput}`
        : '',
      data.message ? `MESSAGE:\n${data.message}` : '',
      data.status?.description
        ? `STATUS: ${data.status.description}`
        : '',
      data.time ? `TIME: ${data.time}s` : '',
      data.memory ? `MEMORY: ${data.memory} KB` : '',
    ]
      .filter(Boolean)
      .join('\n\n')
  }

  const resetAssistiveState = () => {
    setSubmitResult(null)
    setHintItems([])
    setHintCount(0)
    setOptimizedSolution(null)
  }

  const runCode = () => {
    runCodeMutation.mutate(
      {
        trackerId,
        subtopicId,
        sourceCode: code,
        languageId: selectedLanguage.languageId,
        language: selectedLanguage.value,
        stdin,
      },
      {
        onSuccess: (response) =>
          setOutput(buildOutput(response.data) || '> Code executed'),
        onError: (error) => setOutput(`> ${getUserFacingError(error, 'Code execution failed. Please try again.')}`),
      }
    )
  }

  const submitCode = () => {
    submitCodeMutation.mutate(
      {
        trackerId,
        subtopicId,
        sourceCode: code,
        languageId: selectedLanguage.languageId,
        language: selectedLanguage.value,
        stdin,
      },
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
        onError: (error) => setOutput(`> ${getUserFacingError(error, 'Code submission failed. Please try again.')}`),
      }
    )
  }

  const getHint = () => {
    hintMutation.mutate(
      {
        trackerId,
        subtopicId,
        sourceCode: code,
        actualOutput:
          submitResult?.actualOutput || submitResult?.stdout || output,
        errorOutput:
          submitResult?.stderr ||
          submitResult?.compileOutput ||
          submitResult?.message ||
          '',
        hintCount,
      },
      {
        onSuccess: (response) => {
          setHintCount(response.data.hintCount)
          setHintItems((current) => [
            ...current,
            {
              mode: response.data.mode,
              title: response.data.title,
              explanation: response.data.explanation,
            },
          ])
        },
      }
    )
  }

  const compareOptimized = () => {
    optimizedMutation.mutate(
      {
        trackerId,
        subtopicId,
        sourceCode: code,
        language: selectedLanguage.value,
      },
      {
        onSuccess: (response) => setOptimizedSolution(response.data),
      }
    )
  }

  const handleLanguageChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const nextLanguage =
      COMPILER_LANGUAGES.find(
        (item) => item.value === event.target.value
      ) || COMPILER_LANGUAGES[0]

    setSelectedLanguage(nextLanguage)
    setOutput(`> Compiler language changed to ${nextLanguage.label}`)
    resetAssistiveState()
  }

  const restoreSubmission = (submission: LessonCodeSubmission) => {
    const restoredLanguage = findCompilerLanguage(submission.language)

    setSelectedLanguage(restoredLanguage)
    setCode(submission.sourceCode)
    setStdin(submission.stdin ?? '')
    setOutput(
      buildOutput({
        stdout: submission.stdout,
        stderr: submission.stderr,
        compileOutput: submission.compileOutput,
        message: submission.message,
        status: submission.status,
        time: submission.time,
        memory: submission.memory,
      }) || '> Restored previous submission'
    )

    setSubmitResult({
      isCorrect: submission.isCorrect,
      expectedOutput: submission.expectedOutput ?? '',
      actualOutput: submission.actualOutput ?? '',
      stdout: submission.stdout ?? '',
      stderr: submission.stderr ?? '',
      compileOutput: submission.compileOutput ?? '',
      message: submission.message ?? '',
      status: getSafeStatus(submission.status),
      time: submission.time ?? null,
      memory: submission.memory ?? null,
      feedback: submission.feedback ?? '',
      canCompareOptimized: submission.isCorrect,
      canAskHints: !submission.isCorrect,
    })
  }

  const lineCount = Math.max(1, code.split('\n').length)

  // *** CHANGED: the card wraps in a maximizable container
  return (
    <>
      {/* *** CHANGED: submission detail modal */}
      {expandedSubmission && (
        <SubmissionModal
          item={expandedSubmission}
          buildOutput={buildOutput}
          onClose={() => setExpandedSubmission(null)}
          onRestore={(item) => {
            restoreSubmission(item)
            setExpandedSubmission(null)
          }}
        />
      )}

      {/* *** CHANGED: maximize overlay wrapper */}
      <div
        className={cn(
          'transition-all duration-300',
          isMaximized
            ? 'fixed inset-0 z-40 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm'
            : 'relative'
        )}
      >
        <section
          className={cn(
            'overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-(--shadow-2) dark:bg-[#111]',
            isMaximized && 'mx-auto max-w-6xl'
          )}
        >
          {/* *** CHANGED: maximize button in the top-right of the card header */}
          <div className="border-b border-white/10 bg-[#161616] px-5 py-4 dark:bg-[#0a0a0a]">
            <div className="mb-4 rounded-md border border-white/10 bg-[#111] p-4">
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#4caf50]">
                Coding Challenge
              </div>

              <h3 className="text-[16px] font-bold text-[#f2f0eb]">
                {practiceTitle || 'Solve this coding task'}
              </h3>

              <MathText className="mt-2 text-[13px] leading-[1.65] text-[#aaa]">
                {practiceDescription ||
                  'Write code that solves the problem and submit it.'}
              </MathText>

              {expectedOutput && (
                <div className="mt-4 rounded-md border border-white/10 bg-[#0a0a0a] p-3">
                  <div className="mb-1 font-mono text-[8px] uppercase tracking-widest text-[#888]">
                    Expected Output
                  </div>

                  <pre className="whitespace-pre-wrap font-mono text-[12px] text-[#d4d4d4]">
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
                <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#888]">
                  📄 {displayFileName}
                </div>

                <label className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#888]">
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
                  className="inline-flex items-center gap-1.5 rounded-md border border-(--brand-500)/40 bg-(--brand-500) px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-50"
                >
                  ✓ {submitCodeMutation.isPending ? 'Submitting' : 'Submit'}
                </button>

                {/* *** CHANGED: maximize/restore button */}
                <button
                  type="button"
                  onClick={() => setIsMaximized((v) => !v)}
                  title={isMaximized ? 'Minimize' : 'Maximize'}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#1e1e1e] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888] transition hover:bg-[#2a2a2a] hover:text-[#d4d4d4]"
                >
                  {isMaximized ? '⊡ Minimize' : '⛶ Maximize'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-60 bg-[#1e1e1e] py-4 font-mono text-[14px] text-[#d4d4d4] dark:bg-[#111]">
            <div className="select-none px-4 text-right leading-[1.6] text-[#555]">
              {Array.from({ length: lineCount }).map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              className="min-h-56 flex-1 resize-none bg-transparent pr-4 font-mono text-[14px] leading-[1.6] text-[#d4d4d4] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-5 border-t border-white/10 bg-[#161616] p-5 dark:bg-[#0a0a0a] max-[640px]:grid-cols-1">
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-[#888]">
                Input
              </label>

              <textarea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                placeholder="Optional stdin..."
                className="min-h-28 w-full resize-none rounded-lg border border-white/10 bg-[#111] p-3 font-mono text-[12px] text-[#aaa] outline-none focus:border-(--brand-500)"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#888]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
                Output
              </div>

              <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap font-mono text-[12.5px] leading-[1.8] text-[#aaa]">
                {output}
              </pre>
            </div>
          </div>

          {submitResult && (
            <div className="border-t border-white/10 bg-[#111] p-5">
              <div
                className={cn(
                  'rounded-md border p-4',
                  submitResult.isCorrect
                    ? 'border-[#2e5a39] bg-[#1a3d24]/70'
                    : 'border-[#ffbd2e]/30 bg-[#2d2614]'
                )}
              >
                <h4 className="text-[14px] font-bold text-[#f2f0eb]">
                  {submitResult.isCorrect
                    ? '✅ Correct Output'
                    : '⚠️ Not correct yet'}
                </h4>

                <p className="mt-2 text-[12.5px] leading-[1.6] text-[#aaa]">
                  {submitResult.feedback ||
                    (submitResult.isCorrect
                      ? 'Great job. Your output matches the expected result.'
                      : 'Your code ran, but the output or behavior does not match the expected result. Try using hints first.')}
                </p>

                {!submitResult.isCorrect && (
                  <button
                    type="button"
                    onClick={getHint}
                    disabled={hintMutation.isPending}
                    className="mt-4 rounded-md border border-[#ffbd2e]/40 bg-[#3a2b12] px-3 py-2 text-[11px] font-bold text-[#ffbd2e] transition hover:bg-[#4a3616] disabled:cursor-wait disabled:opacity-60"
                  >
                    {hintMutation.isPending
                      ? 'Thinking...'
                      : hintCount >= 3
                        ? 'Reveal Issue'
                        : `Get Hint ${hintCount + 1}/3`}
                  </button>
                )}

                {submitResult.isCorrect && (
                  <button
                    type="button"
                    onClick={compareOptimized}
                    disabled={optimizedMutation.isPending}
                    className="mt-4 rounded-md border border-[#2e5a39] bg-[#1a3d24] px-3 py-2 text-[11px] font-bold text-[#4caf50] transition hover:bg-[#235230] disabled:cursor-wait disabled:opacity-60"
                  >
                    {optimizedMutation.isPending
                      ? 'Comparing...'
                      : 'Compare With Optimized Code'}
                  </button>
                )}
              </div>

              {hintItems.length > 0 && (
                <div className="mt-4 space-y-3">
                  {hintItems.map((item, index) => (
                    <div
                      key={`${item.mode}-${index}`}
                      className="rounded-xl border border-white/10 bg-[#161616] p-4"
                    >
                      <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#ffbd2e]">
                        {item.mode === 'issue'
                          ? 'Issue Revealed'
                          : `Hint ${index + 1}`}
                      </div>

                      <h5 className="mt-1 text-[13px] font-bold text-[#f2f0eb]">
                        {item.title}
                      </h5>

                      <MathText className="mt-2 text-[12.5px] leading-[1.65] text-[#aaa]">
                        {item.explanation}
                      </MathText>
                    </div>
                  ))}
                </div>
              )}

              {optimizedSolution && (
                <div className="mt-4 rounded-md border border-[#2e5a39] bg-[#101a13] p-4">
                  <h4 className="text-[14px] font-bold text-[#4caf50]">
                    Optimized Solution
                  </h4>

                  <p className="mt-2 text-[12.5px] leading-[1.6] text-[#aaa]">
                    {optimizedSolution.explanation}
                  </p>

                  {optimizedSolution.improvements.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.5px] text-[#aaa]">
                      {optimizedSolution.improvements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}

                  <pre className="mt-4 max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[#0a0a0a] p-4 font-mono text-[12.5px] leading-[1.7] text-[#d4d4d4]">
                    {optimizedSolution.optimizedCode}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* *** CHANGED: submission history section — compact rows only */}
          <div className="border-t border-white/10 bg-[#161616] p-5 dark:bg-[#0a0a0a]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
                  Previous Code Activity
                </div>

                <h4 className="mt-1 text-[15px] font-bold text-[#f2f0eb]">
                  Previous submissions
                </h4>

                <p className="mt-1 text-[12px] leading-[1.6] text-[#888]">
                  Only official submits are saved. Run Code is temporary and
                  will not appear here.
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-[#111] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#888]">
                Submits {submitCount}
              </span>
            </div>

            {codeHistoryQuery.isLoading ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#111] px-4 py-6 text-center text-[12px] text-[#888]">
                Loading previous submissions...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#111] px-4 py-6 text-center text-[12px] text-[#888]">
                No previous submissions yet.
              </div>
            ) : (
              // *** CHANGED: compact clickable rows instead of expanded articles
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {historyItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setExpandedSubmission(item)}
                    className="group flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-md border border-white/8 bg-[#111] px-4 py-3 transition hover:border-white/15 hover:bg-[#1a1a1a]"
                  >
                    {/* Left: status + language */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em]",
                          item.isCorrect
                            ? 'border border-[#2e5a39] bg-[#1a3d24] text-[#4caf50]'
                            : 'border border-[#ffbd2e]/40 bg-[#3a2b12] text-[#ffbd2e]'
                        )}
                      >
                        {item.isCorrect ? 'Submit Passed' : 'Submit Failed'}
                      </span>

                      <span className="rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#888]">
                        {item.language}
                      </span>

                      {item.time && (
                        <span className="rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#888]">
                          {item.time}s
                        </span>
                      )}
                    </div>

                    {/* Right: date + restore */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] text-[#666]">
                        {formatDateTime(item.createdAt)}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          // *** restore without opening the modal
                          e.stopPropagation()
                          restoreSubmission(item)
                        }}
                        className="rounded-md border border-(--brand-500)/40 bg-(--brand-500)/20 px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-(--brand-500) transition hover:bg-(--brand-500) hover:text-white"
                      >
                        Restore
                      </button>

                      {/* Visual hint that row is clickable */}
                      <span className="text-[10px] text-[#444] transition group-hover:text-[#666]">
                        ›
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
