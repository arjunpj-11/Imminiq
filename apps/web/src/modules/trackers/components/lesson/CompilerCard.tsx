import { type ChangeEvent, useMemo, useState } from 'react'

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
  LessonCodeSubmissionAction,
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
  const codeHistoryQuery = useLessonCodeSubmissions(trackerId, subtopicId)

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
  const [historyFilter, setHistoryFilter] =
    useState<LessonCodeSubmissionAction | 'all'>('submit')

  const displayFileName =
    selectedLanguage.fileName || fileName || 'main.js'

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

  const historyItems = useMemo(() => {
    const items = codeHistoryQuery.data ?? []

    if (historyFilter === 'all') {
      return items
    }

    return items.filter((item) => item.action === historyFilter)
  }, [codeHistoryQuery.data, historyFilter])

  const runCount =
    codeHistoryQuery.data?.filter((item) => item.action === 'run')
      .length ?? 0

  const submitCount =
    codeHistoryQuery.data?.filter((item) => item.action === 'submit')
      .length ?? 0

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
        onError: (error) => setOutput(`> Error: ${error.message}`),
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
      }) || '> Restored previous code'
    )

    if (submission.action === 'submit') {
      setSubmitResult({
        isCorrect: submission.isCorrect,
        expectedOutput: submission.expectedOutput ?? '',
        actualOutput: submission.actualOutput ?? '',
        stdout: submission.stdout ?? '',
        stderr: submission.stderr ?? '',
        compileOutput: submission.compileOutput ?? '',
        message: submission.message ?? '',
       status:
  submission.status &&
  typeof submission.status.id === 'number' &&
  typeof submission.status.description === 'string'
    ? {
        id: submission.status.id,
        description: submission.status.description,
      }
    : {
        id: 0,
        description: 'Restored',
      },
        time: submission.time ?? null,
        memory: submission.memory ?? null,
        feedback: submission.feedback ?? '',
        canCompareOptimized: submission.isCorrect,
        canAskHints: !submission.isCorrect,
      })
    } else {
      resetAssistiveState()
    }
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
            {practiceDescription ||
              'Write code that solves the problem and submit it.'}
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
          <div
            className={cn(
              'rounded-[14px] border p-4',
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
                className="mt-4 rounded-[10px] border border-[#ffbd2e]/40 bg-[#3a2b12] px-3 py-2 text-[11px] font-bold text-[#ffbd2e] transition hover:bg-[#4a3616] disabled:cursor-wait disabled:opacity-60"
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
                className="mt-4 rounded-[10px] border border-[#2e5a39] bg-[#1a3d24] px-3 py-2 text-[11px] font-bold text-[#4caf50] transition hover:bg-[#235230] disabled:cursor-wait disabled:opacity-60"
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
                  <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#ffbd2e]">
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
            <div className="mt-4 rounded-[14px] border border-[#2e5a39] bg-[#101a13] p-4">
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

              <pre className="mt-4 max-h-72 overflow-y-auto rounded-[10px] border border-white/10 bg-[#0a0a0a] p-4 font-['DM_Mono',monospace] text-[12.5px] leading-[1.7] text-[#d4d4d4]">
                {optimizedSolution.optimizedCode}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-white/10 bg-[#161616] p-5 dark:bg-[#0a0a0a]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#e8816a]">
              Previous Code Activity
            </div>

            <h4 className="mt-1 text-[15px] font-bold text-[#f2f0eb]">
              Runs and submissions
            </h4>

            <p className="mt-1 text-[12px] leading-[1.6] text-[#888]">
              Click restore to load an old run or submit back into the
              editor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['submit', 'run', 'all'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setHistoryFilter(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-bold uppercase tracking-[0.08em] transition",
                  historyFilter === item
                    ? 'border-[#e8816a] bg-[#b84c2b] text-white'
                    : 'border-white/10 bg-[#111] text-[#888] hover:border-[#e8816a] hover:text-[#e8816a]'
                )}
              >
                {item === 'submit'
                  ? `Submits ${submitCount}`
                  : item === 'run'
                    ? `Runs ${runCount}`
                    : `All ${codeHistoryQuery.data?.length ?? 0}`}
              </button>
            ))}
          </div>
        </div>

        {codeHistoryQuery.isLoading ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#111] px-4 py-6 text-center text-[12px] text-[#888]">
            Loading previous code activity...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#111] px-4 py-6 text-center text-[12px] text-[#888]">
            No previous {historyFilter === 'all' ? 'activity' : historyFilter}
            {' '}yet.
          </div>
        ) : (
          <div className="max-h-110 space-y-3 overflow-y-auto pr-1">
            {historyItems.map((item) => {
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
                <article
                  key={item._id}
                  className="rounded-[14px] border border-white/10 bg-[#111] p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.08em]",
                          item.action === 'submit'
                            ? item.isCorrect
                              ? 'border border-[#2e5a39] bg-[#1a3d24] text-[#4caf50]'
                              : 'border border-[#ffbd2e]/40 bg-[#3a2b12] text-[#ffbd2e]'
                            : 'border border-white/10 bg-[#161616] text-[#888]'
                        )}
                      >
                        {item.action === 'submit'
                          ? item.isCorrect
                            ? 'Submit Passed'
                            : 'Submit Failed'
                          : 'Run'}
                      </span>

                      <span className="rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#888]">
                        {item.language}
                      </span>

                      {item.time && (
                        <span className="rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.08em] text-[#888]">
                          {item.time}s
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] text-[#777]">
                        {formatDateTime(item.createdAt)}
                      </span>

                      <button
                        type="button"
                        onClick={() => restoreSubmission(item)}
                        className="rounded-md border border-[#e8816a]/40 bg-[#b84c2b]/20 px-2.5 py-1.5 font-['DM_Mono',monospace] text-[8px] font-bold uppercase tracking-[0.08em] text-[#e8816a] transition hover:bg-[#b84c2b] hover:text-white"
                      >
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div>
                      <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#777]">
                        Code
                      </div>

                      <pre className="max-h-44 overflow-y-auto rounded-[10px] border border-white/10 bg-[#0a0a0a] p-3 font-['DM_Mono',monospace] text-[11.5px] leading-[1.7] text-[#d4d4d4]">
                        {item.sourceCode}
                      </pre>
                    </div>

                    <div>
                      <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#777]">
                        Output
                      </div>

                      <pre className="max-h-44 overflow-y-auto rounded-[10px] border border-white/10 bg-[#0a0a0a] p-3 font-['DM_Mono',monospace] text-[11.5px] leading-[1.7] text-[#aaa]">
                        {historyOutput}
                      </pre>
                    </div>
                  </div>

                  {item.action === 'submit' && (
                    <div className="mt-3 rounded-[10px] border border-white/10 bg-[#161616] p-3">
                      <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#777]">
                        Submit Feedback
                      </div>

                      <p className="text-[12px] leading-[1.6] text-[#aaa]">
                        {item.feedback ||
                          (item.isCorrect
                            ? 'This submission passed.'
                            : 'This submission did not match the expected output.')}
                      </p>

                      {item.expectedOutput && (
                        <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-[#0a0a0a] p-3 font-['DM_Mono',monospace] text-[11.5px] leading-[1.6] text-[#aaa]">
                          Expected:
                          {'\n'}
                          {item.expectedOutput}
                        </pre>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}