import type {
  IProfileData,
  IProfileStats,
  IStreakSummary,
  ProfileRelationshipState,
} from '../types/profile.types';
import { formatCompactNumber } from '../utils/profile-formatters';
import { cn } from '../../../../lib/cn';

interface IProfileHeaderProps {
  profile: IProfileData;
  stats?: IProfileStats | null;
  streak?: IStreakSummary | null;
  levelLabel: string;
  location: string;
  isOwnView: boolean;
  isPublicView: boolean;
  relationship: ProfileRelationshipState;
  isSendingFriendRequest: boolean;
  onChangeBanner: () => void;
  onChangeAvatar: () => void;
  onEdit: () => void;
  onSendFriendRequest: () => void;
  onCopyProfileLink: () => void;
}

function BannerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ProfileAvatar({
  profile,
  isOwnView,
  onChange,
}: Pick<IProfileHeaderProps, 'profile' | 'isOwnView'> & { onChange: () => void }) {
  const initials = profile.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative z-20 -mt-18 shrink-0 max-[640px]:-mt-13.5">
      <button
        type="button"
        onClick={onChange}
        disabled={!isOwnView}
        aria-label={isOwnView ? 'Change profile avatar' : `${profile.name} profile avatar`}
        className={cn(
          'group relative flex h-25 w-25 items-center justify-center overflow-hidden rounded-full border-4 border-[#fdf8f5] bg-linear-to-br from-(--brand-500) via-(--brand-500) to-(--warning) shadow-[0_4px_24px_rgba(26,23,20,0.18),0_0_0_1px_rgba(26,23,20,0.06)] transition-shadow dark:border-[#1e1c19] max-[640px]:h-23 max-[640px]:w-23',
          isOwnView
            ? 'cursor-pointer hover:shadow-[0_6px_32px_rgba(26,23,20,0.22),0_0_0_2px_var(--brand-500)]'
            : 'cursor-default'
        )}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-ui text-[26px] font-bold text-white/90">{initials}</span>
        )}

        {isOwnView && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.75 rounded-full bg-[rgba(0,0,0,0.52)] opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <CameraIcon />
            <span className="font-mono text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-white">
              Change
            </span>
          </span>
        )}
      </button>

      <div className="absolute bottom-0.75 left-1/2 z-3 -translate-x-1/2 whitespace-nowrap rounded-sm bg-(--brand-500) px-1.75 py-0.5 font-mono text-[8px] font-medium tracking-[0.12em] text-white dark:bg-(--brand-500) dark:text-[#141412]">
        PRO
      </div>
    </div>
  );
}

