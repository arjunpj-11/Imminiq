import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CommunityErrorState from '../components/CommunityErrorState'
import CommunityLayout from '../components/CommunityLayout'
import CommunityPageSkeleton from '../components/CommunityPageSkeleton'
import { CheckIcon } from '../components/icons/CommunityIcons'
import { useCloneCommunityTracker } from '../hooks/useCloneCommunityTracker'
import { useCommunityPublicTracker } from '../hooks/useCommunityPublicTracker'
import { useToggleCommunityReviewHelpful } from '../hooks/useToggleCommunityReviewHelpful'
import { useToggleCommunityTrackerLike } from '../hooks/useToggleCommunityTrackerLike'
import { useUpsertCommunityTrackerReview } from '../hooks/useUpsertCommunityTrackerReview'
import type {
  CommunityPublicTrackerDetail,
  CommunityTrackerReview,
} from '../types/community.types'
import { getApiErrorMessage } from '../utils/community-formatters'
import { cn, communityPageClass } from '../utils/community-ui'

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M20.8 4.6C18.9 2.8 15.9 2.9 14.1 4.8L12 7L9.9 4.8C8.1 2.9 5.1 2.8 3.2 4.6C1.2 6.6 1.3 9.8 3.4 11.8L12 20L20.6 11.8C22.7 9.8 22.8 6.6 20.8 4.6Z" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
  </svg>
)

const StarIcon = ({
  filled = true,
  half = false,
}: {
  filled?: boolean
  half?: boolean
}) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {half ? (
      <>
        <defs>
          <linearGradient id="half-fill">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d="M12 2.5L14.9 8.6L21.5 9.5L16.7 14.2L17.9 20.8L12 17.7L6.1 20.8L7.3 14.2L2.5 9.5L9.1 8.6L12 2.5Z" fill="url(#half-fill)" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </>
    ) : (
      <path
        d="M12 2.5L14.9 8.6L21.5 9.5L16.7 14.2L17.9 20.8L12 17.7L6.1 20.8L7.3 14.2L2.5 9.5L9.1 8.6L12 2.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    )}
  </svg>
)

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 15H4.5C3.7 15 3 14.3 3 13.5V4.5C3 3.7 3.7 3 4.5 3H13.5C14.3 3 15 3.7 15 4.5V5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 18.5V20.5L8.2 18.5H17C19.2 18.5 21 16.7 21 14.5V7.5C21 5.3 19.2 3.5 17 3.5H7C4.8 3.5 3 5.3 3 7.5V14.5C3 16.7 4.8 18.5 7 18.5H5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
)

const VerifiedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5L14.5 5L18 4.5L19.5 7.7L22 10L20.7 13.3L21 17L17.5 18.2L15 21L12 19.3L9 21L6.5 18.2L3 17L3.3 13.3L2 10L4.5 7.7L6 4.5L9.5 5L12 2.5Z" fill="currentColor" opacity="0.18" />
    <path d="M8 12.2L10.5 14.7L16.2 9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TopicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 4.5H19M5 9.5H15M5 14.5H19M5 19.5H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const ThumbsUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 22V11M2 13V20C2 21.1 2.9 22 4 22H16.4C17.6 22 18.6 21.1 18.8 19.9L20 13.9C20.2 12.5 19.1 11.2 17.7 11.2H14V6C14 4.3 12.7 3 11 3C10.4 3 10 3.4 10 4V5L8.1 9.7C7.7 10.5 7 11 6.2 11H4C2.9 11 2 11.9 2 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── RatingStars ──────────────────────────────────────────────────────────────

type StarSize = 'sm' | 'md' | 'lg'

const starSizePx: Record<StarSize, number> = {
  sm: 13,
  md: 16,
  lg: 22,
}

