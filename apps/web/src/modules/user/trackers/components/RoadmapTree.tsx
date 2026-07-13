import { Link } from 'react-router-dom'
import type { IRoadmapSubtopic, IRoadmapTopic } from '../types/tracker.types'
import { cn, formatMinutes } from '../utils/tracker-ui'

interface IRoadmapTreeProps { trackerId: string; roadmap: IRoadmapTopic[] }

const statusTone = {
  completed: 'border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.08)] text-[var(--success)] dark:border-[rgba(92,201,138,0.24)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[var(--success)]',
  in_progress: 'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] text-[var(--brand-500)] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[var(--brand-500)]',
  available: 'border-[rgba(59,108,183,0.22)] bg-[rgba(59,108,183,0.08)] text-[var(--info)] dark:border-[rgba(107,159,232,0.24)] dark:bg-[rgba(107,159,232,0.10)] dark:text-[var(--info)]',
  locked: 'border-[var(--border-subtle)] bg-[rgba(26,23,20,0.04)] text-[var(--text-secondary)] dark:border-[var(--border-subtle)] dark:bg-white/[0.04] dark:text-[var(--text-secondary)]',
}

function SubtopicNode({ trackerId, item, index }: { trackerId: string; item: IRoadmapSubtopic; index: number }) {
  const locked = item.isLocked || item.status === 'locked'
  const content = (
    <div className={cn('rounded-lg border-[1.5px] p-4 shadow-(--shadow-1) transition', locked ? 'border-(--border-subtle) bg-[rgba(26,23,20,0.035)] opacity-75 dark:border-(--border-subtle) dark:bg-white/[0.035]' : 'border-(--border-subtle) bg-(--surface-card) hover:-translate-y-1 hover:border-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card)')}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] font-mono text-[12px] font-bold text-(--brand-500) dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">{locked ? '🔒' : index + 1}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-ui text-[18px] font-extrabold tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">{item.title}</h4>
            <span className={cn('rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em]', statusTone[item.status])}>{item.status.replace('_', ' ')}</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">{item.description || 'Study this lesson and unlock the next step.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
            <span>{formatMinutes(item.estimatedMinutes)}</span>
            <span>Depth {item.depth}</span>
            <span>{Math.round(item.progressPercent || 0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative pl-5">
      <div className="absolute left-0 top-0 h-full w-px bg-[rgba(184,76,43,0.18)] dark:bg-[rgba(232,129,106,0.20)]" />
      {locked ? content : <Link to={`/trackers/${trackerId}/lessons/${item._id}`}>{content}</Link>}
      {item.children?.length ? <div className="mt-3 space-y-3 pl-5">{item.children.map((child, childIndex) => <SubtopicNode key={child._id} trackerId={trackerId} item={child} index={childIndex} />)}</div> : null}
    </div>
  )
}

export default function RoadmapTree({ trackerId, roadmap }: IRoadmapTreeProps) {
  return (
    <div className="space-y-5">
      {roadmap.map((topic) => (
        <section key={topic._id} className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-(--border-subtle) pb-4 dark:border-(--border-subtle)">
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-(--brand-500) dark:text-(--brand-500)">Topic {topic.order}</div>
              <h3 className="mt-1 font-ui text-[24px] font-extrabold tracking-[-0.5px]">{topic.title}</h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">{topic.description}</p>
              {topic.learningVideo ? (
                <a
                  href={topic.learningVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex max-w-xl items-center gap-3 rounded-lg border border-[rgba(220,38,38,0.22)] bg-[rgba(220,38,38,0.06)] p-2.5 transition hover:-translate-y-0.5 hover:border-[rgba(220,38,38,0.42)] hover:bg-[rgba(220,38,38,0.10)] dark:border-[rgba(248,113,113,0.24)] dark:bg-[rgba(248,113,113,0.08)]"
                  aria-label={`Watch ${topic.learningVideo.title} on YouTube`}
                >
                  {topic.learningVideo.thumbnailUrl ? (
                    <img
                      src={topic.learningVideo.thumbnailUrl}
                      alt=""
                      className="h-14 w-24 shrink-0 rounded-md object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-red-600 dark:text-red-400">▶ Watch on YouTube</span>
                    <span className="mt-1 line-clamp-2 block text-[12px] font-bold text-(--text-primary)">{topic.learningVideo.title}</span>
                    <span className="mt-0.5 block text-[10px] text-(--text-secondary)">{topic.learningVideo.channelTitle}</span>
                  </span>
                </a>
              ) : null}
            </div>
            <div className="rounded-2xl border border-(--border-subtle) bg-white/55 px-4 py-3 text-center dark:border-(--border-subtle) dark:bg-(--surface-elevated)/60">
              <div className="font-ui text-2xl font-extrabold text-(--brand-500) dark:text-(--brand-500)">{Math.round(topic.progressPercent || 0)}%</div>
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">Mastery</div>
            </div>
          </div>
          <div className="space-y-3">{topic.subtopics.map((item, index) => <SubtopicNode key={item._id} trackerId={trackerId} item={item} index={index} />)}</div>
        </section>
      ))}
    </div>
  )
}
