// apps/web/src/modules/trackers/pages/TrackerQuickRevisionPage.tsx

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppShellBoundary } from '../../../components/layout/AppShell'
import { useTrackerRoadmap, useTrackerLesson } from '../hooks/useTrackers'

import MathText from '../components/lesson/MathText'
import type { RoadmapSubtopic, RoadmapTopic } from '../types/tracker.types'
import { cn } from '../utils/tracker-ui'

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatNode = {
  _id: string
  title: string
  description?: string
  order: number
  status?: string
  isLocked?: boolean
  estimatedMinutes?: number
  nodeType: 'topic' | 'subtopic'
  depth: number
  children: FlatNode[]
  parentId?: string
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapSubtopicToNode = (s: RoadmapSubtopic, depth: number): FlatNode => ({
  _id: s._id,
  title: s.title,
  description: s.description,
  order: s.order,
  status: s.status,
  isLocked: s.isLocked,
  estimatedMinutes: s.estimatedMinutes,
  nodeType: 'subtopic',
  depth,
  children: (s.children || []).map((c) => mapSubtopicToNode(c, depth + 1)),
})

const mapTopicToNode = (t: RoadmapTopic): FlatNode => ({
  _id: t._id,
  title: t.title,
  description: t.description,
  order: t.order,
  status: t.status,
  nodeType: 'topic',
  depth: 0,
  children: t.subtopics.map((s) => mapSubtopicToNode(s, 1)),
})

// ─── Inline Lesson View ───────────────────────────────────────────────────────

function LessonInlineView({
  trackerId,
  subtopicId,
}: {
  trackerId: string
  subtopicId: string
}) {
  const lessonQuery = useTrackerLesson(trackerId, subtopicId)
  const navigate = useNavigate()

  if (lessonQuery.isLoading) {
    return (
      <div className="space-y-3 py-4 pl-4">
        {[100, 80, 60].map((w) => (
          <div
            key={w}
            className="h-3 animate-pulse rounded-full bg-[rgba(26,23,20,0.07)] dark:bg-white/7"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    )
  }

  if (lessonQuery.isError || !lessonQuery.data?.generatedLesson) {
    return (
      <div className="flex items-start gap-3 rounded-[14px] border border-dashed border-[#e0d0c5] bg-[rgba(138,98,0,0.05)] p-4 dark:border-white/9 dark:bg-[rgba(240,168,66,0.05)]">
        <span className="mt-0.5 text-[18px]">📖</span>
        <div>
          <p className="text-[13px] font-semibold text-[#8a6200] dark:text-[#f0a842]">
            Lesson not generated yet
          </p>
          <p className="mt-0.5 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
            Study this topic first to generate its lesson before reviewing.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(`/trackers/${trackerId}/lessons/${subtopicId}`)
            }
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#b84c2b] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#9e3e22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705c]"
          >
            Study now →
          </button>
        </div>
      </div>
    )
  }

  const { generatedLesson } = lessonQuery.data

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-[13px] leading-[1.65] text-[#1a1714]/80 dark:text-[#f2f0eb]/80">
        {generatedLesson.summary}
      </p>

      {/* Explanation */}
      <div className="rounded-[14px] border border-[#e0d0c5] bg-white/50 p-4 dark:border-white/9 dark:bg-white/3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b84c2b] dark:text-[#e8816a]">
          ⬢ Explanation
        </h4>
        <MathText className="text-[13px] leading-[1.65] text-[#1a1714]/85 dark:text-[#f2f0eb]/85">
          {generatedLesson.explanation}
        </MathText>
      </div>

      {/* Insight */}
      <div className="rounded-r-xl border-l-[3px] border-[#c98000] bg-[rgba(138,98,0,0.07)] p-4 dark:bg-[rgba(240,168,66,0.08)]">
        <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6200] dark:text-[#f0a842]">
          💬 Key Insight
        </h4>
        <MathText className="text-[13px] italic leading-[1.55] text-[#1a1714]/80 dark:text-[#f2f0eb]/80">
          {generatedLesson.insight}
        </MathText>
      </div>

      {/* Code example */}
      {generatedLesson.codeExample?.code && (
        <div>
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
            {'</>'}  Code Example
          </h4>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#1e1e1e] p-4 font-['DM_Mono',monospace] text-[12px] leading-[1.6] text-[#d4d4d4]">
            <code>{generatedLesson.codeExample.code}</code>
          </pre>
        </div>
      )}

      {/* Open full lesson link */}
      <button
        type="button"
        onClick={() =>
          navigate(`/trackers/${trackerId}/lessons/${subtopicId}`)
        }
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#e0d0c5] py-2.5 text-[12px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.06)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
      >
        Open full lesson →
      </button>
    </div>
  )
}

// ─── Revision Node (recursive) ────────────────────────────────────────────────

function RevisionNode({
  node,
  trackerId,
  defaultOpen = false,
}: {
  node: FlatNode
  trackerId: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isLeaf = node.children.length === 0
  const isCompleted = node.status === 'completed'
  const isInProgress = node.status === 'in_progress'
  const isTopic = node.nodeType === 'topic'

  // Depth-based indent + style
  const depthIndent = node.depth * 16

  return (
    <div
      className={cn(
        'rounded-[14px] border-[1.5px] transition-all',
        open
          ? 'border-[rgba(184,76,43,0.18)] bg-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07)] dark:border-[rgba(232,129,106,0.16)] dark:bg-[#1e1c19]'
          : 'border-[#e0d0c5] bg-[#fdf8f5]/70 dark:border-white/9 dark:bg-[#1e1c19]/70'
      )}
      style={{ marginLeft: depthIndent }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Status dot */}
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            isCompleted
              ? 'bg-[#4caf7d]'
              : isInProgress
              ? 'bg-[#e8816a]'
              : 'bg-[#e0d0c5] dark:bg-white/20'
          )}
        />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isTopic && (
              <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b84c2b] opacity-70 dark:text-[#e8816a]">
                Topic {node.order}
              </span>
            )}
            {!isTopic && !isLeaf && (
              <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
                Section
              </span>
            )}
            {isLeaf && (
              <span className="inline-flex items-center rounded-full bg-[rgba(26,23,20,0.07)] px-2 py-0.5 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#6b5f58] dark:bg-white/8 dark:text-[#9b9a92]">
                Lesson
              </span>
            )}
          </div>
          <p
            className={cn(
              'font-semibold leading-tight',
              isTopic
                ? "font-['Playfair_Display',serif] text-[17px] tracking-[-0.2px] text-[#1a1714] dark:text-[#f2f0eb]"
                : 'text-[14px] text-[#1a1714] dark:text-[#f2f0eb]'
            )}
          >
            {node.title}
          </p>
          {node.description && !open && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
              {node.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex shrink-0 items-center gap-2">
          {isCompleted && (
            <span className="text-[#4caf7d]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
         
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={cn(
              'shrink-0 text-[#6b5f58] transition-transform duration-200 dark:text-[#9b9a92]',
              open && 'rotate-180'
            )}
          >
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-[#e0d0c5] px-4 pb-4 pt-4 dark:border-white/9">
          {isLeaf ? (
            <LessonInlineView trackerId={trackerId} subtopicId={node._id} />
          ) : (
            <div className="space-y-2.5">
              {node.children.map((child) => (
                <RevisionNode
                  key={child._id}
                  node={child}
                  trackerId={trackerId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function count(nodes: FlatNode[]): { total: number; completed: number } {
  let total = 0
  let completed = 0
  for (const n of nodes) {
    if (n.children.length === 0) {
      total++
      if (n.status === 'completed') completed++
    } else {
      const sub = count(n.children)
      total += sub.total
      completed += sub.completed
    }
  }
  return { total, completed }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerQuickRevisionPage() {
  const navigate = useNavigate()
  const { trackerId } = useParams<{ trackerId: string }>()

  const [search, setSearch] = useState('')

  const roadmapQuery = useTrackerRoadmap(trackerId || '')

  const roadmapData = roadmapQuery.data

  const allNodes: FlatNode[] = (roadmapData?.roadmap || []).map(mapTopicToNode)

  const filtered = search.trim()
    ? allNodes
        .map((topic) => {
          const matchesTopic = topic.title
            .toLowerCase()
            .includes(search.toLowerCase())

          const filteredChildren = topic.children.filter((sub) =>
            sub.title.toLowerCase().includes(search.toLowerCase())
          )

          if (matchesTopic || filteredChildren.length > 0) {
            return { ...topic, children: matchesTopic ? topic.children : filteredChildren }
          }
          return null
        })
        .filter(Boolean) as FlatNode[]
    : allNodes

  const { total, completed } = count(allNodes)
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  const isMainLoading = roadmapQuery.isLoading
  const hasMainError = !trackerId || roadmapQuery.isError

  return (
    <AppShellBoundary>
{isMainLoading ? (
  <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
    <div className="w-full max-w-md rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-8 text-center shadow-[0_14px_48px_rgba(26,23,20,0.08)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mx-auto mb-5 h-13 w-13 animate-pulse rounded-2xl bg-[rgba(184,76,43,0.10)] dark:bg-[rgba(232,129,106,0.12)]" />
      <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.18em] text-[#b84c2b] dark:text-[#e8816a]">
        Quick Revision
      </p>
      <h1 className="mt-2 font-['Playfair_Display',serif] text-[28px] font-extrabold tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
        Loading your topics
      </h1>
      <div className="mt-6 space-y-3">
        {[100, 80, 60].map((w) => (
          <div
            key={w}
            className="h-3 animate-pulse rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  </div>
) : hasMainError || !roadmapData ? (
  <div className="flex min-h-[calc(100vh-88px)] items-center justify-center px-4">
    <div className="max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-[#fdf8f5] p-6 text-center shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:bg-[#1e1c19]">
      <h1 className="font-['Playfair_Display',serif] text-[22px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
        Revision unavailable
      </h1>
      <p className="mt-2 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
        Something went wrong loading the revision content.
      </p>
    </div>
  </div>
) : (
  <div className="mx-auto mt-6 w-[min(780px,calc(100%-48px))] max-w-full pb-[calc(80px+env(safe-area-inset-bottom,0)+24px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

    {/* Header */}
    <section className="mb-6 border-b border-[#e0d0c5] pb-6 dark:border-white/9">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/trackers')}
          className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          Trackers
        </button>
        <span className="text-[#6b5f58]/40">/</span>
        <button
          type="button"
          onClick={() => navigate(`/trackers/${trackerId}/roadmap`)}
          className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          {roadmapData.tracker.title}
        </button>
        <span className="text-[#6b5f58]/40">/</span>
        <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
          Quick Revision
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
            ⚡ Quick Revision Mode
          </div>
          <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,4vw,38px)] font-extrabold leading-[1.1] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
            {roadmapData.tracker.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
            Review all lessons inline — expand a topic, open a subtopic, read its lesson.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/trackers/${trackerId}/roadmap`)}
          className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[12px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          ← Back to Roadmap
        </button>
      </div>
    </section>

    {/* Stats */}
    <section className="mb-6 grid grid-cols-3 gap-3 max-[480px]:grid-cols-1">
      <div className="rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_12px_rgba(26,23,20,0.05)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
          Topics
        </div>
        <div className="font-['Playfair_Display',serif] text-[26px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
          {allNodes.length}
        </div>
      </div>

      <div className="rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_12px_rgba(26,23,20,0.05)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
          Lessons Done
        </div>
        <div className="font-['Playfair_Display',serif] text-[26px] font-extrabold leading-none text-[#1a1714] dark:text-[#f2f0eb]">
          {completed}
          <span className="ml-1 font-['DM_Mono',monospace] text-[13px] font-normal text-[#6b5f58] dark:text-[#9b9a92]">
            / {total}
          </span>
        </div>
      </div>

      <div className="rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_12px_rgba(26,23,20,0.05)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
          Readiness
        </div>
        <div
          className={cn(
            "font-['Playfair_Display',serif] text-[26px] font-extrabold leading-none",
            progress >= 80
              ? 'text-[#2d6a47] dark:text-[#5cc98a]'
              : progress >= 40
              ? 'text-[#8a6200] dark:text-[#f0a842]'
              : 'text-[#1a1714] dark:text-[#f2f0eb]'
          )}
        >
          {progress}%
        </div>
      </div>
    </section>

    {/* Progress bar */}
    <section className="mb-6 rounded-[14px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_12px_rgba(26,23,20,0.05)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
          Overall Progress
        </span>
        <span className="font-['DM_Mono',monospace] text-[#b84c2b] dark:text-[#e8816a]">
          {completed} / {total} lessons
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
        <div
          className="h-full rounded-full bg-linear-to-r from-[#e8816a] to-[#b84c2b] transition-all duration-700 dark:from-[#f5a090] dark:to-[#e8816a]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>

    {/* Search */}
    <div className="mb-5 relative">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b5f58] dark:text-[#9b9a92]"
      >
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Search topics or subtopics…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] py-2.5 pl-9 pr-4 text-[13px] text-[#1a1714] outline-none placeholder:text-[#6b5f58]/50 focus:border-[rgba(184,76,43,0.35)] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb] dark:placeholder:text-[#9b9a92]/50 dark:focus:border-[rgba(232,129,106,0.30)]"
      />
    </div>

    {/* Topic list */}
    <section className="space-y-3">
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] p-8 text-center dark:border-white/9 dark:bg-[#1e1c19]">
          <p className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            No topics found
          </p>
          <p className="mt-1.5 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
            Try a different search term.
          </p>
        </div>
      ) : (
        filtered.map((topic) => (
          <RevisionNode
            key={topic._id}
            node={topic}
            trackerId={trackerId!}
            defaultOpen={false}
          />
        ))
      )}
    </section>

    {/* Footer tip */}
    {filtered.length > 0 && (
      <p className="mt-6 text-center font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-40 dark:text-[#9b9a92]">
        Expand topics → subtopics → read lesson inline
      </p>
    )}
  </div>
)}

    </AppShellBoundary>
  )
}
