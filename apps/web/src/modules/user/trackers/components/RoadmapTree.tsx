import { Link } from 'react-router';
import type { IRoadmapSubtopic, IRoadmapTopic } from '../types/tracker.types';
import { cn } from '../utils/tracker-ui';
import EmbeddedLearningVideo from './EmbeddedLearningVideo';

interface IRoadmapTreeProps {
  trackerId: string;
  roadmap: IRoadmapTopic[];
}

const statusTone = {
  completed:
    'border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.08)] text-[var(--success)] dark:border-[rgba(92,201,138,0.24)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[var(--success)]',
  in_progress:
    'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] text-[var(--brand-500)] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[var(--brand-500)]',
  available:
    'border-[rgba(59,108,183,0.22)] bg-[rgba(59,108,183,0.08)] text-[var(--info)] dark:border-[rgba(107,159,232,0.24)] dark:bg-[rgba(107,159,232,0.10)] dark:text-[var(--info)]',
  locked:
    'border-[var(--border-subtle)] bg-[rgba(26,23,20,0.04)] text-[var(--text-secondary)] dark:border-[var(--border-subtle)] dark:bg-white/[0.04] dark:text-[var(--text-secondary)]',
};

function SubtopicNode({
  trackerId,
  item,
  index,
}: {
  trackerId: string;
  item: IRoadmapSubtopic;
  index: number;
}) {
  const locked = item.isLocked || item.status === 'locked';
  const isInProgress = item.status === 'in_progress';
  const isCompleted = item.status === 'completed';

  const content = (
    <div
      className={cn(
        'relative rounded-xl border-[1.5px] p-4 shadow-(--shadow-1) transition-all duration-200',
        locked
          ? 'border-(--border-subtle) bg-[rgba(26,23,20,0.035)] opacity-75 dark:border-(--border-subtle) dark:bg-white/[0.035]'
          : isInProgress
            ? 'border-(--brand-500) bg-(--surface-card) shadow-[0_0_20px_rgba(184,76,43,0.15)] ring-2 ring-(--brand-500)/20 hover:-translate-y-1 dark:shadow-[0_0_20px_rgba(232,129,106,0.2)]'
            : 'border-(--border-subtle) bg-(--surface-card) hover:-translate-y-1 hover:border-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card)'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-[12px] font-bold transition-all',
            locked
              ? 'border border-(--border-subtle) bg-black/5 dark:bg-white/5'
              : isInProgress
                ? 'border border-(--brand-500) bg-(--brand-500) text-white shadow-md'
                : isCompleted
                  ? 'border border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.12)] text-(--success)'
                  : 'border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] text-(--brand-500)'
          )}
        >
          {locked ? '🔒' : isCompleted ? '✓' : index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-ui text-[18px] font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
              {item.title}
            </h4>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em]',
                statusTone[item.status]
              )}
            >
              {item.status.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
            {item.description || 'Study this lesson and unlock the next step.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
            <span>Depth {item.depth}</span>
            <span>{Math.round(item.progressPercent || 0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative pl-5">
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-0.5 transition-colors',
          isCompleted
            ? 'bg-(--success)'
            : isInProgress
              ? 'bg-(--brand-500)'
              : 'bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.20)]'
        )}
      />
      {locked ? content : <Link to={`/trackers/${trackerId}/lessons/${item._id}`}>{content}</Link>}
      {item.children?.length ? (
        <div className="mt-3 space-y-3 pl-5">
          {item.children.map((child, childIndex) => (
            <SubtopicNode key={child._id} trackerId={trackerId} item={child} index={childIndex} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function RoadmapTree({ trackerId, roadmap }: IRoadmapTreeProps) {
  return (
    <div className="space-y-5">
      {roadmap.map((topic) => (
        <section
          key={topic._id}
          className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-(--border-subtle) pb-4 dark:border-(--border-subtle)">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--brand-500)">
                Topic {topic.order}
              </div>
              <h3 className="mt-1 font-ui text-[24px] font-extrabold tracking-[-0.5px]">
                {topic.title}
              </h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                {topic.description}
              </p>
              {topic.learningVideo ? (
                <EmbeddedLearningVideo video={topic.learningVideo} className="max-w-xl" />
              ) : null}
            </div>
            <div className="rounded-2xl border border-(--border-subtle) bg-white/55 px-4 py-3 text-center dark:border-(--border-subtle) dark:bg-(--surface-elevated)/60">
              <div className="font-ui text-2xl font-extrabold text-(--brand-500) dark:text-(--brand-500)">
                {Math.round(topic.progressPercent || 0)}%
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                Mastery
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {topic.subtopics.map((item, index) => (
              <SubtopicNode key={item._id} trackerId={trackerId} item={item} index={index} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
