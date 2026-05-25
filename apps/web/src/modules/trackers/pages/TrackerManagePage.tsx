import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/layout/Sidebar'
import TopBar from '../../../components/layout/TopBar'
import AppFooter from '../../../components/layout/Footer'
import BottomNav from '../../../components/layout/BottomNav'

import { useDashboardSummary } from '../../dashboard/hooks/useDashboardSummary'

import {
  useCreateTrackerSubtopic,
  useCreateTrackerTopic,
  useTrackerDetails,
  useTrackerRoadmap,
  useUpdateTracker,
} from '../hooks/useTrackers'

import {
  useVerifyTrackerSubtopic,
  useVerifyTrackerTopic,
} from '../hooks/useTrackerAiVerification'

import type { Tracker } from '../types/tracker.types'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

// ─── Types ───────────────────────────────────────────────────────────────────

type RawRoadmapNode = Record<string, unknown>

type RoadmapSubtopicNode = {
  _id: string
  title: string
  description?: string
  difficulty?: string
  level?: string
  order?: number
  children?: RoadmapSubtopicNode[]
  subtopics?: RoadmapSubtopicNode[]
}

type RoadmapTopicNode = {
  _id: string
  title: string
  description?: string
  order?: number
  subtopicsCount?: number
  children?: RoadmapSubtopicNode[]
  subtopics?: RoadmapSubtopicNode[]
}

type TrackerRoadmapLike = {
  tracker?: Tracker
  topics?: unknown[]
  topicTree?: unknown[]
  roadmapTopics?: unknown[]
  roadmap?:
    | unknown[]
    | {
        topics?: unknown[]
        topicTree?: unknown[]
        roadmapTopics?: unknown[]
      }
  data?: {
    tracker?: Tracker
    topics?: unknown[]
    topicTree?: unknown[]
    roadmapTopics?: unknown[]
    roadmap?:
      | unknown[]
      | {
          topics?: unknown[]
          topicTree?: unknown[]
          roadmapTopics?: unknown[]
        }
  }
}

type SubtopicDifficulty = 'beginner' | 'intermediate' | 'advanced'

type AiVerificationStatus = 'idle' | 'checking' | 'approved' | 'rejected'

type AiVerificationState = {
  status: AiVerificationStatus
  message: string | null
}

// ─── Normalization helpers ────────────────────────────────────────────────────

const getRawId = (node: RawRoadmapNode) => {
  const rawId = node._id || node.id || node.topicId || node.subtopicId

  if (typeof rawId === 'string') return rawId

  if (
    rawId &&
    typeof rawId === 'object' &&
    'toString' in rawId &&
    typeof rawId.toString === 'function'
  ) {
    return rawId.toString()
  }

  return ''
}

