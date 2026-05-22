import { Link } from 'react-router-dom'
import type { RoadmapSubtopic, RoadmapTopic } from '../../../types/tracker.types'
import { cn, formatMinutes } from '../utils/tracker-ui'

interface RoadmapTreeProps { trackerId: string; roadmap: RoadmapTopic[] }

const statusTone = {
  completed: 'border-[rgba(45,106,71,0.25)] bg-[rgba(45,106,71,0.08)] text-[#2d6a47] dark:border-[rgba(92,201,138,0.24)] dark:bg-[rgba(92,201,138,0.10)] dark:text-[#5cc98a]',
  in_progress: 'border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]',
  available: 'border-[rgba(59,108,183,0.22)] bg-[rgba(59,108,183,0.08)] text-[#3b6cb7] dark:border-[rgba(107,159,232,0.24)] dark:bg-[rgba(107,159,232,0.10)] dark:text-[#6b9fe8]',
  locked: 'border-[#e0d0c5] bg-[rgba(26,23,20,0.04)] text-[#6b5f58] dark:border-white/9 dark:bg-white/[0.04] dark:text-[#9b9a92]',
}

function SubtopicNode({ trackerId, item, index }: { trackerId: string; item: RoadmapSubtopic; index: number }) {
  const locked = item.isLocked || item.status === 'locked'
  const content = (
    <div className={cn('rounded-[18px] border-[1.5px] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition', locked ? 'border-[#e0d0c5] bg-[rgba(26,23,20,0.035)] opacity-75 dark:border-white/9 dark:bg-white/[0.035]' : 'border-[#e0d0c5] bg-[#fdf8f5] hover:-translate-y-1 hover:border-[#e8816a] dark:border-white/9 dark:bg-[#1e1c19]')}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(184,76,43,0.20)] bg-[rgba(184,76,43,0.08)] font-['DM_Mono',monospace] text-[12px] font-bold text-[#b84c2b] dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">{locked ? '🔒' : index + 1}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-['Playfair_Display',serif] text-[18px] font-extrabold tracking-[-0.3px] text-[#1a1714] dark:text-[#f2f0eb]">{item.title}</h4>
            <span className={cn('rounded-full border px-2.5 py-1 font-[DM_Mono,monospace] text-[8px] uppercase tracking-[0.12em]', statusTone[item.status])}>{item.status.replace('_', ' ')}</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">{item.description || 'Study this lesson and unlock the next step.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
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

export default function RoadmapTree({ trackerId, roadmap }: RoadmapTreeProps) {
  return (
    <div className="space-y-5">
      {roadmap.map((topic) => (
        <section key={topic._id} className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e0d0c5] pb-4 dark:border-white/9">
            <div>
              <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-[#b84c2b] dark:text-[#e8816a]">Topic {topic.order}</div>
              <h3 className="mt-1 font-['Playfair_Display',serif] text-[24px] font-extrabold tracking-[-0.5px]">{topic.title}</h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">{topic.description}</p>
            </div>
            <div className="rounded-2xl border border-[#e0d0c5] bg-white/55 px-4 py-3 text-center dark:border-white/9 dark:bg-[#252320]/60">
              <div className="font-['Playfair_Display',serif] text-2xl font-extrabold text-[#b84c2b] dark:text-[#e8816a]">{Math.round(topic.progressPercent || 0)}%</div>
              <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">Mastery</div>
            </div>
          </div>
          <div className="space-y-3">{topic.subtopics.map((item, index) => <SubtopicNode key={item._id} trackerId={trackerId} item={item} index={index} />)}</div>
        </section>
      ))}
    </div>
  )
}
