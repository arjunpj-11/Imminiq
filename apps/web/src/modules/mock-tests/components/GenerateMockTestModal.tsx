import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from '../constants/mock-tests.constants'
import { useTrackers, useTrackerRoadmap } from '../../trackers/hooks/useTrackers'
import { useGenerateMockTest } from '../hooks/useMockTests'
import { useMockTestsStore } from '../store/mockTests.store'
import { cn } from '../utils/mock-tests-formatters'
import { SparklesIcon } from './MockTestIcons'
import type { QuestionType } from '../types/mock-tests.types'
import type {
  RoadmapSubtopic,
  RoadmapTopic,
} from '../../trackers/types/tracker.types'

interface FlatNode {
  _id: string
  title: string
  status?: string
  depth: number
  parentTopicId: string
  parentTopicTitle: string
}

function flattenSubtopic(
  subtopic: RoadmapSubtopic,
  parentTopicId: string,
  parentTopicTitle: string,
  depth: number,
  acc: FlatNode[]
): void {
  acc.push({
    _id: subtopic._id,
    title: subtopic.title,
    status: subtopic.status,
    depth,
    parentTopicId,
    parentTopicTitle,
  })

  for (const child of subtopic.children || []) {
    flattenSubtopic(child, parentTopicId, parentTopicTitle, depth + 1, acc)
  }
}

function flattenRoadmap(topics: RoadmapTopic[]): FlatNode[] {
  const acc: FlatNode[] = []

  for (const topic of topics) {
    for (const subtopic of topic.subtopics) {
      flattenSubtopic(subtopic, topic._id, topic.title, 0, acc)
    }
  }

  return acc
}

function buildStructuredTopicString(
  selectedNodes: Map<string, string>,
  flatNodes: FlatNode[],
  trackerTitle: string
): string {
  const byTopic = new Map<string, { topicTitle: string; subtopics: string[] }>()

  for (const [id, title] of selectedNodes.entries()) {
    const node = flatNodes.find((item) => item._id === id)
    if (!node) continue

    if (!byTopic.has(node.parentTopicId)) {
      byTopic.set(node.parentTopicId, {
        topicTitle: node.parentTopicTitle,
        subtopics: [],
      })
    }

    byTopic.get(node.parentTopicId)!.subtopics.push(title)
  }

  const topicParts = Array.from(byTopic.values())
    .map(({ topicTitle, subtopics }) => `${topicTitle} → ${subtopics.join(', ')}`)
    .join(' | ')

  return `[${trackerTitle}] ${topicParts}`
}

const ChevronDown = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    className={cn(
      'shrink-0 transition-transform duration-200',
      open && 'rotate-180'
    )}
    aria-hidden="true"
  >
    <path
      d="M2 4.5L6 8L10 4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path
      d="M1.5 1.5L11.5 11.5M11.5 1.5L1.5 11.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
    <path
      d="M1.5 4.5L3.5 6.8L7.5 2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CHEVRON_STYLE =
  "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6.5L11 1' stroke='%236b5f58' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")"

interface TopicGroupProps {
  topicTitle: string
  nodes: FlatNode[]
  selectedIds: Set<string>
  onToggle: (id: string, title: string) => void
  onSelectAll: (nodes: FlatNode[]) => void
  onDeselectAll: (nodes: FlatNode[]) => void
}

