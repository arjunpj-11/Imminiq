import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { useRoadmapJobStatus } from '../../tracker-creation';
import { ROUTES } from '../../../../routes/config/route-paths';

export default function MockTestGeneratingPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const job = useRoadmapJobStatus(jobId);
  const status = (job.data?.data?.status || job.data?.data?.state || '').toLowerCase();
  const testId = job.data?.data?.testId;

  useEffect(() => {
    if (!['completed', 'success', 'done'].includes(status) || !testId) return;

    const timer = window.setTimeout(() => {
      navigate(`/mock-tests/${testId}`, { replace: true });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [navigate, status, testId]);

  const failed = ['failed', 'error'].includes(status);

  return (
    <AppShellBoundary>
      <main className="mx-auto mt-10 flex w-[min(760px,calc(100%-32px))] flex-col items-center pb-24 text-center">
        <section className="w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-7 shadow-(--shadow-1) sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(184,76,43,0.10)] text-2xl text-(--brand-500)">
            {failed ? '!' : '✦'}
          </div>
          <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500)">
            AI mock-test generator
          </div>
          <h1 className="mt-2 font-serif text-[34px] font-black leading-tight text-(--text-primary)">
            {failed
              ? 'Generation could not be completed'
              : status === 'completed'
                ? 'Your mock test is ready'
                : 'Creating your recommended mock test'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-(--text-secondary)">
            {failed
              ? job.data?.data?.errorMessage || 'Please return and try again.'
              : status === 'completed'
                ? 'Opening the generated test now…'
                : 'Immi is turning your learning data into a focused assessment. You can safely continue in the background.'}
          </p>

          {!failed && status !== 'completed' ? (
            <div className="mx-auto mt-7 h-2 max-w-md overflow-hidden rounded-full bg-black/8 dark:bg-white/8">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-(--brand-500)" />
            </div>
          ) : null}

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            {!failed && status !== 'completed' ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.dashboard)}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-5 py-3 text-[12px] font-bold text-(--text-primary) transition hover:border-(--brand-500)"
              >
                Continue in background
              </button>
            ) : null}
            {failed ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.learningAgent)}
                className="rounded-xl bg-(--brand-500) px-5 py-3 text-[12px] font-bold text-white"
              >
                Return to Immi
              </button>
            ) : null}
          </div>
        </section>
      </main>
    </AppShellBoundary>
  );
}
