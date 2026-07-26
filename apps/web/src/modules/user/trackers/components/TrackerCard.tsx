import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useAnalyzeClonedTracker } from '../../tracker-creation';
import { useSocialShareStore } from '../../social';
import type { ITracker } from '../types/tracker.types';
import ConfirmDialog from './ConfirmDialog';
import PublishTrackerModal, { type PublishFormData } from './PublishTrackerModal';
import TrackerCardMenu from './tracker-card/TrackerCardMenu';
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  PublishIcon,
  RevisionIcon,
  UsersIcon,
} from './tracker-card/TrackerCardIcons';

export type { PublishFormData } from './PublishTrackerModal';

type TrackerCardProps = {
  tracker: ITracker;
  onOpenStudy: (trackerId: string) => void;
  onPublish: (trackerId: string, data: PublishFormData) => Promise<void> | void;
  onViewPublished: (trackerId: string) => void;
  onInfo: (trackerId: string) => void;
  onArchive?: (trackerId: string) => void;
  onDelete: (trackerId: string) => Promise<void> | void;
  onQuickRevision: (trackerId: string) => void;
  onSendForVerification: (trackerId: string) => Promise<void> | void;
};

type TrackerTone = {
  bar: string;
  badge: string;
  soft: string;
};

const formatRelativeTime = (value: string | null | undefined) => {
  if (!value) return 'Not started yet';

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return 'Recently active';

  const diffMinutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (diffMinutes < 1) return 'Active just now';
  if (diffMinutes < 60) return `Active ${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Active ${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Active ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return `Active ${new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
};

const toLabel = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getTone = (status: ITracker['status']): TrackerTone => {
  if (status === 'completed') {
    return {
      bar: 'from-[#70d49a] to-(--success)',
      badge:
        'border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)]',
      soft: 'bg-[rgba(45,106,71,0.07)] dark:bg-[rgba(92,201,138,0.08)]',
    };
  }

  if (status === 'archived') {
    return {
      bar: 'from-[#9b9a92] to-[#6b5f58]',
      badge:
        'border-(--border-subtle) bg-[rgba(26,23,20,0.05)] text-(--text-secondary) dark:bg-white/6',
      soft: 'bg-[rgba(26,23,20,0.04)] dark:bg-white/4',
    };
  }

  if (status === 'stalled') {
    return {
      bar: 'from-[#e8c060] to-(--warning)',
      badge:
        'border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.08)] text-[#8a6200] dark:border-[rgba(240,168,66,0.24)] dark:bg-[rgba(240,168,66,0.10)] dark:text-(--warning)',
      soft: 'bg-[rgba(138,98,0,0.06)] dark:bg-[rgba(240,168,66,0.07)]',
    };
  }

  return {
    bar: 'from-(--brand-500) to-(--brand-500)',
    badge:
      'border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)]',
    soft: 'bg-[rgba(184,76,43,0.06)] dark:bg-[rgba(232,129,106,0.07)]',
  };
};

const getStatusLabel = ({
  tracker,
  isUnavailable,
  isVerificationPending,
  isVerificationVerified,
  isPublished,
}: {
  tracker: ITracker;
  isUnavailable: boolean;
  isVerificationPending: boolean;
  isVerificationVerified: boolean;
  isPublished: boolean;
}) => {
  if (isUnavailable) return 'Under review';
  if (tracker.status === 'archived') return 'Archived';
  if (isVerificationVerified) return 'Verified';
  if (isVerificationPending) return 'Verification pending';
  if (tracker.status === 'completed') return 'Completed';
  if (tracker.status === 'stalled') return 'Needs attention';
  if (isPublished) return 'Published';
  return 'In progress';
};

const getPrimaryActionLabel = (tracker: ITracker, progress: number) => {
  if (tracker.status === 'completed') return 'Review roadmap';
  if (tracker.status === 'archived') return 'View roadmap';
  if (progress > 0) return 'Continue roadmap';
  return 'Start roadmap';
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3 py-2.5 dark:bg-white/3">
      <div className="text-[15px] font-extrabold leading-none text-(--text-primary)">{value}</div>
      <div className="mt-1 text-[10.5px] font-semibold text-(--text-secondary)">{label}</div>
    </div>
  );
}

