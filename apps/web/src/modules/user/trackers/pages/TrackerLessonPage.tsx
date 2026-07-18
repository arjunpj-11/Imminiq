// apps/web/src/modules/user/trackers/pages/TrackerLessonPage.tsx
// ─── DIFF: Added LessonVisualizerCard import and placement in <aside> ─────────

import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import WidgetErrorBoundary from '../../../../components/system/WidgetErrorBoundary';
import { useTrackerLesson, useUpdateSubtopicProgress } from '../hooks/useTrackers';

import CompilerCard from '../components/lesson/CompilerCard';
import LessonChatCard from '../components/lesson/LessonChatCard';
import LessonNavigationPreview from '../components/lesson/LessonNavigationPreview';
import LessonVisualizerCard from '../components/lesson/LessonVisualizerCard'; // ← NEW
import MathText from '../components/lesson/MathText';
import ReflectionPracticeCard from '../components/lesson/ReflectionPracticeCard';
import type { LessonLocationState } from '../types/lesson.types';
import { formatLessonType } from '../utils/lesson-formatters';
import { readSavedRoadmapStack } from '../utils/roadmap.utils';

export default function TrackerLessonPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { trackerId, subtopicId } = useParams<{
    trackerId: string;
    subtopicId: string;
  }>();

  const queryClient = useQueryClient();
  const lessonQuery = useTrackerLesson(trackerId || '', subtopicId || '');
  const updateProgressMutation = useUpdateSubtopicProgress();

  const lessonData = lessonQuery.data;

  const tracker = lessonData?.tracker;
  const lessonNode = lessonData?.lessonNode;
  const generatedLesson = lessonData?.generatedLesson;

  const [optimisticCompletedId, setOptimisticCompletedId] = useState<string | null>(null);
  const isCompleted = lessonNode?.status === 'completed' || optimisticCompletedId === subtopicId;

  const codeForCompiler = useMemo(() => {
    return (
      generatedLesson?.practiceTask.starterCode ||
      generatedLesson?.codeExample.code ||
      '// Start coding here'
    );
  }, [generatedLesson]);

  const isMainLoading = lessonQuery.isLoading;

  const hasMainError = lessonQuery.isError || !trackerId || !subtopicId;

  const getReturnStack = () => {
    const state = location.state as LessonLocationState | null;
    if (state?.returnToRoadmapStack?.length) return state.returnToRoadmapStack;
    return readSavedRoadmapStack(trackerId);
  };

  const markCompleted = () => {
    if (isCompleted || !trackerId || !subtopicId || !generatedLesson) return;

    updateProgressMutation.mutate(
      {
        trackerId,
        subtopicId,
        status: 'completed',
      },
      {
        onSuccess: async () => {
          setOptimisticCompletedId(subtopicId ?? null);

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'current-roadmap'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity-intensity'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity-intensity', 6] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'activity-intensity', 12] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'heatmap'] }),
            queryClient.invalidateQueries({ queryKey: ['activity-intensity'] }),
            queryClient.invalidateQueries({ queryKey: ['trackers', 'roadmap', trackerId] }),
            queryClient.invalidateQueries({ queryKey: ['trackers', 'list'] }),
            queryClient.invalidateQueries({ queryKey: ['trackers'] }),
            queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] }),
            queryClient.invalidateQueries({ queryKey: ['tracker-lesson', trackerId, subtopicId] }),
          ]);

          await lessonQuery.refetch();
        },
        onError: (error) => {
          console.error('❌ Mutation error:', error);
        },
      }
    );
  };

  const goToLesson = (id: string) => {
    navigate(`/trackers/${trackerId}/lessons/${id}`, {
      state: { returnToRoadmapStack: getReturnStack() },
    });
  };

  const backToRoadmapLastLevel = () => {
    const stack = getReturnStack();
    navigate(`/trackers/${trackerId}/roadmap`, {
      state: { roadmapBreadcrumbStack: stack },
    });
  };

  const compilerRuntime = generatedLesson?.compilerRuntime ?? null;
  const showCompiler = Boolean(compilerRuntime);
  const compilerLanguage = compilerRuntime ?? 'javascript';

  return (
    <AppShellBoundary
      showSidebar={false}
      withTopBar={false}
      withFooter={false}
      className="bg-(--surface-sunken)"
    >
      {isMainLoading ? (
        <AppPageSkeleton kind="lesson" label="Loading lesson" />
      ) : hasMainError || !lessonData || !tracker || !lessonNode || !generatedLesson ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-(--surface-canvas) px-4 dark:bg-(--surface-canvas)">
          <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-6 text-center shadow-(--shadow-2) dark:bg-(--surface-card)">
            <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              Lesson unavailable
            </h1>
            <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              Something went wrong while fetching this lesson.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 grid w-[min(1280px,calc(100%-48px))] max-w-full grid-cols-[1fr_340px] gap-6 pb-8 max-[1024px]:grid-cols-1 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
          {/* ── Main content column ─────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-6">
            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-4.5">
              <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
                Trackers › {tracker.title} › {lessonNode.topicTitle || 'Lesson'}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                  Groq Lesson
                </span>
                <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                  {formatLessonType(generatedLesson.lessonType)}
                </span>
                {showCompiler && (
                  <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                    Piston Compiler
                  </span>
                )}
                <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)">
                  {generatedLesson.difficulty}
                </span>
              </div>

              <h1 className="font-ui text-[clamp(32px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
                {generatedLesson.title}
              </h1>

              <p className="mt-3 max-w-3xl text-[14px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                {generatedLesson.summary}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-[12.5px] font-medium text-(--text-secondary) dark:text-(--text-secondary)">
                <div>⏱ {generatedLesson.estimatedMinutes} min</div>
                <div>◇ Level {lessonNode.depth}</div>
                <div>★ +180 XP</div>
              </div>
            </section>

            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-4.5">
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                ⬢ Scribe AI Explanation
              </h2>

              <MathText className="text-[15px] leading-[1.7] text-(--text-primary)/90 dark:text-(--text-primary)/90">
                {generatedLesson.explanation}
              </MathText>

              <div className="mt-6 rounded-r-xl border-l-4 border-(--warning) bg-[rgba(138,98,0,0.08)] p-5 dark:bg-[rgba(240,168,66,0.10)]">
                <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#8a6200] dark:text-(--warning)">
                  💬 Insight
                </h3>
                <MathText className="text-[14px] italic leading-[1.55] text-(--text-primary)/85 dark:text-(--text-primary)/85">
                  {generatedLesson.insight}
                </MathText>
              </div>

              {generatedLesson.codeExample.code && (
                <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-[#1e1e1e] p-5 font-mono text-[13.5px] leading-[1.6] text-[#d4d4d4]">
                  <code>{generatedLesson.codeExample.code}</code>
                </pre>
              )}
            </section>

            {showCompiler ? (
              <>
                <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
                  <h2 className="font-ui text-[24px] font-extrabold">Coding Practice</h2>
                  <MathText className="mt-2 text-[14px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                    {`${generatedLesson.practiceTask.title || 'Practice task'}: ${
                      generatedLesson.practiceTask.description ||
                      'Try solving this using the compiler below.'
                    }`}
                  </MathText>
                </section>

                <CompilerCard
                  trackerId={trackerId}
                  subtopicId={subtopicId}
                  language={compilerLanguage}
                  fileName={generatedLesson.codeExample.fileName}
                  initialCode={codeForCompiler}
                  practiceTitle={generatedLesson.practiceTask.title}
                  practiceDescription={generatedLesson.practiceTask.description}
                  expectedOutput={generatedLesson.practiceTask.expectedOutput ?? ''}
                />
              </>
            ) : (
              <WidgetErrorBoundary title="Practice activity unavailable">
                <ReflectionPracticeCard
                  lesson={generatedLesson}
                  trackerId={trackerId}
                  subtopicId={subtopicId}
                />
              </WidgetErrorBoundary>
            )}
          </div>

          {/* ── Sidebar column ──────────────────────────────────────── */}
          <aside className="flex min-w-0 flex-col gap-6">
            <WidgetErrorBoundary title="AI tutor unavailable">
              <LessonChatCard
                lessonTitle={generatedLesson.title}
                trackerId={trackerId}
                subtopicId={subtopicId}
              />
            </WidgetErrorBoundary>

            {/* ✦ AI Visualizer — NEW */}
            <WidgetErrorBoundary title="Visualizer unavailable">
              <LessonVisualizerCard
                trackerId={trackerId!}
                subtopicId={subtopicId!}
                lessonTitle={generatedLesson.title}
              />
            </WidgetErrorBoundary>

            <LessonNavigationPreview
              previousLesson={lessonData.previousLesson}
              nextLesson={lessonData.nextLesson}
              onOpenLesson={goToLesson}
              onComplete={markCompleted}
              completing={updateProgressMutation.isPending}
              isCompleted={isCompleted}
            />

            <button
              type="button"
              onClick={backToRoadmapLastLevel}
              className="w-full rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-[12px] font-semibold text-(--text-secondary) shadow-(--shadow-1) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
            >
              Back to Current Roadmap Level
            </button>
          </aside>
        </div>
      )}
    </AppShellBoundary>
  );
}