function RatingStars({
  value,
  size = 'md',
  interactive = false,
  disabled = false,
  onChange,
}: {
  value: number
  size?: StarSize
  interactive?: boolean
  disabled?: boolean
  onChange?: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const px = starSizePx[size]
  const displayed = interactive && hovered > 0 ? hovered : value

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => interactive && setHovered(0)}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Select a rating' : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.floor(displayed)
        const isHalf =
          !isFilled && star === Math.ceil(displayed) && displayed % 1 >= 0.4

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive || disabled}
            aria-label={
              interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined
            }
            onClick={() => interactive && !disabled && onChange?.(star)}
            onMouseEnter={() => interactive && !disabled && setHovered(star)}
            style={{
              width: px,
              height: px,
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: interactive && !disabled ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={cn(
              'transition-transform disabled:opacity-60',
              interactive && !disabled && 'hover:scale-110',
              isFilled || isHalf
                ? 'text-[#b84c2b] dark:text-[#e8816a]'
                : 'text-[#d4c8bf] dark:text-white/20',
            )}
          >
            <svg width={px} height={px} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {isHalf ? (
                <>
                  <defs>
                    <linearGradient id={`hg-${star}-${size}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.5L14.9 8.6L21.5 9.5L16.7 14.2L17.9 20.8L12 17.7L6.1 20.8L7.3 14.2L2.5 9.5L9.1 8.6L12 2.5Z" fill={`url(#hg-${star}-${size})`} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </>
              ) : (
                <path d="M12 2.5L14.9 8.6L21.5 9.5L16.7 14.2L17.9 20.8L12 17.7L6.1 20.8L7.3 14.2L2.5 9.5L9.1 8.6L12 2.5Z" fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        )
      })}
    </div>
  )
}

// ─── Small UI Blocks ──────────────────────────────────────────────────────────

const Avatar = ({
  initials,
  size = 'md',
  accent = false,
}: {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  accent?: boolean
}) => {
  const sizeClass = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-[11px]',
    lg: 'h-11 w-11 text-[13px]',
  }[size]

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl font-["DM_Mono",monospace] font-bold',
        sizeClass,
        accent
          ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
          : 'bg-[#1a1714] text-white dark:bg-[#f2f0eb] dark:text-[#141412]',
      )}
    >
      {initials}
    </div>
  )
}

const StatPill = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) => (
  <div className="rounded-[14px] border border-[#e8ddd6] bg-white/55 px-4 py-3 dark:border-white/8 dark:bg-white/3">
    <div className="mb-1 flex items-center gap-1.5 text-[#b84c2b] dark:text-[#e8816a]">
      {icon}
      <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
      {value}
    </p>
  </div>
)

const RatingBar = ({
  star,
  count,
  total,
}: {
  star: number
  count: number
  total: number
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-3 shrink-0 text-right font-['DM_Mono',monospace] text-[10px] text-[#9b9a92]">
        {star}
      </span>
      <StarIcon filled />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8ddd6] dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[#b84c2b] transition-all duration-500 dark:bg-[#e8816a]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right font-['DM_Mono',monospace] text-[10px] text-[#9b9a92]">
        {count}
      </span>
    </div>
  )
}

const ReviewCard = ({
  review,
  helpfulLoading,
  onHelpful,
}: {
  review: CommunityTrackerReview
  helpfulLoading: boolean
  onHelpful: () => void
}) => (
  <article className="rounded-[18px] border border-[#e8ddd6] bg-white/50 p-4 dark:border-white/8 dark:bg-white/3 sm:p-5">
    <div className="flex gap-3">
      <Avatar initials={review.author.initials} size="md" />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
              {review.author.name}
              {review.isMine && (
                <span className="ml-2 rounded-full bg-[rgba(184,76,43,0.08)] px-2 py-0.5 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  You
                </span>
              )}
            </p>
            <p className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
              {formatRelativeTime(review.createdAt)}
            </p>
          </div>
          <RatingStars value={review.rating} size="sm" />
        </div>

        <p className="text-[13px] leading-[1.7] text-[#6b5f58] dark:text-[#9b9a92]">
          {review.comment}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[11px] text-[#9b9a92]">Helpful?</span>
          <button
            type="button"
            disabled={helpfulLoading}
            onClick={onHelpful}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
              review.helpfulByMe
                ? 'border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.08)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]'
                : 'border-[#e0d0c5] text-[#9b9a92] hover:border-[rgba(184,76,43,0.25)] hover:text-[#b84c2b] dark:border-white/9 dark:hover:text-[#e8816a]',
            )}
          >
            <ThumbsUpIcon />
            {review.helpfulCount}
          </button>
        </div>
      </div>
    </div>
  </article>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ratingLabel: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return 'Recently'
  }

  const date = new Date(value)
  const time = date.getTime()

  if (Number.isNaN(time)) {
    return 'Recently'
  }

  const diffMs = Date.now() - time
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getTotalSubtopics = (tracker: CommunityPublicTrackerDetail) => {
  if (tracker.subtopicsCount > 0) {
    return tracker.subtopicsCount
  }

  return tracker.topics.reduce(
    (total, topic) => total + topic.subtopics.length,
    0,
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPublicTrackerPage() {
  const { trackerId } = useParams<{ trackerId: string }>()
  const trackerQuery = useCommunityPublicTracker(trackerId)
  const tracker = trackerQuery.data

  if (trackerQuery.isLoading || !trackerId) {
    return <CommunityPageSkeleton variant="browse" />
  }

  if (trackerQuery.isError || !tracker) {
    return (
      <CommunityLayout>
        <div className={communityPageClass}>
          <CommunityErrorState
            title="Tracker unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading this community tracker.',
              trackerQuery.error,
            )}
            actionLabel="Try again"
            onAction={() => void trackerQuery.refetch()}
          />
        </div>
      </CommunityLayout>
    )
  }

  return <CommunityPublicTrackerLoaded key={tracker._id} tracker={tracker} />
}

