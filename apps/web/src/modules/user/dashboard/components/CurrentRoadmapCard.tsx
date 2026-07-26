import EmptyCard from './EmptyCard';
import { formatRelativeTime } from '../utils/dashboard-formatters';
import type { ReactElement } from 'react';
import { ROUTES } from '../../../../routes/config/route-paths';
import { safeLocalStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';

type CurrentRoadmap = {
  _id: string;
  title: string;
  level: string;
  lastStudiedAt?: string | Date | null;
  completionPercentage?: number | null;
  totalTopics?: number | null;
  completedTopics?: number | null;
  remainingTopics?: number | null;
};

type CurrentRoadmapCardProps = {
  currentRoadmap?: CurrentRoadmap | null;
  onNavigate: (link: string) => void;
  canCreateTracker?: boolean;
};

const BeginnerIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const IntermediateIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <line x1="15" y1="5" x2="19" y2="9" />
  </svg>
);

const AdvancedIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <line x1="15" y1="5" x2="19" y2="9" />
    <line x1="2" y1="22" x2="6" y2="18" />
  </svg>
);

const LEVEL_CONFIG: Record<
  string,
  { icon: ReactElement; color: string; bg: string; darkColor: string; darkBg: string }
> = {
  beginner: {
    icon: <BeginnerIcon />,
    color: 'var(--success)',
    bg: 'rgba(45,106,71,0.08)',
    darkColor: 'var(--success)',
    darkBg: 'rgba(92,201,138,0.10)',
  },
  intermediate: {
    icon: <IntermediateIcon />,
    color: 'var(--brand-500)',
    bg: 'rgba(184,76,43,0.08)',
    darkColor: 'var(--brand-500)',
    darkBg: 'rgba(232,129,106,0.10)',
  },
  advanced: {
    icon: <AdvancedIcon />,
    color: '#7c5a1e',
    bg: 'rgba(124,90,30,0.08)',
    darkColor: '#d4a84b',
    darkBg: 'rgba(212,168,75,0.10)',
  },
};

function getMilestones(progress: number) {
  return [25, 50, 75, 100].map((m) => ({
    value: m,
    reached: progress >= m,
  }));
}

export default function CurrentRoadmapCard({
  currentRoadmap,
  onNavigate,
  canCreateTracker = true,
}: CurrentRoadmapCardProps) {
  const progress = currentRoadmap?.completionPercentage ?? 0;
  const levelKey = currentRoadmap?.level?.toLowerCase() ?? 'beginner';
  const levelCfg = LEVEL_CONFIG[levelKey] ?? LEVEL_CONFIG.beginner;
  const milestones = getMilestones(progress);
  const recentLesson = (() => {
    try {
      return JSON.parse(safeLocalStorage.get(STORAGE_KEYS.recentLesson) ?? 'null') as {
        trackerId?: string;
        subtopicId?: string;
        lessonTitle?: string;
      } | null;
    } catch {
      return null;
    }
  })();
  const resumeLesson =
    recentLesson?.trackerId === currentRoadmap?._id && recentLesson?.subtopicId
      ? recentLesson
      : null;

  return (
    <div className="relative overflow-hidden self-start rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-6 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-4">
      {/* Subtle radial glow top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(184,76,43,0.18) 0%, transparent 70%)' }}
      />

      {currentRoadmap ? (
        <>
          {/* ── Header row ── */}
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                Continue learning
              </div>
              <h2 className="font-ui text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)">
                {currentRoadmap.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* Level badge */}
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]"
                  style={{
                    color: levelCfg.color,
                    background: levelCfg.bg,
                    borderColor: levelCfg.color + '33',
                  }}
                >
                  {levelCfg.icon}
                  {currentRoadmap.level}
                </span>
                <span className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
                  Last studied {formatRelativeTime(currentRoadmap.lastStudiedAt)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  resumeLesson
                    ? ROUTES.trackerLesson(currentRoadmap._id, resumeLesson.subtopicId!)
                    : ROUTES.trackerRoadmap(currentRoadmap._id)
                )
              }
              className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
            >
              {resumeLesson ? 'Resume lesson →' : 'Continue →'}
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="my-5 border-t border-[rgba(26,23,20,0.07)] dark:border-white/7" />

          {resumeLesson?.lessonTitle && (
            <div className="mb-4 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-3.5 py-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                Pick up where you stopped
              </div>
              <div className="mt-1 truncate text-[13px] font-bold text-(--text-primary)">
                {resumeLesson.lessonTitle}
              </div>
            </div>
          )}

          {/* ── Progress section ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                Completion Progress
              </span>
              <span className="font-mono text-[13px] font-bold tracking-[0.04em] text-(--brand-500) dark:text-(--brand-500)">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Bar + milestone dots */}
            <div className="relative">
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/8">
                <div
                  className="h-full rounded-full bg-linear-to-r from-(--brand-500) to-(--brand-500) transition-all duration-700 dark:from-[#f5a090] dark:to-(--brand-500)"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {/* Milestone ticks */}
              <div className="pointer-events-none absolute inset-0 flex items-center">
                {milestones.map((m) => (
                  <div
                    key={m.value}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${m.value}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`h-2.5 w-0.5 rounded-full transition-colors duration-500 ${
                        m.reached ? 'bg-white/60' : 'bg-[rgba(26,23,20,0.15)] dark:bg-white/15'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone labels */}
            <div className="relative mt-1 h-4">
              {milestones.map((m) => (
                <span
                  key={m.value}
                  className={`absolute font-mono text-[9px] transition-colors duration-500 ${
                    m.reached
                      ? 'text-(--brand-500) dark:text-(--brand-500)'
                      : 'text-(--text-secondary)/40 dark:text-(--text-secondary)/40'
                  }`}
                  style={{ left: `${m.value}%`, transform: 'translateX(-50%)' }}
                >
                  {m.value}%
                </span>
              ))}
            </div>
            <details className="mt-3 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-3 py-2">
              <summary className="cursor-pointer text-[12px] font-bold text-(--text-secondary)">
                How is progress calculated?
              </summary>
              <p className="mt-2 text-[12px] leading-5 text-(--text-muted)">
                Completion is based on finished roadmap lessons and topics. Marking the current
                lesson complete updates this percentage and your remaining-topic count.
              </p>
            </details>
          </div>

          {/* ── Mini stat pills ── */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Topics', value: currentRoadmap.totalTopics, sub: 'total in roadmap' },
              { label: 'Done', value: currentRoadmap.completedTopics, sub: 'topics completed' },
              { label: 'Remaining', value: currentRoadmap.remainingTopics, sub: 'left to study' },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="rounded-xl border border-(--border-subtle) bg-[rgba(26,23,20,0.02)] px-3 py-2.5 dark:border-white/8 dark:bg-white/3"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                  {label}
                </div>
                <div className="mt-0.5 font-ui text-[18px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  {value}
                </div>
                <div className="text-[11px] text-(--text-secondary)/70 dark:text-(--text-secondary)/70">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
            Continue learning
          </div>
          <h2 className="font-ui text-[22px] font-extrabold tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)">
            No active roadmap
          </h2>
          <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
            Create a tracker to start your personalized learning path.
          </p>
          <div className="mt-4">
            <EmptyCard
              title="Your dashboard is ready"
              description="Generate your first roadmap to unlock active progress, study heatmaps, and recommendations."
            />
          </div>
          {canCreateTracker ? (
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.trackerCreate)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412]"
            >
              Create Tracker
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
