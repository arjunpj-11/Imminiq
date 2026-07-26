import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';

import { type ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import Modal from '../../../../components/overlays/Modal';
import { toast } from '../../../../lib/toast';
import { ROUTES } from '../../../../routes/config/route-paths';
import { CheckCircleIcon, HintIcon } from '../components/MockTestAttemptIcons';
import { MockTestAttemptFooter, MockTestAttemptHeader } from '../components/MockTestAttemptChrome';
import { useCountdown } from '../hooks/useCountdown';

import {
  useFinishMockTestAttempt,
  useFlagMockTestQuestion,
  useMockTestAttemptQuestions,
  useRunMockTestCode,
  useReportMockTestQuestion,
  useSubmitMockTestAnswer,
  useSubmitMockTestCode,
} from '../hooks/useMockTests';

import {
  buildCompilerOutput,
  COMPILER_LANGUAGES,
  findCompilerLanguage,
  formatJsonValue,
  getStarterCode,
  type Confidence,
} from '../utils/mock-test-attempt.utils';

import type {
  IMockTestCodeRunResponse,
  MockTestCodingLanguage,
  IPublicMockTestQuestion,
  IStartAttemptResponse,
  MockTestQuestionIssueReason,
} from '../types/mock-tests.types';

export default function MockTestAttemptPage() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initial = location.state as IStartAttemptResponse | undefined;
  const shouldFetch = !initial?.questions?.length && Boolean(attemptId);
  const questionsQuery = useMockTestAttemptQuestions(shouldFetch ? attemptId : undefined);

  const questions = useMemo<IPublicMockTestQuestion[]>(() => {
    if (initial?.questions?.length) return initial.questions;

    return (questionsQuery.data || []) as IPublicMockTestQuestion[];
  }, [initial?.questions, questionsQuery.data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<number, Confidence>>({});
  const [flagged, setFlagged] = useState<Set<number>>(
    () =>
      new Set(
        questions.flatMap((item, index) =>
          initial?.attempt.flaggedQuestions.includes(item._id) ? [index] : []
        )
      )
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<MockTestQuestionIssueReason>('incorrect_answer');
  const [reportDetails, setReportDetails] = useState('');

  const [languageByQuestion, setLanguageByQuestion] = useState<
    Record<string, MockTestCodingLanguage>
  >({});
  const [codeByQuestion, setCodeByQuestion] = useState<Record<string, string>>({});
  const [codeResultByQuestion, setCodeResultByQuestion] = useState<
    Record<string, IMockTestCodeRunResponse | null>
  >({});
  const [codeFeedbackByQuestion, setCodeFeedbackByQuestion] = useState<Record<string, string>>({});
  const [compilerExpanded, setCompilerExpanded] = useState(false);

  const submitMutation = useSubmitMockTestAnswer();
  const runCodeMutation = useRunMockTestCode();
  const submitCodeMutation = useSubmitMockTestCode();
  const finishMutation = useFinishMockTestAttempt();
  const flagMutation = useFlagMockTestQuestion();
  const reportMutation = useReportMockTestQuestion();
  const timerDisplay = useCountdown(3600);

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const isMCQ = question?.type === 'mcq' && Boolean(question.options?.length);
  const isCoding = question?.type === 'coding' && Boolean(question.coding);

  const selectedLanguage = useMemo(() => {
    if (!question?._id) return COMPILER_LANGUAGES[0];

    return findCompilerLanguage(languageByQuestion[question._id] || question.coding?.language);
  }, [languageByQuestion, question]);

  const currentCode = useMemo(() => {
    if (!question?._id) return '';

    return codeByQuestion[question._id] || getStarterCode(question, selectedLanguage.value);
  }, [codeByQuestion, question, selectedLanguage.value]);

  const currentCodeResult = question?._id ? codeResultByQuestion[question._id] : null;

  const currentCodeFeedback = question?._id ? codeFeedbackByQuestion[question._id] : '';

  const lineCount = Math.max(1, currentCode.split('\n').length);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return;

      setCurrentIndex(index);
      setVisited((prev) => new Set([...prev, index]));
    },
    [totalQuestions]
  );

  const submitAnswer = async () => {
    if (!question || !attemptId || isCoding) return;

    const answer = answers[question._id]?.trim();
    if (!answer) return;

    await submitMutation.mutateAsync({
      attemptId,
      payload: { questionId: question._id, answer },
    });
  };

  const runCode = () => {
    if (!question?._id || !question.coding || !attemptId) return;

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
          }));

          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: response.data.passed
              ? 'Visible test cases passed.'
              : `${response.data.passedCount}/${response.data.totalCount} visible test cases passed.`,
          }));
        },

        onError: (error) => {
          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: getUserFacingError(error, 'Unable to run this code. Please try again.'),
          }));
        },
      }
    );
  };

  const submitCode = () => {
    if (!question?._id || !question.coding || !attemptId) return;

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
          }));

          setCodeResultByQuestion((prev) => ({
            ...prev,
            [question._id]: response.data,
          }));

          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]:
              response.data.feedback ||
              (response.data.isCorrect
                ? 'Accepted. All test cases passed.'
                : `${response.data.passedCount}/${response.data.totalCount} test cases passed.`),
          }));
        },

        onError: (error) => {
          setCodeFeedbackByQuestion((prev) => ({
            ...prev,
            [question._id]: getUserFacingError(
              error,
              'Unable to submit this code. Please try again.'
            ),
          }));
        },
      }
    );
  };

  const finish = async () => {
    if (!attemptId) return;

    try {
      await finishMutation.mutateAsync({ attemptId });
      navigate(ROUTES.mockTestResult(attemptId));
    } catch (error) {
      toast.error(
        'Could not finish this test',
        getUserFacingError(error, 'Please check your connection and try again.')
      );
    }
  };

  const toggleFlag = () => {
    if (!question?._id || !attemptId || flagMutation.isPending) return;
    const wasFlagged = flagged.has(currentIndex);
    setFlagged((prev) => {
      const next = new Set(prev);

      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }

      return next;
    });
    flagMutation.mutate(
      { attemptId, questionId: question._id },
      {
        onError: (error) => {
          setFlagged((prev) => {
            const next = new Set(prev);
            if (wasFlagged) next.add(currentIndex);
            else next.delete(currentIndex);
            return next;
          });
          toast.error('Could not save review flag', getUserFacingError(error));
        },
      }
    );
  };

  const submitQuestionReport = () => {
    if (!question?._id || !attemptId) return;
    reportMutation.mutate(
      {
        attemptId,
        questionId: question._id,
        reason: reportReason,
        details: reportDetails,
      },
      {
        onSuccess: () => {
          setReportOpen(false);
          setReportDetails('');
          toast.success(
            'Question reported',
            'The moderation team can now review this question and its test context.'
          );
        },
        onError: (error) => toast.error('Could not report question', getUserFacingError(error)),
      }
    );
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!question?._id) return;

    const nextLanguage = findCompilerLanguage(event.target.value);

    setLanguageByQuestion((prev) => ({
      ...prev,
      [question._id]: nextLanguage.value,
    }));

    setCodeByQuestion((prev) => ({
      ...prev,
      [question._id]: getStarterCode(question, nextLanguage.value),
    }));

    setCodeResultByQuestion((prev) => ({
      ...prev,
      [question._id]: null,
    }));

    setCodeFeedbackByQuestion((prev) => ({
      ...prev,
      [question._id]: `Compiler language changed to ${nextLanguage.label}`,
    }));
  };

  const handleCodeChange = (value: string) => {
    if (!question?._id) return;

    setCodeByQuestion((prev) => ({
      ...prev,
      [question._id]: value,
    }));
  };

  const isLoading = shouldFetch && questionsQuery.isLoading;
  const isFinishing = finishMutation.isPending;
  const isSubmitting = submitMutation.isPending;
  const isRunningCode = runCodeMutation.isPending;
  const isSubmittingCode = submitCodeMutation.isPending;
  const attemptUnavailable = !isLoading && (questionsQuery.isError || !question);

  if (attemptUnavailable) {
    return (
      <AppShellBoundary
        showSidebar={false}
        withTopBar={false}
        withFooter={false}
        className="bg-(--surface-sunken)"
      >
        <main className="grid min-h-dvh place-items-center px-5 py-10">
          <section className="w-full max-w-lg rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-7 text-center shadow-(--shadow-2)">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-(--brand-500)/10 text-xl text-(--brand-500)">
              !
            </div>
            <h1 className="mt-4 text-2xl font-black text-(--text-primary)">
              Attempt unavailable
            </h1>
            <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
              This mock-test attempt does not exist, is no longer available, or belongs to another
              account.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {questionsQuery.isError && (
                <button
                  type="button"
                  onClick={() => void questionsQuery.refetch()}
                  className="rounded-md border border-(--border-subtle) bg-(--surface-elevated) px-4 py-2.5 text-sm font-bold text-(--text-primary)"
                >
                  Try again
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(ROUTES.mockTests, { replace: true })}
                className="rounded-md bg-(--brand-500) px-4 py-2.5 text-sm font-bold text-white"
              >
                Back to mock tests
              </button>
            </div>
          </section>
        </main>
      </AppShellBoundary>
    );
  }

  return (
    <AppShellBoundary
      showSidebar={false}
      withTopBar={false}
      withFooter={false}
      className="bg-(--surface-sunken)"
    >
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
        <MockTestAttemptHeader
          timerDisplay={timerDisplay}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          questions={questions}
          answers={answers}
          flagged={flagged}
          visited={visited}
          isFinishing={isFinishing}
          canFinish={Boolean(attemptId && questions.length)}
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
                    className="h-48 animate-pulse rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
                  />
                ))}
              </div>
            ) : questionsQuery.isError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-600 dark:text-red-300">
                Failed to load attempt questions.
              </div>
            ) : !question ? (
              <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 text-(--text-secondary) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)">
                No questions found for this attempt.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
                    <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.13em] text-(--text-secondary) dark:text-(--text-secondary)">
                      Question {currentIndex + 1} of {totalQuestions}
                      {question.type && ` · ${question.type.replace('_', ' ')}`}
                      {question.points && ` · ${question.points} pts`}
                    </div>

                    <h2 className="font-ui text-[26px] font-black leading-snug text-(--text-primary) max-[640px]:text-[22px] dark:text-(--text-primary)">
                      {question.question}
                    </h2>

                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="mt-3 text-xs font-semibold text-(--text-secondary) underline-offset-4 hover:text-(--brand-500) hover:underline"
                    >
                      Report a problem with this question
                    </button>

                    {isCoding && question.coding && (
                      <div className="mt-5 rounded-md border border-(--border-subtle) bg-(--surface-canvas) p-5 dark:border-(--border-subtle) dark:bg-(--surface-elevated)">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
                            Sample test cases
                          </p>

                          <span className="rounded-full border border-(--border-subtle) bg-(--surface-card) px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-secondary)">
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
                                className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3 font-mono text-[12px] leading-relaxed dark:border-(--border-subtle) dark:bg-(--surface-canvas)"
                              >
                                <div className="text-(--text-secondary) dark:text-(--text-secondary)">
                                  <span className="font-semibold text-(--brand-500) dark:text-(--brand-500)">
                                    Input:
                                  </span>{' '}
                                  {formatJsonValue(testCase.input)}
                                </div>

                                <div className="mt-1 text-(--text-secondary) dark:text-(--text-secondary)">
                                  <span className="font-semibold text-(--brand-500) dark:text-(--brand-500)">
                                    Expected:
                                  </span>{' '}
                                  {formatJsonValue(testCase.expectedOutput)}
                                </div>

                                {testCase.explanation && (
                                  <div className="mt-1 text-(--text-secondary) dark:text-(--text-secondary)">
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
                          className="mt-5 w-full resize-y rounded-xl border border-(--border-subtle) bg-(--surface-canvas) p-4 font-mono text-sm text-(--text-primary) outline-none transition placeholder:text-[#9b8f87] focus:border-(--brand-500) focus:bg-(--surface-card) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary) dark:placeholder:text-[#6b6560] dark:focus:border-(--brand-500)"
                          placeholder="Type your answer…"
                        />

                        <button
                          type="button"
                          onClick={submitAnswer}
                          disabled={!answers[question._id]?.trim() || isSubmitting}
                          className="mt-4 rounded-md border border-(--border-subtle) bg-(--surface-canvas) px-5 py-2.5 text-sm font-bold text-(--text-primary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:bg-white/8 dark:text-(--text-primary) dark:hover:bg-white/12"
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
                        compilerExpanded && 'fixed inset-4 z-50 overflow-y-auto bg-[#111]'
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
                            onClick={() => setCompilerExpanded((value) => !value)}
                            className="rounded-md border border-white/10 bg-[#1e1e1e] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#888] transition hover:bg-[#2a2a2a] hover:text-[#d4d4d4]"
                          >
                            {compilerExpanded ? '⊡ Minimize' : '⛶ Maximize'}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
                              Mock Test Compiler
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#888]">
                              <span>📄 {selectedLanguage.fileName}</span>
                              <span>·</span>
                              <span>{selectedLanguage.label}</span>
                            </div>
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
                      </div>

                      <div className="flex min-h-80 bg-[#111] py-4 font-mono text-[14px] text-[#d4d4d4]">
                        <div className="select-none px-4 text-right leading-[1.6] text-[#555]">
                          {Array.from({ length: lineCount }).map((_, index) => (
                            <div key={index}>{index + 1}</div>
                          ))}
                        </div>

                        <textarea
                          value={currentCode}
                          onChange={(event) => handleCodeChange(event.target.value)}
                          spellCheck={false}
                          className="min-h-80 flex-1 resize-none bg-transparent pr-4 font-mono text-[14px] leading-[1.6] text-[#d4d4d4] outline-none"
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
                              disabled={isSubmittingCode || !currentCode.trim()}
                              onClick={submitCode}
                              className="inline-flex items-center gap-1.5 rounded-md border border-(--brand-500)/40 bg-(--brand-500) px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-50"
                            >
                              ✓ {isSubmittingCode ? 'Submitting' : 'Submit Code'}
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

                          <pre className="mt-4 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0a0a0a] p-4 font-mono text-[12px] leading-[1.8] text-[#aaa]">
                            {buildCompilerOutput(currentCodeResult)}
                          </pre>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#888]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
                            Test case results
                          </div>

                          {!currentCodeResult ? (
                            <div className="rounded-xl border border-dashed border-white/10 bg-[#111] p-5 text-center text-[12px] text-[#888]">
                              Run or submit your code to see test case results.
                            </div>
                          ) : (
                            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                              {currentCodeResult.testCases.map((testCase) => (
                                <div
                                  key={testCase.index}
                                  className={cn(
                                    'rounded-xl border p-3 font-mono text-[11.5px]',
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
                                      {testCase.passed ? 'Passed' : 'Failed'}
                                    </span>

                                    <span className="text-[#777]">
                                      Case {testCase.index + 1}
                                      {testCase.isHidden ? ' · hidden' : ''}
                                    </span>
                                  </div>

                                  {!testCase.isHidden && (
                                    <>
                                      <div className="text-[#aaa]">
                                        Input: {formatJsonValue(testCase.input)}
                                      </div>

                                      <div className="mt-1 text-[#aaa]">
                                        Expected: {formatJsonValue(testCase.expectedOutput)}
                                      </div>
                                    </>
                                  )}

                                  <div className="mt-1 text-[#aaa]">
                                    Actual: {formatJsonValue(testCase.actualOutput)}
                                  </div>

                                  {testCase.error && (
                                    <div className="mt-2 text-[#ff9b8a]">
                                      Error: {testCase.error}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-4">
                  {isMCQ && (
                    <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
                      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
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
                        {question.type.replace('_', ' ')} · {question.points} pts
                      </p>

                      <div className="flex flex-col gap-2">
                        {question.options!.map((option, i) => {
                          const selected = answers[question._id] === option;

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
                                  ? 'border-(--brand-500) bg-[rgba(184,76,43,0.08)] dark:border-(--brand-500) dark:bg-(--brand-500)/8'
                                  : 'border-(--border-subtle) bg-(--surface-canvas) hover:border-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:hover:border-white/20'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7px] border font-mono text-[11px] transition',
                                  selected
                                    ? 'border-(--brand-500) bg-(--brand-500) text-white dark:border-(--brand-500) dark:bg-(--brand-500)'
                                    : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) dark:border-white/16 dark:bg-(--surface-card) dark:text-(--text-secondary)'
                                )}
                              >
                                {['A', 'B', 'C', 'D'][i]}
                              </span>

                              <span className="text-[13px] text-(--text-primary) dark:text-(--text-primary)">
                                {option}
                              </span>

                              {selected && (
                                <span className="ml-auto">
                                  <CheckCircleIcon />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={submitAnswer}
                        disabled={!answers[question._id] || isSubmitting}
                        className="mt-4 rounded-md border border-(--border-subtle) bg-(--surface-canvas) px-5 py-2.5 text-sm font-bold text-(--text-primary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:bg-white/8 dark:text-(--text-primary) dark:hover:bg-white/12"
                      >
                        {isSubmitting ? 'Saving…' : 'Save answer'}
                      </button>
                    </div>
                  )}

                  <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
                      Self-Confidence Level
                    </p>

                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((level) => {
                        const active = confidence[currentIndex] === level;

                        const activeColor =
                          level === 'high'
                            ? 'border-[var(--success)] bg-[rgba(45,106,71,0.08)] text-[var(--success)] dark:border-[#6fcb8a] dark:bg-[#6fcb8a]/8 dark:text-[#6fcb8a]'
                            : level === 'medium'
                              ? 'border-[var(--warning)] bg-[rgba(201,128,0,0.08)] text-[var(--warning)] dark:border-[#f0c060] dark:bg-[#f0c060]/8 dark:text-[#f0c060]'
                              : 'border-[var(--brand-500)] bg-[rgba(184,76,43,0.08)] text-[var(--brand-500)] dark:border-[var(--brand-500)] dark:bg-[var(--brand-500)]/8 dark:text-[var(--brand-500)]';

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
                              'flex-1 rounded-sm border py-2 font-ui text-[11px] font-bold uppercase tracking-[0.06em] transition',
                              active
                                ? activeColor
                                : 'border-(--border-subtle) bg-(--surface-canvas) text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-secondary) dark:hover:border-white/20 dark:hover:text-[#f2f0eb]'
                            )}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.05)] p-5 dark:border-(--brand-500)/20 dark:bg-(--brand-500)/5"
                    style={{ borderLeft: '3px solid var(--brand-500)' }}
                  >
                    <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--brand-500)">
                      <HintIcon />
                      Hint
                    </p>

                    <p className="text-[12.5px] italic leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
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
        <Modal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          preventClose={reportMutation.isPending}
          ariaLabel="Report a mock test question"
        >
          <h2 className="text-lg font-bold">Report a problem</h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            This creates a moderation report. Use the Flag button only to mark a question for review
            during your attempt.
          </p>
          <label className="mt-5 block text-sm font-semibold">
            Problem type
            <select
              value={reportReason}
              onChange={(event) =>
                setReportReason(event.target.value as MockTestQuestionIssueReason)
              }
              className="mt-2 w-full rounded-lg border border-(--border-subtle) bg-(--surface-card) p-3"
            >
              <option value="incorrect_answer">Incorrect answer</option>
              <option value="ambiguous_question">Ambiguous question</option>
              <option value="duplicate_question">Duplicate question</option>
              <option value="broken_code_or_test_case">Broken code or test case</option>
              <option value="formatting_problem">Formatting problem</option>
              <option value="unsafe_or_offensive">Unsafe or offensive content</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="mt-4 block text-sm font-semibold">
            What should the moderation team know? <span className="font-normal">(optional)</span>
            <textarea
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              maxLength={1500}
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-(--border-subtle) bg-(--surface-card) p-3"
              placeholder="Describe what looks wrong…"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              disabled={reportMutation.isPending}
              className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitQuestionReport}
              disabled={reportMutation.isPending}
              className="rounded-lg bg-(--brand-500) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {reportMutation.isPending ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </Modal>
      </div>
    </AppShellBoundary>
  );
}
