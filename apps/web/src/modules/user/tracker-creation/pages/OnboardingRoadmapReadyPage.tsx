import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../../routes/config/route-paths';

import {
  useRoadmapJobResult,
  type IRoadmapSubtopic,
  type IRoadmapTopic,
} from '../hooks/useRoadmapJobResult';
import { useRunRoadmapEvaluation } from '../hooks/useRunRoadmapEvaluation';
import { OnboardingWorkflowHeader } from '../components/OnboardingWorkflowLayout';
import type { Section } from '../types/onboarding.types';
import { cn } from '../utils/cn';
import SkeletonBlock from '../../../../components/feedback/SkeletonBlock';
import { capitalize } from '../utils/onboarding-formatters';
import { useOnboardingStore } from '../store/useOnboardingStore';

const ChevronDownIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};

const PulseIcon = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
};

const DashboardIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
};

const getChildren = (node?: IRoadmapSubtopic) => {
  return node?.children || node?.subtopics || [];
};

const countNestedSubtopics = (nodes: IRoadmapSubtopic[] = []): number => {
  return nodes.reduce((total, node) => {
    return total + 1 + countNestedSubtopics(getChildren(node));
  }, 0);
};

const buildSections = (topic?: IRoadmapTopic): Section[] => {
  if (!topic) return [];

  const directChildren = topic.children || topic.subtopics || [];

  if (!directChildren.length) {
    return [];
  }

  const groupedChildren = directChildren.filter((child) => {
    return getChildren(child).length > 0;
  });

  const leafChildren = directChildren.filter((child) => {
    return getChildren(child).length === 0;
  });

  const sections: Section[] = groupedChildren.map((child, index) => {
    return {
      id: child._id || `${topic._id}-section-${index}`,
      title: child.title || `Section ${index + 1}`,
      items: getChildren(child),
    };
  });

  if (leafChildren.length) {
    sections.unshift({
      id: `${topic._id}-core-roadmap`,
      title: groupedChildren.length ? 'Core Topics' : 'Roadmap Topics',
      items: leafChildren,
    });
  }

  return sections;
};

const flattenSectionCount = (topic?: IRoadmapTopic) => {
  return countNestedSubtopics(topic?.children || topic?.subtopics || []);
};

const SectionDifficultyBadge = ({ item }: { item: IRoadmapSubtopic }) => {
  const difficulty = item.difficulty || item.level;

  if (!difficulty) {
    return null;
  }

  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em]',
        difficulty === 'beginner' &&
          'border-[rgba(76,175,125,0.25)] bg-[rgba(76,175,125,0.10)] text-(--success) dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.12)] dark:text-(--success)',
        difficulty === 'intermediate' &&
          'border-[rgba(201,128,0,0.22)] bg-[rgba(201,128,0,0.09)] text-(--warning) dark:border-[rgba(240,168,66,0.26)] dark:bg-[rgba(240,168,66,0.12)] dark:text-(--warning)',
        difficulty === 'advanced' &&
          'border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)'
      )}
    >
      {difficulty}
    </span>
  );
};

