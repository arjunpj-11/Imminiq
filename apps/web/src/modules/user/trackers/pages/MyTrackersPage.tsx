import { useNavigate } from 'react-router-dom';

import StatCard from '../../../../components/data-display/StatCard';
import SkeletonBlock from '../../../../components/feedback/SkeletonBlock';
import PageHero from '../../../../components/layout/PageHero';
import { ROUTES } from '../../../../routes/config/route-paths';
import TrackerCard, { type PublishFormData } from '../components/TrackerCard';
import TrackerFilterBar from '../components/TrackerFilterBar';
import TrackerShell from '../components/TrackerShell';
import { useSubmitTrackerForVerification } from '../hooks/useSubmitTrackerForVerification';
import { useTrackerFilters } from '../hooks/useTrackerFilters';
import {
  useArchiveTracker,
  useDeleteTracker,
  usePublishTracker,
  useRestoreTracker,
  useTrackerSummary,
  useTrackers,
} from '../hooks/useTrackers';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const CompassIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 11a8 8 0 1 0-2.35 5.65M20 5v6h-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrackerCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
        <div className="h-6 w-16 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
      </div>
      <div className="h-9 w-9 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="mt-5 h-7 w-3/4 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mt-3 h-4 w-full rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mt-2 h-4 w-4/5 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mt-5 h-40 rounded-xl bg-[#eee5df] dark:bg-white/7" />
    <div className="mt-5 flex gap-2.5">
      <div className="h-11 flex-1 rounded-xl bg-[#e0c8bb] dark:bg-white/10" />
      <div className="h-11 w-11 rounded-xl bg-[#e8ddd6] dark:bg-white/10" />
    </div>
  </div>
);

const TrackerGridSkeleton = () => (
  <section className="grid grid-cols-3 gap-5 max-[1220px]:grid-cols-2 max-[760px]:grid-cols-1">
    {Array.from({ length: 6 }).map((_, index) => (
      <TrackerCardSkeleton key={index} />
    ))}
  </section>
);

function MyTrackersPageSkeleton() {
  return (
    <TrackerShell>
      <section
        className="flex flex-wrap items-start justify-between gap-4"
        role="status"
        aria-label="Loading trackers"
      >
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="mb-2.5 h-6 w-28 rounded-full" />
          <SkeletonBlock className="h-10 w-[min(540px,100%)] rounded-xl" />
          <SkeletonBlock className="mt-2 h-4 w-[min(560px,100%)]" />
        </div>
        <div className="flex gap-2 max-[560px]:w-full">
          <SkeletonBlock className="h-10 w-32 rounded-md max-[560px]:flex-1" />
          <SkeletonBlock className="h-10 w-40 rounded-md max-[560px]:flex-1" />
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32 rounded-lg" />
        ))}
      </section>
      <SkeletonBlock className="h-20 rounded-xl" />
      <TrackerGridSkeleton />
      <span className="sr-only">Loading tracker content</span>
    </TrackerShell>
  );
}