function CommunityPublicTrackerLoaded({
  tracker,
}: {
  tracker: CommunityPublicTrackerDetail
}) {
  const navigate = useNavigate()

  const cloneTracker = useCloneCommunityTracker()
  const upsertReview = useUpsertCommunityTrackerReview()
  const toggleHelpful = useToggleCommunityReviewHelpful()
  const toggleLike = useToggleCommunityTrackerLike()

  const [cloned, setCloned] = useState(false)
  const [openTopicId, setOpenTopicId] = useState(
    () => tracker.topics[0]?._id ?? '',
  )
  const [reviewText, setReviewText] = useState(
    () => tracker.myReview?.comment ?? '',
  )
  const [myRating, setMyRating] = useState(
    () => tracker.myReview?.rating ?? 0,
  )
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top')
  const [activeHelpfulReviewId, setActiveHelpfulReviewId] = useState<string | null>(null)

  const totalSubtopics = useMemo(
    () => getTotalSubtopics(tracker),
    [tracker],
  )

  const sortedReviews = useMemo(() => {
    const copy = [...tracker.reviews]

    if (sortBy === 'top') {
      copy.sort((first, second) => second.helpfulCount - first.helpfulCount)
    } else {
      copy.sort((first, second) => {
        const secondDate = new Date(second.createdAt ?? '').getTime()
        const firstDate = new Date(first.createdAt ?? '').getTime()

        return (Number.isNaN(secondDate) ? 0 : secondDate) -
          (Number.isNaN(firstDate) ? 0 : firstDate)
      })
    }

    return copy
  }, [tracker.reviews, sortBy])

  const isCloned = cloned || tracker.inDashboard
  const likeCount = tracker.likes
  const cloneCount = tracker.clones + (cloned ? 1 : 0)
  const ratingSummary = tracker.ratingSummary
  const liveTotal = ratingSummary.count

  const handleLike = () => {
    if (toggleLike.isPending) {
      return
    }

    toggleLike.mutate({
      trackerId: tracker._id,
    })
  }

  const handleClone = () => {
    if (isCloned || cloneTracker.isPending) {
      return
    }

    cloneTracker.mutate(
      { trackerId: tracker._id },
      {
        onSuccess: () => setCloned(true),
      },
    )
  }

  const handleSubmitReview = () => {
    const comment = reviewText.trim()

    if (!comment || myRating === 0 || upsertReview.isPending) {
      return
    }

    upsertReview.mutate(
      {
        trackerId: tracker._id,
        rating: myRating,
        comment,
      },
      {
        onSuccess: () => {
          setReviewText('')
          setMyRating(0)
          setSortBy('new')
        },
      },
    )
  }

  const handleHelpful = (reviewId: string) => {
    if (toggleHelpful.isPending) {
      return
    }

    setActiveHelpfulReviewId(reviewId)
    toggleHelpful.mutate(
      {
        trackerId: tracker._id,
        reviewId,
      },
      {
        onSettled: () => setActiveHelpfulReviewId(null),
      },
    )
  }

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        <button
          type="button"
          onClick={() => navigate('/community')}
          className="inline-flex w-fit items-center gap-2 rounded-[10px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-2.5 text-[12px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.25)] hover:bg-[rgba(184,76,43,0.07)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
        >
          <BackIcon />
          Back to community
        </button>

        <section className="overflow-hidden rounded-3xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_18px_rgba(26,23,20,0.07)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="relative border-b border-[#e8ddd6] px-6 py-7 dark:border-white/8 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#b84c2b]" />
              <div className="absolute -bottom-22.5 -left-17.5 h-52 w-52 rounded-full bg-[#4caf7d]" />
            </div>

            <div className="relative z-1 grid gap-6 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#e0d0c5] bg-white/65 px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9 dark:bg-white/4">
                    Public Tracker
                  </span>

                  {tracker.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#2d6a47] dark:text-[#5cc98a]">
                      <VerifiedIcon />
                      Verified
                    </span>
                  )}

                  <span className="inline-flex items-center rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.07)] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]">
                    {tracker.level}
                  </span>
                </div>

                <h1 className="max-w-3xl font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,44px)] font-extrabold leading-[1.08] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                  {tracker.title}
                </h1>

                <p className="mt-4 max-w-2xl text-[13.5px] leading-[1.75] text-[#6b5f58] dark:text-[#9b9a92]">
                  {tracker.description || tracker.goal}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {tracker.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#e0d0c5] bg-white/65 px-3 py-1 text-[11px] font-semibold text-[#6b5f58] dark:border-white/9 dark:bg-white/4 dark:text-[#9b9a92]">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={toggleLike.isPending}
                    onClick={handleLike}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-[11px] border-[1.5px] px-4 py-2.5 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60',
                      tracker.likedByMe
                        ? 'border-[rgba(184,76,43,0.28)] bg-[rgba(184,76,43,0.10)] text-[#b84c2b] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]'
                        : 'border-[#e0d0c5] bg-white/60 text-[#6b5f58] hover:border-[rgba(184,76,43,0.25)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-white/4 dark:text-[#9b9a92] dark:hover:text-[#e8816a]',
                    )}
                  >
                    <HeartIcon filled={tracker.likedByMe} />
                    {toggleLike.isPending
                      ? 'Saving...'
                      : tracker.likedByMe
                        ? 'Liked'
                        : 'Like'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClone}
                    disabled={isCloned || cloneTracker.isPending}
                    className="inline-flex items-center gap-2 rounded-[11px] bg-[#b84c2b] px-5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
                  >
                    <CopyIcon />
                    {cloneTracker.isPending
                      ? 'Cloning...'
                      : isCloned
                        ? 'In dashboard'
                        : 'Clone tracker'}
                  </button>
                </div>

                {toggleLike.isError && (
                  <p className="mt-3 text-[12px] font-medium text-[#b84c2b] dark:text-[#e8816a]">
                    {getApiErrorMessage(
                      'Unable to update like. Please try again.',
                      toggleLike.error,
                    )}
                  </p>
                )}

                {cloneTracker.isError && (
                  <p className="mt-3 text-[12px] font-medium text-[#b84c2b] dark:text-[#e8816a]">
                    {getApiErrorMessage(
                      'Unable to clone tracker. Please try again.',
                      cloneTracker.error,
                    )}
                  </p>
                )}
              </div>

              <aside className="rounded-[18px] border border-[#e8ddd6] bg-white/60 p-4 dark:border-white/8 dark:bg-white/4">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar initials={tracker.author.initials} size="lg" accent />
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      {tracker.author.name}
                    </p>
                    <p className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
                      {tracker.author.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <StatPill icon={<StarIcon filled />} label="Rating" value={ratingSummary.average.toFixed(1)} />
                  <StatPill icon={<CopyIcon />} label="Clones" value={cloneCount.toLocaleString()} />
                  <StatPill icon={<HeartIcon filled />} label="Likes" value={likeCount.toLocaleString()} />
                  <StatPill icon={<MessageIcon />} label="Reviews" value={ratingSummary.count.toString()} />
                </div>

                <div className="mt-3 rounded-xl border border-[#e8ddd6] bg-[#fdf8f5]/70 px-3.5 py-3 dark:border-white/8 dark:bg-[#1e1c19]/70">
                  <p className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
                    Tracker ID
                  </p>
                  <p className="mt-0.5 break-all text-[10.5px] font-semibold text-[#6b5f58] dark:text-[#9b9a92]">
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
          <div className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19] sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                  Roadmap Preview
                </p>
                <h2 className="mt-1 font-['Playfair_Display',serif] text-[24px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                  Topics & subtopics
                </h2>
              </div>
              <p className="text-[11.5px] text-[#9b9a92]">Click a topic to expand.</p>
            </div>

            <div className="space-y-2.5">
              {tracker.topics.map((topic, index) => {
                const isOpen = openTopicId === topic._id

                return (
                  <div key={topic._id} className="overflow-hidden rounded-2xl border border-[#e8ddd6] bg-white/55 dark:border-white/8 dark:bg-white/3">
                    <button
                      type="button"
                      onClick={() => setOpenTopicId((current) => (current === topic._id ? '' : topic._id))}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-[rgba(184,76,43,0.04)] dark:hover:bg-[rgba(232,129,106,0.05)]"
                    >
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,76,43,0.09)] font-['DM_Mono',monospace] text-[10px] font-bold text-[#b84c2b] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                            {topic.title}
                          </h3>
                          <p className="mt-0.5 text-[11.5px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
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
                            <div key={subtopic._id} className="rounded-xl border border-[#e8ddd6] bg-[#fdf8f5]/70 px-4 py-3 dark:border-white/8 dark:bg-[#1e1c19]/70">
                              <div>
                                <h4 className="text-[12.5px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                                  {subtopic.title}
                                </h4>
                                <p className="mt-0.5 text-[11px] leading-[1.55] text-[#6b5f58] dark:text-[#9b9a92]">
                                  {subtopic.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
              <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                Goal
              </p>
              <p className="mt-2 text-[13px] leading-[1.72] text-[#6b5f58] dark:text-[#9b9a92]">
                {tracker.goal}
              </p>
            </section>

            <section className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
              <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                Community notes
              </p>
              <ul className="mt-3 space-y-2 text-[12px] leading-[1.65] text-[#6b5f58] dark:text-[#9b9a92]">
                <li>• Verified trackers are reviewed by community members.</li>
                <li>• Clone creates your own editable copy.</li>
                <li>• Reviews help improve roadmap quality.</li>
              </ul>
            </section>

            <section className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
              <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                Field
              </p>
              <p className="mt-2 text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                {tracker.field}
              </p>
              <div className="mt-3 border-t border-[#e8ddd6] pt-3 dark:border-white/8">
                <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                  Category
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                  {tracker.category}
                </p>
              </div>
            </section>
          </aside>
        </section>

        <section className="rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e8ddd6] px-5 py-5 dark:border-white/8 sm:px-6">
            <div>
              <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                Community feedback
              </p>
              <h2 className="mt-0.5 font-['Playfair_Display',serif] text-[24px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                Ratings &amp; Reviews
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#e0d0c5] px-3 py-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92] dark:border-white/9">
                {liveTotal} learners
              </span>
              <div className="flex overflow-hidden rounded-[10px] border border-[#e0d0c5] dark:border-white/9">
                {(['top', 'new'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSortBy(option)}
                    className={cn(
                      'px-3 py-1.5 font-["DM_Mono",monospace] text-[8px] uppercase tracking-widest transition',
                      sortBy === option
                        ? 'bg-[#b84c2b] text-white dark:bg-[#e8816a] dark:text-[#141412]'
                        : 'text-[#9b9a92] hover:text-[#6b5f58] dark:hover:text-[#c8c5be]',
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
              <div className="flex flex-col justify-center rounded-[18px] border border-[#e8ddd6] bg-white/55 p-5 dark:border-white/8 dark:bg-white/3">
                <div className="mb-3 flex items-end gap-3">
                  <p className="font-['Playfair_Display',serif] text-[64px] font-extrabold leading-none tracking-[-2px] text-[#1a1714] dark:text-[#f2f0eb]">
                    {ratingSummary.average.toFixed(1)}
                  </p>
                  <div className="mb-1.5">
                    <RatingStars value={ratingSummary.average} size="md" />
                    <p className="mt-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-widest text-[#9b9a92]">
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

              <div className="rounded-[18px] border border-[#e8ddd6] bg-white/55 p-5 dark:border-white/8 dark:bg-white/3">
                <p className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
                  Your review
                </p>
                <h3 className="mt-0.5 font-['Playfair_Display',serif] text-[18px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
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
                    <span className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#b84c2b] dark:text-[#e8816a]">
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
                  className="mt-3 w-full resize-none rounded-xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] px-4 py-3 text-[13px] leading-[1.6] text-[#1a1714] outline-none transition placeholder:text-[#9b9a92] focus:border-[#b84c2b] focus:ring-2 focus:ring-[rgba(184,76,43,0.10)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#f2f0eb] dark:focus:border-[#e8816a]"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-[#9b9a92]">
                    {upsertReview.isError
                      ? getApiErrorMessage(
                          'Unable to submit review. Please try again.',
                          upsertReview.error,
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
                    className="shrink-0 rounded-[10px] bg-[#b84c2b] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#963d22] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
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
              <div className="rounded-[18px] border border-dashed border-[#e0d0c5] px-5 py-8 text-center dark:border-white/10">
                <p className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                  No reviews yet
                </p>
                <p className="mt-2 text-[13px] text-[#6b5f58] dark:text-[#9b9a92]">
                  Be the first learner to rate and review this tracker.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </CommunityLayout>
  )
}