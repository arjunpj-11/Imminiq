// apps/web/src/modules/trackers/pages/TrackerRoadmapPage.tsx

import { useMemo, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'
import PageLoadingScreen from '../../../components/ui/PageLoadingScreen'

import { useDashboardSummary } from '../../../hooks/dashboard/useDashboardSummary'
import { useTrackerRoadmap } from '../../../hooks/trackers/useTrackers'

import type {
  RoadmapSubtopic,
  RoadmapTopic,
} from '../../../types/tracker.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

type RoadmapNode = {
  _id: string
  title: string
  description?: string
  order: number
  status?: string
  progressPercent?: number
  estimatedMinutes?: number
  estimatedHours?: number
  isLocked?: boolean
  children: RoadmapNode[]
  nodeType: 'topic' | 'subtopic'
}

type BreadcrumbItem = {
  id: string
  title: string
  nodes: RoadmapNode[]
}

type RoadmapLocationState = {
  roadmapBreadcrumbStack?: BreadcrumbItem[]
}

const getRoadmapStackStorageKey = (trackerId?: string) => {
  return `imminiq_roadmap_stack_${trackerId || 'unknown'}`
}

const readSavedRoadmapStack = (
  trackerId?: string
): BreadcrumbItem[] => {
  if (typeof window === 'undefined' || !trackerId) return []

  try {
    const raw = sessionStorage.getItem(
      getRoadmapStackStorageKey(trackerId)
    )

    if (!raw) return []

    return JSON.parse(raw) as BreadcrumbItem[]
  } catch {
    return []
  }
}

const saveRoadmapStack = (
  trackerId: string | undefined,
  stack: BreadcrumbItem[]
) => {
  if (typeof window === 'undefined' || !trackerId) return

  sessionStorage.setItem(
    getRoadmapStackStorageKey(trackerId),
    JSON.stringify(stack)
  )
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const getNodeIcon = (title: string, index: number) => {
  const lower = title.toLowerCase()

  if (lower.includes('javascript')) return '⚡'
  if (lower.includes('typescript')) return '🔷'
  if (lower.includes('react')) return '⚛️'
  if (lower.includes('node')) return '🟢'
  if (lower.includes('express')) return '🚂'
  if (lower.includes('mongo')) return '🍃'
  if (lower.includes('database')) return '🗄️'
  if (lower.includes('api')) return '🔌'
  if (lower.includes('auth')) return '🔐'
  if (lower.includes('deploy')) return '🚀'
  if (lower.includes('interview')) return '🎤'
  if (lower.includes('project')) return '🧩'

  const fallback = ['📘', '🧠', '🛠️', '💡', '🎯', '📦']
  return fallback[index % fallback.length]
}

const mapSubtopicToNode = (
  subtopic: RoadmapSubtopic
): RoadmapNode => ({
  _id: subtopic._id,
  title: subtopic.title,
  description: subtopic.description,
  order: subtopic.order,
  status: subtopic.status,
  progressPercent: subtopic.progressPercent,
  estimatedMinutes: subtopic.estimatedMinutes,
  isLocked: subtopic.isLocked,
  nodeType: 'subtopic',
  children: (subtopic.children || []).map(mapSubtopicToNode),
})

const mapTopicToNode = (topic: RoadmapTopic): RoadmapNode => ({
  _id: topic._id,
  title: topic.title,
  description: topic.description,
  order: topic.order,
  status: topic.status,
  progressPercent: topic.progressPercent,
  estimatedHours: topic.estimatedHours,
  nodeType: 'topic',
  children: topic.subtopics.map(mapSubtopicToNode),
})

const getNodeState = (
  node: RoadmapNode,
  isFirstLevel: boolean
) => {
  if (
    isFirstLevel &&
    (node.isLocked || node.status === 'locked')
  ) {
    return 'locked'
  }

  if (node.status === 'completed') return 'completed'
  if (node.status === 'in_progress') return 'active'

  return 'available'
}

function FlowConnector({
  direction,
}: {
  direction: 'down' | 'left' | 'right'
}) {
  if (direction === 'down') {
    return (
      <div className="h-14 w-full">
        <svg
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <line
            x1="300"
            y1="0"
            x2="300"
            y2="60"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 4"
            className="text-[rgba(184,76,43,0.30)] dark:text-[rgba(232,129,106,0.28)]"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-20 w-full max-w-150">
      <svg
        viewBox="0 0 600 90"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          d={
            direction === 'right'
              ? 'M 160 0 Q 160 90 440 90'
              : 'M 440 0 Q 440 90 160 90'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="text-[rgba(184,76,43,0.30)] dark:text-[rgba(232,129,106,0.28)]"
        />
      </svg>
    </div>
  )
}

function RoadmapFlowNode({
  node,
  index,
  isFirstLevel,
  onClick,
}: {
  node: RoadmapNode
  index: number
  isFirstLevel: boolean
  onClick: () => void
}) {
  const state = getNodeState(node, isFirstLevel)

  const progress = Math.min(
    100,
    Math.max(0, Number(node.progressPercent ?? 0))
  )

  const locked = state === 'locked'
  const completed = state === 'completed'
  const active = state === 'active'
  const hasChildren = node.children.length > 0

  return (
    <div
      className={cn(
        'flex w-full',
        index % 3 === 0 && 'justify-start',
        index % 3 === 1 && 'justify-end',
        index % 3 === 2 && 'justify-center'
      )}
    >
      <button
        type="button"
        disabled={locked}
        onClick={onClick}
        className={cn(
          'group relative w-[min(420px,90%)] overflow-hidden rounded-[18px] border-[1.5px] bg-[#fdf8f5] p-4.5 text-left shadow-[0_4px_24px_rgba(26,23,20,0.08),0_1px_4px_rgba(26,23,20,0.05)] transition dark:bg-[#1e1c19] dark:shadow-[0_4px_24px_rgba(0,0,0,0.30),0_1px_4px_rgba(0,0,0,0.20)]',
          locked &&
            'cursor-not-allowed border-[#e0d0c5] opacity-70 dark:border-white/9',
          !locked &&
            'cursor-pointer border-[#e0d0c5] hover:-translate-y-1 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-white/9 dark:hover:border-[rgba(232,129,106,0.24)]',
          active &&
            'border-[#e8816a] shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-[#e8816a]',
          completed &&
            'border-[rgba(45,106,71,0.20)] dark:border-[rgba(92,201,138,0.22)]'
        )}
      >
        {(active || completed) && (
          <div
            className={cn(
              'absolute left-0 right-0 top-0 h-0.75',
              completed
                ? 'bg-linear-to-r from-[#70d49a] to-[#4caf7d]'
                : 'bg-linear-to-r from-[#e8816a] to-[#b84c2b]'
            )}
          />
        )}

        <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-linear-to-br from-white/50 to-transparent dark:from-white/3" />

        <div className="relative flex items-center gap-4">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[rgba(184,76,43,0.08)] text-[25px] dark:bg-[rgba(232,129,106,0.10)]">
            {getNodeIcon(node.title, index)}

            {locked && (
              <div className="absolute bottom-0.75 right-0.75 flex h-5 w-5 items-center justify-center rounded-md border border-[#e0d0c5] bg-[#fdf8f5] text-[10px] dark:border-white/9 dark:bg-[#252320]">
                🔒
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
              {node.nodeType === 'topic'
                ? `Topic ${node.order}`
                : `Level ${node.order}`}
            </div>

            <h3 className="font-['Playfair_Display',serif] text-[18px] font-extrabold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">
              {node.title}
            </h3>

            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.45] text-[#6b5f58] dark:text-[#9b9a92]">
              {node.description ||
                (hasChildren
                  ? 'Open this node to go deeper.'
                  : 'Open the lesson and start learning.')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-["DM_Mono",monospace] text-[8px] uppercase tracking-[0.08em]',
                  locked &&
                    'border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]',
                  active &&
                    'border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]',
                  completed &&
                    'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
                  state === 'available' &&
                    'border-[#e0d0c5] bg-transparent text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]'
                )}
              >
                {locked
                  ? 'Locked'
                  : completed
                    ? 'Completed'
                    : active
                      ? 'In Progress'
                      : hasChildren
                        ? 'Open'
                        : 'Lesson'}
              </span>

              {!locked && (
                <>
                  <div className="h-1.25 min-w-18 flex-1 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
                    <div
                      className={cn(
                        'h-full rounded-full bg-linear-to-r',
                        completed
                          ? 'from-[#70d49a] to-[#4caf7d]'
                          : 'from-[#e8816a] to-[#b84c2b]'
                      )}
                      style={{
                        width: `${completed ? 100 : progress}%`,
                      }}
                    />
                  </div>

                  <span className="font-['DM_Mono',monospace] text-[8px] text-[#6b5f58] dark:text-[#9b9a92]">
                    {completed ? 100 : progress}%
                  </span>
                </>
              )}
            </div>
          </div>

          {!locked && (
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition group-hover:translate-x-0.5',
                completed
                  ? 'bg-[#4caf7d]'
                  : 'bg-[#b84c2b] dark:bg-[#e8816a] dark:text-[#141412]'
              )}
            >
              {hasChildren ? '›' : '→'}
            </div>
          )}
        </div>
      </button>
    </div>
  )
}

export default function TrackerRoadmapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { trackerId } = useParams<{ trackerId: string }>()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  const [breadcrumbStack, setBreadcrumbStack] = useState<
    BreadcrumbItem[]
  >(() => {
    const state = location.state as RoadmapLocationState | null

    if (state?.roadmapBreadcrumbStack) {
      return state.roadmapBreadcrumbStack
    }

    return readSavedRoadmapStack(trackerId)
  })

  const dashboardSummaryQuery = useDashboardSummary()
  const roadmapQuery = useTrackerRoadmap(trackerId || '')

  const dashboardSummary = dashboardSummaryQuery.data
  const roadmapData = roadmapQuery.data

  const topLevelNodes = useMemo(() => {
    return (roadmapData?.roadmap || []).map(mapTopicToNode)
  }, [roadmapData?.roadmap])

  const currentNodes =
    breadcrumbStack.length > 0
      ? breadcrumbStack[breadcrumbStack.length - 1].nodes
      : topLevelNodes

  const currentTitle =
    breadcrumbStack.length > 0
      ? breadcrumbStack[breadcrumbStack.length - 1].title
      : roadmapData?.tracker.title || 'Study Roadmap'

  const isFirstLevel = breadcrumbStack.length === 0

  const completedCount = currentNodes.filter(
    (node) => getNodeState(node, isFirstLevel) === 'completed'
  ).length

  const progress =
    currentNodes.length === 0
      ? 0
      : Math.round((completedCount / currentNodes.length) * 100)

  const isLoading =
    dashboardSummaryQuery.isLoading || roadmapQuery.isLoading

  const hasError =
    dashboardSummaryQuery.isError ||
    roadmapQuery.isError ||
    !trackerId

  if (isLoading) {
    return (
      <PageLoadingScreen
        eyebrow="Study Roadmap"
        title="Opening your roadmap"
        description="Preparing your node-based learning path."
      />
    )
  }

  if (hasError || !dashboardSummary || !roadmapData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5ede4] px-4 dark:bg-[#141412]">
        <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
          <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            Roadmap unavailable
          </h1>

          <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
            Something went wrong while fetching your study roadmap.
          </p>
        </div>
      </div>
    )
  }

  const userInitials = getInitials(dashboardSummary.user.fullName)

  const handleNodeClick = (node: RoadmapNode) => {
    const firstLevel = breadcrumbStack.length === 0

    if (
      firstLevel &&
      (node.isLocked || node.status === 'locked')
    ) {
      return
    }

    if (node.children.length > 0) {
      setBreadcrumbStack((current) => {
        const nextStack = [
          ...current,
          {
            id: node._id,
            title: node.title,
            nodes: node.children,
          },
        ]

        saveRoadmapStack(trackerId, nextStack)

        return nextStack
      })

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    if (node.nodeType === 'subtopic') {
      saveRoadmapStack(trackerId, breadcrumbStack)

      navigate(`/trackers/${trackerId}/lessons/${node._id}`, {
        state: {
          returnToRoadmapStack: breadcrumbStack,
        },
      })
    }
  }

  const goToBreadcrumb = (index: number) => {
    if (index === -1) {
      saveRoadmapStack(trackerId, [])
      setBreadcrumbStack([])
      return
    }

    setBreadcrumbStack((current) => {
      const nextStack = current.slice(0, index + 1)
      saveRoadmapStack(trackerId, nextStack)
      return nextStack
    })
  }

  const goBackOneLevel = () => {
    setBreadcrumbStack((current) => {
      const nextStack = current.slice(0, -1)
      saveRoadmapStack(trackerId, nextStack)
      return nextStack
    })
  }

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

              localStorage.setItem(
                'imminiq_sb',
                next ? 'closed' : 'open'
              )

              return next
            })
          }
        />

        <main
          className={cn(
            'flex min-w-0 flex-1 flex-col overflow-x-clip transition-[margin] duration-300',
            sidebarCollapsed
              ? 'min-[901px]:ml-0'
              : 'min-[901px]:ml-56'
          )}
        >
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            streakDays={dashboardSummary.streak.current}
            userName={dashboardSummary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={dashboardSummary.user.avatarUrl || undefined}
            userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(900px,calc(100%-48px))] max-w-full min-w-0 flex-col pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
              <section className="mb-7 border-b border-[#e0d0c5] pb-6 dark:border-white/9">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/trackers')}
                    className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                  >
                    Trackers
                  </button>

                  <span className="text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
                    /
                  </span>

                  <button
                    type="button"
                    onClick={() => goToBreadcrumb(-1)}
                    className={cn(
                      "font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] transition",
                      breadcrumbStack.length === 0
                        ? 'text-[#b84c2b] dark:text-[#e8816a]'
                        : 'text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
                    )}
                  >
                    {roadmapData.tracker.title}
                  </button>

                  {breadcrumbStack.map((item, index) => (
                    <span
                      key={item.id}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
                        /
                      </span>

                      <button
                        type="button"
                        onClick={() => goToBreadcrumb(index)}
                        className={cn(
                          "max-w-42 truncate font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] transition",
                          index === breadcrumbStack.length - 1
                            ? 'text-[#b84c2b] dark:text-[#e8816a]'
                            : 'text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
                        )}
                      >
                        {item.title}
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                      {currentTitle}
                    </h1>

                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                      <span>
                        {currentNodes.length} node
                        {currentNodes.length === 1 ? '' : 's'}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-[#6b5f58]/40 dark:bg-[#9b9a92]/40" />

                      <span>
                        {isFirstLevel
                          ? 'Locked nodes apply here'
                          : 'All inner nodes are open'}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-[#6b5f58]/40 dark:bg-[#9b9a92]/40" />

                      <span>Last node opens lesson</span>
                    </p>
                  </div>

                  {breadcrumbStack.length > 0 && (
                    <button
                      type="button"
                      onClick={goBackOneLevel}
                      className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[12.5px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                    >
                      ← Back
                    </button>
                  )}
                </div>
              </section>

              <section className="mb-7 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                    🧭
                  </div>

                  <div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                      Current Level
                    </div>

                    <div className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                      {breadcrumbStack.length + 1}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                    ✓
                  </div>

                  <div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                      Completed Here
                    </div>

                    <div className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                      {completedCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(138,98,0,0.08)] text-[#8a6200] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f0a842]">
                    ★
                  </div>

                  <div>
                    <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                      Level Mastery
                    </div>

                    <div className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                      {progress}%
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8 rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                    Current Node Progress
                  </span>

                  <span className="font-['DM_Mono',monospace] text-[11px] text-[#b84c2b] dark:text-[#e8816a]">
                    {progress} / 100 pts
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#e8816a] to-[#b84c2b] transition-all duration-700 dark:from-[#f5a090] dark:to-[#e8816a]"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </section>

              <section className="flex flex-col items-center">
                <div className="mb-2 flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b84c2b] text-white shadow-[0_0_0_6px_rgba(184,76,43,0.08),0_0_0_12px_#f5ede4,0_8px_40px_rgba(184,76,43,0.18)] dark:bg-[#e8816a] dark:text-[#141412] dark:shadow-[0_0_0_6px_rgba(232,129,106,0.10),0_0_0_12px_#141412,0_8px_40px_rgba(232,129,106,0.18)]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>

                  <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                    Start Here
                  </span>
                </div>

                {currentNodes.length > 0 ? (
                  <div className="flex w-full flex-col items-center">
                    <FlowConnector direction="down" />

                    {currentNodes.map((node, index) => (
                      <div
                        key={node._id}
                        className="flex w-full flex-col items-center"
                      >
                        <RoadmapFlowNode
                          node={node}
                          index={index}
                          isFirstLevel={isFirstLevel}
                          onClick={() => handleNodeClick(node)}
                        />

                        {index < currentNodes.length - 1 && (
                          <FlowConnector
                            direction={index % 2 === 0 ? 'right' : 'left'}
                          />
                        )}
                      </div>
                    ))}

                    <div className="mt-6 flex flex-col items-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]">
                        ✓
                      </div>

                      <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-50 dark:text-[#9b9a92]">
                        End of this level
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-[20px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-8 text-center dark:border-white/9 dark:bg-[#1e1c19]">
                    <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold">
                      No nodes found
                    </h2>

                    <p className="mt-2 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                      This part of the roadmap has no child nodes yet.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}