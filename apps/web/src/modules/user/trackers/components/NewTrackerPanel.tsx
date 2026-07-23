import { useEffect, useState } from 'react';

import { getUserFacingError } from '../../../../lib/user-facing-error';
import { useCreateTracker } from '../hooks/useTrackers';
import type { TrackerDomain, TrackerLevel } from '../types/tracker.types';
import { cn, themedScrollbar, trackerDomainOptions } from '../utils/tracker-ui';

interface INewTrackerPanelProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-xl border-[1.5px] border-(--border-subtle) bg-white px-3.5 py-3 text-[13.5px] text-(--text-primary) outline-none transition placeholder:text-[#9f8f86] focus:border-(--brand-500) focus:shadow-[0_0_0_3px_rgba(184,76,43,0.16)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-(--surface-elevated) dark:placeholder:text-[#7a756e]';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold text-(--text-primary)';
const helperClass = 'mt-1.5 block text-[10.5px] leading-[1.45] text-(--text-secondary)';

const CloseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SparkIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3ZM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3ZM5 14l.8 2.7 2.7.8-2.7.8L5 22l-.8-2.7-2.7-.8 2.7-.8L5 14Z"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NewTrackerPanel({ open, onClose }: INewTrackerPanelProps) {
  const createTrackerMutation = useCreateTracker();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState<TrackerDomain>('development');
  const [level, setLevel] = useState<TrackerLevel>('beginner');
  const [error, setError] = useState<string | null>(null);

  const isValid = title.trim().length >= 2;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !createTrackerMutation.isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [createTrackerMutation.isPending, onClose, open]);

  const handleCreate = async () => {
    if (!isValid || createTrackerMutation.isPending) return;

    try {
      setError(null);
      await createTrackerMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        goal: goal.trim(),
        domain,
        level,
      });
      setTitle('');
      setDescription('');
      setGoal('');
      setDomain('development');
      setLevel('beginner');
      onClose();
    } catch (createError) {
      setError(getUserFacingError(createError, 'Could not create the tracker. Please try again.'));
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => {
          if (!createTrackerMutation.isPending) onClose();
        }}
        className={cn(
          'fixed inset-0 z-100 bg-[rgba(26,23,20,0.55)] backdrop-blur-sm transition dark:bg-black/70',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-tracker-title"
        aria-describedby="new-tracker-description"
        aria-hidden={!open}
        className={cn(
          'fixed bottom-0 right-0 top-0 z-101 flex w-[min(560px,100vw)] flex-col overflow-hidden border-l border-(--border-subtle) bg-(--surface-card) shadow-[-12px_0_56px_rgba(26,23,20,0.16)] transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="relative overflow-hidden border-b border-(--border-subtle) px-6 py-5">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[rgba(184,76,43,0.09)] blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-2.5 py-1 text-[10px] font-extrabold text-(--brand-500)">
                <SparkIcon /> New learning path
              </div>
              <h2
                id="new-tracker-title"
                className="font-ui text-[25px] font-extrabold tracking-[-0.55px] text-(--text-primary)"
              >
                Create a tracker
              </h2>
              <p
                id="new-tracker-description"
                className="mt-1.5 max-w-md text-[13px] leading-[1.6] text-(--text-secondary)"
              >
                Give the roadmap a clear outcome. You can refine its lessons and structure after
                creation.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={createTrackerMutation.isPending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-(--border-subtle) text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close create tracker panel"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className={cn('flex-1 overflow-y-auto px-6 py-5', themedScrollbar)}>
          <div className="space-y-5">
            <label className="block">
              <span className={labelClass}>Tracker title</span>
              <input
                autoFocus={open}
                className={inputClass}
                value={title}
                maxLength={120}
                disabled={createTrackerMutation.isPending}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="MERN Stack: zero to job-ready"
              />
              <span className={helperClass}>
                Use a specific outcome instead of a broad subject name.
              </span>
            </label>

            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                className={cn(inputClass, 'min-h-28 resize-y leading-[1.6]')}
                value={description}
                maxLength={600}
                disabled={createTrackerMutation.isPending}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What will this tracker cover?"
              />
            </label>

            <label className="block">
              <span className={labelClass}>Learning goal</span>
              <textarea
                className={cn(inputClass, 'min-h-24 resize-y leading-[1.6]')}
                value={goal}
                maxLength={500}
                disabled={createTrackerMutation.isPending}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Example: become interview-ready for full-stack roles"
              />
              <span className={helperClass}>A measurable goal helps the roadmap stay focused.</span>
            </label>

            <div className="grid grid-cols-2 gap-4 max-[460px]:grid-cols-1">
              <label className="block">
                <span className={labelClass}>Domain</span>
                <select
                  className={inputClass}
                  value={domain}
                  disabled={createTrackerMutation.isPending}
                  onChange={(event) => setDomain(event.target.value as TrackerDomain)}
                >
                  {trackerDomainOptions
                    .filter((item) => item.value !== 'all')
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Starting level</span>
                <select
                  className={inputClass}
                  value={level}
                  disabled={createTrackerMutation.isPending}
                  onChange={(event) => setLevel(event.target.value as TrackerLevel)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3.5 py-3 text-[12.5px] leading-[1.55] text-[#b83232] dark:text-[#ff8c8c]"
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-(--border-subtle) bg-(--surface-card) px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 max-[430px]:flex-col-reverse">
            <p className="text-[11px] text-(--text-secondary)">You can edit these details later.</p>
            <div className="flex gap-2.5 max-[430px]:w-full">
              <button
                type="button"
                onClick={onClose}
                disabled={createTrackerMutation.isPending}
                className="min-h-11 rounded-xl border-[1.5px] border-(--border-subtle) px-5 text-[13px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 max-[430px]:flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={!isValid || createTrackerMutation.isPending}
                className="min-h-11 rounded-xl bg-(--brand-500) px-5 text-[13px] font-extrabold text-[#fdf8f5] shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-45 dark:text-[#141412] max-[430px]:flex-1"
              >
                {createTrackerMutation.isPending ? 'Creating…' : 'Create tracker'}
              </button>
            </div>
          </div>
        </footer>
      </aside>
    </>
  );
}