const getRawText = (
  node: RawRoadmapNode,
  keys: string[],
  fallback = ''
) => {
  for (const key of keys) {
    const value = node[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return fallback
}

const getRawNumber = (node: RawRoadmapNode, key: string) => {
  const value = node[key]
  return typeof value === 'number' ? value : undefined
}

const getRawArray = (node: RawRoadmapNode, keys: string[]): unknown[] => {
  for (const key of keys) {
    const value = node[key]

    if (Array.isArray(value)) {
      return value
    }
  }

  return []
}

const isRawNode = (value: unknown): value is RawRoadmapNode =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

const normalizeSubtopicNode = (
  value: unknown,
  fallbackIndex: number
): RoadmapSubtopicNode | null => {
  if (!isRawNode(value)) return null

  const wrappedSubtopic = value.subtopic
  const source = isRawNode(wrappedSubtopic) ? wrappedSubtopic : value
  const id = getRawId(source) || getRawId(value)

  if (!id) return null

  const children = getRawArray(source, [
    'children',
    'subtopics',
    'childSubtopics',
    'nodes',
  ])
    .map((child, index) => normalizeSubtopicNode(child, index))
    .filter((child): child is RoadmapSubtopicNode => Boolean(child))

  return {
    _id: id,
    title: getRawText(
      source,
      ['title', 'name'],
      `Subtopic ${fallbackIndex + 1}`
    ),
    description: getRawText(source, ['description', 'summary']),
    difficulty: getRawText(source, ['difficulty']),
    level: getRawText(source, ['level']),
    order: getRawNumber(source, 'order') ?? getRawNumber(value, 'order'),
    children,
    subtopics: children,
  }
}

const normalizeTopicNode = (
  value: unknown,
  fallbackIndex: number
): RoadmapTopicNode | null => {
  if (!isRawNode(value)) return null

  const wrappedTopic = value.topic
  const source = isRawNode(wrappedTopic) ? wrappedTopic : value
  const id = getRawId(source) || getRawId(value)

  if (!id) return null

  const subtopics = getRawArray(value, [
    'subtopics',
    'children',
    'lessons',
    'nodes',
  ])
    .concat(
      getRawArray(source, ['subtopics', 'children', 'lessons', 'nodes'])
    )
    .map((subtopic, index) => normalizeSubtopicNode(subtopic, index))
    .filter((subtopic): subtopic is RoadmapSubtopicNode =>
      Boolean(subtopic)
    )

  const seen = new Set<string>()

  const uniqueSubtopics = subtopics.filter((subtopic) => {
    if (seen.has(subtopic._id)) return false

    seen.add(subtopic._id)
    return true
  })

  return {
    _id: id,
    title: getRawText(source, ['title', 'name'], `Topic ${fallbackIndex + 1}`),
    description: getRawText(source, ['description', 'summary']),
    order: getRawNumber(source, 'order') ?? getRawNumber(value, 'order'),
    subtopicsCount:
      getRawNumber(source, 'subtopicsCount') ??
      getRawNumber(value, 'subtopicsCount') ??
      uniqueSubtopics.length,
    children: uniqueSubtopics,
    subtopics: uniqueSubtopics,
  }
}

const getChildren = (node?: RoadmapTopicNode | RoadmapSubtopicNode) =>
  node?.children || node?.subtopics || []

const countNestedSubtopics = (
  nodes: RoadmapSubtopicNode[] = []
): number =>
  nodes.reduce(
    (total, node) => total + 1 + countNestedSubtopics(getChildren(node)),
    0
  )

const extractFirstArray = (...values: unknown[]) =>
  values.find((value): value is unknown[] => Array.isArray(value)) || []

const extractRoadmapTopics = (
  roadmapData?: TrackerRoadmapLike
): RoadmapTopicNode[] => {
  const roadmap = roadmapData?.roadmap
  const dataRoadmap = roadmapData?.data?.roadmap

  const rawTopics = extractFirstArray(
    Array.isArray(roadmap) ? roadmap : undefined,
    Array.isArray(dataRoadmap) ? dataRoadmap : undefined,
    roadmapData?.topics,
    roadmapData?.topicTree,
    roadmapData?.roadmapTopics,
    !Array.isArray(roadmap)
      ? (roadmap as { topics?: unknown[] })?.topics
      : undefined,
    !Array.isArray(roadmap)
      ? (roadmap as { topicTree?: unknown[] })?.topicTree
      : undefined,
    !Array.isArray(roadmap)
      ? (roadmap as { roadmapTopics?: unknown[] })?.roadmapTopics
      : undefined,
    roadmapData?.data?.topics,
    roadmapData?.data?.topicTree,
    roadmapData?.data?.roadmapTopics,
    !Array.isArray(dataRoadmap)
      ? (dataRoadmap as { topics?: unknown[] })?.topics
      : undefined,
    !Array.isArray(dataRoadmap)
      ? (dataRoadmap as { topicTree?: unknown[] })?.topicTree
      : undefined,
    !Array.isArray(dataRoadmap)
      ? (dataRoadmap as { roadmapTopics?: unknown[] })?.roadmapTopics
      : undefined
  )

  return rawTopics
    .map((topic, index) => normalizeTopicNode(topic, index))
    .filter((topic): topic is RoadmapTopicNode => Boolean(topic))
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
}

const extractRoadmapTracker = (
  roadmapData?: TrackerRoadmapLike
): Tracker | undefined => roadmapData?.tracker || roadmapData?.data?.tracker

// ── Flatten all subtopics recursively for parent selector ──
const flattenSubtopics = (
  nodes: RoadmapSubtopicNode[],
  depth = 0
): { node: RoadmapSubtopicNode; depth: number }[] =>
  nodes.flatMap((node) => [
    { node, depth },
    ...flattenSubtopics(getChildren(node), depth + 1),
  ])

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatLevelLabel = (isPremium: boolean) =>
  isPremium ? 'Imminiq Pro' : 'Free Scholar'

const getVerificationMessageClass = (status: AiVerificationStatus) =>
  cn(
    'rounded-[11px] border px-3 py-2 text-[12.5px] font-semibold leading-relaxed',
    status === 'approved' &&
      'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
    status === 'rejected' &&
      'border-red-300 bg-red-50 text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300',
    status === 'checking' &&
      'border-[#e0d0c5] bg-[#f5ede4] text-[#6b5f58] dark:border-white/15 dark:bg-[#141412] dark:text-[#9b9a92]'
  )

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-3.5 py-3 text-[13px] font-medium text-[#1a1714] outline-none transition placeholder:text-[#6b5f58]/45 focus:border-[#b84c2b] focus:ring-3 focus:ring-[rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#9b9a92]/45 dark:focus:border-[#e8816a]'

const labelClass =
  'mb-1.5 block font-mono text-[9px] uppercase tracking-[0.13em] text-[#6b5f58]/70 dark:text-[#9b9a92]/70'

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#1a1714] px-4 py-3 text-[13px] font-bold text-[#f5ede4] transition hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,23,20,0.20)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#f2f0eb] dark:text-[#141412]'

const subtleButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[13px] font-bold text-[#6b5f58] transition hover:-translate-y-px hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/15 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:border-[#e8816a] dark:hover:text-[#e8816a]'

// ─── Subtopic tree renderer ───────────────────────────────────────────────────

function SubtopicTreeNode({
  subtopic,
  index,
  depth = 0,
}: {
  subtopic: RoadmapSubtopicNode
  index: number
  depth?: number
}) {
  const children = getChildren(subtopic)

  return (
    <div>
      <div
        className={cn(
          'rounded-[14px] border border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/15 dark:bg-[#1e1c19]',
          depth > 0 && 'bg-[#faf6f3] dark:bg-[#1a1815]'
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {depth > 0 && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#b84c2b]/60 dark:text-[#e8816a]/60">
                  {'└─'.repeat(depth)}
                </span>
              )}

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[12px] font-bold text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                {index + 1}
              </span>

              <h4 className="font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                {subtopic.title}
              </h4>

              {(subtopic.difficulty || subtopic.level) && (
                <span className="rounded-sm border border-[#e0d0c5] px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[#6b5f58] dark:border-white/15 dark:text-[#9b9a92]">
                  {subtopic.difficulty || subtopic.level}
                </span>
              )}

              {children.length > 0 && (
                <span className="rounded-full border border-[#e0d0c5] px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-[#6b5f58] dark:border-white/15 dark:text-[#9b9a92]">
                  {children.length} nested
                </span>
              )}
            </div>

            {subtopic.description && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                {subtopic.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="ml-5 mt-2 space-y-2 border-l-2 border-[#e0d0c5] pl-4 dark:border-white/15">
          {children.map((child, childIndex) => (
            <SubtopicTreeNode
              key={child._id}
              subtopic={child}
              index={childIndex}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Loading / Empty panels ───────────────────────────────────────────────────

function LoadingPanel() {
  return (
    <div className="flex min-h-105 w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
      <div className="flex flex-col items-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[#b84c2b] dark:border-t-[#e8816a]" />
        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Loading tracker manager
        </p>
        <p className="mt-2 max-w-90 text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          Fetching tracker details, topics, and roadmap structure.
        </p>
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-80 w-full items-center justify-center rounded-[18px] border border-[#e0d0c5] bg-[#fdf8f5] px-6 text-center shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
      <div>
        <p className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
          Tracker unavailable
        </p>
        <p className="mt-2 max-w-115 text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
          {message}
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className={cn(subtleButtonClass, 'mt-5')}
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerManagePage() {
  const { trackerId } = useParams<{ trackerId: string }>()
  const navigate = useNavigate()

  // ── Layout state ──
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('imminiq_sb') === 'closed'
  )

  // ── Data queries ──
  const dashboardSummaryQuery = useDashboardSummary()
  const trackerDetailsQuery = useTrackerDetails(trackerId)
  const roadmapQuery = useTrackerRoadmap(trackerId)

  const updateTrackerMutation = useUpdateTracker()
  const createTopicMutation = useCreateTrackerTopic()
  const createSubtopicMutation = useCreateTrackerSubtopic()
  const verifyTopicMutation = useVerifyTrackerTopic()
  const verifySubtopicMutation = useVerifyTrackerSubtopic()

  const dashboardSummary = dashboardSummaryQuery.data
  const roadmapData = roadmapQuery.data as TrackerRoadmapLike | undefined
  const tracker = trackerDetailsQuery.data || extractRoadmapTracker(roadmapData)

  const roadmapDataStr = JSON.stringify(roadmapData)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const topics = useMemo(() => extractRoadmapTopics(roadmapData), [
    roadmapDataStr,
  ])

  // ── UI state ──
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [trackerTitleDraft, setTrackerTitleDraft] = useState<string | null>(null)

  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')

  const [newSubtopicTitle, setNewSubtopicTitle] = useState('')
  const [newSubtopicDescription, setNewSubtopicDescription] = useState('')
  const [newSubtopicDifficulty, setNewSubtopicDifficulty] =
    useState<SubtopicDifficulty>('beginner')
  const [newSubtopicParentId, setNewSubtopicParentId] = useState<string | null>(null)

  const [topicVerification, setTopicVerification] =
    useState<AiVerificationState>({ status: 'idle', message: null })

  const [subtopicVerification, setSubtopicVerification] =
    useState<AiVerificationState>({ status: 'idle', message: null })

  // ── Mutation in-flight guards ──
  const subtopicCreating = useRef(false)
  const topicCreating = useRef(false)
  const trackerSaving = useRef(false)

  const activeTopic = useMemo(
    () => topics.find((topic) => topic._id === selectedTopicId) || topics[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roadmapDataStr, selectedTopicId]
  )

  const activeSubtopics = useMemo(
    () => getChildren(activeTopic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTopic?._id, roadmapDataStr]
  )

  // Flat list of all subtopics (including nested) for the parent selector
  const flatSubtopics = useMemo(
    () => flattenSubtopics(activeSubtopics),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTopic?._id, roadmapDataStr]
  )

  const totalSubtopics = useMemo(
    () =>
      topics.reduce(
        (total, topic) => total + countNestedSubtopics(getChildren(topic)),
        0
      ),
    [topics]
  )

  const trackerTitle = trackerTitleDraft ?? tracker?.title ?? ''

  const topicTitleReady = Boolean(newTopicTitle.trim())
  const subtopicTitleReady = Boolean(newSubtopicTitle.trim())

  const canAddTopic =
    topicTitleReady &&
    topicVerification.status === 'approved' &&
    !createTopicMutation.isPending

  const canAddSubtopic =
    Boolean(activeTopic?._id) &&
    subtopicTitleReady &&
    subtopicVerification.status === 'approved' &&
    !createSubtopicMutation.isPending

  // ── Helpers ──
  const clearMessages = () => {
    setStatusMessage(null)
    setErrorMessage(null)
  }

  const resetTopicVerification = () =>
    setTopicVerification({ status: 'idle', message: null })

  const resetSubtopicVerification = () =>
    setSubtopicVerification({ status: 'idle', message: null })

  // ── Handlers ──
  const handleTopicTitleChange = (value: string) => {
    setNewTopicTitle(value)
    resetTopicVerification()
  }

  const handleTopicDescriptionChange = (value: string) => {
    setNewTopicDescription(value)
    resetTopicVerification()
  }

  const handleSubtopicTitleChange = (value: string) => {
    setNewSubtopicTitle(value)
    resetSubtopicVerification()
  }

  const handleSubtopicDescriptionChange = (value: string) => {
    setNewSubtopicDescription(value)
    resetSubtopicVerification()
  }

  const handleSubtopicDifficultyChange = (value: SubtopicDifficulty) => {
    setNewSubtopicDifficulty(value)
    resetSubtopicVerification()
  }

  const handleSubtopicParentChange = (value: string) => {
    setNewSubtopicParentId(value || null)
    resetSubtopicVerification()
  }

  const handleSaveTracker = async () => {
    if (!trackerId || trackerSaving.current) return

    clearMessages()

    if (!trackerTitle.trim()) {
      setErrorMessage('Tracker name is required.')
      return
    }

    trackerSaving.current = true

    try {
      await updateTrackerMutation.mutateAsync({
        trackerId,
        title: trackerTitle.trim(),
      } as Parameters<typeof updateTrackerMutation.mutateAsync>[0])

      setTrackerTitleDraft(null)
      setStatusMessage('Tracker name updated.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to update tracker.'
      )
    } finally {
      trackerSaving.current = false
    }
  }

  const handleVerifyTopic = async () => {
    if (!trackerId) return

    clearMessages()

    if (!newTopicTitle.trim()) {
      setTopicVerification({
        status: 'rejected',
        message: 'Topic title is required before AI verification.',
      })
      return
    }

    setTopicVerification({
      status: 'checking',
      message: 'AI is checking whether this topic belongs in this tracker...',
    })

    try {
      const result = await verifyTopicMutation.mutateAsync({
        trackerId,
        trackerTitle: trackerTitle.trim(),
        topicTitle: newTopicTitle.trim(),
        topicDescription: newTopicDescription.trim(),
        existingTopics: topics.map((topic) => ({
          id: topic._id,
          title: topic.title,
          description: topic.description || '',
        })),
      })

      setTopicVerification({
        status: result.verified ? 'approved' : 'rejected',
        message: result.message,
      })

      if (result.verified) {
        setNewTopicTitle(result.polishedTitle ?? newTopicTitle)
        setNewTopicDescription(result.polishedDescription ?? newTopicDescription)
      }
    } catch (error) {
      setTopicVerification({
        status: 'rejected',
        message:
          error instanceof Error
            ? error.message
            : 'AI verification failed. Please try again.',
      })
    }
  }

  const handleVerifySubtopic = async () => {
    if (!trackerId || !activeTopic?._id) return

    clearMessages()

    if (!newSubtopicTitle.trim()) {
      setSubtopicVerification({
        status: 'rejected',
        message: 'Subtopic title is required before AI verification.',
      })
      return
    }

    setSubtopicVerification({
      status: 'checking',
      message:
        'AI is checking whether this subtopic belongs under the selected topic...',
    })

    // If a parent subtopic is selected, include it in the topic context for AI
    const parentSubtopic = newSubtopicParentId
      ? flatSubtopics.find((s) => s.node._id === newSubtopicParentId)?.node
      : null

    const effectiveTopicTitle = parentSubtopic
      ? `${activeTopic.title} > ${parentSubtopic.title}`
      : activeTopic.title

    try {
      const result = await verifySubtopicMutation.mutateAsync({
        trackerId,
        trackerTitle: trackerTitle.trim(),
        topicId: activeTopic._id,
        topicTitle: effectiveTopicTitle,
        topicDescription: activeTopic.description || '',
        subtopicTitle: newSubtopicTitle.trim(),
        subtopicDescription: newSubtopicDescription.trim(),
        difficulty: newSubtopicDifficulty,
        existingSubtopics: activeSubtopics.map((subtopic) => ({
          id: subtopic._id,
          title: subtopic.title,
          description: subtopic.description || '',
          difficulty: subtopic.difficulty || subtopic.level || '',
        })),
      })

      setSubtopicVerification({
        status: result.verified ? 'approved' : 'rejected',
        message: result.message,
      })

      if (result.verified) {
        setNewSubtopicTitle(result.polishedTitle ?? newSubtopicTitle)
        setNewSubtopicDescription(result.polishedDescription ?? newSubtopicDescription)
      }
    } catch (error) {
      setSubtopicVerification({
        status: 'rejected',
        message:
          error instanceof Error
            ? error.message
            : 'AI verification failed. Please try again.',
      })
    }
  }

  const handleCreateTopic = async () => {
    if (!trackerId || topicCreating.current) return

    clearMessages()

    if (!newTopicTitle.trim()) {
      setErrorMessage('Topic title is required.')
      return
    }

    if (topicVerification.status !== 'approved') {
      setErrorMessage('Please verify this topic with AI before adding it.')
      return
    }

    topicCreating.current = true

    try {
      await createTopicMutation.mutateAsync({
        trackerId,
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim(),
      })

      setNewTopicTitle('')
      setNewTopicDescription('')
      resetTopicVerification()
      setStatusMessage('Topic added.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to add topic.'
      )
    } finally {
      topicCreating.current = false
    }
  }

  const handleCreateSubtopic = async () => {
    if (!trackerId || !activeTopic?._id || subtopicCreating.current) return

    clearMessages()

    if (!newSubtopicTitle.trim()) {
      setErrorMessage('Subtopic title is required.')
      return
    }

    if (subtopicVerification.status !== 'approved') {
      setErrorMessage('Please verify this subtopic with AI before adding it.')
      return
    }

    subtopicCreating.current = true

    try {
      await createSubtopicMutation.mutateAsync({
        trackerId,
        topicId: activeTopic._id,
        title: newSubtopicTitle.trim(),
        description: newSubtopicDescription.trim(),
        parentSubtopicId: newSubtopicParentId || undefined,
      })

      setNewSubtopicTitle('')
      setNewSubtopicDescription('')
      setNewSubtopicDifficulty('beginner')
      setNewSubtopicParentId(null)
      resetSubtopicVerification()
      setStatusMessage('Subtopic added.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to add subtopic.'
      )
    } finally {
      subtopicCreating.current = false
    }
  }

  // ── Loading / error flags ──
  const isLoading =
    dashboardSummaryQuery.isLoading ||
    trackerDetailsQuery.isLoading ||
    roadmapQuery.isLoading

  const hasError =
    !trackerId ||
    dashboardSummaryQuery.isError ||
    trackerDetailsQuery.isError ||
    roadmapQuery.isError

  const savingTracker = updateTrackerMutation.isPending
  const creatingTopic = createTopicMutation.isPending
  const creatingSubtopic = createSubtopicMutation.isPending

  const verifyingTopic =
    topicVerification.status === 'checking' || verifyTopicMutation.isPending

  const verifyingSubtopic =
    subtopicVerification.status === 'checking' ||
    verifySubtopicMutation.isPending

  // ── TopBar props ──
  const topBarUserName = dashboardSummary?.user.fullName || 'Learner'
  const topBarInitials = getInitials(topBarUserName)
  const topBarStreakDays = dashboardSummary?.streak.current ?? 0
  const topBarAvatarUrl = dashboardSummary?.user.avatarUrl || undefined
  const topBarLevel = dashboardSummary
    ? formatLevelLabel(dashboardSummary.user.isPremium)
    : 'Free Scholar'

  const shell = (children: ReactNode) => (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5ede4] font-[DM_Sans,sans-serif] text-[#1a1714] dark:bg-[#141412] dark:text-[#f2f0eb]">
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
            {children}
            <AppFooter />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )

  if (isLoading) {
    return shell(
      <div className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
        <LoadingPanel />
      </div>
    )
  }

  if (hasError || !tracker) {
    return shell(
      <div className="mx-auto flex w-full max-w-280 flex-1 items-center px-4 py-8 sm:px-6 md:px-12">
        <EmptyPanel message="Unable to fetch this tracker for editing." />
      </div>
    )
  }

  return shell(
    <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] sm:px-6 sm:py-8 md:px-12 md:py-10">
      <section className="relative overflow-hidden rounded-[18px] bg-[#1a1714] px-5 py-6 text-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:bg-[#0f0e0c] sm:px-7 sm:py-7 md:px-9 md:py-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-55 w-55 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.20)_0%,transparent_70%)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.32)] bg-[rgba(184,76,43,0.20)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e8816a]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8816a]" />
              Manage Tracker
            </div>

            <h1 className="max-w-175 font-serif text-[clamp(24px,5vw,38px)] font-extrabold leading-[1.08] tracking-[-1px]">
              {trackerTitle || tracker.title}
            </h1>

            <p className="mt-3 max-w-175 text-sm leading-relaxed text-[#f2f0eb]/70">
              Edit tracker name, add AI-verified topics, and manage roadmap
              subtopics from one place.
            </p>
          </div>

          <div className="flex shrink-0 gap-5">
            <div className="flex flex-col sm:items-end">
              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                Topics
              </span>
              <span className="font-serif text-[34px] font-extrabold leading-none text-[#f0a842]">
                {topics.length}
              </span>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-[#f2f0eb]/40">
                Subtopics
              </span>
              <span className="font-serif text-[34px] font-extrabold leading-none text-[#fdf8f5]">
                {totalSubtopics}
              </span>
            </div>
          </div>
        </div>
      </section>

      {(statusMessage || errorMessage) && (
        <div
          className={cn(
            'rounded-[13px] border px-4 py-3 text-[13px] font-semibold',
            statusMessage &&
              'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.25)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
            errorMessage &&
              'border-red-300 bg-red-50 text-red-600 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300'
          )}
        >
          {statusMessage || errorMessage}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* ── Tracker name ── */}
          <section className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19] sm:p-6">
            <div className="mb-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                Tracker Details
              </p>
              <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-[-0.5px]">
                Edit tracker name
              </h2>
            </div>

            <div>
              <label className={labelClass}>Tracker name</label>
              <input
                value={trackerTitle}
                onChange={(event) => setTrackerTitleDraft(event.target.value)}
                className={inputClass}
                placeholder="Example: MERN Stack Interview Roadmap"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveTracker}
                disabled={savingTracker}
                className={buttonClass}
              >
                {savingTracker ? 'Saving...' : 'Save Name'}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trackers/${trackerId}/roadmap`)}
                className={subtleButtonClass}
              >
                Open Roadmap
              </button>
            </div>
          </section>

          {/* ── Topics & subtopics ── */}
          <section className="overflow-hidden rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
            <div className="border-b border-[#e0d0c5] p-5 dark:border-white/15 sm:p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b84c2b] dark:text-[#e8816a]">
                Current Roadmap
              </p>
              <h2 className="mt-1 font-serif text-2xl font-extrabold tracking-[-0.5px]">
                Topics &amp; subtopics
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                Select a topic to view its subtopics. Nested subtopics are shown
                indented below their parent.
              </p>
            </div>

            {topics.length ? (
              <>
                <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
                  {topics.map((topic) => {
                    const active = topic._id === activeTopic?._id

                    return (
                      <button
                        key={topic._id}
                        type="button"
                        onClick={() => {
                          setSelectedTopicId(topic._id)
                          resetSubtopicVerification()
                          setNewSubtopicParentId(null)
                        }}
                        className={cn(
                          'rounded-full border-[1.5px] px-3 py-2 text-[12.5px] font-medium transition',
                          active
                            ? 'border-[#b84c2b] bg-[#b84c2b] text-[#fdf8f5] dark:border-[#e8816a] dark:bg-[#e8816a] dark:text-[#141412]'
                            : 'border-[#e0d0c5] bg-transparent text-[#6b5f58] hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/15 dark:text-[#9b9a92]'
                        )}
                      >
                        {topic.title}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 border-y-[1.5px] border-[#e0d0c5] px-4 py-4 dark:border-white/15 sm:px-6">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
                    Selected Topic
                  </div>

                  <h3 className="font-serif text-[clamp(18px,3vw,24px)] font-bold tracking-[-0.3px] text-[#b84c2b] dark:text-[#e8816a]">
                    {activeTopic?.title || 'Roadmap Topic'}
                  </h3>

                  {activeTopic?.description && (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                      {activeTopic.description}
                    </p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6b5f58]/60 dark:text-[#9b9a92]/60">
                        Subtopics
                      </p>
                      <h3 className="font-serif text-xl font-bold tracking-[-0.3px]">
                        {activeTopic?.title || 'Selected topic'} lessons
                      </h3>
                    </div>

                    <span className="rounded-full border border-[#e0d0c5] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:border-white/15 dark:text-[#9b9a92]">
                      {countNestedSubtopics(activeSubtopics)} items
                    </span>
                  </div>

                  {activeSubtopics.length ? (
                    <div className="space-y-3">
                      {activeSubtopics.map((subtopic, index) => (
                        <SubtopicTreeNode
                          key={subtopic._id}
                          subtopic={subtopic}
                          index={index}
                          depth={0}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[14px] border border-dashed border-[#e0d0c5] p-5 text-center text-sm text-[#6b5f58] dark:border-white/15 dark:text-[#9b9a92]">
                      This topic has no subtopics yet.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <h3 className="font-serif text-xl font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  No roadmap topics yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
                  Add a topic from the side panel to start building your
                  roadmap.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          {/* ── Add Topic ── */}
          <section className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
            <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">
              Add Topic
            </h3>

            <p className="mt-1 text-[12.5px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
              Verify the topic with AI first. You can add it only if it belongs
              to this tracker.
            </p>

            <div className="mt-4 grid gap-3">
              <div>
                <label className={labelClass}>Topic title</label>
                <input
                  value={newTopicTitle}
                  onChange={(event) =>
                    handleTopicTitleChange(event.target.value)
                  }
                  className={inputClass}
                  placeholder="Example: React Hooks"
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={newTopicDescription}
                  onChange={(event) =>
                    handleTopicDescriptionChange(event.target.value)
                  }
                  className={cn(inputClass, 'min-h-20 resize-y')}
                  placeholder="What this topic covers"
                />
              </div>

              {topicVerification.status !== 'idle' && (
                <div
                  className={getVerificationMessageClass(
                    topicVerification.status
                  )}
                >
                  {topicVerification.message}
                </div>
              )}

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleVerifyTopic}
                  disabled={!topicTitleReady || verifyingTopic || creatingTopic}
                  className={subtleButtonClass}
                >
                  {verifyingTopic ? 'Verifying with AI...' : 'Verify with AI'}
                </button>

                <button
                  type="button"
                  onClick={handleCreateTopic}
                  disabled={!canAddTopic}
                  className={buttonClass}
                  title={
                    topicVerification.status === 'approved'
                      ? 'Add verified topic'
                      : 'Verify this topic with AI before adding'
                  }
                >
                  {creatingTopic ? 'Adding topic...' : 'Add Topic'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Add Subtopic ── */}
          <section className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_4px_24px_rgba(26,23,20,0.07),0_1px_4px_rgba(26,23,20,0.04)] dark:border-white/15 dark:bg-[#1e1c19]">
            <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">
              Add Subtopic
            </h3>

            <p className="mt-1 text-[12.5px] leading-relaxed text-[#6b5f58] dark:text-[#9b9a92]">
              Verify the subtopic with AI first. Optionally nest it under an
              existing subtopic.
            </p>

            <div className="mt-4 grid gap-3">
              {/* Selected topic display */}
              <div>
                <label className={labelClass}>Selected topic</label>
                <div className="rounded-[11px] border-[1.5px] border-[#e0d0c5] bg-[#f5ede4] px-3.5 py-3 text-[13px] font-bold text-[#b84c2b] dark:border-white/15 dark:bg-[#141412] dark:text-[#e8816a]">
                  {activeTopic?.title || 'No topic selected'}
                </div>
              </div>

              {/* Parent subtopic selector */}
              <div>
                <label className={labelClass}>
                  Parent subtopic{' '}
                  <span className="normal-case tracking-normal opacity-60">
                    (optional — for nested subtopics)
                  </span>
                </label>
                <select
                  value={newSubtopicParentId || ''}
                  onChange={(event) =>
                    handleSubtopicParentChange(event.target.value)
                  }
                  className={inputClass}
                  disabled={!activeTopic || flatSubtopics.length === 0}
                >
                  <option value="">None — add as top-level subtopic</option>
                  {flatSubtopics.map(({ node, depth }) => (
                    <option key={node._id} value={node._id}>
                      {'  '.repeat(depth)}
                      {depth > 0 ? '└ ' : ''}
                      {node.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected parent badge */}
              {newSubtopicParentId && (
                <div className="flex items-center gap-2 rounded-[10px] border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-3 py-2 dark:border-[rgba(232,129,106,0.20)] dark:bg-[rgba(232,129,106,0.08)]">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                    Nesting under:
                  </span>
                  <span className="text-[12.5px] font-semibold text-[#b84c2b] dark:text-[#e8816a]">
                    {flatSubtopics.find((s) => s.node._id === newSubtopicParentId)
                      ?.node.title || '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSubtopicParentId(null)
                      resetSubtopicVerification()
                    }}
                    className="ml-auto font-mono text-[10px] text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className={labelClass}>Subtopic title</label>
                <input
                  value={newSubtopicTitle}
                  onChange={(event) =>
                    handleSubtopicTitleChange(event.target.value)
                  }
                  className={inputClass}
                  placeholder="Example: useEffect cleanup"
                  disabled={!activeTopic}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={newSubtopicDescription}
                  onChange={(event) =>
                    handleSubtopicDescriptionChange(event.target.value)
                  }
                  className={cn(inputClass, 'min-h-20 resize-y')}
                  placeholder="What learner should understand"
                  disabled={!activeTopic}
                />
              </div>

              <div>
                <label className={labelClass}>Difficulty</label>
                <select
                  value={newSubtopicDifficulty}
                  onChange={(event) =>
                    handleSubtopicDifficultyChange(
                      event.target.value as SubtopicDifficulty
                    )
                  }
                  className={inputClass}
                  disabled={!activeTopic}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {subtopicVerification.status !== 'idle' && (
                <div
                  className={getVerificationMessageClass(
                    subtopicVerification.status
                  )}
                >
                  {subtopicVerification.message}
                </div>
              )}

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleVerifySubtopic}
                  disabled={
                    !activeTopic ||
                    !subtopicTitleReady ||
                    verifyingSubtopic ||
                    creatingSubtopic
                  }
                  className={subtleButtonClass}
                >
                  {verifyingSubtopic
                    ? 'Verifying with AI...'
                    : 'Verify with AI'}
                </button>

                <button
                  type="button"
                  onClick={handleCreateSubtopic}
                  disabled={!canAddSubtopic}
                  className={buttonClass}
                  title={
                    subtopicVerification.status === 'approved'
                      ? 'Add verified subtopic'
                      : 'Verify this subtopic with AI before adding'
                  }
                >
                  {creatingSubtopic ? 'Adding subtopic...' : 'Add Subtopic'}
                </button>
              </div>
            </div>
          </section>

          {/* ── Summary ── */}
          <section className="rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 dark:border-white/15 dark:bg-[#1e1c19]">
            <h3 className="font-serif text-[18px] font-bold tracking-[-0.3px]">
              Summary
            </h3>

            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-[10px] border border-[#e0d0c5] px-3 py-3 dark:border-white/15">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                  Topics
                </span>
                <span className="font-serif text-[22px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                  {topics.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-[10px] border border-[#e0d0c5] px-3 py-3 dark:border-white/15">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                  Subtopics
                </span>
                <span className="font-serif text-[22px] font-bold text-[#b84c2b] dark:text-[#e8816a]">
                  {totalSubtopics}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}