const LoadingPanel = () => {
  return (
    <div className="w-full" role="status" aria-label="Loading generated roadmap">
      <span className="sr-only">Loading your generated roadmap…</span>
      <div aria-hidden="true">
        <div className="mb-6 rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1)">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-4 h-9 w-[min(34rem,80%)] rounded-xl" />
          <SkeletonBlock className="mt-3 h-4 w-[min(42rem,95%)]" />
          <div className="mt-6 flex gap-3">
            <SkeletonBlock className="h-9 w-28 rounded-md" />
            <SkeletonBlock className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5"
              >
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-5 w-2/5" />
                    <SkeletonBlock className="mt-2 h-3 w-4/5" />
                  </div>
                  <SkeletonBlock className="h-8 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-44 w-full rounded-2xl" />
            <SkeletonBlock className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyPanel = ({ message }: { message: string }) => {
  return (
    <div className="flex min-h-80 w-full items-center justify-center rounded-3xl border border-(--border-subtle) bg-(--surface-card) px-6 text-center shadow-[0_18px_55px_rgba(26,23,20,0.07)] dark:border-white/15 dark:bg-(--surface-card)">
      <div>
        <p className="font-serif text-[24px] font-black text-(--text-primary) dark:text-(--text-primary)">
          Roadmap result unavailable
        </p>

        <p className="mt-2 max-w-115 text-sm leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
          {message}
        </p>
      </div>
    </div>
  );
};

export default function OnboardingRoadmapReadyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const clearIntake = useOnboardingStore((state) => state.clearIntake);
  const setActiveRoadmapJobId = useOnboardingStore((state) => state.setActiveRoadmapJobId);

  const { data, isLoading, error } = useRoadmapJobResult(jobId);
  const runRoadmapEvaluation = useRunRoadmapEvaluation();

  const tracker = data?.data?.tracker;

  useEffect(() => {
    if (!tracker) return;
    clearIntake();
    setActiveRoadmapJobId(null);
  }, [clearIntake, setActiveRoadmapJobId, tracker]);

  const topics = useMemo(() => {
    return data?.data?.topics || [];
  }, [data?.data?.topics]);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, boolean>>({});
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const activeTopicId = selectedTopicId || topics[0]?._id || '';

  const activeTopic = useMemo(() => {
    return topics.find((topic) => topic._id === activeTopicId) || topics[0];
  }, [topics, activeTopicId]);

  const sections = useMemo(() => {
    return buildSections(activeTopic);
  }, [activeTopic]);

  const totalTopics = tracker?.topicsCount || topics.length;

  const totalSubtopics =
    tracker?.subtopicsCount ||
    topics.reduce((total, topic) => {
      return total + flattenSectionCount(topic);
    }, 0);

  const totalPreviewNodes = totalTopics + totalSubtopics;

  const coverageRows = useMemo(() => {
    return topics.map((topic) => {
      const count = topic.subtopicsCount || flattenSectionCount(topic);

      const percent =
        totalSubtopics > 0
          ? Math.round((count / totalSubtopics) * 100)
          : topics.length > 0
            ? Math.round(100 / topics.length)
            : 0;

      return {
        id: topic._id,
        title: topic.title,
        count,
        percent,
      };
    });
  }, [topics, totalSubtopics]);

  const aiInsight = useMemo(() => {
    const firstTopicTitle = topics[0]?.title || 'your first learning module';

    return `Your roadmap starts with ${firstTopicTitle} and expands into ${totalTopics} structured topic areas. Run AI Evaluation to let Gemini score the roadmap quality, completeness, and interview-readiness.`;
  }, [topics, totalTopics]);

  const resultError =
    error?.response?.data?.message ||
    (!jobId
      ? 'Missing roadmap generation job ID.'
      : 'Unable to fetch the generated roadmap result.');

  const toggleSection = (sectionId: string, defaultOpen: boolean) => {
    setSectionOverrides((current) => ({
      ...current,
      [sectionId]: current[sectionId] === undefined ? !defaultOpen : !current[sectionId],
    }));
  };

  const handleRunAiEvaluation = async () => {
    if (!jobId || !tracker) {
      setEvaluationError('Roadmap data is missing. Please regenerate it.');
      return;
    }

    setEvaluationError(null);

    try {
      const response = await runRoadmapEvaluation.mutateAsync(jobId);

      navigate(ROUTES.trackerCreateEvaluation(response.data.jobId));
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to evaluate roadmap right now.';

      setEvaluationError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
        <OnboardingWorkflowHeader label="Roadmap Preview" />
        <main className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <LoadingPanel />
        </main>
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
        <OnboardingWorkflowHeader label="Roadmap Preview" />
        <main className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
          <EmptyPanel message={resultError} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--surface-canvas) font-[DM_Sans,sans-serif] text-(--text-primary)">
      <OnboardingWorkflowHeader label="Roadmap Preview" />

      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-[rgba(184,76,43,0.18)] bg-[linear-gradient(135deg,#1a1714,#211b18)] px-5 py-7 text-[#fdf8f5] shadow-[0_22px_65px_rgba(26,23,20,0.16)] dark:border-[rgba(232,129,106,0.18)] dark:bg-[linear-gradient(135deg,#0f0e0c,#171310)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.24)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-80 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.12)_0%,transparent_72%)]" />

          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.34)] bg-[rgba(184,76,43,0.18)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--brand-500)" />
                Roadmap ready
              </div>

              <h1 className="mt-4 max-w-190 font-serif text-[clamp(28px,5vw,44px)] font-black leading-[1.06] tracking-[-1px]">
                {tracker.title}
              </h1>

              {tracker.description ? (
                <p className="mt-3 max-w-190 text-[13.5px] leading-7 text-[#f2f0eb]/72">
                  {tracker.description}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  tracker.field || 'AI-generated field',
                  capitalize(tracker.level),
                  capitalize(tracker.visibility || 'private'),
                ].map((label) => (
                  <span
                    key={label}
                    className="inline-flex max-w-full items-center rounded-lg border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-[#f2f0eb]/72"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-88">
              {[
                ['Topics', totalTopics],
                ['Subtopics', totalSubtopics],
                ['Nodes', totalPreviewNodes],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/6 px-3 py-4 text-center backdrop-blur"
                >
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-[#f2f0eb]/45">
                    {label}
                  </span>
                  <span className="mt-1 block font-serif text-[30px] font-black leading-none text-(--warning)">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) shadow-[0_16px_48px_rgba(26,23,20,0.07)] dark:border-white/15">
            <div className="border-b border-(--border-subtle) px-4 py-4 dark:border-white/15 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                    Roadmap structure
                  </p>
                  <h2 className="mt-1 font-serif text-[22px] font-black tracking-[-0.4px]">
                    Explore generated topics
                  </h2>
                </div>
                <span className="hidden rounded-full bg-(--surface-canvas) px-3 py-1.5 text-[10px] font-bold text-(--text-secondary) sm:inline-flex">
                  {topics.length} topic groups
                </span>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {topics.map((topic) => {
                  const active = topic._id === activeTopic?._id;
                  return (
                    <button
                      key={topic._id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic._id)}
                      className={cn(
                        'shrink-0 rounded-xl border px-3.5 py-2.5 text-[12px] font-bold transition',
                        active
                          ? 'border-(--brand-500) bg-(--brand-500) text-white shadow-[0_7px_18px_rgba(184,76,43,0.20)] dark:text-[#141412]'
                          : 'border-(--border-subtle) bg-(--surface-canvas)/55 text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-white/15'
                      )}
                    >
                      {topic.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-(--border-subtle) bg-[rgba(184,76,43,0.045)] px-4 py-5 dark:border-white/15 dark:bg-[rgba(232,129,106,0.05)] sm:px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-(--brand-500)">
                Selected topic
              </p>
              <h3 className="mt-1 font-serif text-[clamp(20px,3vw,26px)] font-black tracking-[-0.4px] text-(--text-primary)">
                {activeTopic?.title || 'Generated Topic'}
              </h3>
              <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-(--text-secondary)">
                {activeTopic?.description ||
                  'Explore the generated sections and learning nodes inside this topic.'}
              </p>
            </div>

            {sections.length ? (
              <div className="p-3 sm:p-4">
                {sections.map((section, index) => {
                  const defaultOpen = index === 0;
                  const open = sectionOverrides[section.id] ?? defaultOpen;

                  return (
                    <div
                      key={section.id}
                      className="mb-3 overflow-hidden rounded-2xl border border-(--border-subtle) last:mb-0 dark:border-white/12"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id, defaultOpen)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 bg-(--surface-canvas)/45 px-4 py-4 text-left transition hover:bg-[rgba(184,76,43,0.06)] dark:bg-(--surface-canvas)/35 dark:hover:bg-[rgba(232,129,106,0.06)] sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[13px] text-(--brand-500)">
                            ✦
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate text-[13.5px] font-black text-(--text-primary)">
                              {section.title}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-semibold text-(--text-secondary)">
                              {section.items.length} learning items
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-(--text-secondary) transition-transform',
                            open && 'rotate-180'
                          )}
                        >
                          <ChevronDownIcon />
                        </span>
                      </button>

                      {open ? (
                        <div className="space-y-1 border-t border-(--border-subtle) p-3 dark:border-white/10 sm:p-4">
                          {section.items.map((item, itemIndex) => (
                            <div
                              key={item._id || `${section.id}-${itemIndex}`}
                              className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-(--surface-canvas)/55"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-(--surface-canvas) text-[10px] font-black text-(--text-secondary)">
                                  {itemIndex + 1}
                                </span>
                                <span className="min-w-0 text-[13px] font-semibold leading-5 text-(--text-primary)">
                                  {item.title}
                                </span>
                              </div>
                              <SectionDifficultyBadge item={item} />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(184,76,43,0.08)] text-(--brand-500)">
                  ✦
                </div>
                <p className="mt-3 text-[13px] font-bold text-(--text-primary)">
                  No preview items yet
                </p>
                <p className="mt-1 text-[12px] text-(--text-secondary)">
                  This topic does not contain preview subtopics in the result payload.
                </p>
              </div>
            )}
          </div>

          <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-21">
            <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-[0_12px_36px_rgba(26,23,20,0.05)] dark:border-white/15">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                    Coverage
                  </p>
                  <h3 className="mt-1 font-serif text-[20px] font-black tracking-[-0.3px]">
                    Topic distribution
                  </h3>
                </div>
                <span className="font-serif text-[28px] font-black text-(--brand-500)">
                  {totalPreviewNodes}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {coverageRows.map((row) => (
                  <div key={row.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-bold">{row.title}</span>
                      <span className="text-[10px] font-bold text-(--text-secondary)">
                        {row.count} nodes
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-(--brand-500)"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(184,76,43,0.20)] bg-[linear-gradient(145deg,var(--surface-card),rgba(184,76,43,0.07))] p-5 dark:border-[rgba(232,129,106,0.22)] dark:bg-[linear-gradient(145deg,var(--surface-card),rgba(232,129,106,0.07))]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--brand-500) text-white dark:text-[#141412]">
                  ✦
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-(--brand-500)">
                    AI insight
                  </p>
                  <p className="text-[12px] font-black text-(--text-primary)">Before evaluation</p>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-6 text-(--text-secondary)">{aiInsight}</p>
            </div>

            <button
              type="button"
              onClick={handleRunAiEvaluation}
              disabled={runRoadmapEvaluation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-4 py-3.5 text-[13px] font-black text-white shadow-[0_10px_28px_rgba(184,76,43,0.22)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:text-[#141412]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/16 dark:bg-black/10">
                <PulseIcon />
              </span>
              {runRoadmapEvaluation.isPending ? 'Evaluating roadmap…' : 'Run AI Evaluation'}
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.dashboard)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3.5 text-[13px] font-black text-(--text-secondary) transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:text-(--brand-500) dark:border-white/15"
            >
              <DashboardIcon />
              Go to dashboard
            </button>

            {evaluationError ? (
              <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-3 text-center text-[12px] font-semibold text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300">
                {evaluationError}
              </p>
            ) : null}
          </aside>
        </section>
      </main>
    </div>
  );
}
