import { Check, Compass, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

import { safeLocalStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { ROUTES } from '../../../../routes/config/route-paths';
import { cn } from '../../../../lib/cn';
import type { FeatureAvailability } from '../../../../config/feature-availability';

export default function GettingStartedChecklist({
  trackerCount,
  completedSubtopics,
  onNavigate,
  features,
}: {
  trackerCount: number;
  completedSubtopics: number;
  onNavigate: (path: string) => void;
  features: FeatureAvailability;
}) {
  const [dismissed, setDismissed] = useState(
    () => safeLocalStorage.get(STORAGE_KEYS.gettingStartedDismissed) === 'true'
  );
  const steps = [
    {
      label: 'Create or clone your first tracker',
      done: trackerCount > 0,
      path: trackerCount > 0 ? ROUTES.trackers : ROUTES.trackerCreate,
    },
    {
      label: 'Open and complete a lesson',
      done: completedSubtopics > 0,
      path: ROUTES.trackers,
    },
    {
      label: 'Explore a community learning path',
      done: trackerCount > 1,
      path: ROUTES.community,
    },
    {
      label: 'Visit one of your tracker guilds',
      done: safeLocalStorage.get(STORAGE_KEYS.onboardingGuildVisited) === 'true',
      path: ROUTES.trackers,
    },
  ].filter((step) => {
    if (step.path === ROUTES.community) return features.community;
    if (step.path === ROUTES.trackerCreate) {
      return features.trackers && features.trackerCreation;
    }
    return features.trackers;
  });
  if (steps.length === 0) return null;
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length || dismissed) return null;

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1)">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-(--brand-500)">
            <Sparkles size={13} />
            Getting started
          </div>
          <h2 className="mt-1 text-[18px] font-extrabold text-(--text-primary)">
            Build your learning rhythm
          </h2>
          <p className="mt-1 text-[12px] text-(--text-secondary)">
            {completed} of {steps.length} essentials completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {features.community ? (
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.community)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-(--border-subtle) px-3 text-[12px] font-bold text-(--brand-500) hover:border-(--brand-500)"
            >
              <Compass size={14} />
              Browse sample paths
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              safeLocalStorage.set(STORAGE_KEYS.gettingStartedDismissed, 'true');
              setDismissed(true);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-(--text-muted) hover:bg-(--surface-muted)"
            aria-label="Skip getting started guide"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step) => (
          <button
            key={step.label}
            type="button"
            onClick={() => onNavigate(step.path)}
            className={cn(
              'flex min-h-12 items-center gap-3 rounded-xl border px-3 text-left text-[13px] font-semibold transition',
              step.done
                ? 'border-[color-mix(in_srgb,var(--success)_25%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--success)_7%,transparent)] text-(--text-secondary)'
                : 'border-(--border-subtle) bg-(--surface-elevated) text-(--text-primary) hover:border-(--brand-500)'
            )}
          >
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full border',
                step.done
                  ? 'border-(--success) bg-(--success) text-white'
                  : 'border-(--border-strong) text-transparent'
              )}
            >
              <Check size={13} />
            </span>
            {step.label}
          </button>
        ))}
      </div>
    </section>
  );
}
