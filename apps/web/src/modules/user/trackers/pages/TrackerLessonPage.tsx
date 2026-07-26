// ─── DIFF: Added LessonVisualizerCard import and placement in <aside> ─────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import WidgetErrorBoundary from '../../../../components/system/WidgetErrorBoundary';
import {
  useTrackerDetails,
  useTrackerLesson,
  useUpdateSubtopicProgress,
} from '../hooks/useTrackers';
import TrackerModerationNotice from '../components/TrackerModerationNotice';

import CompilerCard from '../components/lesson/CompilerCard';
import LessonChatCard from '../components/lesson/LessonChatCard';
import LessonNavigationPreview from '../components/lesson/LessonNavigationPreview';
import LessonVisualizerCard from '../components/lesson/LessonVisualizerCard'; // ← NEW
import MathText from '../components/lesson/MathText';
import ReflectionPracticeCard from '../components/lesson/ReflectionPracticeCard';
import LessonFeedbackCard from '../components/lesson/LessonFeedbackCard';
import type { LessonLocationState } from '../types/lesson.types';
import { formatLessonType } from '../utils/lesson-formatters';
import { readSavedRoadmapStack } from '../utils/roadmap.utils';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useBackNavigation } from '../../../../hooks/useBackNavigation';
import { safeLocalStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { useSavedItemsStore } from '../../../../store/useSavedItemsStore';

type RecentLesson = {
  trackerId: string;
  subtopicId: string;
  trackerTitle: string;
  lessonTitle: string;
  scrollY: number;
};

const readRecentLesson = (): RecentLesson | null => {
  try {
    return JSON.parse(
      safeLocalStorage.get(STORAGE_KEYS.recentLesson) ?? 'null'
    ) as RecentLesson | null;
  } catch {
    return null;
  }
};

export default function TrackerLessonPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { trackerId, subtopicId } = useParams<{
    trackerId: string;
    subtopicId: string;
  }>();

  const trackerDetailsQuery = useTrackerDetails(trackerId);
  const goBack = useBackNavigation(trackerId ? ROUTES.trackerRoadmap(trackerId) : ROUTES.trackers);
  const trackerIsModerated = Boolean(
    trackerDetailsQuery.data?.moderationStatus &&
    trackerDetailsQuery.data.moderationStatus !== 'active'
  );
  const lessonQuery = useTrackerLesson(
    trackerId || '',
    subtopicId || '',
    Boolean(trackerDetailsQuery.data && !trackerIsModerated)
  );
  const updateProgressMutation = useUpdateSubtopicProgress();

  const lessonData = lessonQuery.data;

  const tracker = lessonData?.tracker;
  const lessonNode = lessonData?.lessonNode;
  const generatedLesson = lessonData?.generatedLesson;

  const [optimisticCompletedId, setOptimisticCompletedId] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const savedLesson = useSavedItemsStore((state) =>
    state.lessons.some((item) => item.trackerId === trackerId && item.subtopicId === subtopicId)
  );
  const toggleLesson = useSavedItemsStore((state) => state.toggleLesson);
  const restoredPositionRef = useRef(false);
  const isCompleted = lessonNode?.status === 'completed' || optimisticCompletedId === subtopicId;
  const estimatedMinutes = useMemo(() => {
    if (!generatedLesson) return 0;
    const words = [
      generatedLesson.summary,
      generatedLesson.explanation,
      generatedLesson.insight,
      generatedLesson.practiceTask.description,
    ]
      .join(' ')
      .trim()
      .split(/\s+/).length;
    return Math.max(3, Math.ceil(words / 210) + 2);
  }, [generatedLesson]);

  useEffect(() => {
    if (!trackerId || !subtopicId || !tracker || !generatedLesson) return undefined;
    const existing = readRecentLesson();
    const matching = existing?.trackerId === trackerId && existing.subtopicId === subtopicId;
    const save = () => {
      safeLocalStorage.set(
        STORAGE_KEYS.recentLesson,
        JSON.stringify({
          trackerId,
          subtopicId,
          trackerTitle: tracker.title,
          lessonTitle: generatedLesson.title,
          scrollY: window.scrollY,
        } satisfies RecentLesson)
      );
    };
    if (!restoredPositionRef.current) {
      restoredPositionRef.current = true;
      window.requestAnimationFrame(() => {
        if (matching && existing.scrollY > 0) {
          window.scrollTo({ top: existing.scrollY, behavior: 'auto' });
        }
      });
    }
    let frameId: number | null = null;
    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        save();
        frameId = null;
      });
    };
    save();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      save();
    };
  }, [generatedLesson, subtopicId, tracker, trackerId]);

  useEffect(() => {
    if (!generatedLesson) return undefined;
    const updateReadingProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(
        scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      );
    };
    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);
    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, [generatedLesson]);

  const codeForCompiler = useMemo(() => {
    return (
      generatedLesson?.practiceTask.starterCode ||
      generatedLesson?.codeExample.code ||
      '// Start coding here'
    );
  }, [generatedLesson]);

  const isMainLoading =
    trackerDetailsQuery.isLoading || (!trackerIsModerated && lessonQuery.isLoading);

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
        onSuccess: () => {
          setOptimisticCompletedId(subtopicId ?? null);
        },
      }
    );
  };

  const goToLesson = (id: string) => {
    navigate(ROUTES.trackerLesson(trackerId!, id), {
      state: { returnToRoadmapStack: getReturnStack() },
    });
  };

  const backToRoadmapLastLevel = () => {
    const stack = getReturnStack();
    navigate(ROUTES.trackerRoadmap(trackerId!), {
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
        <AppPageSkeleton
          kind="lesson"
          label="Preparing your lesson"
          description="Immi is creating the lesson explanation, examples, and practice tasks. New lessons may take up to a minute."
        />
      ) : trackerIsModerated && trackerDetailsQuery.data ? (
        <TrackerModerationNotice tracker={trackerDetailsQuery.data} />
      ) : hasMainError || !lessonData || !tracker || !lessonNode || !generatedLesson ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-(--surface-canvas) px-4 dark:bg-(--surface-canvas)">
          <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-6 text-center shadow-(--shadow-2) dark:bg-(--surface-card)">
            <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              Lesson unavailable
            </h1>
            <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              This lesson could not be found, or it is temporarily unavailable.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void trackerDetailsQuery.refetch();
                  void lessonQuery.refetch();
                }}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-4 py-2.5 text-[13px] font-bold text-(--text-primary) transition hover:border-(--brand-500)"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl bg-(--brand-500) px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-(--brand-600)"
              >
                Back to trackers
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="fixed inset-x-0 top-0 z-60 h-1 bg-(--surface-muted)"
            role="progressbar"
            aria-label="Lesson reading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={readingProgress}
          >
            <div
              className="h-full bg-(--brand-500) transition-[width] duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <div className="mx-auto mt-6 w-[min(1280px,calc(100%-48px))] max-w-full pb-8 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 text-[12px] font-bold text-(--text-secondary) shadow-(--shadow-1) transition hover:border-(--brand-500) hover:text-(--brand-500)"
              aria-label="Go back"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back
            </button>

            <div className="grid grid-cols-[1fr_340px] gap-6 max-[1024px]:grid-cols-1">
              {/* ── Main content column ─────────────────────────────────── */}
              <div className="flex min-w-0 flex-col gap-6">
                <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-4.5">
                  <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
                    Trackers › {tracker.title} › {lessonNode.topicTitle || 'Lesson'}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                      AI-guided lesson
                    </span>
                    <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                      {formatLessonType(generatedLesson.lessonType)}
                    </span>
                    {showCompiler && (
                      <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-secondary) dark:bg-white/9 dark:text-(--text-secondary)">
                        Interactive code practice
                      </span>
                    )}
                    <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)">
                      {generatedLesson.difficulty}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <h1 className="min-w-0 flex-1 font-ui text-[clamp(32px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-(--text-primary) dark:text-(--text-primary)">
                      {generatedLesson.title}
                    </h1>
                    <button
                      type="button"
                      onClick={() =>
                        toggleLesson({
                          trackerId: trackerId!,
                          subtopicId: subtopicId!,
                          trackerTitle: tracker.title,
                          lessonTitle: generatedLesson.title,
                        })
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) text-(--brand-500) hover:bg-(--surface-muted)"
                      aria-label={savedLesson ? 'Remove lesson from saved items' : 'Save lesson'}
                      aria-pressed={savedLesson}
                    >
                      <Bookmark size={18} fill={savedLesson ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <p className="mt-3 max-w-3xl text-[14px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                    {generatedLesson.summary}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-5 text-[12.5px] font-medium text-(--text-secondary) dark:text-(--text-secondary)">
                    <div>◇ Level {lessonNode.depth}</div>
                    <div>◷ About {estimatedMinutes} min</div>
                    <div>★ +180 XP</div>
                  </div>
                </section>

                <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-4.5">
                  <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-(--brand-500) dark:text-(--brand-500)">
                    ⬢ Lesson explanation
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

                <LessonFeedbackCard
                  key={subtopicId}
                  trackerId={trackerId!}
                  subtopicId={subtopicId!}
                  lessonTitle={generatedLesson.title}
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
          </div>
        </>
      )}
    </AppShellBoundary>
  );
}
