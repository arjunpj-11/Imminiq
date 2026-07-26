import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageHero from '../../../../components/layout/PageHero';
import EmptyState from '../../../../components/feedback/EmptyState';
import ErrorState from '../../../../components/feedback/ErrorState';
import Pagination from '../../../../components/navigation/Pagination';

import GenerateMockTestModal from '../components/GenerateMockTestModal';
import MockTestRow from '../components/MockTestRow';
import MockTestStatsGrid from '../components/MockTestStatsGrid';
import { StatCardSkeleton, TestRowSkeleton } from '../components/MockTestSkeletons';
import { TrophyIcon } from '../components/MockTestIcons';

import {
  useActiveMockTestGeneration,
  useImportSharedMockTest,
  useMockTestAIInsights,
  useMockTestTopicBreakdown,
  useMockTests,
  useShareMockTest,
  useStartMockTestAttempt,
} from '../hooks/useMockTests';

import type { IMockTest } from '../types/mock-tests.types';
import { AdaptiveExamPanel } from '../../adaptive-learning';

const EMPTY_TESTS: IMockTest[] = [];
const TESTS_PER_PAGE = 6;

const SparklesSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
      fill="currentColor"
    />
    <path
      d="M5 15L5.74 18.26L9 19L5.74 19.74L5 23L4.26 19.74L1 19L4.26 18.26L5 15Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

