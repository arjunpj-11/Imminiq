import { cn } from '../../../../../lib/cn';
import type { RoadmapSubtopicNode } from '../../utils/tracker-roadmap-normalizers';
import { getChildren } from '../../utils/tracker-roadmap-normalizers';

interface ISubtopicTreeNodeProps {
  subtopic: RoadmapSubtopicNode;
  index: number;
  depth?: number;
  canDelete?: boolean;
  onDelete?: (subtopic: RoadmapSubtopicNode) => void;
}

export default function SubtopicTreeNode({
  subtopic,
  index,
  depth = 0,
  canDelete = false,
  onDelete,
}: ISubtopicTreeNodeProps) {
  const children = getChildren(subtopic);

  return (
    <div>
      <div
        className={cn(
          'rounded-md border border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15 dark:bg-(--surface-card)',
          depth > 0 && 'bg-[#faf6f3] dark:bg-[#1a1815]'
        )}
      >
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {depth > 0 && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500)/60 dark:text-(--brand-500)/60">
                  {'└─'.repeat(depth)}
                </span>
              )}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-[12px] font-bold text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                {index + 1}
              </span>
              <h4 className="font-semibold text-(--text-primary) dark:text-(--text-primary)">
                {subtopic.title}
              </h4>
              {(subtopic.difficulty || subtopic.level) && (
                <span className="rounded-sm border border-(--border-subtle) px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                  {subtopic.difficulty || subtopic.level}
                </span>
              )}
              {children.length > 0 && (
                <span className="rounded-full border border-(--border-subtle) px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-(--text-secondary) dark:border-white/15 dark:text-(--text-secondary)">
                  {children.length} nested
                </span>
              )}
            </div>
            {subtopic.description && (
              <p className="mt-2 text-[12.5px] leading-relaxed text-(--text-secondary) dark:text-(--text-secondary)">
                {subtopic.description}
              </p>
            )}
          </div>
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(subtopic)}
              className="rounded-md border border-red-500/20 px-2.5 py-1.5 text-[10px] font-bold text-red-500 transition hover:bg-red-500/10"
              title={children.length ? 'Delete this subtopic and all nested children' : 'Delete subtopic'}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="ml-5 mt-2 space-y-2 border-l-2 border-(--border-subtle) pl-4 dark:border-white/15">
          {children.map((child, childIndex) => (
            <SubtopicTreeNode
              key={child._id}
              subtopic={child}
              index={childIndex}
              depth={depth + 1}
              canDelete={canDelete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
