import { useState, type ReactNode } from 'react'

import type {
  CommunityPublicTrackerDetail,
  CommunityTrackerReview,
} from '../types/community.types'
import { cn } from '../utils/community-ui'

export const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M20.8 4.6C18.9 2.8 15.9 2.9 14.1 4.8L12 7L9.9 4.8C8.1 2.9 5.1 2.8 3.2 4.6C1.2 6.6 1.3 9.8 3.4 11.8L12 20L20.6 11.8C22.7 9.8 22.8 6.6 20.8 4.6Z" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
  </svg>
)

export const StarIcon = ({
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

export const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 15H4.5C3.7 15 3 14.3 3 13.5V4.5C3 3.7 3.7 3 4.5 3H13.5C14.3 3 15 3.7 15 4.5V5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 18.5V20.5L8.2 18.5H17C19.2 18.5 21 16.7 21 14.5V7.5C21 5.3 19.2 3.5 17 3.5H7C4.8 3.5 3 5.3 3 7.5V14.5C3 16.7 4.8 18.5 7 18.5H5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
)

export const VerifiedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5L14.5 5L18 4.5L19.5 7.7L22 10L20.7 13.3L21 17L17.5 18.2L15 21L12 19.3L9 21L6.5 18.2L3 17L3.3 13.3L2 10L4.5 7.7L6 4.5L9.5 5L12 2.5Z" fill="currentColor" opacity="0.18" />
    <path d="M8 12.2L10.5 14.7L16.2 9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const TopicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 4.5H19M5 9.5H15M5 14.5H19M5 19.5H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const ThumbsUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 22V11M2 13V20C2 21.1 2.9 22 4 22H16.4C17.6 22 18.6 21.1 18.8 19.9L20 13.9C20.2 12.5 19.1 11.2 17.7 11.2H14V6C14 4.3 12.7 3 11 3C10.4 3 10 3.4 10 4V5L8.1 9.7C7.7 10.5 7 11 6.2 11H4C2.9 11 2 11.9 2 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChevronIcon = ({ open }: { open: boolean }) => (
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

type StarSize = 'sm' | 'md' | 'lg'

const starSizePx: Record<StarSize, number> = {
  sm: 13,
  md: 16,
  lg: 22,
}

export function RatingStars({
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

export const Avatar = ({
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

export const StatPill = ({
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

export const RatingBar = ({
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

export const ReviewCard = ({
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

export const ratingLabel: Record<number, string> = {
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

export const getTotalSubtopics = (tracker: CommunityPublicTrackerDetail) => {
  if (tracker.subtopicsCount > 0) {
    return tracker.subtopicsCount
  }

  return tracker.topics.reduce(
    (total, topic) => total + topic.subtopics.length,
    0,
  )
}