function ProfileActions({
  isPublicView,
  relationship,
  isSendingFriendRequest,
  onSendFriendRequest,
  onEdit,
  onCopyProfileLink,
}: Omit<
  IProfileHeaderProps,
  | 'profile'
  | 'stats'
  | 'streak'
  | 'levelLabel'
  | 'location'
  | 'isOwnView'
  | 'onChangeBanner'
  | 'onChangeAvatar'
>) {
  return (
    <div className="flex self-center translate-y-1.5 flex-wrap items-center gap-2 max-[900px]:w-full max-[900px]:translate-y-0 max-[900px]:self-auto max-[640px]:gap-2">
      {isPublicView ? (
        <>
          <button
            type="button"
            onClick={onSendFriendRequest}
            disabled={
              isSendingFriendRequest ||
              relationship === 'request_sent' ||
              relationship === 'friends'
            }
            className={cn(
              'inline-flex items-center gap-1.75 whitespace-nowrap rounded-md px-5.5 py-2.5 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-70 max-[640px]:flex-[1_1_150px] max-[640px]:justify-center',
              relationship === 'request_sent' || relationship === 'friends'
                ? 'border-[1.5px] border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] text-(--success) dark:border-[rgba(92,201,138,0.22)] dark:bg-[rgba(92,201,138,0.10)] dark:text-(--success)'
                : 'bg-(--brand-500) text-[#fdf8f5] hover:-translate-y-px hover:bg-(--brand-600) hover:shadow-[0_8px_24px_rgba(184,76,43,0.28)] dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)'
            )}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {isSendingFriendRequest
              ? 'Sending...'
              : relationship === 'friends'
                ? 'Friends'
                : relationship === 'request_received'
                  ? 'Review Request'
                  : relationship === 'request_sent'
                    ? 'Request Sent'
                    : 'Send Request'}
          </button>

        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.75 whitespace-nowrap rounded-md border-[1.5px] border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-4.5 py-2.5 text-[13px] font-semibold text-(--brand-500) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-(--brand-500) hover:text-[#fdf8f5] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.09)] dark:text-(--brand-500) max-[640px]:flex-[1_1_150px] max-[640px]:justify-center"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      )}

      <button
        type="button"
        onClick={onCopyProfileLink}
        className="inline-flex items-center gap-1.75 whitespace-nowrap rounded-md border-[1.5px] border-(--border-subtle) px-4.5 py-2.5 text-[13px] font-semibold text-(--text-primary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-primary) max-[640px]:flex-[1_1_170px] max-[640px]:justify-center"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        Copy Profile URL
      </button>
    </div>
  );
}

function ProfileChips({ stats, streak }: Pick<IProfileHeaderProps, 'stats' | 'streak'>) {
  const chips = [
    {
      className:
        'bg-[rgba(184,76,43,0.08)] border-[rgba(184,76,43,0.16)] text-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.10)] dark:border-[rgba(232,129,106,0.22)] dark:text-[var(--brand-500)]',
      label: `${streak?.currentStreak ?? stats?.streakCount ?? 0} Day Streak`,
    },
    {
      className:
        'bg-[rgba(138,98,0,0.08)] border-[rgba(138,98,0,0.20)] text-[#8a6200] dark:bg-[rgba(240,168,66,0.10)] dark:border-[rgba(240,168,66,0.24)] dark:text-[var(--warning)]',
      label: `${formatCompactNumber(stats?.xp ?? 0)} XP`,
    },
    {
      className:
        'bg-[rgba(59,108,183,0.08)] border-[rgba(59,108,183,0.20)] text-[var(--info)] dark:bg-[rgba(107,159,232,0.10)] dark:border-[rgba(107,159,232,0.22)] dark:text-[var(--info)]',
      label: `Student Level ${stats?.studentLevel ?? 0}`,
    },
    {
      className:
        'bg-[rgba(184,76,43,0.08)] border-[rgba(184,76,43,0.20)] text-[var(--brand-500)] dark:bg-[rgba(232,129,106,0.10)] dark:border-[rgba(232,129,106,0.22)]',
      label: `Teacher Level ${stats?.teacherLevel ?? 1}`,
    },
    {
      className:
        'bg-[rgba(45,106,71,0.08)] border-[rgba(45,106,71,0.20)] text-[var(--success)] dark:bg-[rgba(92,201,138,0.10)] dark:border-[rgba(92,201,138,0.22)] dark:text-[var(--success)]',
      label: `Rating ${Number(stats?.ratingAverage ?? 0).toFixed(1)}`,
    },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.75">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1.25 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap',
            chip.className
          )}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export default function ProfileHeader({
  profile,
  stats,
  streak,
  levelLabel,
  location,
  isOwnView,
  isPublicView,
  relationship,
  isSendingFriendRequest,
  onChangeBanner,
  onChangeAvatar,
  onEdit,
  onSendFriendRequest,
  onCopyProfileLink,
}: IProfileHeaderProps) {
  return (
    <>
      <div
        className="group/banner relative overflow-hidden rounded-t-[22px] bg-[#0e0c0a] max-[640px]:rounded-t-2xl"
        style={{ aspectRatio: '4 / 1' }}
      >
        {profile.bannerDataUrl && (
          <img
            src={profile.bannerDataUrl}
            alt="Profile banner"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-1 h-95 w-95 -translate-x-1/2 translate-y-[-60%] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 z-1 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: '180px',
          }}
        />

        {isOwnView && (
          <div className="pointer-events-none absolute inset-0 z-5 flex items-end justify-end p-3.5 transition-[background] group-hover/banner:bg-[rgba(0,0,0,0.28)] max-[900px]:bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.42)_100%)] [@media(hover:none)]:bg-[linear-gradient(180deg,transparent_26%,rgba(0,0,0,0.46)_100%)]">
            <button
              type="button"
              onClick={onChangeBanner}
              className="pointer-events-auto inline-flex translate-y-1 items-center gap-1.5 rounded-sm border border-white/22 bg-black/62 px-3.5 py-2 text-[12px] font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-220 hover:border-white/40 hover:bg-black/82 group-hover/banner:translate-y-0 group-hover/banner:opacity-100 max-[900px]:translate-y-0 max-[900px]:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
            >
              <BannerIcon />
              Change Banner
            </button>
          </div>
        )}
      </div>

      <div className="animate-[fadeUp_0.38s_ease_0.05s_both] border-x border-b border-(--border-subtle) bg-(--surface-card) px-7 pb-5.5 dark:border-(--border-subtle) dark:bg-(--surface-card) max-[640px]:px-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4 max-[640px]:flex-col max-[640px]:gap-3">
            <ProfileAvatar profile={profile} isOwnView={isOwnView} onChange={onChangeAvatar} />

            <div className="min-w-0 flex-1 pt-2 max-[640px]:pt-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="wrap-break-word font-ui text-[clamp(22px,3.5vw,32px)] font-extrabold leading-[1.15] tracking-[-0.6px] text-(--text-primary) dark:text-(--text-primary)">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center rounded-full border border-[rgba(59,108,183,0.22)] bg-[rgba(59,108,183,0.09)] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-(--info) dark:border-[rgba(107,159,232,0.26)] dark:bg-[rgba(107,159,232,0.12)] dark:text-(--info)">
                  {levelLabel}
                </span>
              </div>

              {profile.username && (
                <div className="wrap-break-word mt-1 font-mono text-[11px] tracking-[0.08em] text-(--brand-500) dark:text-(--brand-500)">
                  @{profile.username}
                </div>
              )}

              <div className="mt-1.25 flex flex-wrap items-center gap-1.5 text-[13px] text-(--text-secondary) dark:text-(--text-secondary)">
                {profile.profession && <span>{profile.profession}</span>}
                {profile.profession && location && <span className="opacity-40">·</span>}
                {location && <span>{location}</span>}
              </div>
            </div>
          </div>

          <ProfileActions
            isPublicView={isPublicView}
            relationship={relationship}
            isSendingFriendRequest={isSendingFriendRequest}
            onSendFriendRequest={onSendFriendRequest}
            onEdit={onEdit}
            onCopyProfileLink={onCopyProfileLink}
          />
        </div>

        <ProfileChips stats={stats} streak={streak} />
      </div>
    </>
  );
}