export default function MyTrackersPage() {
  const navigate = useNavigate();
  const { status, setStatus } = useTrackerFilters();
  const summaryQuery = useTrackerSummary();
  const trackersQuery = useTrackers({
    status,
    domain: 'all',
    sortBy: 'lastActive',
    page: 1,
    limit: 12,
  });

  const archiveTrackerMutation = useArchiveTracker();
  const deleteTrackerMutation = useDeleteTracker();
  const restoreTrackerMutation = useRestoreTracker();
  const publishTrackerMutation = usePublishTracker();
  const submitTrackerForVerificationMutation = useSubmitTrackerForVerification();

  const summary = summaryQuery.data;
  const trackers = trackersQuery.data?.trackers ?? [];
  const isInitialLoad =
    (summaryQuery.isLoading && !summary) || (trackersQuery.isLoading && !trackersQuery.data);

  if (isInitialLoad) return <MyTrackersPageSkeleton />;

  if (summaryQuery.isError || trackersQuery.isError || !summary) {
    return (
      <TrackerShell>
        <section className="mx-auto max-w-lg rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-8 text-center shadow-(--shadow-2)">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[rgba(200,50,50,0.08)] text-[#b83232] dark:text-[#ff8c8c]">
            <RefreshIcon />
          </div>
          <h1 className="mt-4 font-ui text-[24px] font-extrabold text-(--text-primary)">
            Trackers unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-[1.65] text-(--text-secondary)">
            We could not load your tracker workspace. Your data is safe—please try again.
          </p>
          <button
            type="button"
            onClick={() => {
              void summaryQuery.refetch();
              void trackersQuery.refetch();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:bg-(--brand-600) dark:text-[#141412]"
          >
            <RefreshIcon /> Try again
          </button>
        </section>
      </TrackerShell>
    );
  }

  const handleArchiveToggle = (trackerId: string, trackerStatus?: string) => {
    if (trackerStatus === 'archived') restoreTrackerMutation.mutate(trackerId);
    else archiveTrackerMutation.mutate(trackerId);
  };

  const handlePublish = async (trackerId: string, data: PublishFormData) => {
    await publishTrackerMutation.mutateAsync({
      trackerId,
      name: data.name,
      description: data.description,
      domain: data.domain,
      difficulty: data.difficulty,
      tags: data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      allowClone: data.allowClone,
    });
  };

  const handleSendForVerification = async (trackerId: string) => {
    await submitTrackerForVerificationMutation.mutateAsync({
      trackerId,
      requiredVotes: 10,
      durationHours: 24,
      urgent: false,
    });
  };

  const handleDelete = async (trackerId: string): Promise<void> => {
    await deleteTrackerMutation.mutateAsync(trackerId);
  };

  const emptyTitle = status === 'all' ? 'Create your first tracker' : `No ${status} trackers`;
  const emptyDescription =
    status === 'all'
      ? 'Turn a learning goal into a structured roadmap, then continue from exactly where you stopped.'
      : 'There are no trackers in this view. Choose another status or create a new learning path.';

  return (
    <TrackerShell>
      <PageHero
        eyebrow="Learning workspace"
        title={
          <>
            Build your <span className="text-(--brand-500)">zero-to-hero</span> learning path
          </>
        }
        description="Manage personalized roadmaps, continue exactly where you stopped, and turn every completed topic into visible mastery."
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate(ROUTES.trackerCreate)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-(--brand-500) px-5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-0.5 hover:bg-(--brand-600) dark:text-[#141412]"
            >
              <PlusIcon /> Create tracker
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.publishedTrackers)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-5 text-[13px] font-bold text-(--text-primary) transition hover:-translate-y-0.5 hover:border-[rgba(45,106,71,0.3)] hover:text-(--success)"
            >
              <GlobeIcon /> Published
              {summary.publishedTrackers > 0 && (
                <span className="rounded-full bg-[rgba(45,106,71,0.12)] px-2 py-0.5 text-[10px] text-(--success)">
                  {summary.publishedTrackers}
                </span>
              )}
            </button>
          </>
        }
        aside={
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              Overall mastery
            </div>
            <div className="mt-3 font-ui text-[36px] font-extrabold leading-none text-(--brand-500)">
              {summary.averageProgress || 0}%
            </div>
            <p className="mt-2 text-[12px] leading-5 text-(--text-secondary)">
              {summary.activeTrackers || 0} active path{summary.activeTrackers === 1 ? '' : 's'}{' '}
              moving forward.
            </p>
          </div>
        }
      />

      {/* Shared StatCard components intentionally remain unchanged. */}
      <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1">
        <StatCard
          label="Total"
          value={summary.totalTrackers || 0}
          helper="Created trackers"
          tone="rust"
        />
        <StatCard
          label="Active"
          value={summary.activeTrackers || 0}
          helper="In progress"
          tone="blue"
        />
        <StatCard
          label="Completed"
          value={summary.completedTrackers || 0}
          helper="Finished paths"
          tone="green"
        />
        <StatCard
          label="Average"
          value={`${summary.averageProgress || 0}%`}
          helper="Overall mastery"
          tone="amber"
        />
      </section>

      <TrackerFilterBar status={status} onStatusChange={setStatus} />

      {trackersQuery.isFetching && trackers.length > 0 && (
        <div
          className="-mt-2 flex items-center gap-2 text-[11.5px] font-semibold text-(--text-secondary)"
          role="status"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-(--brand-500)" />
          Refreshing trackers…
        </div>
      )}

      {trackersQuery.isFetching && !trackers.length ? (
        <TrackerGridSkeleton />
      ) : trackers.length ? (
        <section
          className="grid grid-cols-3 gap-5 max-[1220px]:grid-cols-2 max-[760px]:grid-cols-1"
          aria-busy={trackersQuery.isFetching}
        >
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker._id}
              tracker={tracker}
              onOpenStudy={(trackerId) => navigate(`/trackers/${trackerId}/roadmap`)}
              onPublish={handlePublish}
              onViewPublished={(trackerId) => navigate(`/community/trackers/${trackerId}`)}
              onInfo={(trackerId) => navigate(`/trackers/${trackerId}/manage`)}
              onArchive={(trackerId) => handleArchiveToggle(trackerId, tracker.status)}
              onDelete={handleDelete}
              onQuickRevision={(trackerId) => navigate(`/trackers/${trackerId}/revision`)}
              onSendForVerification={handleSendForVerification}
            />
          ))}
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-2xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) p-12 text-center shadow-(--shadow-1) max-[640px]:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-32 max-w-md bg-[rgba(184,76,43,0.06)] blur-3xl" />
          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border-[1.5px] border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] text-(--brand-500)">
            <CompassIcon />
          </div>
          <h2 className="relative mt-5 font-ui text-[26px] font-extrabold text-(--text-primary)">
            {emptyTitle}
          </h2>
          <p className="relative mx-auto mt-2 max-w-lg text-[13.5px] leading-[1.65] text-(--text-secondary)">
            {emptyDescription}
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-2.5">
            {status !== 'all' && (
              <button
                type="button"
                onClick={() => setStatus('all')}
                className="rounded-xl border-[1.5px] border-(--border-subtle) px-5 py-2.5 text-[13px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500)"
              >
                View all trackers
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(ROUTES.trackerCreate)}
              className="inline-flex items-center gap-2 rounded-xl bg-(--brand-500) px-5 py-2.5 text-[13px] font-extrabold text-[#fdf8f5] transition hover:bg-(--brand-600) dark:text-[#141412]"
            >
              <PlusIcon /> Create tracker
            </button>
          </div>
        </section>
      )}
    </TrackerShell>
  );
}
