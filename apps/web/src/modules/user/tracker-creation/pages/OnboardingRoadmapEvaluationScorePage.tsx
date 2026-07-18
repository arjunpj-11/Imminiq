import { Link, useParams } from 'react-router-dom';

import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useAddMissingEvaluationTopic } from '../../trackers';
import { OnboardingWorkflowHeader } from '../components/OnboardingWorkflowLayout';
import { useRoadmapEvaluationResult } from '../hooks/useRoadmapEvaluationResult';
import type { MissingRoadmapTopic } from '../hooks/useRoadmapEvaluationResult';
import { cn } from '../utils/cn';

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.8 4.7L19 9.5l-5.2 1.8L12 16l-1.8-4.7L5 9.5l5.2-1.8L12 3z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
  </svg>
);

export default function OnboardingRoadmapEvaluationScorePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { data, isLoading, error } = useRoadmapEvaluationResult(jobId);
  const addMissingTopic = useAddMissingEvaluationTopic();
  const evaluation = data?.data?.evaluation;
  const trackerId = data?.data?.trackerId;

  const handleAddMissingTopic = async (topicIndex: number) => {
    if (!trackerId || !jobId) return;

    await addMissingTopic.mutateAsync({
      trackerId,
      evaluationJobId: jobId,
      topicIndex,
    });
  };

  return (
    <div className="min-h-screen bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
      <OnboardingWorkflowHeader label="Evaluation Report" />

      <main className="mx-auto flex w-full max-w-280 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        {isLoading ? (
          <div className="flex min-h-125 items-center justify-center rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-6 text-center shadow-[0_18px_55px_rgba(26,23,20,0.07)] dark:border-white/15">
            <div className="flex flex-col items-center">
              <div className="mb-5 h-12 w-12 animate-spin rounded-full border-2 border-(--border-subtle) border-t-(--brand-500)" />
              <p className="font-serif text-[24px] font-black">Loading AI evaluation report</p>
              <p className="mt-2 text-[12.5px] leading-6 text-(--text-secondary)">Preparing the score, summary, and recommended roadmap additions.</p>
            </div>
          </div>
        ) : error || !evaluation ? (
          <div className="flex min-h-105 items-center justify-center rounded-3xl border border-red-300 bg-red-50 p-6 text-center dark:border-red-400/30 dark:bg-red-400/10">
            <div>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300 text-xl font-black text-red-600">!</span>
              <h1 className="mt-4 font-serif text-[26px] font-black text-red-700 dark:text-red-300">Evaluation result unavailable</h1>
              <p className="mt-3 max-w-130 text-[13px] leading-6 text-red-600 dark:text-red-200">{error?.message || 'The final roadmap evaluation could not be loaded.'}</p>
            </div>
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-[rgba(184,76,43,0.18)] bg-[linear-gradient(135deg,#1a1714,#211b18)] px-5 py-8 text-[#fdf8f5] shadow-[0_24px_70px_rgba(26,23,20,0.17)] dark:border-[rgba(232,129,106,0.18)] dark:bg-[linear-gradient(135deg,#0f0e0c,#171310)] sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.28)_0%,transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.13)_0%,transparent_72%)]" />

              <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.34)] bg-[rgba(184,76,43,0.18)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                    <SparkIcon />
                    AI tracker analysis complete
                  </div>
                  <h1 className="mt-4 max-w-200 font-serif text-[clamp(30px,5vw,48px)] font-black leading-[1.05] tracking-[-1.2px]">Your roadmap quality report is ready</h1>
                  <p className="mt-3 max-w-170 text-[13.5px] leading-7 text-[#f2f0eb]/70">The score reflects coverage, depth, structure, and how well the roadmap supports your intended learning outcome.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center backdrop-blur">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-[#f2f0eb]/45">Score</span>
                    <span className="mt-1 block font-serif text-[40px] font-black leading-none text-(--warning)">{evaluation.score}</span>
                    <span className="mt-1 block text-[10px] font-bold text-[#f2f0eb]/55">out of 100</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center backdrop-blur">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-[#f2f0eb]/45">Grade</span>
                    <span className="mt-2 block font-serif text-[36px] font-black leading-none text-[#fdf8f5]">{evaluation.grade}</span>
                    <span className="mt-2 block text-[10px] font-bold text-[#f2f0eb]/55">quality band</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-[0_16px_48px_rgba(26,23,20,0.06)] dark:border-white/15">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">Overall score</p>
                <div className="mt-5 flex justify-center">
                  <div
                    className="relative flex h-55 w-55 items-center justify-center rounded-full p-3"
                    style={{ background: `conic-gradient(var(--brand-500) ${evaluation.score * 3.6}deg, rgba(184,76,43,0.12) 0deg)` }}
                    role="img"
                    aria-label={`Roadmap score ${evaluation.score} out of 100`}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-(--surface-card)">
                      <div className="text-center">
                        <div className="font-serif text-[64px] font-black leading-none text-(--brand-500)">{evaluation.score}</div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-(--text-secondary)">Score / 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-(--surface-canvas)/60 px-4 py-3 dark:bg-(--surface-canvas)/40">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-(--text-secondary)">Evaluation grade</span>
                  <span className="rounded-lg bg-(--brand-500) px-2.5 py-1 text-[12px] font-black text-white dark:text-[#141412]">{evaluation.grade}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-[0_16px_48px_rgba(26,23,20,0.06)] dark:border-white/15 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] text-(--brand-500)"><SparkIcon /></span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">Evaluation summary</p>
                    <h2 className="mt-1 font-serif text-[25px] font-black tracking-[-0.5px]">What the analysis found</h2>
                  </div>
                </div>
                <p className="mt-5 text-[14px] leading-7 text-(--text-secondary)">{evaluation.summary}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Coverage review', 'Topic and subtopic completeness checked'],
                    ['Depth review', 'Learning progression and detail assessed'],
                    ['Readiness review', 'Practical usefulness evaluated'],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-(--border-subtle) bg-(--surface-canvas)/50 p-4 dark:border-white/10 dark:bg-(--surface-canvas)/35">
                      <p className="text-[11px] font-black text-(--text-primary)">{title}</p>
                      <p className="mt-1 text-[10.5px] leading-5 text-(--text-secondary)">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_16px_48px_rgba(26,23,20,0.06)] dark:border-white/15 sm:p-7">
              <div className="flex flex-col gap-3 border-b border-(--border-subtle) pb-5 dark:border-white/15 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">Coverage gaps</p>
                  <h2 className="mt-1 font-serif text-[clamp(22px,4vw,29px)] font-black tracking-[-0.55px]">Recommended additions</h2>
                  <p className="mt-2 max-w-170 text-[12.5px] leading-6 text-(--text-secondary)">Review each suggestion before adding it. Only approved topics are inserted into your tracker.</p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--brand-500)">{evaluation.missingTopics.length} additions</span>
              </div>

              {addMissingTopic.error ? (
                <div className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                  {getUserFacingError(addMissingTopic.error, 'Unable to add this topic. Please try again.')}
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                {evaluation.missingTopics.length ? (
                  evaluation.missingTopics.map((topic, index) => (
                    <MissingTopicCard
                      key={`${topic.title}-${index}`}
                      topic={topic}
                      isAdding={addMissingTopic.isPending && addMissingTopic.variables?.topicIndex === index}
                      onAdd={() => handleAddMissingTopic(index)}
                    />
                  ))
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-[rgba(76,175,125,0.24)] bg-[rgba(76,175,125,0.08)] p-5 text-[13px] leading-6 text-[#3c8b64] dark:text-(--success)">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--success) text-white"><CheckIcon /></span>
                    <div><p className="font-black">Coverage looks strong</p><p className="mt-1 opacity-85">The analysis did not find any credible missing topic. Your tracker remains current and well structured.</p></div>
                  </div>
                )}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-[rgba(184,76,43,0.20)] bg-[linear-gradient(145deg,var(--surface-card),rgba(184,76,43,0.08))] px-6 py-8 text-center shadow-[0_16px_48px_rgba(184,76,43,0.08)] dark:border-[rgba(232,129,106,0.22)] dark:bg-[linear-gradient(145deg,var(--surface-card),rgba(232,129,106,0.08))] sm:px-8 sm:py-9">
              <div className="pointer-events-none absolute -bottom-24 left-1/2 h-55 w-105 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.14)_0%,transparent_72%)]" />
              <div className="relative mx-auto flex max-w-170 flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--success) text-white shadow-[0_8px_22px_rgba(76,175,125,0.20)]"><CheckIcon /></div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">Tracker review complete</p>
                <h2 className="mt-2 font-serif text-[clamp(24px,4vw,32px)] font-black tracking-[-0.6px]">Continue from your dashboard</h2>
                <p className="mt-3 max-w-145 text-[13px] leading-6 text-(--text-secondary)">Your tracker has been reviewed and includes every topic you chose to add.</p>
                <Link to={ROUTES.dashboard} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-6 py-3.5 text-[13px] font-black text-white shadow-[0_10px_28px_rgba(184,76,43,0.22)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) dark:text-[#141412]">Go to dashboard <ArrowRightIcon /></Link>
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
    <article className="rounded-2xl border border-(--border-subtle) bg-(--surface-canvas)/50 p-4 transition hover:border-[rgba(184,76,43,0.24)] hover:shadow-[0_10px_30px_rgba(26,23,20,0.05)] dark:border-white/15 dark:bg-(--surface-canvas)/35 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] text-(--brand-500)"><SparkIcon /></span>
            <h3 className="font-serif text-[20px] font-black tracking-[-0.35px] text-(--text-primary)">{topic.title}</h3>
            <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-(--brand-500)">Suggested addition</span>
          </div>

          <p className="mt-3 text-[13px] leading-6 text-(--text-secondary)">{topic.description}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3.5 dark:border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-(--text-secondary)">Why add this</p>
              <p className="mt-1.5 text-[12px] leading-5 text-(--text-secondary)">{topic.reason}</p>
            </div>
            <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3.5 dark:border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-(--text-secondary)">Suggested placement</p>
              <p className="mt-1.5 text-[12px] font-black leading-5 text-(--brand-500)">{topic.suggestedParentTitle}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isAdding}
          className={cn(
            'inline-flex min-w-28 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-black transition',
            isAdded
              ? 'cursor-default bg-[rgba(76,175,125,0.14)] text-[#3c8b64] dark:bg-[rgba(92,201,138,0.16)] dark:text-(--success)'
              : 'bg-(--brand-500) text-white shadow-[0_7px_20px_rgba(184,76,43,0.18)] hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:text-[#141412]'
          )}
        >
          {isAdded ? <><CheckIcon /> Added</> : isAdding ? 'Adding…' : <><PlusIcon /> Add topic</>}
        </button>
      </div>
    </article>
  );
}