export default function MockTestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const requestedPage = Number(searchParams.get('page'));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [shareToken, setShareToken] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [importToken, setImportToken] = useState('');
  const [importMessage, setImportMessage] = useState('');

  const testsQuery = useMockTests(currentPage, TESTS_PER_PAGE);
  const activeGenerationQuery = useActiveMockTestGeneration();
  const generationBlocked = Boolean(activeGenerationQuery.data);
  const aiInsightsQuery = useMockTestAIInsights();
  const topicBreakdownQuery = useMockTestTopicBreakdown();
  const startMutation = useStartMockTestAttempt();
  const shareMutation = useShareMockTest();
  const importMutation = useImportSharedMockTest();

  const tests = testsQuery.data?.tests ?? EMPTY_TESTS;
  const pagination = testsQuery.data?.pagination;

  const totalItems = pagination?.totalItems ?? testsQuery.data?.summary?.totalTests ?? tests.length;

  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(totalItems / TESTS_PER_PAGE));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * TESTS_PER_PAGE + 1;

  const endItem = Math.min(currentPage * TESTS_PER_PAGE, totalItems);

  const weakestTopic = topicBreakdownQuery.data?.[0];

  const aiInsight =
    aiInsightsQuery.data?.insight || 'Complete more tests to unlock personalized insights.';

  const startTest = async (testId: string) => {
    const response = await startMutation.mutateAsync(testId);
    const data = response.data;

    navigate(`/mock-tests/attempts/${data.attempt._id}`, {
      state: data,
    });
  };

  const shareTest = async (testId: string) => {
    try {
      setShareMessage('');
      setShareToken('');

      const response = await shareMutation.mutateAsync(testId);

      setShareToken(response.data.shareToken);
      setShareMessage('Share token generated');
    } catch {
      setShareMessage('Failed to generate share token');
    }
  };

  const copyShareToken = async () => {
    if (!shareToken) return;

    try {
      await navigator.clipboard.writeText(shareToken);
      setShareMessage('Token copied');
    } catch {
      setShareMessage('Copy failed. Select and copy the token manually.');
    }
  };

  const importSharedTest = async () => {
    const token = importToken.trim();

    if (!token) {
      setImportMessage('Enter a share token first');
      return;
    }

    try {
      setImportMessage('Importing test...');

      const response = await importMutation.mutateAsync(token);
      const importedTest = response.data.test;

      setImportToken('');
      setImportMessage(
        response.data.alreadyImported
          ? 'Already imported. Opening test...'
          : 'Test imported successfully'
      );

      window.setTimeout(() => {
        navigate(`/mock-tests/${importedTest._id}`);
      }, 500);
    } catch {
      setImportMessage('Invalid token or failed to import test');
    }
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    const nextParams = new URLSearchParams(searchParams);

    if (nextPage === 1) nextParams.delete('page');
    else nextParams.set('page', String(nextPage));

    setSearchParams(nextParams, { replace: false });
  };

  return (
    <AppShellBoundary>
      <GenerateMockTestModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        generationBlocked={generationBlocked}
      />

      <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
        <PageHero
          eyebrow="Assessment studio"
          title={
            <>
              Practice <span className="text-(--brand-500)">under pressure</span>
            </>
          }
          description="Generate focused assessments from your learning paths, test recall under realistic timing, and turn every result into a smarter next step."
          actions={
            <button
              type="button"
              onClick={() => {
                if (!generationBlocked) setGenerateModalOpen(true);
              }}
              disabled={generationBlocked || activeGenerationQuery.isLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--brand-500) px-5 font-ui text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 dark:text-[#141412]"
            >
              <SparklesSmall />
              {generationBlocked ? 'Test generating…' : 'Generate test'}
            </button>
          }
          aside={
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                Adaptive mode
              </div>
              <div className="mt-3 font-ui text-[24px] font-extrabold text-(--text-primary)">
                {generationBlocked ? 'Generation active' : 'Ready to test'}
              </div>
              <p className="mt-2 text-[12px] leading-5 text-(--text-secondary)">
                Questions adjust to your roadmap, level, and recent weak areas.
              </p>
            </div>
          }
        />

        <AdaptiveExamPanel />

        {testsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <MockTestStatsGrid
            summary={
              testsQuery.data?.summary || {
                totalTests: 0,
                completedAttempts: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                passedAttempts: 0,
              }
            }
          />
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* ── Share token card ── */}
          <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--brand-500) dark:text-(--brand-500)">
              Share token
            </div>

            <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
              Click Share on any test to generate a token.
            </p>

            {/*
              Always rendered — visibility:hidden keeps height stable so the
              card never changes size when the token appears/disappears.
              \u00A0 (non-breaking space) prevents the text node from
              collapsing to zero height while invisible.
            */}
            <div
              className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
              style={{ visibility: shareToken ? 'visible' : 'hidden' }}
            >
              <div className="min-w-0 flex-1 select-all rounded-xl border border-(--border-subtle) bg-white/40 px-3 py-2 font-mono text-[11px] text-(--text-primary) dark:border-(--border-subtle) dark:bg-black/10 dark:text-(--text-primary)">
                {shareToken || '\u00A0'}
              </div>

              <button
                type="button"
                onClick={copyShareToken}
                className="rounded-xl bg-(--brand-500) px-4 py-2 text-[12px] font-bold text-white transition hover:bg-(--brand-600) dark:bg-(--brand-500) dark:hover:bg-[#d9522d]"
              >
                Copy
              </button>
            </div>

            <p
              className="mt-2 text-[12px] font-bold text-(--brand-500) dark:text-(--brand-500)"
              style={{ visibility: shareMessage ? 'visible' : 'hidden' }}
            >
              {shareMessage || '\u00A0'}
            </p>
          </div>

          {/* ── Import shared test card ── */}
          <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--brand-500) dark:text-(--brand-500)">
              Import shared test
            </div>

            <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
              Paste a token from another account to add that mock test to your list.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={importToken}
                onChange={(event) => setImportToken(event.target.value)}
                placeholder="Paste share token"
                className="min-w-0 flex-1 rounded-xl border border-(--border-subtle) bg-white/40 px-3 py-2 text-[12px] font-semibold text-(--text-primary) outline-none transition placeholder:text-[#9b8f86] focus:border-(--brand-500) dark:border-(--border-subtle) dark:bg-black/10 dark:text-(--text-primary) dark:placeholder:text-[#6b6560]"
              />

              <button
                type="button"
                disabled={importMutation.isPending}
                onClick={importSharedTest}
                className="rounded-xl bg-(--brand-500) px-4 py-2 text-[12px] font-bold text-white transition hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--brand-500) dark:hover:bg-[#d9522d]"
              >
                {importMutation.isPending ? 'Importing...' : 'Import'}
              </button>
            </div>

            {importMessage ? (
              <p className="mt-2 text-[12px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                {importMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div>
                <h2 className="font-ui text-[18px] font-black text-(--text-primary) dark:text-(--text-primary)">
                  All mock tests
                </h2>

                <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-[#6b6560]">
                  {testsQuery.isLoading
                    ? 'Loading your tests...'
                    : totalItems
                      ? `Showing ${startItem}-${endItem} of ${totalItems} tests`
                      : 'No tests created yet'}
                </p>
              </div>

              {testsQuery.isFetching && !testsQuery.isLoading ? (
                <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[8.5px] uppercase tracking-widest text-(--brand-500) dark:border-(--brand-500)/25 dark:bg-(--brand-500)/10 dark:text-(--brand-500)">
                  Updating
                </span>
              ) : null}
            </div>

            {testsQuery.isLoading ? (
              <div className="space-y-3">
                <TestRowSkeleton />
                <TestRowSkeleton />
                <TestRowSkeleton />
              </div>
            ) : testsQuery.isError ? (
              <ErrorState
                title="Failed to load mock tests"
                description="Your mock tests could not be loaded. Please try again."
                onRetry={() => void testsQuery.refetch()}
              />
            ) : tests.length ? (
              <>
                <div className="space-y-3">
                  {tests.map((test) => (
                    <MockTestRow
                      key={test._id}
                      test={test}
                      onOpen={() => navigate(`/mock-tests/${test._id}`)}
                      onShare={() => shareTest(test._id)}
                      onStart={() => startTest(test._id)}
                    />
                  ))}
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  showPageNumbers
                  onPageChange={goToPage}
                  disabled={testsQuery.isFetching}
                  previousLabel="Prev"
                  className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
                />
              </>
            ) : (
              <EmptyState
                title="No mock tests found"
                description="Generate your first test or create one manually."
              />
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div className="mb-2 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                <span className="text-(--brand-500) dark:text-(--brand-500)">
                  <TrophyIcon />
                </span>
                AI insights
              </div>

              <h3 className="font-ui text-[17px] font-black text-(--text-primary) dark:text-(--text-primary)">
                {weakestTopic ? `Focus: ${weakestTopic.topic}` : 'Keep building consistency'}
              </h3>

              <p className="mt-3 text-[12.5px] leading-6 text-(--text-secondary) dark:text-[#6b6560]">
                {aiInsightsQuery.isLoading || topicBreakdownQuery.isLoading
                  ? 'Preparing your test insights...'
                  : aiInsight}
              </p>

              <button
                type="button"
                onClick={() => setGenerateModalOpen(true)}
                className="mt-4 w-full rounded-xl border border-[rgba(184,76,43,0.25)] bg-[rgba(184,76,43,0.08)] py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-(--brand-500) transition hover:bg-[rgba(184,76,43,0.14)] dark:border-(--brand-500)/25 dark:bg-(--brand-500)/8 dark:text-(--brand-500) dark:hover:bg-(--brand-500)/15"
              >
                ✦ Generate a test now
              </button>
            </div>
          </aside>
        </div>
      </div>
    </AppShellBoundary>
  );
}
