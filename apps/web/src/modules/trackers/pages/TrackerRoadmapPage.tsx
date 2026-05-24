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

import { useDashboardSummary } from '../../dashboard/hooks/useDashboardSummary'
import { useTrackerRoadmap } from '../hooks/useTrackers'

import type {
  RoadmapSubtopic,
  RoadmapTopic,
} from '../types/tracker.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const LockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1.5" y="4.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path d="M3 4.5V3a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5.5 3.5L9 7L5.5 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CompassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="9" r="1.25" fill="currentColor" />
    <path d="M11.5 6.5L10 9L6.5 11.5L8 9L11.5 6.5Z" fill="currentColor" />
  </svg>
)

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 2L10.85 6.74L16 7.27L12.25 10.47L13.41 15.5L9 12.77L4.59 15.5L5.75 10.47L2 7.27L7.15 6.74L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

const LayersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
)

const CodeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 7L2.5 11L7 15M15 7L19.5 11L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 5L9 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const TypeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const AtomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="11" cy="11" r="2" fill="currentColor" />
    <ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 11 11)" />
    <ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" transform="rotate(120 11 11)" />
  </svg>
)

const ServerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2.5" y="3" width="17" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="2.5" y="10.5" width="17" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="5.5" cy="5.75" r="1" fill="currentColor" />
    <circle cx="5.5" cy="13.25" r="1" fill="currentColor" />
  </svg>
)

const TrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 9h14" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 16.5L5 19M15 16.5L17 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="7.5" cy="12.5" r="1.2" fill="currentColor" />
    <circle cx="14.5" cy="12.5" r="1.2" fill="currentColor" />
  </svg>
)

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 4C18 4 10 4 6 9C3 13 5 19 5 19C5 19 8 17 11 15C14 13 18 4 18 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M5 19C5 19 8 14 11 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const DatabaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="11" cy="5.5" rx="7.5" ry="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.5 5.5V11C3.5 12.38 6.91 13.5 11 13.5C15.09 13.5 18.5 12.38 18.5 11V5.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.5 11V16.5C3.5 17.88 6.91 19 11 19C15.09 19 18.5 17.88 18.5 16.5V11" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const PlugIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 3v4M14 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5" y="7" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M11 13v3M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 3L4 6V11C4 14.87 7.13 18.28 11 19C14.87 18.28 18 14.87 18 11V6L11 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8 11L10.5 13.5L15 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RocketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 3C11 3 16 5 16 11L13 14H9L6 11C6 5 11 3 11 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 14L8 18H14L13 14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="11" cy="9.5" r="1.5" fill="currentColor" />
    <path d="M6 11L3.5 13.5M16 11L18.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="2.5" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 11C5 14.31 7.69 17 11 17C14.31 17 17 14.31 17 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M11 17V20M8.5 20H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const PuzzleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M9 3.5H6C5.17 3.5 4.5 4.17 4.5 5V8C5.33 8 6 8.67 6 9.5C6 10.33 5.33 11 4.5 11V14C4.5 14.83 5.17 15.5 6 15.5H9C9 14.67 9.67 14 10.5 14C11.33 14 12 14.67 12 15.5H15C15.83 15.5 16.5 14.83 16.5 14V11C15.67 11 15 10.33 15 9.5C15 8.67 15.67 8 16.5 8V5C16.5 4.17 15.83 3.5 15 3.5H12C12 4.33 11.33 5 10.5 5C9.67 5 9 4.33 9 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 4.5C4 4.5 6.5 3.5 11 3.5C15.5 3.5 18 4.5 18 4.5V18.5C18 18.5 15.5 17.5 11 17.5C6.5 17.5 4 18.5 4 18.5V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M11 3.5V17.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const BrainIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8.5 5C6.5 5 4.5 6.5 4.5 9C4.5 10 5 10.5 5 11C5 12 4 12.5 4 13.5C4 15.5 5.5 17 7.5 17H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13.5 5C15.5 5 17.5 6.5 17.5 9C17.5 10 17 10.5 17 11C17 12 18 12.5 18 13.5C18 15.5 16.5 17 14.5 17H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M11 5V17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8 8.5C8.5 8 9.5 7.5 11 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M14 8.5C13.5 8 12.5 7.5 11 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const WrenchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14.5 3.5C12.5 3.5 11 5 11 7C11 7.5 11.1 8 11.3 8.4L4.5 15.5C4 16 4 17 4.5 17.5C5 18 6 18 6.5 17.5L13.6 10.7C14 10.9 14.5 11 15 11C17 11 18.5 9.5 18.5 7.5C18.5 7 18.4 6.5 18.2 6.1L15.8 8.5L13.5 6.2L15.9 3.8C15.5 3.6 15 3.5 14.5 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

const LightbulbIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 3C8.24 3 6 5.24 6 8C6 10 7.1 11.8 8.75 12.75V15H13.25V12.75C14.9 11.8 16 10 16 8C16 5.24 13.76 3 11 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M9 15H13M9.5 17.5H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const TargetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="11" r="1.5" fill="currentColor" />
  </svg>
)

const BoxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3.5 7L11 3.5L18.5 7V15L11 18.5L3.5 15V7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M11 3.5V18.5M3.5 7L11 10.5L18.5 7" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

const FALLBACK_ICONS = [
  <BookIcon />,
  <BrainIcon />,
  <WrenchIcon />,
  <LightbulbIcon />,
  <TargetIcon />,
  <BoxIcon />,
]

const getNodeIcon = (title: string, index: number): React.ReactNode => {
  const lower = title.toLowerCase()
  if (lower.includes('javascript')) return <CodeIcon />
  if (lower.includes('typescript')) return <TypeIcon />
  if (lower.includes('react')) return <AtomIcon />
  if (lower.includes('node')) return <ServerIcon />
  if (lower.includes('express')) return <TrainIcon />
  if (lower.includes('mongo')) return <LeafIcon />
  if (lower.includes('database')) return <DatabaseIcon />
  if (lower.includes('api')) return <PlugIcon />
  if (lower.includes('auth')) return <ShieldIcon />
  if (lower.includes('deploy')) return <RocketIcon />
  if (lower.includes('interview')) return <MicIcon />
  if (lower.includes('project')) return <PuzzleIcon />
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getRoadmapStackStorageKey = (trackerId?: string) =>
  `imminiq_roadmap_stack_${trackerId || 'unknown'}`

const readSavedRoadmapStack = (trackerId?: string): BreadcrumbItem[] => {
  if (typeof window === 'undefined' || !trackerId) return []
  try {
    const raw = sessionStorage.getItem(getRoadmapStackStorageKey(trackerId))
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
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const mapSubtopicToNode = (subtopic: RoadmapSubtopic): RoadmapNode => ({
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

const getNodeState = (node: RoadmapNode, isFirstLevel: boolean) => {
  if (isFirstLevel && (node.isLocked || node.status === 'locked')) return 'locked'
  if (node.status === 'completed') return 'completed'
  if (node.status === 'in_progress') return 'active'
  return 'available'
}

// ─── Helpers for fresh node lookup ───────────────────────────────────────────

const findFreshNodes = (
  nodes: RoadmapNode[],
  targetId: string
): RoadmapNode[] | null => {
  for (const node of nodes) {
    if (node._id === targetId) return node.children
    if (node.children.length > 0) {
      const found = findFreshNodes(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

// ─── Flow connectors ─────────────────────────────────────────────────────────

function FlowConnector({ direction }: { direction: 'down' | 'left' | 'right' }) {
  if (direction === 'down') {
    return (
      <div className="h-14 w-full">
        <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <line x1="300" y1="0" x2="300" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" className="text-[rgba(184,76,43,0.30)] dark:text-[rgba(232,129,106,0.28)]" />
        </svg>
      </div>
    )
  }
  return (
    <div className="h-20 w-full max-w-150">
      <svg viewBox="0 0 600 90" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path
          d={direction === 'right' ? 'M 160 0 Q 160 90 440 90' : 'M 440 0 Q 440 90 160 90'}
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

// ─── Roadmap flow node ────────────────────────────────────────────────────────

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
  const progress = Math.min(100, Math.max(0, Number(node.progressPercent ?? 0)))

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
          locked && 'cursor-not-allowed border-[#e0d0c5] opacity-70 dark:border-white/9',
          !locked && 'cursor-pointer border-[#e0d0c5] hover:-translate-y-1 hover:border-[rgba(184,76,43,0.22)] hover:shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-white/9 dark:hover:border-[rgba(232,129,106,0.24)]',
          active && 'border-[#e8816a] shadow-[0_8px_40px_rgba(184,76,43,0.18)] dark:border-[#e8816a]',
          completed && 'border-[rgba(45,106,71,0.20)] dark:border-[rgba(92,201,138,0.22)]'
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
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
            {getNodeIcon(node.title, index)}
            {locked && (
              <div className="absolute bottom-0.75 right-0.75 flex h-5 w-5 items-center justify-center rounded-md border border-[#e0d0c5] bg-[#fdf8f5] text-[#6b5f58] dark:border-white/9 dark:bg-[#252320] dark:text-[#9b9a92]">
                <LockIcon />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
              {node.nodeType === 'topic' ? `Topic ${node.order}` : `Level ${node.order}`}
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
                  locked && 'border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] text-[#6b5f58] dark:border-white/9 dark:bg-white/6 dark:text-[#9b9a92]',
                  active && 'border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]',
                  completed && 'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
                  state === 'available' && 'border-[#e0d0c5] bg-transparent text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]'
                )}
              >
                {locked ? 'Locked' : completed ? 'Completed' : active ? 'In Progress' : hasChildren ? 'Open' : 'Lesson'}
              </span>

              {!locked && (
                <>
                  <div className="h-1.25 min-w-18 flex-1 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/9">
                    <div
                      className={cn(
                        'h-full rounded-full bg-linear-to-r',
                        completed ? 'from-[#70d49a] to-[#4caf7d]' : 'from-[#e8816a] to-[#b84c2b]'
                      )}
                      style={{ width: `${completed ? 100 : progress}%` }}
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
              {hasChildren ? <ChevronRightIcon /> : <ArrowRightIcon />}
            </div>
          )}
        </div>
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const [breadcrumbStack, setBreadcrumbStack] = useState<BreadcrumbItem[]>(() => {
    const state = location.state as RoadmapLocationState | null
    if (state?.roadmapBreadcrumbStack) return state.roadmapBreadcrumbStack
    return readSavedRoadmapStack(trackerId)
  })

  const dashboardSummaryQuery = useDashboardSummary()
  const roadmapQuery = useTrackerRoadmap(trackerId || '')

  const dashboardSummary = dashboardSummaryQuery.data
  const roadmapData = roadmapQuery.data

  const topLevelNodes = useMemo(
    () => (roadmapData?.roadmap || []).map(mapTopicToNode),
    [roadmapData?.roadmap]
  )

  // ✅ Sync breadcrumb nodes with fresh server data using useMemo — no useEffect/setState
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

  const isLoading = dashboardSummaryQuery.isLoading || roadmapQuery.isLoading
  const hasError = dashboardSummaryQuery.isError || roadmapQuery.isError || !trackerId

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
    if (firstLevel && (node.isLocked || node.status === 'locked')) return

    if (node.children.length > 0) {
      setBreadcrumbStack((current) => {
        const nextStack = [...current, { id: node._id, title: node.title, nodes: node.children }]
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
            streakDays={dashboardSummary.streak.current}
            userName={dashboardSummary.user.fullName}
            userInitials={userInitials}
            userAvatarUrl={dashboardSummary.user.avatarUrl || undefined}
            userLevel={formatLevelLabel(dashboardSummary.user.isPremium)}
            isGuest={false}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mt-5.5 flex w-[min(900px,calc(100%-48px))] max-w-full min-w-0 flex-col pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">

              {/* ─── Header / breadcrumbs ─── */}
              <section className="mb-7 border-b border-[#e0d0c5] pb-6 dark:border-white/9">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/trackers')}
                    className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.14em] text-[#6b5f58] transition hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                  >
                    Trackers
                  </button>

                  <span className="text-[#6b5f58]/40 dark:text-[#9b9a92]/40">/</span>

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
                      <span className="text-[#6b5f58]/40 dark:text-[#9b9a92]/40">/</span>
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
                      <span>{currentNodes.length} node{currentNodes.length === 1 ? '' : 's'}</span>
                      <span className="h-1 w-1 rounded-full bg-[#6b5f58]/40 dark:bg-[#9b9a92]/40" />
                      <span>{isFirstLevel ? 'Locked nodes apply here' : 'All inner nodes are open'}</span>
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

              {/* ─── Stat cards ─── */}
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

              {/* ─── Progress bar ─── */}
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

              {/* ─── Flow ─── */}
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
                      <div key={node._id} className="flex w-full flex-col items-center">
                        <RoadmapFlowNode
                          node={node}
                          index={index}
                          isFirstLevel={isFirstLevel}
                          onClick={() => handleNodeClick(node)}
                        />
                        {index < currentNodes.length - 1 && (
                          <FlowConnector direction={index % 2 === 0 ? 'right' : 'left'} />
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

            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}