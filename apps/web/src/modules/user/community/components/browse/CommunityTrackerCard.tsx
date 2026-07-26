import type { ICommunityTracker } from '../../types/community.types';
import { cn } from '../../utils/community-ui';
import { formatCompactNumber } from '../../utils/community-formatters';
import { CheckIcon, CopyIcon, StarIcon, VerifiedIcon } from '../icons/CommunityIcons';
import { Bookmark } from 'lucide-react';
import { useSavedItemsStore } from '../../../../../store/useSavedItemsStore';

interface ICommunityTrackerCardProps {
  tracker: ICommunityTracker;
  cloning?: boolean;
  onClone: (trackerId: string) => void;
  onOpen: (trackerId: string) => void;
}

export default function CommunityTrackerCard({
  tracker,
  cloning = false,
  onClone,
  onOpen,
}: ICommunityTrackerCardProps) {
  const saved = useSavedItemsStore((state) =>
    state.trackers.some((item) => item.id === tracker._id)
  );
  const toggleTracker = useSavedItemsStore((state) => state.toggleTracker);
  const handleOpen = () => {
    onOpen(tracker._id);
  };

  return (
    <article
      className={cn(
        'group relative flex overflow-hidden flex-col rounded-xl border-[1.5px] bg-(--surface-card) transition duration-200 dark:bg-(--surface-card)',
        'border-(--border-subtle) dark:border-(--border-subtle)',
        'hover:-translate-y-1 hover:border-[rgba(184,76,43,0.28)] hover:shadow-[0_12px_36px_rgba(26,23,20,0.11)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.32)]'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          tracker.verified ? 'bg-(--success)' : 'bg-(--brand-500)'
        )}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(184,76,43,0.09)] font-ui text-[13px] font-extrabold text-(--brand-500)">
              {tracker.topic.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-(--text-muted)">
              {tracker.topic}
            </span>

            {tracker.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-2.25 py-0.75 font-mono text-[10px] font-semibold uppercase tracking-widest text-(--success) dark:text-(--success)">
                <VerifiedIcon />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.04)] px-2.25 py-0.75 font-mono text-[10px] font-semibold uppercase tracking-widest text-(--text-muted) dark:border-(--border-subtle) dark:bg-white/4">
                Community
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              toggleTracker({
                id: tracker._id,
                title: tracker.title,
                description: tracker.description,
              })
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) text-(--brand-500) transition hover:bg-(--surface-muted)"
            aria-label={saved ? 'Remove tracker from saved items' : 'Save tracker'}
            aria-pressed={saved}
          >
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <h3 className="mb-2 font-ui text-[18px] font-extrabold leading-tight text-(--text-primary) dark:text-(--text-primary)">
          <button
            type="button"
            onClick={handleOpen}
            className="text-left transition hover:text-(--brand-500) focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--brand-500)"
          >
            {tracker.title}
          </button>
        </h3>

        <p className="mb-auto line-clamp-3 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
          {tracker.description}
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#e8ddd6] overflow-hidden rounded-md border border-[#e8ddd6] dark:divide-white/8 dark:border-white/8">
          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-(--text-muted)">
              Rating
            </span>
            <span className="flex items-center gap-1 font-ui text-[13px] font-extrabold text-[#c49a2c]">
              <StarIcon />
              {tracker.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-(--text-muted)">
              Topic
            </span>
            <span className="max-w-full truncate font-ui text-[13px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              {tracker.topic}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-2.5">
            <span className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-(--text-muted)">
              Clones
            </span>
            <span className="flex items-center gap-1 font-ui text-[13px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
              <CopyIcon />
              {formatCompactNumber(tracker.clones)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3.5">
          <button
            type="button"
            onClick={handleOpen}
            className="min-h-10 rounded-md px-1 text-[12px] font-bold text-(--text-secondary) transition hover:text-(--brand-500) focus-visible:outline-2 focus-visible:outline-(--brand-500)"
          >
            View roadmap <span aria-hidden="true">→</span>
          </button>
          {tracker.inDashboard ? (
            <span className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.07)] px-3.5 py-1.5 text-[12px] font-bold text-(--success) dark:text-(--success)">
              <CheckIcon />
              In dashboard
            </span>
          ) : (
            <button
              type="button"
              disabled={cloning}
              onClick={() => {
                onClone(tracker._id);
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(184,76,43,0.22)] bg-transparent px-3.5 py-1.5 text-[12px] font-bold text-(--brand-500) transition hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.07)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(232,129,106,0.25)] dark:text-(--brand-500)"
            >
              {cloning ? 'Cloning…' : 'Clone tracker'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
