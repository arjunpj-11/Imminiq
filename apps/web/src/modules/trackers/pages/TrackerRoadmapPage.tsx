import { cn } from '../../../lib/cn'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import { useTrackerRoadmap } from '../hooks/useTrackers'
import {
  CheckIcon,
  CompassIcon,
  FlowConnector,
  LayersIcon,
  RoadmapFlowNode,
  StarIcon,
} from '../components/roadmap/RoadmapFlow'
import type { BreadcrumbItem, RoadmapLocationState, RoadmapNode } from '../utils/roadmap.types'
import {
  findFreshNodes,
  getNodeState,
  mapTopicToNode,
  readSavedRoadmapStack,
  saveRoadmapStack,
} from '../utils/roadmap.utils'


export default function TrackerRoadmapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { trackerId } = useParams<{ trackerId: string }>()

  const [breadcrumbStack, setBreadcrumbStack] = useState<BreadcrumbItem[]>(() => {
    const state = location.state as RoadmapLocationState | null
    if (state?.roadmapBreadcrumbStack) return state.roadmapBreadcrumbStack
    return readSavedRoadmapStack(trackerId)
  })

  const roadmapQuery = useTrackerRoadmap(trackerId || '')

  const roadmapData = roadmapQuery.data

  const topLevelNodes = useMemo(
    () => (roadmapData?.roadmap || []).map(mapTopicToNode),
    [roadmapData?.roadmap]
  )

  const syncedBreadcrumbStack = useMemo(() => {
    if (breadcrumbStack.length === 0 || topLevelNodes.length === 0) {
      return breadcrumbStack
    }

    return breadcrumbStack.map((crumb) => {
      const freshNodes = findFreshNodes(topLevelNodes, crumb.id)
      return freshNodes ? { ...crumb, nodes: freshNodes } : crumb
    })
  }, [topLevelNodes, breadcrumbStack])

  const currentNodes =
    syncedBreadcrumbStack.length > 0
      ? syncedBreadcrumbStack[syncedBreadcrumbStack.length - 1].nodes
      : topLevelNodes

  const currentTitle =
    syncedBreadcrumbStack.length > 0
      ? syncedBreadcrumbStack[syncedBreadcrumbStack.length - 1].title
      : roadmapData?.tracker.title || 'Study Roadmap'

  const isFirstLevel = syncedBreadcrumbStack.length === 0

  const completedCount = currentNodes.filter(
    (node) => getNodeState(node, isFirstLevel) === 'completed'
  ).length

  const progress =
    currentNodes.length === 0
      ? 0
      : Math.round((completedCount / currentNodes.length) * 100)

  const isMainLoading = roadmapQuery.isLoading

  const hasMainError = !trackerId || roadmapQuery.isError

  const handleNodeClick = (node: RoadmapNode) => {
    const firstLevel = breadcrumbStack.length === 0
    if (firstLevel && (node.isLocked || node.status === 'locked')) return

    if (node.children.length > 0) {
      setBreadcrumbStack((current) => {
        const nextStack = [
          ...current,
          { id: node._id, title: node.title, nodes: node.children },
        ]
        saveRoadmapStack(trackerId, nextStack)
        return nextStack
      })

      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (node.nodeType === 'subtopic') {
      saveRoadmapStack(trackerId, breadcrumbStack)

      navigate(`/trackers/${trackerId}/lessons/${node._id}`, {
        state: { returnToRoadmapStack: breadcrumbStack },
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
    <AppShellBoundary>
      {isMainLoading ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-8 text-center shadow-[0_14px_48px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19]">
            <div className="mx-auto mb-5 h-13 w-13 animate-pulse rounded-2xl bg-[rgba(184,76,43,0.10)] dark:bg-[rgba(232,129,106,0.12)]" />

            <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
              Study Roadmap
            </p>

            <h1 className="mt-2 font-['Playfair_Display',serif] text-[28px] font-extrabold tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
              Opening your roadmap
            </h1>

            <p className="mt-2 text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
              Preparing your node-based learning path.
            </p>

            <div className="mt-6 space-y-3">
              <div className="h-3 w-full animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
              <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
              <div className="mx-auto h-3 w-3/5 animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8" />
            </div>
          </div>
        </div>
      ) : hasMainError || !roadmapData ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
            <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
              Roadmap unavailable
            </h1>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
              Something went wrong while fetching your study roadmap.
            </p>
          </div>
        </div>
      ) : (
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
                  syncedBreadcrumbStack.length === 0
                    ? 'text-[#b84c2b] dark:text-[#e8816a]'
                    : 'text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]'
                )}
              >
                {roadmapData.tracker.title}
              </button>

              {syncedBreadcrumbStack.map((item, index) => (
                <span key={item.id} className="flex items-center gap-2">
                  <span className="text-[#6b5f58]/40 dark:text-[#9b9a92]/40">
                    /
                  </span>
                  <button
                    type="button"
                    onClick={() => goToBreadcrumb(index)}
                    className={cn(
                      "max-w-42 truncate font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] transition",
                      index === syncedBreadcrumbStack.length - 1
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

              {syncedBreadcrumbStack.length > 0 && (
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
                <CompassIcon />
              </div>
              <div>
                <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                  Current Level
                </div>
                <div className="font-['Playfair_Display',serif] text-[22px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                  {syncedBreadcrumbStack.length + 1}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]">
                <CheckIcon size={18} />
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
                <StarIcon />
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
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          <section className="flex flex-col items-center">
            <div className="mb-2 flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b84c2b] text-white shadow-[0_0_0_6px_rgba(184,76,43,0.08),0_0_0_12px_#f5ede4,0_8px_40px_rgba(184,76,43,0.18)] dark:bg-[#e8816a] dark:text-[#141412] dark:shadow-[0_0_0_6px_rgba(232,129,106,0.10),0_0_0_12px_#141412,0_8px_40px_rgba(232,129,106,0.18)]">
                <LayersIcon />
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
                        // ── FIX: even node is left → sweep right toward next (odd/right) node
                        //        odd node is right → sweep left toward next (even/left) node
                        direction={index % 2 === 0 ? 'right' : 'left'}
                      />
                    )}
                  </div>
                ))}

                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#e0d0c5] bg-[rgba(26,23,20,0.05)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]">
                    <CheckIcon size={20} />
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
      )}
    </AppShellBoundary>
  )
}