function TopicGroup({
  topicTitle,
  nodes,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: TopicGroupProps) {
  const [open, setOpen] = useState(true)
  const selectedCount = nodes.filter((node) => selectedIds.has(node._id)).length
  const allSelected = selectedCount === nodes.length

  const handleSelectToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (allSelected) {
      onDeselectAll(nodes)
    } else {
      onSelectAll(nodes)
    }
  }

  const handleSelectToggleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') return

    if (allSelected) {
      onDeselectAll(nodes)
    } else {
      onSelectAll(nodes)
    }
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e0d0c5] bg-[#fdf8f5] transition-all duration-200 dark:border-white/8 dark:bg-[#141412]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-white/2.5"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#b84c2b] shadow-[0_0_6px_rgba(184,76,43,0.35)] dark:bg-[#e8816a] dark:shadow-[0_0_6px_rgba(232,129,106,0.5)]" />
          <span className="truncate font-['Playfair_Display',serif] text-[13.5px] font-black text-[#1a1714] dark:text-[#f2f0eb]">
            {topicTitle}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {selectedCount > 0 && (
            <span className="rounded-full bg-[rgba(184,76,43,0.10)] px-2 py-0.5 font-['DM_Mono',monospace] text-[9px] font-bold text-[#b84c2b] dark:bg-[#e8816a]/20 dark:text-[#e8816a]">
              {selectedCount}/{nodes.length}
            </span>
          )}

          <span
            role="button"
            tabIndex={0}
            onClick={handleSelectToggleClick}
            onKeyDown={handleSelectToggleKeyDown}
            className="font-['DM_Mono',monospace] text-[9px] text-[#6b5f58] underline transition hover:text-[#b84c2b] dark:text-[#6b6560] dark:hover:text-[#9b9a92]"
          >
            {allSelected ? 'none' : 'all'}
          </span>

          <span className="text-[#6b5f58] dark:text-[#6b6560]">
            <ChevronDown open={open} />
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#e0d0c5] px-4 pb-4 pt-3 dark:border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {nodes.map((node) => {
              const isSelected = selectedIds.has(node._id)
              const depthPrefix = node.depth > 0 ? '↳ ' : ''

              return (
                <button
                  key={node._id}
                  type="button"
                  onClick={() => onToggle(node._id, node.title)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-['DM_Mono',monospace] text-[10px] font-bold tracking-[0.04em] transition-all duration-150 hover:-translate-y-px active:scale-95",
                    node.depth > 0 && 'opacity-85',
                    isSelected
                      ? 'border-[#b84c2b] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] shadow-[0_0_0_1px_rgba(184,76,43,0.12)] dark:border-[#e8816a] dark:bg-[#e8816a]/15 dark:text-[#e8816a] dark:shadow-[0_0_0_1px_rgba(232,129,106,0.15)]'
                      : 'border-[#e0d0c5] bg-white/35 text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/10 dark:bg-white/2 dark:text-[#6b6560] dark:hover:border-white/20 dark:hover:text-[#9b9a92]'
                  )}
                >
                  {isSelected && <CheckIcon />}
                  <span>
                    {depthPrefix}
                    {node.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SelectionPreviewProps {
  selectedNodes: Map<string, string>
  flatNodes: FlatNode[]
  trackerTitle: string
}

function SelectionPreview({
  selectedNodes,
  flatNodes,
  trackerTitle,
}: SelectionPreviewProps) {
  const [expanded, setExpanded] = useState(false)

  const byTopic = useMemo(() => {
    const map = new Map<string, { topicTitle: string; subtopics: string[] }>()

    for (const [id, title] of selectedNodes.entries()) {
      const node = flatNodes.find((item) => item._id === id)
      if (!node) continue

      if (!map.has(node.parentTopicId)) {
        map.set(node.parentTopicId, {
          topicTitle: node.parentTopicTitle,
          subtopics: [],
        })
      }

      map.get(node.parentTopicId)!.subtopics.push(title)
    }

    return Array.from(map.values())
  }, [selectedNodes, flatNodes])

  if (selectedNodes.size === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.06)] dark:border-[#e8816a]/20 dark:bg-[#e8816a]/5">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b84c2b] dark:bg-[#e8816a]" />
          <span className="font-['DM_Mono',monospace] text-[9px] font-bold uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
            {selectedNodes.size} subtopics across {byTopic.length} topic
            {byTopic.length !== 1 ? 's' : ''}
          </span>
        </div>

        <span className="text-[#6b5f58] dark:text-[#9b9a92]">
          <ChevronDown open={expanded} />
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-[rgba(184,76,43,0.12)] px-3.5 pb-3 pt-2 dark:border-[#e8816a]/10">
          <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#6b5f58] dark:text-[#6b6560]">
            {trackerTitle}
          </p>

          {byTopic.map(({ topicTitle, subtopics }) => (
            <div key={topicTitle}>
              <p className="mb-1 font-['DM_Mono',monospace] text-[10px] font-bold text-[#1a1714] dark:text-[#9b9a92]">
                └ {topicTitle}
              </p>

              <div className="flex flex-wrap gap-1 pl-4">
                {subtopics.map((subtopic) => (
                  <span
                    key={subtopic}
                    className="rounded-full border border-[rgba(184,76,43,0.30)] px-2 py-0.5 font-['DM_Mono',monospace] text-[9px] text-[#b84c2b] dark:border-[#e8816a]/30 dark:text-[#e8816a]"
                  >
                    {subtopic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface GenerateMockTestModalProps {
  open: boolean
  onClose: () => void
}

export function GenerateMockTestModal({
  open,
  onClose,
}: GenerateMockTestModalProps) {
  const navigate = useNavigate()
  const overlayRef = useRef<HTMLDivElement>(null)

  const { generateDraft, updateGenerateDraft, resetGenerateDraft } =
    useMockTestsStore()
  const generateMutation = useGenerateMockTest()

  type TopicSource = 'manual' | 'tracker'

  const [topicSource, setTopicSource] = useState<TopicSource>('manual')
  const [manualSelectedTrackerId, setManualSelectedTrackerId] =
    useState<string>('')
  const [selectedNodesByTracker, setSelectedNodesByTracker] = useState<
    Record<string, Map<string, string>>
  >({})

  const trackersQuery = useTrackers({ limit: 50 })

  const trackers = useMemo(
    () => trackersQuery.data?.trackers ?? [],
    [trackersQuery.data?.trackers]
  )

  const selectedTrackerId = manualSelectedTrackerId || trackers[0]?._id || ''

  const selectedNodes = useMemo(
    () => selectedNodesByTracker[selectedTrackerId] ?? new Map<string, string>(),
    [selectedNodesByTracker, selectedTrackerId]
  )

  const roadmapQuery = useTrackerRoadmap(
    topicSource === 'tracker' && selectedTrackerId ? selectedTrackerId : undefined
  )

  useEffect(() => {
    if (!open) return

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  const flatNodes = useMemo(
    () => flattenRoadmap(roadmapQuery.data?.roadmap ?? []),
    [roadmapQuery.data?.roadmap]
  )

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; nodes: FlatNode[] }>()

    for (const node of flatNodes) {
      if (!map.has(node.parentTopicId)) {
        map.set(node.parentTopicId, {
          title: node.parentTopicTitle,
          nodes: [],
        })
      }

      map.get(node.parentTopicId)!.nodes.push(node)
    }

    return Array.from(map.values())
  }, [flatNodes])

  const selectedTracker = trackers.find(
    (tracker) => tracker._id === selectedTrackerId
  )

  const updateSelectedNodes = (
    updater: (previous: Map<string, string>) => Map<string, string>
  ) => {
    if (!selectedTrackerId) return

    setSelectedNodesByTracker((previous) => {
      const current = previous[selectedTrackerId] ?? new Map<string, string>()
      const next = updater(current)

      return {
        ...previous,
        [selectedTrackerId]: next,
      }
    })
  }

  const clearSelectedNodes = () => {
    if (!selectedTrackerId) return

    setSelectedNodesByTracker((previous) => ({
      ...previous,
      [selectedTrackerId]: new Map<string, string>(),
    }))
  }

  const toggleNode = (id: string, title: string) => {
    updateSelectedNodes((previous) => {
      const next = new Map(previous)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.set(id, title)
      }

      return next
    })
  }

  const selectAllInGroup = (nodes: FlatNode[]) => {
    updateSelectedNodes((previous) => {
      const next = new Map(previous)

      nodes.forEach((node) => {
        next.set(node._id, node.title)
      })

      return next
    })
  }

  const deselectAllInGroup = (nodes: FlatNode[]) => {
    updateSelectedNodes((previous) => {
      const next = new Map(previous)

      nodes.forEach((node) => {
        next.delete(node._id)
      })

      return next
    })
  }

  const toggleType = (type: QuestionType) => {
    const exists = generateDraft.questionTypes.includes(type)

    const next = exists
      ? generateDraft.questionTypes.filter((item) => item !== type)
      : [...generateDraft.questionTypes, type]

    updateGenerateDraft({
      questionTypes: next.length ? next : ['mcq'],
    })
  }

  const selectedIds = useMemo(() => new Set(selectedNodes.keys()), [selectedNodes])

  const canSubmit =
    topicSource === 'manual'
      ? generateDraft.topic.trim().length > 0
      : selectedNodes.size > 0

  const handleSubmit = async () => {
    if (!canSubmit || generateMutation.isPending) return

    const topicValue =
      topicSource === 'tracker'
        ? buildStructuredTopicString(
            selectedNodes,
            flatNodes,
            selectedTracker?.title || ''
          )
        : generateDraft.topic.trim()

    const response = await generateMutation.mutateAsync({
      ...generateDraft,
      topic: topicValue,
    })

    resetGenerateDraft()
    clearSelectedNodes()
    onClose()

    const testId = response?.data?._id

    if (testId) {
      navigate(`/mock-tests/${testId}`)
    }
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onClose()
    }
  }

  if (!open) return null

  const isRoadmapLoading = roadmapQuery.isLoading
  const totalSelected = selectedNodes.size

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,20,0.42)] px-4 py-6 backdrop-blur-[6px] dark:bg-[rgba(8,8,7,0.88)]"
      role="dialog"
      aria-modal="true"
      aria-label="Generate AI mock test"
    >
      <div
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-170 flex-col rounded-[28px] border border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_40px_100px_rgba(26,23,20,0.28),0_0_0_1px_rgba(255,255,255,0.35)] dark:border-white/10 dark:bg-[#1c1a18] dark:shadow-[0_40px_100px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)]"
        style={{
          animation: 'modalIn 0.24s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-[28px] bg-linear-to-r from-transparent via-[#b84c2b] to-transparent opacity-80 dark:via-[#e8816a]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-45 rounded-t-[28px] bg-linear-to-b from-[rgba(184,76,43,0.05)] to-transparent dark:from-[#e8816a]/4" />

        <div className="relative shrink-0 px-7 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2.5">
                <span className="text-[#b84c2b] dark:text-[#e8816a]">
                  <SparklesIcon />
                </span>

                <h2 className="font-['Playfair_Display',serif] text-[22px] font-black leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                  Generate AI mock test
                </h2>
              </div>

              <p className="pl-7.5 font-['DM_Mono',monospace] text-[10px] tracking-[0.06em] text-[#6b5f58] dark:text-[#4a4843]">
                Powered by your roadmap & AI
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0d0c5] bg-white/45 text-[#6b5f58] transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.08)] hover:text-[#b84c2b] dark:border-white/10 dark:bg-white/5 dark:text-[#6b6560] dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-[#f2f0eb]"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#e0d0c5] bg-[#f5ede4] p-1.5 dark:border-white/8 dark:bg-[#141412]">
            {(['manual', 'tracker'] as TopicSource[]).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setTopicSource(source)}
                className={cn(
                  "rounded-xl py-2.5 font-['DM_Mono',monospace] text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
                  topicSource === source
                    ? 'bg-[#b84c2b] text-white shadow-[0_2px_16px_rgba(184,76,43,0.25)] dark:bg-[#e8816a] dark:shadow-[0_2px_16px_rgba(232,129,106,0.35)]'
                    : 'text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#6b6560] dark:hover:text-[#9b9a92]'
                )}
              >
                {source === 'manual' ? '✦ Enter manually' : '⊞ From tracker'}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-7">
          <div className="space-y-5 pb-2">
            {topicSource === 'manual' && (
              <div>
                <p className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                  Topic
                </p>

                <input
                  autoFocus
                  value={generateDraft.topic}
                  onChange={(event) =>
                    updateGenerateDraft({ topic: event.target.value })
                  }
                  placeholder="e.g. Recursion, Australian Visa 189…"
                  className="w-full rounded-[14px] border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3.5 text-[14px] text-[#1a1714] outline-none transition placeholder:text-[#9b8f87] focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:placeholder:text-[#3a3834] dark:focus:border-[#e8816a] dark:focus:bg-[#161410]"
                />
              </div>
            )}

            {topicSource === 'tracker' && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                    Tracker
                  </p>

                  {trackersQuery.isLoading ? (
                    <div className="h-12.5 animate-pulse rounded-[14px] bg-[#f5ede4] dark:bg-white/5" />
                  ) : trackers.length === 0 ? (
                    <div className="rounded-[14px] border border-dashed border-[#e0d0c5] px-4 py-3 text-[12px] text-[#6b5f58] dark:border-white/10 dark:text-[#6b6560]">
                      No trackers found — create one first.
                    </div>
                  ) : (
                    <select
                      value={selectedTrackerId}
                      onChange={(event) =>
                        setManualSelectedTrackerId(event.target.value)
                      }
                      className="w-full appearance-none rounded-[14px] border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3.5 text-[14px] text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:focus:border-[#e8816a] dark:focus:bg-[#161410]"
                      style={{
                        backgroundImage: CHEVRON_STYLE,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                      }}
                    >
                      {trackers.map((tracker) => (
                        <option key={tracker._id} value={tracker._id}>
                          {tracker.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedTrackerId && (
                  <div>
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                        Topics &amp; subtopics
                      </p>

                      {totalSelected > 0 && (
                        <div className="flex items-center gap-2.5">
                          <span className="font-['DM_Mono',monospace] text-[9px] text-[#b84c2b] dark:text-[#e8816a]">
                            {totalSelected} selected
                          </span>

                          <button
                            type="button"
                            onClick={clearSelectedNodes}
                            className="font-['DM_Mono',monospace] text-[9px] text-[#6b5f58] underline transition hover:text-[#b84c2b] dark:text-[#6b6560] dark:hover:text-[#9b9a92]"
                          >
                            clear all
                          </button>
                        </div>
                      )}
                    </div>

                    {isRoadmapLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-14.5 animate-pulse rounded-[14px] bg-[#f5ede4] dark:bg-white/5"
                          />
                        ))}
                      </div>
                    ) : roadmapQuery.isError ? (
                      <div className="rounded-[14px] border border-red-500/20 bg-red-500/8 px-4 py-3 text-[12px] text-red-500 dark:text-red-400">
                        Failed to load roadmap. Try again.
                      </div>
                    ) : groups.length === 0 ? (
                      <div className="rounded-[14px] border border-dashed border-[#e0d0c5] px-4 py-5 text-center text-[12px] text-[#6b5f58] dark:border-white/10 dark:text-[#6b6560]">
                        This tracker has no topics yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {groups.map((group) => (
                          <TopicGroup
                            key={group.title}
                            topicTitle={group.title}
                            nodes={group.nodes}
                            selectedIds={selectedIds}
                            onToggle={toggleNode}
                            onSelectAll={selectAllInGroup}
                            onDeselectAll={deselectAllInGroup}
                          />
                        ))}
                      </div>
                    )}

                    {totalSelected > 0 && (
                      <div className="mt-3">
                        <SelectionPreview
                          selectedNodes={selectedNodes}
                          flatNodes={flatNodes}
                          trackerTitle={selectedTracker?.title || ''}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
              <div>
                <p className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                  Difficulty
                </p>

                <select
                  value={generateDraft.difficulty}
                  onChange={(event) =>
                    updateGenerateDraft({
                      difficulty: event.target
                        .value as typeof generateDraft.difficulty,
                    })
                  }
                  className="w-full appearance-none rounded-[14px] border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3.5 text-[14px] text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:focus:border-[#e8816a] dark:focus:bg-[#161410]"
                  style={{
                    backgroundImage: CHEVRON_STYLE,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                  }}
                >
                  {DIFFICULTY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                  Questions
                </p>

                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generateDraft.questionCount}
                  onChange={(event) =>
                    updateGenerateDraft({
                      questionCount: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-[14px] border border-[#e0d0c5] bg-[#f5ede4] px-4 py-3.5 text-[14px] text-[#1a1714] outline-none transition focus:border-[#b84c2b] focus:bg-[#fdf8f5] dark:border-white/10 dark:bg-[#141412] dark:text-[#f2f0eb] dark:focus:border-[#e8816a] dark:focus:bg-[#161410]"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] dark:text-[#6b6560]">
                Question types
              </p>

              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={cn(
                      "rounded-full border px-4 py-2 font-['DM_Mono',monospace] text-[10px] font-bold capitalize tracking-[0.08em] transition-all duration-150 hover:-translate-y-px active:scale-95",
                      generateDraft.questionTypes.includes(type)
                        ? 'border-[#b84c2b] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] shadow-[0_0_0_1px_rgba(184,76,43,0.12)] dark:border-[#e8816a] dark:bg-[#e8816a]/15 dark:text-[#e8816a] dark:shadow-[0_0_0_1px_rgba(232,129,106,0.15)]'
                        : 'border-[#e0d0c5] bg-white/35 text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/10 dark:bg-white/2 dark:text-[#6b6560] dark:hover:border-white/20 dark:hover:text-[#9b9a92]'
                    )}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative shrink-0 px-7 pb-7 pt-4">
          <div className="mb-5 h-px bg-linear-to-r from-transparent via-[#e0d0c5] to-transparent dark:via-white/8" />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={generateMutation.isPending || !canSubmit}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl py-4 font-['Playfair_Display',serif] text-[17px] font-black text-white transition-all duration-200",
              canSubmit && !generateMutation.isPending
                ? 'bg-[#b84c2b] hover:-translate-y-0.5 hover:bg-[#963d22] hover:shadow-[0_12px_32px_rgba(184,76,43,0.30)] dark:bg-[#e8816a] dark:hover:bg-[#d9522d] dark:hover:shadow-[0_12px_32px_rgba(232,129,106,0.4)]'
                : 'cursor-not-allowed bg-[#b84c2b]/35 dark:bg-[#e8816a]/35'
            )}
          >
            {canSubmit && !generateMutation.isPending && (
              <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
            )}

            {generateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating…
              </span>
            ) : (
              'Generate test →'
            )}
          </button>

          {generateMutation.error && (
            <p className="mt-3 text-center text-[11.5px] text-[#b84c2b] dark:text-[#e8816a]">
              {(generateMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          60% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default GenerateMockTestModal