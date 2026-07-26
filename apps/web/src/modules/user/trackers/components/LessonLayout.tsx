import { Link } from 'react-router';
import type { ITrackerLessonResponse } from '../types/tracker.types';
import { cn } from '../utils/tracker-ui';

interface ILessonLayoutProps {
  data: ITrackerLessonResponse;
  onComplete: () => void;
  isCompleting?: boolean;
}

export default function LessonLayout({ data, onComplete, isCompleting }: ILessonLayoutProps) {
  const { tracker, lessonNode: lesson, previousLesson, nextLesson, lessonRoadmap } = data;

  return (
    <div className="grid grid-cols-[1fr_340px] gap-5 max-[1100px]:grid-cols-1">
      <section className="space-y-5">
        <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
            {tracker.title} / {lesson.topicTitle || 'Lesson'}
          </div>
          <h1 className="mt-3 font-ui text-[clamp(32px,4vw,46px)] font-extrabold leading-tight tracking-[-1px]">
            {lesson.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-[1.7] text-(--text-secondary) dark:text-(--text-secondary)">
            {lesson.description ||
              'This lesson is ready. Add your AI generated lesson body or compiler content from the backend when that endpoint is connected.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              {lesson.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <h2 className="font-ui text-[24px] font-extrabold tracking-[-0.5px]">Scribe AI Notes</h2>
          <div className="mt-4 rounded-2xl border-l-4 border-(--warning) bg-[rgba(138,98,0,0.08)] p-4 text-[14px] leading-[1.7] text-(--text-primary) dark:bg-[rgba(240,168,66,0.10)] dark:text-(--text-primary)">
            Use this area for AI generated lesson explanation, examples, interview notes, and code
            snippets. The layout matches the lesson model you shared.
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3 text-[12px] text-white/70">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 font-mono">lesson.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-[12px] leading-[1.7] text-[#d4d4d4]">
              <code>{`// Connect your lesson compiler / code examples here\nfunction study(topic: string) {\n  return \`Mastering ${lesson.title}\`\n}`}</code>
            </pre>
          </div>
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="mt-5 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:bg-(--brand-600) disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {isCompleting ? 'Saving...' : 'Mark Completed'}
          </button>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          {previousLesson ? (
            <Link
              to={`/trackers/${tracker._id}/lessons/${previousLesson._id}`}
              className="rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[13px] font-semibold text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)"
            >
              ← {previousLesson.title}
            </Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link
              to={`/trackers/${tracker._id}/lessons/${nextLesson._id}`}
              className="rounded-md bg-(--brand-500) px-4 py-2.5 text-[13px] font-bold text-[#fdf8f5] dark:bg-(--brand-500) dark:text-[#141412]"
            >
              {nextLesson.title} →
            </Link>
          ) : null}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <h3 className="font-ui text-[20px] font-extrabold">Lesson Roadmap</h3>
          <div className="mt-4 space-y-2">
            {lessonRoadmap.map((item) => (
              <Link
                key={item._id}
                to={item.isLocked ? '#' : `/trackers/${tracker._id}/lessons/${item._id}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 transition',
                  item._id === lesson._id
                    ? 'border-(--brand-500) bg-[rgba(184,76,43,0.08)] dark:border-(--brand-500) dark:bg-[rgba(232,129,106,0.10)]'
                    : 'border-(--border-subtle) hover:border-(--brand-500) dark:border-(--border-subtle)',
                  item.isLocked && 'pointer-events-none opacity-55'
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.08)] text-[12px]">
                  {item.status === 'completed' ? '✓' : item.isLocked ? '🔒' : '›'}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold">{item.title}</span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-(--text-secondary) dark:text-(--text-secondary)">
                    {item.status.replace('_', ' ')}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
