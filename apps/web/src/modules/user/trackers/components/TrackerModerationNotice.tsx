import { useNavigate } from 'react-router';

import { ContentModerationAppealPanel } from '../../../../components/moderation/ContentModerationAppealPanel';
import { ROUTES } from '../../../../routes/config/route-paths';
import type { ITracker } from '../types/tracker.types';

export default function TrackerModerationNotice({ tracker }: { tracker: ITracker }) {
  const navigate = useNavigate();
  const wasRemoved = tracker.moderationStatus === 'deleted';

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-amber-500/25 bg-(--surface-card) p-6 text-center shadow-(--shadow-2) sm:p-8">
        <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-amber-800 dark:text-amber-200">
          {wasRemoved ? 'Tracker blocked' : 'Tracker under review'}
        </span>
        <h1 className="mt-4 font-ui text-2xl font-black text-(--text-primary)">{tracker.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-(--text-secondary)">
          {wasRemoved
            ? 'An administrator removed this tracker. Its roadmap, lessons, guild, and editing tools are unavailable.'
            : 'This tracker is temporarily suspended while it is reviewed. Its roadmap, lessons, guild, and editing tools are unavailable.'}
        </p>
        {tracker.moderationReason ? (
          <p className="mx-auto mt-3 max-w-lg rounded-xl bg-amber-500/8 px-4 py-3 text-sm font-semibold leading-6 text-amber-900 dark:text-amber-100">
            {tracker.moderationReason}
          </p>
        ) : null}
        <button
          type="button"
          className="mt-5 rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500)"
          onClick={() => navigate(ROUTES.trackers)}
        >
          Back to trackers
        </button>
      </section>

      <ContentModerationAppealPanel targetType="tracker" targetId={tracker._id} />
    </div>
  );
}
