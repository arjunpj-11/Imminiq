// apps/web/src/modules/trackers/pages/TrackerLessonPage.tsx

import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useDashboardSummary } from '../../dashboard/hooks/useDashboardSummary'
import {
  useTrackerLesson,
  useUpdateSubtopicProgress,
} from '../hooks/useTrackers'

import CompilerCard from '../components/lesson/CompilerCard'
import LessonChatCard from '../components/lesson/LessonChatCard'
import LessonNavigationPreview from '../components/lesson/LessonNavigationPreview'
import MathText from '../components/lesson/MathText'
import ReflectionPracticeCard from '../components/lesson/ReflectionPracticeCard'
import type { LessonLocationState } from '../types/lesson.types'
import {
  formatLessonType,
  formatLevelLabel,
  getInitials,
  getRoadmapStackStorageKey,
} from '../utils/lesson-formatters'
import { cn } from '../utils/tracker-ui'



export default function TrackerLessonPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { trackerId, subtopicId } = useParams<{
    trackerId: string
    subtopicId: string
  }>()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const queryClient = useQueryClient()
  const dashboardSummaryQuery = useDashboardSummary()
  const lessonQuery = useTrackerLesson(trackerId || '', subtopicId || '')
  const updateProgressMutation = useUpdateSubtopicProgress()

  const dashboardSummary = dashboardSummaryQuery.data
  const lessonData = lessonQuery.data

  const tracker = lessonData?.tracker
  const lessonNode = lessonData?.lessonNode
  const generatedLesson = lessonData?.generatedLesson

  // ✅ FIX: Derive completed state directly from server data so it always resets
  // correctly when navigating between lessons (same component instance reused).
  // localCompleted is only set to true optimistically after a successful mutation,
  // and is keyed to subtopicId so it resets automatically on lesson change.
  const [optimisticCompletedId, setOptimisticCompletedId] = useState<string | null>(null)
  const isCompleted =
    lessonNode?.status === 'completed' || optimisticCompletedId === subtopicId

  const codeForCompiler = useMemo(() => {
    return (
      generatedLesson?.practiceTask.starterCode ||
      generatedLesson?.codeExample.code ||
      '// Start coding here'
    )
  }, [generatedLesson])

  const isMainLoading =
    dashboardSummaryQuery.isLoading || lessonQuery.isLoading

  const hasMainError =
    dashboardSummaryQuery.isError ||
    lessonQuery.isError ||
    !trackerId ||
    !subtopicId

  const topBarUserName = dashboardSummary?.user.fullName || 'Learner'
  const topBarInitials = getInitials(topBarUserName)
  const topBarStreakDays = dashboardSummary?.streak.current ?? 0
  const topBarAvatarUrl = dashboardSummary?.user.avatarUrl || undefined
  const topBarLevel = dashboardSummary
    ? formatLevelLabel(dashboardSummary.user.isPremium)
    : 'Free Scholar'

  const getReturnStack = () => {
    const state = location.state as LessonLocationState | null
    if (state?.returnToRoadmapStack?.length) return state.returnToRoadmapStack
    if (typeof window === 'undefined' || !trackerId) return []

    try {
      const raw = sessionStorage.getItem(getRoadmapStackStorageKey(trackerId))
      if (!raw) return []
      return JSON.parse(raw) as unknown[]
    } catch {
      return []
    }
  }

  const markCompleted = () => {
    if (isCompleted || !trackerId || !subtopicId || !generatedLesson) return

    updateProgressMutation.mutate(
      {
        trackerId,
        subtopicId,
        status: 'completed',
        timeSpentMinutes: generatedLesson.estimatedMinutes,
      },
      {
        onSuccess: async () => {
          setOptimisticCompletedId(subtopicId ?? null)

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
            queryClient.invalidateQueries({
              queryKey: ['dashboard', 'current-roadmap'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['dashboard', 'activity-intensity'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['dashboard', 'activity-intensity', 6],
            }),
            queryClient.invalidateQueries({
              queryKey: ['dashboard', 'activity-intensity', 12],
            }),
            queryClient.invalidateQueries({
              queryKey: ['dashboard', 'heatmap'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['activity-intensity'],
            }),
            queryClient.invalidateQueries({
              queryKey: ['trackers', 'roadmap', trackerId],
            }),
            queryClient.invalidateQueries({ queryKey: ['trackers', 'list'] }),
            queryClient.invalidateQueries({ queryKey: ['trackers'] }),
            queryClient.invalidateQueries({ queryKey: ['tracker', trackerId] }),
            queryClient.invalidateQueries({
              queryKey: ['tracker-lesson', trackerId, subtopicId],
            }),
          ])

          await lessonQuery.refetch()
        },
        onError: (error) => {
          console.error('❌ Mutation error:', error)
        },
      }
    )
  }

  const goToLesson = (id: string) => {
    navigate(`/trackers/${trackerId}/lessons/${id}`, {
      state: { returnToRoadmapStack: getReturnStack() },
    })
  }

  const backToRoadmapLastLevel = () => {
    const stack = getReturnStack()
    navigate(`/trackers/${trackerId}/roadmap`, {
      state: { roadmapBreadcrumbStack: stack },
    })
  }

  const compilerRuntime = generatedLesson?.compilerRuntime ?? null
  const showCompiler = Boolean(compilerRuntime)
  const compilerLanguage = compilerRuntime ?? 'javascript'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      <div className="relative z-1 flex min-h-screen w-full overflow-x-clip">
        <Sidebar
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCloseMobile={() => setSidebarOpen(false)}
          onToggleCollapsed={() =>
            setSidebarCollapsed((value) => {
              const next = !value
              localStorage.setItem('imminiq_sb', next ? 'closed' : 'open')
              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed ? 'min-[901px]:ml-0' : 'min-[901px]:ml-56'
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={topBarStreakDays}
            userName={topBarUserName}
            userInitials={topBarInitials}
            userAvatarUrl={topBarAvatarUrl}
            userLevel={topBarLevel}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {isMainLoading ? (
              <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-8 text-center shadow-[0_14px_48px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="mx-auto mb-5 h-13 w-13 animate-pulse rounded-2xl bg-[rgba(184,76,43,0.10)] dark:bg-[rgba(232,129,106,0.12)]" />

                  <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
                    Lesson
                  </p>

                  <h1 className="mt-2 font-['Playfair_Display',serif] text-[28px] font-extrabold tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
                    Preparing your lesson
                  </h1>

                  <p className="mt-2 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
                    Loading Groq lesson, AI chat, and roadmap.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="h-3 w-full animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
                    <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
                    <div className="mx-auto h-3 w-3/5 animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
                  </div>
                </div>
              </div>
            ) : hasMainError ||
              !dashboardSummary ||
              !lessonData ||
              !tracker ||
              !lessonNode ||
              !generatedLesson ? (
              <div className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
                <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
                  <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                    Lesson unavailable
                  </h1>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                    Something went wrong while fetching this lesson.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto mt-6 grid w-[min(1280px,calc(100%-48px))] max-w-full grid-cols-[1fr_340px] gap-6 pb-8 max-[1024px]:grid-cols-1 max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[900px]:pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
                <div className="flex min-w-0 flex-col gap-6">
                  <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
                    <div className="mb-4 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.15em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                      Trackers › {tracker.title} › {lessonNode.topicTitle || 'Lesson'}
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                        Groq Lesson
                      </span>

                      <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                        {formatLessonType(generatedLesson.lessonType)}
                      </span>

                      {showCompiler && (
                        <span className="inline-flex rounded-full bg-[rgba(26,23,20,0.09)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#6b5f58] dark:bg-white/9 dark:text-[#9b9a92]">
                          Piston Compiler
                        </span>
                      )}

                      <span className="inline-flex rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-semibold uppercase tracking-wider text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                        {generatedLesson.difficulty}
                      </span>
                    </div>

                    <h1 className="font-['Playfair_Display',serif] text-[clamp(32px,4vw,44px)] font-extrabold leading-[1.08] tracking-[-1px] text-[#1a1714] dark:text-[#f2f0eb]">
                      {generatedLesson.title}
                    </h1>

                    <p className="mt-3 max-w-3xl text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                      {generatedLesson.summary}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-5 text-[12.5px] font-medium text-[#6b5f58] dark:text-[#9b9a92]">
                      <div>⏱ {generatedLesson.estimatedMinutes} min</div>
                      <div>◇ Level {lessonNode.depth}</div>
                      <div>★ +180 XP</div>
                    </div>
                  </section>

                  <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] max-[640px]:p-4.5">
                    <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                      ⬢ Scribe AI Explanation
                    </h2>

                    <MathText className="text-[15px] leading-[1.7] text-[#1a1714]/90 dark:text-[#f2f0eb]/90">
                      {generatedLesson.explanation}
                    </MathText>

                    <div className="mt-6 rounded-r-xl border-l-4 border-[#c98000] bg-[rgba(138,98,0,0.08)] p-5 dark:bg-[rgba(240,168,66,0.10)]">
                      <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-[#8a6200] dark:text-[#f0a842]">
                        💬 Insight
                      </h3>

                      <MathText className="text-[14px] italic leading-[1.55] text-[#1a1714]/85 dark:text-[#f2f0eb]/85">
                        {generatedLesson.insight}
                      </MathText>
                    </div>

                    {generatedLesson.codeExample.code && (
                      <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-[#1e1e1e] p-5 font-['DM_Mono',monospace] text-[13.5px] leading-[1.6] text-[#d4d4d4]">
                        <code>{generatedLesson.codeExample.code}</code>
                      </pre>
                    )}
                  </section>

                  {showCompiler ? (
                    <>
                      <section className="rounded-[20px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                        <h2 className="font-['Playfair_Display',serif] text-[24px] font-extrabold">
                          Coding Practice
                        </h2>

                        <MathText className="mt-2 text-[14px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
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
                        expectedOutput={
                          generatedLesson.practiceTask.expectedOutput ?? ''
                        }
                      />
                    </>
                  ) : (
                    <ReflectionPracticeCard
                      lesson={generatedLesson}
                      trackerId={trackerId}
                      subtopicId={subtopicId}
                    />
                  )}
                </div>

                <aside className="flex min-w-0 flex-col gap-6">
                  <LessonChatCard
                    lessonTitle={generatedLesson.title}
                    trackerId={trackerId}
                    subtopicId={subtopicId}
                  />

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
                    className="w-full rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[12px] font-semibold text-[#6b5f58] shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                  >
                    Back to Current Roadmap Level
                  </button>
                </aside>
              </div>
            )}

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}