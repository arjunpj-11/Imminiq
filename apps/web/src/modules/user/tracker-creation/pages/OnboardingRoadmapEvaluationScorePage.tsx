import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../../../routes/config/route-paths';

import { useRoadmapEvaluationResult } from '../hooks/useRoadmapEvaluationResult';
import type { MissingRoadmapTopic } from '../hooks/useRoadmapEvaluationResult';
import { useAddMissingEvaluationTopic } from '../../trackers';
import OnboardingBrandLink from '../components/OnboardingBrandLink';
import { cn } from '../utils/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';

const PlusIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

const CheckIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

const ArrowRightIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
};

export default function OnboardingRoadmapEvaluationScorePage() {
  const { jobId } = useParams<{ jobId: string }>();

  const { data, isLoading, error } = useRoadmapEvaluationResult(jobId);

  const addMissingTopic = useAddMissingEvaluationTopic();

  const evaluation = data?.data?.evaluation;
  const trackerId = data?.data?.trackerId;

  const handleAddMissingTopic = async (topicIndex: number) => {
    if (!trackerId || !jobId) {
      return;
    }

    await addMissingTopic.mutateAsync({
      trackerId,
      evaluationJobId: jobId,
      topicIndex,
    });
  };

  return (
    <div className="min-h-screen bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary) dark:bg-(--surface-canvas) dark:text-(--text-primary)">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-(--border-subtle) bg-(--surface-canvas)/95 px-5 backdrop-blur-xl dark:border-white/15 dark:bg-(--surface-canvas)/95 sm:px-8 md:px-12">
        <OnboardingBrandLink />
      </header>

      <main className="mx-auto flex w-full max-w-280 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        {isLoading ? (
          <div className="flex min-h-130 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--surface-card) dark:border-white/15 dark:bg-(--surface-card)">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-11 w-11 animate-spin rounded-full border-2 border-transparent border-t-(--brand-500) dark:border-t-(--brand-500)" />

              <p className="font-serif text-xl font-bold">Loading AI evaluation report</p>
            </div>
          </div>
        ) : error || !evaluation ? (
          <div className="flex min-h-105 items-center justify-center rounded-xl border border-red-300 bg-red-50 p-6 text-center dark:border-red-400/30 dark:bg-red-400/10">
            <div>
              <h1 className="font-serif text-2xl font-bold text-red-700 dark:text-red-300">
                Evaluation result unavailable
              </h1>

              <p className="mt-3 max-w-130 text-sm leading-relaxed text-red-600 dark:text-red-200">
                {error?.message || 'The final roadmap evaluation could not be loaded.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-xl bg-[#1a1714] px-6 py-8 text-[#fdf8f5] dark:bg-[#0f0e0c] sm:px-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-70 w-70 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.24)_0%,transparent_72%)]" />

              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--brand-500)">
                  AI Tracker Analysis Complete
                </p>

                <h1 className="mt-2 max-w-205 font-serif text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.08] tracking-[-1px]">
                  Your tracker scored{' '}
                  <span className="text-(--warning)">{evaluation.score}/100</span>
                </h1>

                <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-[#fdf8f5]">
                  Grade: {evaluation.grade}
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 text-center dark:border-white/15 dark:bg-(--surface-card)">
                <div className="mx-auto flex h-52.5 w-52.5 items-center justify-center rounded-full border-14 border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] dark:border-[rgba(232,129,106,0.18)] dark:bg-[rgba(232,129,106,0.10)]">
                  <div>
                    <div className="font-serif text-[68px] font-extrabold leading-none text-(--brand-500) dark:text-(--brand-500)">
                      {evaluation.score}
                    </div>

                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-secondary) dark:text-(--text-secondary)">
                      Score / 100
                    </div>
                  </div>
                </div>

                <div className="mt-5 inline-flex rounded-full bg-[#1a1714] px-4 py-2 text-sm font-bold text-[#fdf8f5] dark:bg-[#f2f0eb] dark:text-[#141412]">
                  Grade: {evaluation.grade}
                </div>
              </div>

              <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 dark:border-white/15 dark:bg-(--surface-card)">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Evaluation Summary
                </p>

                <h2 className="mt-2 font-serif text-[26px] font-bold tracking-[-0.5px]">
                  What the analysis found
                </h2>

                <p className="mt-4 text-sm leading-7 text-(--text-secondary) dark:text-(--text-secondary)">
                  {evaluation.summary}
                </p>
              </div>
            </section>

            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 dark:border-white/15 dark:bg-(--surface-card) sm:p-7">
              <div className="flex flex-col gap-2 border-b border-(--border-subtle) pb-5 dark:border-white/15 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                    Coverage Gaps
                  </p>

                  <h2 className="mt-2 font-serif text-[26px] font-bold tracking-[-0.5px]">
                    Missing topics to strengthen your tracker
                  </h2>
                </div>

                <span className="inline-flex w-fit rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                  {evaluation.missingTopics.length} additions
                </span>
              </div>

              {addMissingTopic.error && (
                <div className="mt-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                  {getUserFacingError(
                    addMissingTopic.error,
                    'Unable to add this topic. Please try again.'
                  )}
                </div>
              )}

              <div className="mt-5 space-y-4">
                {evaluation.missingTopics.length ? (
                  evaluation.missingTopics.map((topic, index) => (
                    <MissingTopicCard
                      key={`${topic.title}-${index}`}
                      topic={topic}
                      isAdding={
                        addMissingTopic.isPending && addMissingTopic.variables?.topicIndex === index
                      }
                      onAdd={() => handleAddMissingTopic(index)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-[rgba(76,175,125,0.24)] bg-[rgba(76,175,125,0.08)] px-5 py-5 text-sm leading-relaxed text-[#3c8b64] dark:text-(--success)">
                    The analysis did not find any credible missing topic. Your tracker remains current
                    and its coverage looks strong.
                  </div>
                )}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-6 py-7 text-center shadow-[0_4px_24px_rgba(26,23,20,0.06)] dark:border-white/15 dark:bg-(--surface-card) dark:shadow-[0_8px_40px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -bottom-24 left-1/2 h-55 w-105 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.13)_0%,transparent_72%)]" />

              <div className="relative mx-auto flex max-w-170 flex-col items-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(76,175,125,0.24)] bg-[rgba(76,175,125,0.10)] text-[#3c8b64] dark:border-[rgba(92,201,138,0.24)] dark:bg-[rgba(92,201,138,0.12)] dark:text-(--success)">
                  <CheckIcon />
                </div>

                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Tracker review complete
                </p>

                <h2 className="mt-2 font-serif text-[clamp(24px,4vw,30px)] font-bold tracking-[-0.5px] text-(--text-primary) dark:text-(--text-primary)">
                  Ready to continue from your dashboard
                </h2>

                <p className="mt-3 max-w-145 text-sm leading-7 text-(--text-secondary) dark:text-(--text-secondary)">
                  Your tracker has been reviewed and improved with the topics you chose to add.
                </p>

                <Link
                  to={ROUTES.dashboard}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-6 py-3.5 text-sm font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_8px_24px_rgba(184,76,43,0.24)] active:translate-y-0 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
                >
                  Go to Dashboard
                  <ArrowRightIcon />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MissingTopicCard({
  topic,
  onAdd,
  isAdding,
}: {
  topic: MissingRoadmapTopic;
  onAdd: () => void;
  isAdding: boolean;
}) {
  const isAdded = Boolean(topic.isAdded) || Boolean(topic.addedSubtopicId);

  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--surface-canvas)/55 p-5 dark:border-white/15 dark:bg-(--surface-canvas)/45">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[20px] font-bold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
              {topic.title}
            </h3>

            <span className="inline-flex rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              Suggested addition
            </span>
          </div>

          <p className="mt-3 text-[13.5px] leading-6 text-(--text-secondary) dark:text-(--text-secondary)">
            {topic.description}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3 dark:border-white/15 dark:bg-(--surface-card)">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                Why add this
              </p>

              <p className="mt-1.5 text-[12.5px] leading-5 text-(--text-secondary) dark:text-(--text-secondary)">
                {topic.reason}
              </p>
            </div>

            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3 dark:border-white/15 dark:bg-(--surface-card)">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                Suggested placement
              </p>

              <p className="mt-1.5 text-[12.5px] font-semibold leading-5 text-(--brand-500) dark:text-(--brand-500)">
                {topic.suggestedParentTitle}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isAdding}
          className={cn(
            'inline-flex h-fit shrink-0 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition',
            isAdded
              ? 'cursor-default bg-[rgba(76,175,125,0.14)] text-[#3c8b64] dark:bg-[rgba(92,201,138,0.16)] dark:text-(--success)'
              : 'bg-(--brand-500) text-[#fdf8f5] hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_6px_20px_rgba(184,76,43,0.24)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)'
          )}
        >
          {isAdded ? (
            <>
              <CheckIcon />
              Added
            </>
          ) : isAdding ? (
            'Adding...'
          ) : (
            <>
              <PlusIcon />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
