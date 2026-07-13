import { useNavigate } from 'react-router-dom'

import SkeletonBlock from '../../../../components/feedback/SkeletonBlock'
import TrackerCard, { type PublishFormData } from '../components/TrackerCard'
import TrackerFilterBar from '../components/TrackerFilterBar'
import TrackerShell from '../components/TrackerShell'
import StatCard from '../../../../components/data-display/StatCard'
import {
  useArchiveTracker,
  useDeleteTracker,
  usePublishTracker,
  useRestoreTracker,
  useTrackerSummary,
  useTrackers,
} from '../hooks/useTrackers'
import { useSubmitTrackerForVerification } from '../hooks/useSubmitTrackerForVerification'
import { useTrackerFilters } from '../hooks/useTrackerFilters'

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1.5V12.5M1.5 7H12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="14" cy="14" rx="4.5" ry="10.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 14H24.5M4.5 9H23.5M4.5 19H23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const CompassIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    <path d="M14 4.5V6.5M14 21.5V23.5M4.5 14H6.5M21.5 14H23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.5 10.5L15.5 13.5L10.5 17.5L12.5 14.5L17.5 10.5Z" fill="currentColor" />
  </svg>
)

const TrackerCardSkeleton = () => (
  <div className="animate-pulse rounded-lg border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="h-5 w-3/5 rounded-lg bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-5 w-12 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    </div>
    <div className="mb-4 h-3.5 w-4/5 rounded bg-[#e8ddd6] dark:bg-white/10" />
    <div className="mb-4 h-2 w-full rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    <div className="flex gap-2">
      <div className="h-8 flex-1 rounded-sm bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-8 w-8 rounded-sm bg-[#e8ddd6] dark:bg-white/10" />
      <div className="h-8 w-8 rounded-sm bg-[#e8ddd6] dark:bg-white/10" />
    </div>
  </div>
)

const TrackerGridSkeleton = () => (
  <section className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
    {Array.from({ length: 6 }).map((_, index) => (
      <TrackerCardSkeleton key={index} />
    ))}
  </section>
)

function MyTrackersPageSkeleton() {
  return (
    <TrackerShell>
      <section className="flex flex-wrap items-start justify-between gap-4" role="status" aria-label="Loading trackers">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="mb-3 h-7 w-32 rounded-full" />
          <SkeletonBlock className="h-10 w-[min(540px,100%)] rounded-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-[min(620px,100%)]" />
        </div>
        <div className="flex items-center gap-2 max-[560px]:w-full">
          <SkeletonBlock className="h-10 w-32 rounded-md max-[560px]:flex-1" />
          <SkeletonBlock className="h-10 w-40 rounded-md max-[560px]:flex-1" />
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32 rounded-lg" />
        ))}
      </section>
      <SkeletonBlock className="h-20 rounded-lg" />
      <TrackerGridSkeleton />
      <span className="sr-only">Loading tracker content</span>
    </TrackerShell>
  )
}

