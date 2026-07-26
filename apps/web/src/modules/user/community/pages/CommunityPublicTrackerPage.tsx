import { useMemo, useState } from 'react';
import { Flag, Share2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ROUTES } from '../../../../routes/config/route-paths';

import CommunityErrorState from '../components/shared/CommunityErrorState';
import CommunityLayout from '../components/shared/CommunityLayout';
import CommunityPageSkeleton from '../components/shared/CommunityPageSkeleton';
import CloneTrackerConfirmDialog from '../components/shared/CloneTrackerConfirmDialog';
import {
  Avatar,
  BackIcon,
  ChevronIcon,
  CopyIcon,
  HeartIcon,
  MessageIcon,
  RatingBar,
  RatingStars,
  ReviewCard,
  StarIcon,
  StatPill,
  TopicIcon,
  VerifiedIcon,
} from '../components/public-tracker/CommunityPublicTrackerUi';
import { getTotalSubtopics, ratingLabel } from '../utils/community-tracker.utils';
import { CheckIcon } from '../components/icons/CommunityIcons';
import { useCloneCommunityTracker } from '../hooks/useCloneCommunityTracker';
import { useCommunityPublicTracker } from '../hooks/useCommunityPublicTracker';
import { useToggleCommunityReviewHelpful } from '../hooks/useToggleCommunityReviewHelpful';
import { useToggleCommunityTrackerLike } from '../hooks/useToggleCommunityTrackerLike';
import { useUpsertCommunityTrackerReview } from '../hooks/useUpsertCommunityTrackerReview';
import type { ICommunityPublicTrackerDetail } from '../types/community.types';
import { getApiErrorMessage } from '../utils/community-formatters';
import { cn, communityPageClass } from '../utils/community-ui';
import Modal from '../../../../components/overlays/Modal';
import {
  useReportCommunityTracker,
  type ReportTrackerReason,
} from '../hooks/useReportCommunityTracker';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useRequestTrackerClanJoin, useTrackerClan } from '../../trackers';
import { useOnboardingStore } from '../../tracker-creation';
import { useSocialShareStore } from '../../social';
import { useBackNavigation } from '../../../../hooks/useBackNavigation';
import { FEATURE_AVAILABILITY_SAFE_FALLBACK } from '../../../../config/feature-availability';
import { useFeatureAvailability } from '../../../../hooks/useFeatureAvailability';

type CommunityTrackerNavigationState = {
  returnTo?: string;
  returnLabel?: string;
  finishTrackerCreationOnClone?: boolean;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPublicTrackerPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const trackerQuery = useCommunityPublicTracker(trackerId);
  const tracker = trackerQuery.data;

  if (trackerQuery.isLoading || !trackerId) {
    return <CommunityPageSkeleton variant="browse" />;
  }

  if (trackerQuery.isError || !tracker) {
    return (
      <CommunityLayout>
        <div className={communityPageClass}>
          <CommunityErrorState
            title="Tracker unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading this community tracker.',
              trackerQuery.error
            )}
            actionLabel="Try again"
            onAction={() => void trackerQuery.refetch()}
          />
        </div>
      </CommunityLayout>
    );
  }

  return <CommunityPublicTrackerLoaded key={tracker._id} tracker={tracker} />;
}

