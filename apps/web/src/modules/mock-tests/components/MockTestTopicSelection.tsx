import { useMemo, useState } from 'react'

import { cn } from '../utils/mock-tests-formatters'
import type { FlatNode } from '../utils/mock-test-topic-selection'

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

export interface TopicGroupProps {
  topicTitle: string
  nodes: FlatNode[]
  selectedIds: Set<string>
  onToggle: (id: string, title: string) => void
  onSelectAll: (nodes: FlatNode[]) => void
  onDeselectAll: (nodes: FlatNode[]) => void
}

export function TopicGroup({
  topicTitle,
  nodes,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: TopicGroupProps) {
  const [open, setOpen] = useState(false)
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
    <div className="overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-card) transition-all duration-200 dark:border-white/8 dark:bg-(--surface-canvas)">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-white/2.5"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-(--brand-500) shadow-[0_0_6px_rgba(184,76,43,0.35)] dark:bg-(--brand-500) dark:shadow-[0_0_6px_rgba(232,129,106,0.5)]" />
          <span className="truncate font-ui text-[13.5px] font-black text-(--text-primary) dark:text-(--text-primary)">
            {topicTitle}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {selectedCount > 0 && (
            <span className="rounded-full bg-[rgba(184,76,43,0.10)] px-2 py-0.5 font-mono text-[9px] font-bold text-(--brand-500) dark:bg-(--brand-500)/20 dark:text-(--brand-500)">
              {selectedCount}/{nodes.length}
            </span>
          )}

          <span
            role="button"
            tabIndex={0}
            onClick={handleSelectToggleClick}
            onKeyDown={handleSelectToggleKeyDown}
            className="font-mono text-[9px] text-(--text-secondary) underline transition hover:text-(--brand-500) dark:text-[#6b6560] dark:hover:text-[#9b9a92]"
          >
            {allSelected ? 'none' : 'all'}
          </span>

          <span className="text-(--text-secondary) dark:text-[#6b6560]">
            <ChevronDown open={open} />
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-(--border-subtle) px-4 pb-4 pt-3 dark:border-white/5">
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
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.04em] transition-all duration-150 hover:-translate-y-px active:scale-95",
                    node.depth > 0 && 'opacity-85',
                    isSelected
                      ? 'border-(--brand-500) bg-[rgba(184,76,43,0.10)] text-(--brand-500) shadow-[0_0_0_1px_rgba(184,76,43,0.12)] dark:border-(--brand-500) dark:bg-(--brand-500)/15 dark:text-(--brand-500) dark:shadow-[0_0_0_1px_rgba(232,129,106,0.15)]'
                      : 'border-(--border-subtle) bg-white/35 text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-white/2 dark:text-[#6b6560] dark:hover:border-white/20 dark:hover:text-[#9b9a92]'
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

export interface SelectionPreviewProps {
  selectedNodes: Map<string, string>
  flatNodes: FlatNode[]
  trackerTitle: string
}

export function SelectionPreview({
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
    <div className="overflow-hidden rounded-xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.06)] dark:border-(--brand-500)/20 dark:bg-(--brand-500)/5">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-(--brand-500) dark:bg-(--brand-500)" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
            {selectedNodes.size} subtopics across {byTopic.length} topic
            {byTopic.length !== 1 ? 's' : ''}
          </span>
        </div>

        <span className="text-(--text-secondary) dark:text-(--text-secondary)">
          <ChevronDown open={expanded} />
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-[rgba(184,76,43,0.12)] px-3.5 pb-3 pt-2 dark:border-(--brand-500)/10">
          <p className="font-mono text-[9px] uppercase tracking-widest text-(--text-secondary) dark:text-[#6b6560]">
            {trackerTitle}
          </p>

          {byTopic.map(({ topicTitle, subtopics }) => (
            <div key={topicTitle}>
              <p className="mb-1 font-mono text-[10px] font-bold text-(--text-primary) dark:text-(--text-secondary)">
                └ {topicTitle}
              </p>

              <div className="flex flex-wrap gap-1 pl-4">
                {subtopics.map((subtopic) => (
                  <span
                    key={subtopic}
                    className="rounded-full border border-[rgba(184,76,43,0.30)] px-2 py-0.5 font-mono text-[9px] text-(--brand-500) dark:border-(--brand-500)/30 dark:text-(--brand-500)"
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