export default function MyTrackersPage() {
  const navigate = useNavigate()
  const { status, setStatus } = useTrackerFilters()
  const summaryQuery = useTrackerSummary()
  const trackersQuery = useTrackers({
    status,
    domain: 'all',
    sortBy: 'lastActive',
    page: 1,
    limit: 12,
  })

  const archiveTrackerMutation = useArchiveTracker()
  const deleteTrackerMutation = useDeleteTracker()
  const restoreTrackerMutation = useRestoreTracker()
  const publishTrackerMutation = usePublishTracker()
  const submitTrackerForVerificationMutation = useSubmitTrackerForVerification()

  const summary = summaryQuery.data
  const trackers = trackersQuery.data?.trackers ?? []
  const isInitialLoad =
    (summaryQuery.isLoading && !summary) ||
    (trackersQuery.isLoading && !trackersQuery.data)

  if (isInitialLoad) return <MyTrackersPageSkeleton />

  if (summaryQuery.isError || trackersQuery.isError || !summary) {
    return (
      <TrackerShell>
        <div className="mx-auto max-w-md rounded-2xl border border-[rgba(200,50,50,0.22)] bg-(--surface-card) p-6 text-center shadow-(--shadow-2) dark:bg-(--surface-card)">
          <h1 className="font-ui text-[22px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">Trackers unavailable</h1>
          <p className="mt-2 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">Something went wrong while fetching your tracker data.</p>
        </div>
      </TrackerShell>
    )
  }

  const handleArchiveToggle = (trackerId: string, trackerStatus?: string) => {
    if (trackerStatus === 'archived') restoreTrackerMutation.mutate(trackerId)
    else archiveTrackerMutation.mutate(trackerId)
  }

  const handlePublish = async (trackerId: string, data: PublishFormData) => {
    await publishTrackerMutation.mutateAsync({
      trackerId,
      name: data.name,
      description: data.description,
      domain: data.domain,
      difficulty: data.difficulty,
      tags: data.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      allowClone: data.allowClone,
    })
  }

  const handleSendForVerification = async (trackerId: string) => {
    await submitTrackerForVerificationMutation.mutateAsync({
      trackerId,
      requiredVotes: 10,
      durationHours: 24,
      urgent: false,
    })
  }

  const handleDelete = async (trackerId: string): Promise<void> => {
    await deleteTrackerMutation.mutateAsync(trackerId)
  }

  return (
    <TrackerShell>
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
            <span className="h-1.25 w-1.25 rounded-full bg-(--success) dark:bg-(--success)" />
            My Trackers
          </div>
          <h1 className="font-ui text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-(--text-primary) dark:text-(--text-primary)">
            Build your <span className="text-(--brand-500) dark:text-(--brand-500)">zero-to-hero</span> learning path
          </h1>
          <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-(--text-secondary) opacity-80 dark:text-(--text-secondary)">
            Manage your roadmaps, continue lessons, and improve your learning path step by step.
          </p>
        </div>

        <div className="flex items-center gap-2 max-[560px]:w-full max-[560px]:flex-col">
          <button type="button" onClick={() => navigate('/trackers/published')} className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.06)] px-4 py-2.5 text-[13px] font-bold text-(--success) transition hover:-translate-y-px dark:text-(--success) max-[560px]:w-full max-[560px]:justify-center">
            <GlobeIcon /> Published
          </button>
          <button type="button" onClick={() => navigate('/onboarding/step-1')} className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412] max-[560px]:w-full max-[560px]:justify-center">
            <PlusIcon /> Create Tracker
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[440px]:grid-cols-1">
        <StatCard label="Total" value={summary.totalTrackers || 0} helper="Created trackers" tone="rust" />
        <StatCard label="Active" value={summary.activeTrackers || 0} helper="In progress" tone="blue" />
        <StatCard label="Completed" value={summary.completedTrackers || 0} helper="Finished paths" tone="green" />
        <StatCard label="Average" value={`${summary.averageProgress || 0}%`} helper="Overall mastery" tone="amber" />
      </section>

      <TrackerFilterBar status={status} onStatusChange={setStatus} />

      {trackersQuery.isFetching ? (
        <TrackerGridSkeleton />
      ) : trackers.length ? (
        <section className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
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
        <section className="rounded-xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) p-10 text-center shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:p-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:text-(--brand-500)"><CompassIcon /></div>
          <h2 className="font-ui text-2xl font-extrabold text-(--text-primary) dark:text-(--text-primary)">No trackers yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">Generate your first zero-to-hero roadmap from onboarding to start learning.</p>
          <button type="button" onClick={() => navigate('/onboarding/step-1')} className="mt-5 inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-[#fdf8f5] dark:bg-(--brand-500) dark:text-[#141412]"><PlusIcon /> Create Tracker</button>
        </section>
      )}
    </TrackerShell>
  )
}
