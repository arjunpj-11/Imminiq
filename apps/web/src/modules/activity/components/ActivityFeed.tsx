import type {
  ActivityEvent,
  ActivityEventIcon,
  ActivityFeedGroup,
} from '../types/activity.types'
import {
  formatActivityTimestamp,
  formatNumber,
} from '../utils/activity-formatters'
import { cn } from '../utils/activity-ui'
import {
  ClipboardCheckIcon,
  CoinsIcon,
  FireIcon,
  GraduationCapIcon,
  LightningIcon,
  RefreshIcon,
  StarIcon,
  UsersIcon,
} from './icons/ActivityIcons'

interface EventIconBubbleProps {
  type: ActivityEventIcon
}

const EventIconBubble = ({ type }: EventIconBubbleProps) => {
  const configuration = {
    tracker: {
      background:
        'bg-[rgba(184,76,43,0.1)] dark:bg-[rgba(232,129,106,0.12)]',
      color: 'text-[#b84c2b] dark:text-[#e8816a]',
      icon: <GraduationCapIcon size={14} />,
    },
    test: {
      background:
        'bg-[rgba(45,106,71,0.1)] dark:bg-[rgba(92,201,138,0.12)]',
      color: 'text-[#2d6a47] dark:text-[#5cc98a]',
      icon: <ClipboardCheckIcon size={14} />,
    },
    community: {
      background:
        'bg-[rgba(124,90,30,0.1)] dark:bg-[rgba(196,154,44,0.12)]',
      color: 'text-[#7c5a1e] dark:text-[#c49a2c]',
      icon: <UsersIcon size={14} />,
    },
    fire: {
      background:
        'bg-[rgba(184,76,43,0.1)] dark:bg-[rgba(232,129,106,0.12)]',
      color: 'text-[#b84c2b] dark:text-[#e8816a]',
      icon: <FireIcon size={14} />,
    },
    star: {
      background:
        'bg-[rgba(196,154,44,0.1)] dark:bg-[rgba(196,154,44,0.12)]',
      color: 'text-[#c49a2c]',
      icon: <StarIcon size={13} />,
    },
  } as const

  const selected = configuration[type]

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        selected.background,
        selected.color,
      )}
    >
      {selected.icon}
    </div>
  )
}

interface ActivityRowProps {
  event: ActivityEvent
}

const ActivityRow = ({ event }: ActivityRowProps) => (
  <article className="flex items-start gap-3.5 border-b border-[#ece3db] px-5 py-3.25 transition-colors duration-100 last:border-b-0 hover:bg-[rgba(26,23,20,0.012)] dark:border-white/6 dark:hover:bg-white/[0.012]">
    <EventIconBubble type={event.icon} />

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#2a2420] dark:text-[#dedad5]">
            {event.title}
          </div>
          {event.subtitle && (
            <div className="mt-0.5 text-[11px] text-[#b0a097] dark:text-[#6b6460]">
              {event.subtitle}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
            {event.xp > 0 && (
              <span className="inline-flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] font-bold text-[#b84c2b] tabular-nums dark:text-[#e8816a]">
                <LightningIcon size={10} />+{formatNumber(event.xp)} XP
              </span>
            )}

            {event.coins > 0 && (
              <span className="inline-flex items-center gap-1 font-['DM_Mono',monospace] text-[11px] font-bold text-[#a07a18] tabular-nums dark:text-[#e6be50]">
                <CoinsIcon size={10} />+{formatNumber(event.coins)}
              </span>
            )}
          </div>

          <div className="mt-0.5 text-right font-['DM_Mono',monospace] text-[9.5px] text-[#c4b8b0] dark:text-[#5a5550]">
            {formatActivityTimestamp(event.occurredAt)}
          </div>
        </div>
      </div>
    </div>
  </article>
)

const DateDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 border-b border-[#e8ddd6] bg-[rgba(26,23,20,0.018)] px-5 py-2.5 dark:border-white/8 dark:bg-white/[0.018]">
    <span className="select-none whitespace-nowrap font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">
      {label}
    </span>
    <div className="h-px flex-1 bg-[#e8ddd6] dark:bg-white/8" />
  </div>
)

interface ActivityFeedProps {
  groups: ActivityFeedGroup[]
  hasMore: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onLoadMore: () => void
}

export default function ActivityFeed({
  groups,
  hasMore,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: ActivityFeedProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19]">
      {groups.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <h3 className="font-['Playfair_Display',serif] text-[18px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
            No activity yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[12px] leading-[1.6] text-[#b0a097] dark:text-[#6b6460]">
            Complete a tracker subtopic, take a mock test, or contribute to
            the community to start building your activity timeline.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.date}>
            <DateDivider label={group.label} />
            {group.events.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </section>
        ))
      )}

      {(hasMore || isFetchNextPageError) && groups.length > 0 && (
        <div className="border-t border-[#ece3db] p-4 text-center dark:border-white/6">
          {isFetchNextPageError && (
            <p className="mb-3 text-[11.5px] text-[#d94535] dark:text-[#ff6b5f]" role="alert">
              Could not load more activity. Try again.
            </p>
          )}

          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-[rgba(184,76,43,0.2)] bg-[rgba(184,76,43,0.06)] px-4 py-2.5 font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.08em] text-[#b84c2b] transition hover:bg-[rgba(184,76,43,0.11)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[rgba(232,129,106,0.2)] dark:bg-[rgba(232,129,106,0.07)] dark:text-[#e8816a]"
          >
            <RefreshIcon
              size={12}
              className={isFetchingNextPage ? 'animate-spin' : ''}
            />
            {isFetchingNextPage
              ? 'Loading…'
              : isFetchNextPageError
                ? 'Retry'
                : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
