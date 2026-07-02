import { cn } from '../../../../lib/cn'
import type { RoadmapSubtopicNode } from '../../utils/tracker-roadmap-normalizers'
import { getChildren } from '../../utils/tracker-roadmap-normalizers'

interface SubtopicTreeNodeProps {
  subtopic: RoadmapSubtopicNode
  index: number
  depth?: number
}

export default function SubtopicTreeNode({
  subtopic,
  index,
  depth = 0,
}: SubtopicTreeNodeProps) {
  const children = getChildren(subtopic)

  return (
    <div>
      <div
        className={cn(
          'rounded-[14px] border border-[#e0d0c5] bg-[#fdf8f5] p-4 dark:border-white/15 dark:bg-[#1e1c19]',
          depth > 0 && 'bg-[#faf6f3] dark:bg-[#1a1815]',
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