function CommunityPublicTrackerLoaded({ tracker }: { tracker: ICommunityPublicTrackerDetail }) {
  const featureQuery = useFeatureAvailability();
  const features = featureQuery.data ?? FEATURE_AVAILABILITY_SAFE_FALLBACK;
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as CommunityTrackerNavigationState | null;
  const goBack = useBackNavigation(ROUTES.community);
  const clearTrackerCreation = useOnboardingStore((state) => state.reset);

  const cloneTracker = useCloneCommunityTracker();
  const upsertReview = useUpsertCommunityTrackerReview();
  const toggleHelpful = useToggleCommunityReviewHelpful();
  const toggleLike = useToggleCommunityTrackerLike();
  const reportTracker = useReportCommunityTracker();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const requestClanJoin = useRequestTrackerClanJoin();
  const shareTracker = useSocialShareStore((state) => state.shareTracker);

  const [cloned, setCloned] = useState(false);
  const [cloneConfirmOpen, setCloneConfirmOpen] = useState(false);
  const [openTopicId, setOpenTopicId] = useState(() => tracker.topics[0]?._id ?? '');
  const [reviewText, setReviewText] = useState(() => tracker.myReview?.comment ?? '');
  const [myRating, setMyRating] = useState(() => tracker.myReview?.rating ?? 0);
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');
  const [activeHelpfulReviewId, setActiveHelpfulReviewId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportTrackerReason>('incorrect_or_misleading');
  const [reportDetails, setReportDetails] = useState('');
  const reportDetailsRequired = reportReason === 'other';
  const canSubmitReport = !reportDetailsRequired || Boolean(reportDetails.trim());

  const totalSubtopics = useMemo(() => getTotalSubtopics(tracker), [tracker]);

  const sortedReviews = useMemo(() => {
    const copy = [...tracker.reviews];

    if (sortBy === 'top') {
      copy.sort((first, second) => second.helpfulCount - first.helpfulCount);
    } else {
      copy.sort((first, second) => {
        const secondDate = new Date(second.createdAt ?? '').getTime();
        const firstDate = new Date(first.createdAt ?? '').getTime();

        return (
          (Number.isNaN(secondDate) ? 0 : secondDate) - (Number.isNaN(firstDate) ? 0 : firstDate)
        );
      });
    }

    return copy;
  }, [tracker.reviews, sortBy]);

  const isCloned = cloned || tracker.inDashboard;
  const clanQuery = useTrackerClan(
    tracker._id,
    features.trackers && (currentUserId === tracker.ownerId || isCloned)
  );
  const likeCount = tracker.likes;
  const cloneCount = tracker.clones + (cloned ? 1 : 0);
  const ratingSummary = tracker.ratingSummary;
  const liveTotal = ratingSummary.count;

  const handleLike = () => {
    if (toggleLike.isPending) {
      return;
    }

    toggleLike.mutate({
      trackerId: tracker._id,
    });
  };

  const handleClone = () => {
    if (cloneTracker.isPending) {
      return;
    }

    if (isCloned && navigationState?.finishTrackerCreationOnClone) {
      clearTrackerCreation();
      navigate(ROUTES.trackers, { replace: true });
      return;
    }

    if (isCloned) return;

    setCloneConfirmOpen(true);
  };

  const confirmClone = () => {
    if (isCloned || cloneTracker.isPending) return;

    cloneTracker.mutate(
      { trackerId: tracker._id },
      {
        onSuccess: () => {
          setCloned(true);
          setCloneConfirmOpen(false);
          if (navigationState?.finishTrackerCreationOnClone) {
            clearTrackerCreation();
            navigate(ROUTES.trackers, { replace: true });
          }
        },
        onError: () => setCloneConfirmOpen(false),
      }
    );
  };

  const handleSubmitReview = () => {
    const comment = reviewText.trim();

    if (!comment || myRating === 0 || upsertReview.isPending) {
      return;
    }

    upsertReview.mutate(
      {
        trackerId: tracker._id,
        rating: myRating,
        comment,
      },
      {
        onSuccess: () => {
          setReviewText('');
          setMyRating(0);
          setSortBy('new');
        },
      }
    );
  };

  const handleHelpful = (reviewId: string) => {
    if (toggleHelpful.isPending) {
      return;
    }

    setActiveHelpfulReviewId(reviewId);
    toggleHelpful.mutate(
      {
        trackerId: tracker._id,
        reviewId,
      },
      {
        onSettled: () => setActiveHelpfulReviewId(null),
      }
    );
  };

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        <button
          type="button"
          onClick={goBack}
          className="inline-flex w-fit items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-2.5 text-[12px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
        >
          <BackIcon />
          {navigationState?.returnLabel ?? 'Back'}
        </button>

        <section className="overflow-hidden rounded-3xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-[0_2px_18px_rgba(26,23,20,0.07)] dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <div className="relative border-b border-[#e8ddd6] px-6 py-7 dark:border-white/8 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-(--brand-500)" />
              <div className="absolute -bottom-22.5 -left-17.5 h-52 w-52 rounded-full bg-(--success)" />
            </div>

            <div className="relative z-1 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-(--border-subtle) bg-white/65 px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle) dark:bg-white/4">
                    Public Tracker
                  </span>

                  {tracker.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-(--success) dark:text-(--success)">
                      <VerifiedIcon />
                      Verified
                    </span>
                  )}

                  <span className="inline-flex items-center rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:text-(--brand-500)">
                    {tracker.level}
                  </span>
                </div>

                <h1 className="max-w-3xl font-ui text-[clamp(26px,3.5vw,44px)] font-extrabold leading-[1.08] tracking-[-0.8px] text-(--text-primary) dark:text-(--text-primary)">
                  {tracker.title}
                </h1>

                <p className="mt-4 max-w-2xl text-[13.5px] leading-[1.75] text-(--text-secondary) dark:text-(--text-secondary)">
                  {tracker.description || tracker.goal}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {tracker.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-(--border-subtle) bg-white/65 px-3 py-1 text-[11px] font-semibold text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/4 dark:text-(--text-secondary)"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    aria-busy={toggleLike.isPending}
                    onClick={handleLike}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md border-[1.5px] px-4 py-2.5 text-[13px] font-bold transition',
                      tracker.likedByMe
                        ? 'border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.10)] text-(--brand-500) dark:border-[rgba(232,129,106,0.25)] dark:text-(--brand-500)'
                        : 'border-(--border-subtle) bg-white/60 text-(--text-secondary) hover:border-[rgba(184,76,43,0.25)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-white/4 dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
                    )}
                  >
                    <HeartIcon filled={tracker.likedByMe} />
                    {tracker.likedByMe ? 'Liked' : 'Like'}
                  </button>

                  {features.social ? (
                    <button
                      type="button"
                      onClick={() =>
                        shareTracker({
                          trackerId: tracker._id,
                          title: tracker.title,
                          description:
                            tracker.description || tracker.goal || 'A focused learning roadmap.',
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-white/60 px-4 py-2.5 text-[13px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.25)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-white/4 dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
                    >
                      <Share2 size={15} />
                      Share with a friend
                    </button>
                  ) : null}

                  {features.trackers &&
                    currentUserId !== tracker.ownerId &&
                    isCloned &&
                    clanQuery.data?.role === 'outsider' && (
                      <button
                        type="button"
                        onClick={() => requestClanJoin.mutate({ trackerId: tracker._id })}
                        disabled={requestClanJoin.isPending}
                        className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-[#d6ad47]/45 bg-[#f4c95d]/12 px-4 py-2.5 text-[13px] font-bold text-[#8a6509] transition hover:-translate-y-px hover:bg-[#f4c95d]/20 disabled:cursor-not-allowed disabled:opacity-65 dark:text-[#f4c95d]"
                      >
                        🛡 {requestClanJoin.isPending ? 'Joining guild...' : 'Join tracker guild'}
                      </button>
                    )}

                  {features.trackers && clanQuery.data && clanQuery.data.role !== 'outsider' && (
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.trackerClan(tracker._id))}
                      className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-[#d6ad47]/45 bg-[#f4c95d]/12 px-4 py-2.5 text-[13px] font-bold text-[#8a6509] transition hover:-translate-y-px hover:bg-[#f4c95d]/20 dark:text-[#f4c95d]"
                    >
                      🛡 Open tracker guild
                    </button>
                  )}

                  {currentUserId !== tracker.ownerId && (
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-(--border-subtle) bg-white/60 px-4 py-2.5 text-[13px] font-bold text-(--text-secondary) transition hover:border-red-500/30 hover:text-red-600 dark:border-(--border-subtle) dark:bg-white/4"
                    >
                      <Flag size={14} /> Report
                    </button>
                  )}

                  {features.trackers && features.trackerCreation ? (
                    <button
                      type="button"
                      onClick={handleClone}
                      disabled={
                        (isCloned && !navigationState?.finishTrackerCreationOnClone) ||
                        cloneTracker.isPending
                      }
                      className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-70 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
                    >
                      <CopyIcon />
                      {cloneTracker.isPending
                        ? 'Cloning...'
                        : isCloned
                          ? navigationState?.finishTrackerCreationOnClone
                            ? 'Use this tracker'
                            : 'In dashboard'
                          : 'Clone tracker'}
                    </button>
                  ) : null}
                </div>

                {toggleLike.isError && (
                  <p className="mt-3 text-[12px] font-medium text-(--brand-500) dark:text-(--brand-500)">
                    {getApiErrorMessage(
                      'Unable to update like. Please try again.',
                      toggleLike.error
                    )}
                  </p>
                )}

                {cloneTracker.isError && (
                  <p className="mt-3 text-[12px] font-medium text-(--brand-500) dark:text-(--brand-500)">
                    {getApiErrorMessage(
                      'Unable to clone tracker. Please try again.',
                      cloneTracker.error
                    )}
                  </p>
                )}
                {requestClanJoin.isError && (
                  <p className="mt-3 text-[12px] font-medium text-(--brand-500)">
                    {getApiErrorMessage('Unable to send guild request.', requestClanJoin.error)}
                  </p>
                )}
              </div>

              <aside className="rounded-lg border border-[#e8ddd6] bg-white/60 p-4 dark:border-white/8 dark:bg-white/4">
                <div className="mb-4 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!tracker.author.username}
                    onClick={() =>
                      tracker.author.username && navigate(`/profile/${tracker.author.username}`)
                    }
                    aria-label={`Open ${tracker.author.name}'s profile`}
                    className="inline-flex h-11 w-11 aspect-square shrink-0 items-center justify-center rounded-full p-0 leading-none transition hover:ring-2 hover:ring-(--brand-500)/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500) disabled:cursor-default"
                  >
                    <Avatar
                      initials={tracker.author.initials}
                      avatarUrl={tracker.author.avatarUrl}
                      size="lg"
                      accent
                    />
                  </button>
                  <div>
                    <button
                      type="button"
                      disabled={!tracker.author.username}
                      onClick={() =>
                        tracker.author.username && navigate(`/profile/${tracker.author.username}`)
                      }
                      className="text-left text-[13px] font-bold text-(--text-primary) transition hover:text-(--brand-500) disabled:cursor-default dark:text-(--text-primary)"
                    >
                      {tracker.author.name}
                    </button>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      {tracker.author.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <StatPill
                    icon={<StarIcon filled />}
                    label="Rating"
                    value={ratingSummary.average.toFixed(1)}
                  />
                  <StatPill
                    icon={<CopyIcon />}
                    label="Clones"
                    value={cloneCount.toLocaleString()}
                  />
                  <StatPill
                    icon={<HeartIcon filled />}
                    label="Likes"
                    value={likeCount.toLocaleString()}
                  />
                  <StatPill
                    icon={<MessageIcon />}
                    label="Reviews"
                    value={ratingSummary.count.toString()}
                  />
                </div>

                <div className="mt-3 rounded-xl border border-[#e8ddd6] bg-(--surface-card)/70 px-3.5 py-3 dark:border-white/8 dark:bg-(--surface-card)/70">
                  <p className="font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                    Tracker ID
                  </p>
                  <p className="mt-0.5 break-all text-[10.5px] font-semibold text-(--text-secondary) dark:text-(--text-secondary)">
                    {tracker._id}
                  </p>
                </div>
              </aside>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 lg:p-5">
            <StatPill icon={<TopicIcon />} label="Topics" value={tracker.topicsCount.toString()} />
            <StatPill icon={<CheckIcon />} label="Subtopics" value={totalSubtopics.toString()} />
            <StatPill icon={<StarIcon filled />} label="Level" value={tracker.level} />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                  Roadmap Preview
                </p>
                <h2 className="mt-1 font-ui text-[24px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                  Topics & subtopics
                </h2>
              </div>
              <p className="text-[11.5px] text-[#9b9a92]">Click a topic to expand.</p>
            </div>

            <div className="space-y-2.5">
              {tracker.topics.map((topic, index) => {
                const isOpen = openTopicId === topic._id;

                return (
                  <div
                    key={topic._id}
                    className="overflow-hidden rounded-2xl border border-[#e8ddd6] bg-white/55 dark:border-white/8 dark:bg-white/3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenTopicId((current) => (current === topic._id ? '' : topic._id))
                      }
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
                    >
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,76,43,0.09)] font-mono text-[10px] font-bold text-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                            {topic.title}
                          </h3>
                          <p className="mt-0.5 text-[11.5px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <ChevronIcon open={isOpen} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#e8ddd6] px-4 py-3.5 dark:border-white/8">
                        <div className="space-y-2">
                          {topic.subtopics.map((subtopic) => (
                            <div
                              key={subtopic._id}
                              className="rounded-xl border border-[#e8ddd6] bg-(--surface-card)/70 px-4 py-3 dark:border-white/8 dark:bg-(--surface-card)/70"
                            >
                              <div>
                                <h4 className="text-[12.5px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                                  {subtopic.title}
                                </h4>
                                <p className="mt-0.5 text-[11px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
                                  {subtopic.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                Goal
              </p>
              <p className="mt-2 text-[13px] leading-[1.72] text-(--text-secondary) dark:text-(--text-secondary)">
                {tracker.goal}
              </p>
            </section>

            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                Community notes
              </p>
              <ul className="mt-3 space-y-2 text-[12px] leading-[1.65] text-(--text-secondary) dark:text-(--text-secondary)">
                <li>• Verified trackers are reviewed by community members.</li>
                <li>• Clone creates your own editable copy.</li>
                <li>• Reviews help improve roadmap quality.</li>
              </ul>
            </section>

            <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                Field
              </p>
              <p className="mt-2 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                {tracker.field}
              </p>
              <div className="mt-3 border-t border-[#e8ddd6] pt-3 dark:border-white/8">
                <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                  Category
                </p>
                <p className="mt-1 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                  {tracker.category}
                </p>
              </div>
            </section>
          </aside>
        </section>

        <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e8ddd6] px-5 py-5 dark:border-white/8 sm:px-6">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                Community feedback
              </p>
              <h2 className="mt-0.5 font-ui text-[24px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                Ratings &amp; Reviews
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-(--border-subtle) px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-(--border-subtle)">
                {liveTotal} learners
              </span>
              <div className="flex overflow-hidden rounded-md border border-(--border-subtle) dark:border-(--border-subtle)">
                {(['top', 'new'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSortBy(option)}
                    className={cn(
                      'px-3 py-1.5 font-mono text-[8px] uppercase tracking-widest transition',
                      sortBy === option
                        ? 'bg-(--brand-500) text-white dark:bg-(--brand-500) dark:text-[#141412]'
                        : 'text-[#9b9a92] hover:text-(--text-secondary) dark:hover:text-[#c8c5be]'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="flex flex-col justify-center rounded-lg border border-[#e8ddd6] bg-white/55 p-5 dark:border-white/8 dark:bg-white/3">
                <div className="mb-3 flex items-end gap-3">
                  <p className="font-ui text-[64px] font-extrabold leading-none tracking-[-2px] text-(--text-primary) dark:text-(--text-primary)">
                    {ratingSummary.average.toFixed(1)}
                  </p>
                  <div className="mb-1.5">
                    <RatingStars value={ratingSummary.average} size="md" />
                    <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      out of 5
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-[11.5px] text-[#9b9a92]">
                  Based on {liveTotal} learner {liveTotal === 1 ? 'review' : 'reviews'}
                </p>

                <div className="space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={ratingSummary.distribution[star]}
                      total={liveTotal}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#e8ddd6] bg-white/55 p-5 dark:border-white/8 dark:bg-white/3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                  Your review
                </p>
                <h3 className="mt-0.5 font-ui text-[18px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                  {tracker.myReview ? 'Update your review' : 'Rate this tracker'}
                </h3>

                <div className="mt-4 flex items-center gap-3">
                  <RatingStars
                    value={myRating}
                    size="lg"
                    interactive
                    disabled={upsertReview.isPending}
                    onChange={setMyRating}
                  />
                  {myRating > 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-(--brand-500) dark:text-(--brand-500)">
                      {ratingLabel[myRating]}
                    </span>
                  ) : (
                    <span className="text-[11.5px] text-[#9b9a92]">Tap to rate</span>
                  )}
                </div>

                <textarea
                  value={reviewText}
                  disabled={upsertReview.isPending}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={4}
                  placeholder="Write your review about this tracker..."
                  className="mt-3 w-full resize-none rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-[13px] leading-[1.6] text-(--text-primary) outline-none transition placeholder:text-[#9b9a92] focus:border-(--brand-500) focus:ring-2 focus:ring-[rgba(184,76,43,0.10)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary) dark:focus:border-(--brand-500)"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-[#9b9a92]">
                    {upsertReview.isError
                      ? getApiErrorMessage(
                          'Unable to submit review. Please try again.',
                          upsertReview.error
                        )
                      : myRating === 0
                        ? 'Select a star rating to enable submit.'
                        : !reviewText.trim()
                          ? 'Write a review to enable submit.'
                          : tracker.myReview
                            ? `Updating your ${myRating}-star review.`
                            : `Submitting a ${myRating}-star review.`}
                  </p>
                  <button
                    type="button"
                    disabled={myRating === 0 || !reviewText.trim() || upsertReview.isPending}
                    onClick={handleSubmitReview}
                    className="shrink-0 rounded-md bg-(--brand-500) px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
                  >
                    {upsertReview.isPending
                      ? 'Submitting...'
                      : tracker.myReview
                        ? 'Update review'
                        : 'Submit review'}
                  </button>
                </div>
              </div>
            </div>

            {sortedReviews.length > 0 ? (
              <div className="space-y-3">
                {sortedReviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    helpfulLoading={activeHelpfulReviewId === review._id && toggleHelpful.isPending}
                    onHelpful={() => handleHelpful(review._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-(--border-subtle) px-5 py-8 text-center dark:border-(--border-subtle)">
                <p className="font-ui text-[20px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                  No reviews yet
                </p>
                <p className="mt-2 text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
                  Be the first learner to rate and review this tracker.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <CloneTrackerConfirmDialog
        open={cloneConfirmOpen}
        trackerTitle={tracker.title}
        isLoading={cloneTracker.isPending}
        onConfirm={confirmClone}
        onClose={() => {
          if (!cloneTracker.isPending) setCloneConfirmOpen(false);
        }}
      />
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        preventClose={reportTracker.isPending}
        ariaLabel="Report tracker"
        contentClassName="max-w-lg"
      >
        <h2 className="font-ui text-2xl font-black text-(--text-primary)">Report this tracker</h2>
        <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
          Choose the closest reason and add evidence that will help the moderation team review it.
          Reports do not automatically remove content.
        </p>
        <label className="mt-5 block text-sm font-bold text-(--text-primary)">
          Reason
          <select
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value as ReportTrackerReason)}
            className="mt-2 w-full rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3 py-2"
          >
            <option value="incorrect_or_misleading">Incorrect or misleading content</option>
            <option value="unsafe_or_offensive">Unsafe or offensive content</option>
            <option value="spam_or_low_quality">Spam or very low quality</option>
            <option value="copyright_or_plagiarism">Copyright or plagiarism</option>
            <option value="broken_learning_path">Broken learning path</option>
            <option value="privacy_concern">Privacy concern</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="mt-4 block text-sm font-bold text-(--text-primary)">
          Details
          {reportDetailsRequired && <span className="text-(--brand-500)"> *</span>}
          <textarea
            rows={5}
            maxLength={1500}
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            required={reportDetailsRequired}
            aria-required={reportDetailsRequired}
            placeholder={
              reportDetailsRequired
                ? 'Explain the reason for this report…'
                : 'Describe the affected topic, lesson, or problem…'
            }
            className="mt-2 w-full rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3 py-2"
          />
        </label>
        {reportDetailsRequired && !reportDetails.trim() && (
          <p className="mt-2 text-xs text-(--text-secondary)">
            Add a short explanation when choosing Other.
          </p>
        )}
        {reportTracker.isError && (
          <p className="mt-3 text-sm text-red-600">
            {getApiErrorMessage(
              'Unable to submit this report. Please try again.',
              reportTracker.error
            )}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-(--border-subtle) px-4 py-2 text-sm font-bold"
            onClick={() => setReportOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-(--brand-500) px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            disabled={reportTracker.isPending || !canSubmitReport}
            onClick={() =>
              reportTracker.mutate(
                {
                  trackerId: tracker._id,
                  reason: reportReason,
                  details: reportDetails.trim(),
                },
                {
                  onSuccess: () => {
                    setReportOpen(false);
                    setReportReason('incorrect_or_misleading');
                    setReportDetails('');
                  },
                }
              )
            }
          >
            {reportTracker.isPending ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </Modal>
    </CommunityLayout>
  );
}