export default function TrackerCard({
  tracker,
  onOpenStudy,
  onPublish,
  onViewPublished,
  onInfo,
  onArchive,
  onDelete,
  onQuickRevision,
  onSendForVerification,
}: TrackerCardProps) {
  const navigate = useNavigate();
  const analyzeClone = useAnalyzeClonedTracker();
  const shareTracker = useSocialShareStore((state) => state.shareTracker);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPublishNudge, setShowPublishNudge] = useState(false);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState<0 | 1 | 2>(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const progress = Math.min(100, Math.max(0, Number(tracker.progressPercent ?? 0)));
  const totalTopics = Number(tracker.topicsCount ?? tracker.totalTopics ?? 0);
  const completedTopics = Number(tracker.completedTopics ?? 0);
  const remainingTopics = Math.max(0, totalTopics - completedTopics);
  const tone = getTone(tracker.status);

  const isPublished = tracker.visibility === 'public' || Boolean(tracker.publishedAt);
  const isPubliclyPublished =
    tracker.visibility === 'public' && Boolean(tracker.publishedAt);
  const isUnavailable = Boolean(tracker.moderationStatus && tracker.moderationStatus !== 'active');
  const isArchived = tracker.status === 'archived';
  const cloneSource = tracker.clonedFrom;
  const hasClanMembership = Boolean(tracker.clanRole);
  const shouldShowClan =
    Boolean(cloneSource) ||
    (isPublished && (tracker.clanRole === 'owner' || tracker.clanRole === 'co_owner'));
  const isSharedCoOwner = !cloneSource && tracker.clanRole === 'co_owner';
  const hasOwnerControls = !cloneSource && !isSharedCoOwner;
  const verificationStatus = (
    tracker as ITracker & {
      verificationStatus?: 'pending' | 'verified' | 'rejected' | null;
    }
  ).verificationStatus;
  const isVerificationPending = verificationStatus === 'pending' || verificationSent;
  const isVerificationVerified = verificationStatus === 'verified';
  const canSendForVerification =
    hasOwnerControls &&
    isPublished &&
    !isArchived &&
    !isVerificationPending &&
    !isVerificationVerified;
  const verificationButtonDisabled =
    isSharedCoOwner ||
    isSendingVerification ||
    isVerificationPending ||
    isVerificationVerified ||
    isArchived;
  const canAnalyzeClone = Boolean(tracker.cloneFreshnessAnalysisAvailable) && !isArchived;

  const statusLabel = getStatusLabel({
    tracker,
    isUnavailable,
    isVerificationPending,
    isVerificationVerified,
    isPublished,
  });
  const primaryActionLabel = getPrimaryActionLabel(tracker, progress);
  const verificationMenuLabel = isSendingVerification
    ? 'Sending for verification…'
    : isVerificationVerified
      ? 'Already verified'
      : isVerificationPending
        ? 'Verification pending'
        : 'Send for verification';

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };

    window.addEventListener('mousedown', closeMenu);
    return () => window.removeEventListener('mousedown', closeMenu);
  }, [menuOpen]);

  useEffect(
    () => () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    },
    []
  );

  const triggerPublishNudge = () => {
    setShowPublishNudge(true);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => setShowPublishNudge(false), 3500);
  };

  const handlePublish = async (trackerId: string, data: PublishFormData) => {
    try {
      setIsPublishing(true);
      setPublishError(null);
      await onPublish(trackerId, data);
      setPublishModalOpen(false);
    } catch (error) {
      setPublishError(getUserFacingError(error, 'Failed to publish tracker. Please try again.'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSendForVerification = async () => {
    if (isSendingVerification) return;
    if (!isPublished) {
      triggerPublishNudge();
      return;
    }
    if (!canSendForVerification) return;

    try {
      setIsSendingVerification(true);
      setVerificationError(null);
      await onSendForVerification(tracker._id);
      setVerificationSent(true);
    } catch (error) {
      setVerificationError(
        getUserFacingError(error, 'Failed to send tracker for verification. Please try again.')
      );
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (deleteConfirmationStep === 1 && isPublished) {
      setDeleteConfirmationStep(2);
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onDelete(tracker._id);
      setDeleteConfirmationStep(0);
    } catch (error) {
      setDeleteError(getUserFacingError(error, 'Failed to delete tracker. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const openPublishModal = () => {
    setPublishError(null);
    setPublishModalOpen(true);
  };

  const handleAnalyzeClone = async () => {
    if (!canAnalyzeClone || analyzeClone.isPending) return;

    try {
      setAnalysisError(null);
      const result = await analyzeClone.mutateAsync(tracker._id);
      navigate(ROUTES.trackerCreateEvaluation(result.data.jobId));
    } catch (error) {
      setAnalysisError(getUserFacingError(error, 'Unable to start the one-time tracker analysis.'));
    }
  };

  return (
    <>
      <article
        className={cn(
          'render-lazy group relative flex min-h-107.5 flex-col rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) transition duration-200',
          isUnavailable
            ? 'overflow-hidden border-amber-500/25'
            : 'overflow-visible hover:-translate-y-1 hover:border-[rgba(184,76,43,0.24)] hover:shadow-(--shadow-2) dark:hover:border-[rgba(232,129,106,0.26)]'
        )}
        aria-disabled={isUnavailable || undefined}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-(--brand-500) to-transparent opacity-45'
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-70',
            tone.soft
          )}
        />

        <header className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.035)] px-2.5 py-1 text-[10.5px] font-bold text-(--text-secondary) dark:bg-white/4">
              {toLabel(tracker.domain, 'General')}
            </span>
            {tracker.level && (
              <span className="rounded-full border border-(--border-subtle) px-2.5 py-1 text-[10.5px] font-semibold text-(--text-secondary)">
                {toLabel(tracker.level, 'Level')}
              </span>
            )}
            <span
              className={cn('rounded-full border px-2.5 py-1 text-[10.5px] font-bold', tone.badge)}
            >
              {statusLabel}
            </span>
          </div>

          <div className="relative flex shrink-0 items-center gap-1">
            {shouldShowClan && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.trackerClan(cloneSource?.trackerId ?? tracker._id))}
                className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d6ad47]/35 bg-[#f4c95d]/10 px-2.5 text-[10.5px] font-bold text-[#8a6509] transition hover:-translate-y-px hover:bg-[#f4c95d]/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6ad47]/25 dark:text-[#f4c95d]"
                aria-label={
                  cloneSource && !hasClanMembership ? 'Join tracker clan' : 'Open tracker clan'
                }
              >
                <UsersIcon className="h-4 w-4" />
                <span className="max-[380px]:hidden">
                  {cloneSource && !hasClanMembership ? 'Join' : 'Clan'}
                </span>
                {Boolean(tracker.clanNotificationsCount) && (
                  <span className="absolute -right-1.5 -top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-(--brand-500) px-1 text-[8px] text-white shadow-sm dark:text-[#141412]">
                    {Math.min(99, tracker.clanNotificationsCount ?? 0)}
                  </span>
                )}
              </button>
            )}

            <TrackerCardMenu
              menuRef={menuRef}
              open={menuOpen}
              disabled={isUnavailable}
              isArchived={isArchived}
              isPublished={isPublished}
              isSharedCoOwner={isSharedCoOwner}
              isSendingVerification={isSendingVerification}
              verificationButtonDisabled={verificationButtonDisabled}
              verificationLabel={verificationMenuLabel}
              canSendForVerification={canSendForVerification}
              onOpenChange={setMenuOpen}
              onInfo={() => onInfo(tracker._id)}
              onQuickRevision={() => onQuickRevision(tracker._id)}
              onShare={
                isPubliclyPublished
                  ? () =>
                      shareTracker({
                        trackerId: tracker._id,
                        title: tracker.title,
                        description:
                          tracker.description ??
                          tracker.goal ??
                          'A focused learning roadmap.',
                      })
                  : undefined
              }
              onSendForVerification={() => void handleSendForVerification()}
              onArchive={onArchive ? () => onArchive(tracker._id) : undefined}
              onDelete={() => {
                setDeleteError(null);
                setDeleteConfirmationStep(1);
              }}
            />
          </div>
        </header>

        <div className="relative mt-5 min-w-0">
          <h2 className="line-clamp-2 font-ui text-[22px] font-extrabold leading-[1.18] tracking-[-0.45px] text-(--text-primary)">
            {tracker.title}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-11 text-[13.5px] leading-[1.6] text-(--text-secondary)">
            {tracker.description ??
              tracker.goal ??
              'A focused learning roadmap built around your goals.'}
          </p>
        </div>

        <section
          className={cn('relative mt-5 rounded-xl border border-(--border-subtle) p-4', tone.soft)}
          aria-label={`${progress}% complete`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-(--text-secondary)">
                <ClockIcon className="h-3.5 w-3.5" />
                {isArchived ? 'Archived tracker' : formatRelativeTime(tracker.lastActiveAt)}
              </div>
              <p className="mt-1 text-[12px] text-(--text-secondary)">
                {remainingTopics > 0
                  ? `${remainingTopics} topic${remainingTopics === 1 ? '' : 's'} remaining`
                  : 'Roadmap completed'}
              </p>
            </div>
            <div className="text-right">
              <div className="font-ui text-[28px] font-extrabold leading-none tracking-[-0.8px] text-(--text-primary)">
                {progress}%
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-(--text-secondary)">
                complete
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(26,23,20,0.09)] dark:bg-white/10">
            <div
              className={cn(
                'h-full rounded-full bg-linear-to-r transition-all duration-700',
                tone.bar
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Topics" value={totalTopics} />
            <Metric label="Completed" value={completedTopics} />
            <Metric label="Remaining" value={remainingTopics} />
          </div>
        </section>

        {(showPublishNudge || verificationError) && (
          <div className="relative mt-4 space-y-2" aria-live="polite">
            {showPublishNudge && (
              <div className="rounded-lg border border-[rgba(138,98,0,0.22)] bg-[rgba(138,98,0,0.08)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a6200] dark:text-(--warning)">
                Publish this tracker before sending it for verification.
              </div>
            )}
            {verificationError && (
              <div className="rounded-lg border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#b83232] dark:text-[#ff8c8c]">
                {verificationError}
              </div>
            )}
          </div>
        )}

        <footer className="relative mt-auto pt-5">
          {canAnalyzeClone && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => void handleAnalyzeClone()}
                disabled={isUnavailable || analyzeClone.isPending}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.07)] px-4 text-[13px] font-extrabold text-(--brand-500) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden="true">✦</span>
                {analyzeClone.isPending ? 'Starting analysis…' : 'Analyze new topics (one time)'}
              </button>
              <p className="mt-1.5 text-center text-[10.5px] leading-4 text-(--text-secondary)">
                Check for credible topics added since the original was published.
              </p>
            </div>
          )}

          {analysisError && (
            <div className="mb-3 rounded-lg border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#b83232] dark:text-[#ff8c8c]">
              {analysisError}
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={isUnavailable}
              onClick={() => onOpenStudy(tracker._id)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-4 text-[13px] font-extrabold text-[#fdf8f5] shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_10px_26px_rgba(184,76,43,0.24)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[rgba(184,76,43,0.20)] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#141412]"
            >
              <BookOpenIcon />
              {isUnavailable ? 'Temporarily unavailable' : primaryActionLabel}
              {!isUnavailable && <ArrowUpRightIcon />}
            </button>
            <button
              type="button"
              disabled={isUnavailable}
              onClick={() => onQuickRevision(tracker._id)}
              className="grid min-h-11 w-11 shrink-0 place-items-center rounded-xl border-[1.5px] border-(--border-subtle) text-(--text-secondary) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.18)] disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Open quick revision"
              title="Quick revision"
            >
              <RevisionIcon />
            </button>
          </div>

          <div className="mt-3 flex min-h-8 items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
            <div className="inline-flex min-w-0 items-center gap-1.5 text-[11.5px] font-semibold text-(--text-secondary)">
              {tracker.status === 'completed' ? (
                <CheckCircleIcon className="h-4 w-4 text-(--success)" />
              ) : (
                <span className={cn('h-2 w-2 shrink-0 rounded-full bg-linear-to-r', tone.bar)} />
              )}
              <span className="truncate">
                {cloneSource
                  ? `Cloned from ${cloneSource.name}`
                  : isPublished
                    ? 'Shared with the community'
                    : 'Private learning tracker'}
              </span>
            </div>

            {cloneSource ? (
              <button
                type="button"
                onClick={() => navigate(`/community/trackers/${cloneSource.trackerId}`)}
                className="shrink-0 text-[11.5px] font-bold text-(--brand-500) hover:underline"
              >
                Original
              </button>
            ) : isPublished ? (
              <button
                type="button"
                onClick={() => onViewPublished(tracker._id)}
                className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-(--success) transition hover:underline"
              >
                View public <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </button>
            ) : isSharedCoOwner ? (
              <span className="shrink-0 text-[10.5px] font-semibold text-(--text-secondary)">
                Owner publishes
              </span>
            ) : (
              <button
                type="button"
                onClick={openPublishModal}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-bold text-(--brand-500) transition hover:bg-[rgba(184,76,43,0.08)]"
              >
                <PublishIcon className="h-3.5 w-3.5" />
                Publish
              </button>
            )}
          </div>
        </footer>

        {isUnavailable && (
          <button
            type="button"
            className="absolute inset-0 z-40 cursor-pointer rounded-2xl bg-[rgba(245,237,228,0.38)] backdrop-blur-[3px] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-500/35 dark:bg-[rgba(15,14,12,0.48)]"
            onClick={() => navigate(ROUTES.trackerManage(tracker._id))}
            aria-label={`Open moderation status for ${tracker.title}`}
          >
            <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/35 bg-(--surface-card)/95 px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-800 shadow-sm dark:text-amber-200">
              {tracker.moderationStatus === 'deleted' ? 'Tracker blocked' : 'Tracker under review'}
            </span>
          </button>
        )}
      </article>

      {publishModalOpen && hasOwnerControls && (
        <PublishTrackerModal
          tracker={tracker}
          isPublishing={isPublishing}
          publishError={publishError}
          onClose={() => {
            if (!isPublishing) {
              setPublishError(null);
              setPublishModalOpen(false);
            }
          }}
          onConfirm={handlePublish}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmationStep > 0}
        variant="danger"
        title={deleteConfirmationStep === 2 ? 'Remove published tracker?' : 'Delete this tracker?'}
        description={
          <div className="space-y-2">
            <p>
              {deleteConfirmationStep === 2
                ? `“${tracker.title}” is published. Deleting it will permanently remove it from your trackers and from Community.`
                : `Are you sure you want to delete “${tracker.title}”? Your roadmap and learning progress will no longer be available.`}
            </p>
            {deleteConfirmationStep === 2 && (
              <p className="font-semibold text-red-600 dark:text-red-400">
                Community users will no longer be able to view this published tracker.
              </p>
            )}
            {deleteError && (
              <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-red-600 dark:text-red-400">
                {deleteError}
              </p>
            )}
          </div>
        }
        confirmText={
          deleteConfirmationStep === 1 && isPublished
            ? 'Continue'
            : deleteConfirmationStep === 2
              ? 'Delete and remove'
              : 'Delete tracker'
        }
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteError(null);
            setDeleteConfirmationStep(0);
          }
        }}
        onConfirm={() => void handleDeleteConfirmation()}
      />
    </>
  );
}
