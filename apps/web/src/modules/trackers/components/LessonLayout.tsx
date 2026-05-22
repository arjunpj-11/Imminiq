import { Link } from 'react-router-dom'
import type { TrackerLessonResponse } from '../../../types/tracker.types'
import { cn, formatMinutes } from '../utils/tracker-ui'

interface LessonLayoutProps {
  data: TrackerLessonResponse
  onComplete: () => void
  isCompleting?: boolean
}

export default function LessonLayout({ data, onComplete, isCompleting }: LessonLayoutProps) {
  const { tracker, lesson, previousLesson, nextLesson, lessonRoadmap } = data

  return (
    <div className="grid grid-cols-[1fr_340px] gap-5 max-[1100px]:grid-cols-1">
      <section className="space-y-5">
        <div className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">{tracker.title} / {lesson.topicTitle || 'Lesson'}</div>
          <h1 className="mt-3 font-['Playfair_Display',serif] text-[clamp(32px,4vw,46px)] font-extrabold leading-tight tracking-[-1px]">{lesson.title}</h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">{lesson.description || 'This lesson is ready. Add your AI generated lesson body or compiler content from the backend when that endpoint is connected.'}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">{lesson.status.replace('_', ' ')}</span>
            <span className="rounded-full border border-[#e0d0c5] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:border-white/9 dark:text-[#9b9a92]">{formatMinutes(lesson.estimatedMinutes)}</span>
          </div>
        </div>

        <div className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-6 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <h2 className="font-['Playfair_Display',serif] text-[24px] font-extrabold tracking-[-0.5px]">Scribe AI Notes</h2>
          <div className="mt-4 rounded-2xl border-l-4 border-[#c98000] bg-[rgba(138,98,0,0.08)] p-4 text-[14px] leading-[1.7] text-[#1a1714] dark:bg-[rgba(240,168,66,0.10)] dark:text-[#f2f0eb]">
            Use this area for AI generated lesson explanation, examples, interview notes, and code snippets. The layout matches the lesson model you shared.
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3 text-[12px] text-white/70"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-400" /><span className="ml-2 font-['DM_Mono',monospace]">lesson.ts</span></div>
            <pre className="overflow-x-auto p-4 text-[12px] leading-[1.7] text-[#d4d4d4]"><code>{`// Connect your lesson compiler / code examples here\nfunction study(topic: string) {\n  return \`Mastering ${lesson.title}\`\n}`}</code></pre>
          </div>
          <button onClick={onComplete} disabled={isCompleting} className="mt-5 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:bg-[#963d22] disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]">{isCompleting ? 'Saving...' : 'Mark Completed'}</button>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          {previousLesson ? <Link to={`/trackers/${tracker._id}/lessons/${previousLesson._id}`} className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-4 py-2.5 text-[13px] font-semibold text-[#6b5f58] hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]">← {previousLesson.title}</Link> : <span />}
          {nextLesson ? <Link to={`/trackers/${tracker._id}/lessons/${nextLesson._id}`} className="rounded-[10px] bg-[#b84c2b] px-4 py-2.5 text-[13px] font-bold text-[#fdf8f5] dark:bg-[#e8816a] dark:text-[#141412]">{nextLesson.title} →</Link> : null}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <h3 className="font-['Playfair_Display',serif] text-[20px] font-extrabold">Lesson Roadmap</h3>
          <div className="mt-4 space-y-2">
            {lessonRoadmap.map((item) => (
              <Link key={item._id} to={item.isLocked ? '#' : `/trackers/${tracker._id}/lessons/${item._id}`} className={cn('flex items-center gap-3 rounded-xl border p-3 transition', item._id === lesson._id ? 'border-[#b84c2b] bg-[rgba(184,76,43,0.08)] dark:border-[#e8816a] dark:bg-[rgba(232,129,106,0.10)]' : 'border-[#e0d0c5] hover:border-[#e8816a] dark:border-white/9', item.isLocked && 'pointer-events-none opacity-55')}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.08)] text-[12px]">{item.status === 'completed' ? '✓' : item.isLocked ? '🔒' : '›'}</span>
                <span className="min-w-0"><span className="block truncate text-[13px] font-bold">{item.title}</span><span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.1em] text-[#6b5f58] dark:text-[#9b9a92]">{item.status.replace('_', ' ')}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
