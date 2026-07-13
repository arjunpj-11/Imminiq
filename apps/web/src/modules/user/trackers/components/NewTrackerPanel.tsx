import { useEffect, useState } from 'react';
import type { TrackerDomain, TrackerLevel } from '../types/tracker.types';
import { useCreateTracker } from '../hooks/useTrackers';
import { cn, themedScrollbar, trackerDomainOptions } from '../utils/tracker-ui';

interface INewTrackerPanelProps {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-subtle)] bg-white px-3.5 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none transition placeholder:text-[#9f8f86] focus:border-[var(--brand-500)] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-elevated)] dark:text-[var(--text-primary)] dark:placeholder:text-[#7a756e] dark:focus:border-[var(--brand-500)]';
const labelCls =
  'mb-1.5 block font-mono text-[8px] uppercase tracking-[0.13em] text-[var(--text-secondary)] opacity-70 dark:text-[var(--text-secondary)]';

export default function NewTrackerPanel({ open, onClose }: INewTrackerPanelProps) {
  const createTrackerMutation = useCreateTracker();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState<TrackerDomain>('development');
  const [level, setLevel] = useState<TrackerLevel>('beginner');

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleCreate = async () => {
    if (title.trim().length < 2) return;
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
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-100 bg-[rgba(26,23,20,0.55)] backdrop-blur transition dark:bg-black/70',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed bottom-0 right-0 top-0 z-101 flex w-[min(520px,100vw)] flex-col overflow-hidden border-l border-(--border-subtle) bg-(--surface-card) shadow-[-8px_0_48px_rgba(26,23,20,0.14)] transition-transform duration-300 dark:border-(--border-subtle) dark:bg-(--surface-card)',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-5 py-4 dark:border-(--border-subtle)">
          <div>
            <h2 className="font-ui text-[22px] font-extrabold tracking-[-0.4px]">Create Tracker</h2>
            <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
              Start a focused roadmap and track every lesson.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md border-[1.5px] border-(--border-subtle) text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)"
          >
            ×
          </button>
        </div>
        <div className={cn('flex-1 overflow-y-auto p-5', themedScrollbar)}>
          <div className="space-y-4">
            <label>
              <span className={labelCls}>Title</span>
              <input
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="MERN Stack Zero to Hero"
              />
            </label>
            <label>
              <span className={labelCls}>Description</span>
              <textarea
                className={cn(inputCls, 'min-h-24 resize-y leading-[1.6]')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this tracker covers"
              />
            </label>
            <label>
              <span className={labelCls}>Goal</span>
              <textarea
                className={cn(inputCls, 'min-h-20 resize-y leading-[1.6]')}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Example: become interview ready for full-stack roles"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelCls}>Domain</span>
                <select
                  className={inputCls}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as TrackerDomain)}
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
              <label>
                <span className={labelCls}>Level</span>
                <select
                  className={inputCls}
                  value={level}
                  onChange={(e) => setLevel(e.target.value as TrackerLevel)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-(--border-subtle) p-4 dark:border-(--border-subtle)">
          <button
            onClick={onClose}
            className="rounded-md border-[1.5px] border-(--border-subtle) px-5 py-2.5 text-[13px] font-semibold text-(--text-secondary) dark:border-(--border-subtle) dark:text-(--text-secondary)"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={createTrackerMutation.isPending}
            className="rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412]"
          >
            {createTrackerMutation.isPending ? 'Creating...' : 'Create Tracker'}
          </button>
        </div>
      </aside>
    </>
  );
}
