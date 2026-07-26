import { cn } from '../../../../../lib/cn';
import UserAvatar from '../../../../../components/data-display/UserAvatar';
import type { ITrackerClanChallenge } from '../../types/tracker.types';

type Props = {
  challenge: ITrackerClanChallenge;
  currentUserId?: string;
  busy?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onEnter: () => void;
  eventType?: 'invite' | 'result';
  onProfile?: (username: string) => void;
};

const statusLabel: Record<ITrackerClanChallenge['status'], string> = {
  open: 'Open challenge',
  pending: 'Direct challenge',
  active: 'Battle live',
  completed: 'Battle finished',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export default function ClanChallengeCard({
  challenge,
  currentUserId,
  busy,
  onAccept,
  onDecline,
  onCancel,
  onEnter,
  eventType = 'invite',
  onProfile,
}: Props) {
  const isParticipant =
    challenge.challenger.userId === currentUserId || challenge.opponent?.userId === currentUserId;
  const winner = challenge.winnerId
    ? challenge.winnerId === challenge.challenger.userId
      ? challenge.challenger
      : challenge.opponent
    : null;

  if (eventType === 'result') {
    return (
      <article className="mx-auto max-w-xl rounded-xl border border-[#d6ad47]/35 bg-[linear-gradient(135deg,rgba(244,201,93,.14),rgba(184,76,43,.07))] px-5 py-4 text-center shadow-sm">
        <p className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#9a7210] dark:text-[#f4c95d]">
          ⚔ Battle result
        </p>
        <h3 className="mt-2 font-serif text-lg font-bold">
          {winner ? `${winner.name} won the guild battle` : 'The guild battle ended in a draw'}
        </h3>
        <p className="mt-1 text-sm font-extrabold">
          {challenge.challenger.name} {challenge.challengerScore ?? 0} –{' '}
          {challenge.opponentScore ?? 0} {challenge.opponent?.name}
        </p>
        <p className="mt-1 text-[10px] text-(--text-secondary)">
          Same tracker contest · {challenge.durationMinutes} minute limit
        </p>
      </article>
    );
  }

  const mine = challenge.challenger.userId === currentUserId;

  return (
    <div className={cn('flex items-start gap-3', mine && 'flex-row-reverse')}>
      <UserAvatar
        name={challenge.challenger.name}
        src={challenge.challenger.avatarUrl}
        profileUsername={challenge.challenger.username}
        sizeClassName="h-9 w-9 text-[10px]"
        fallbackClassName="bg-none bg-[#171512] text-white"
      />
      <article
        className={cn(
          'max-w-[82%] rounded-xl border border-[#d6ad47]/35 bg-[linear-gradient(135deg,rgba(244,201,93,.12),rgba(184,76,43,.06))] p-4',
          mine ? 'rounded-tr-sm' : 'rounded-tl-sm'
        )}
      >
        <button
          type="button"
          onClick={() => onProfile?.(challenge.challenger.username)}
          className="mb-2 block text-[10px] font-bold text-(--text-secondary) hover:text-(--brand-500)"
        >
          {challenge.challenger.name}
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[8px] font-bold uppercase tracking-[.16em] text-[#9a7210] dark:text-[#f4c95d]">
              ⚔ {statusLabel[challenge.status]}
            </p>
            <h3 className="mt-1 font-serif text-lg font-bold">
              {challenge.challenger.name} <span className="text-(--text-secondary)">vs</span>{' '}
              {challenge.opponent?.name ?? 'Any guild member'}
            </h3>
            <p className="mt-1 text-[11px] text-(--text-secondary)">
              {challenge.questionCount} race nodes · {challenge.durationMinutes} minutes · first to
              the finish wins
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {challenge.canAccept && (
            <button
              type="button"
              disabled={busy}
              onClick={onAccept}
              className="rounded-md bg-[#171512] px-4 py-2 text-[11px] font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]"
            >
              Accept & start
            </button>
          )}
          {challenge.status === 'active' && isParticipant && (
            <button
              type="button"
              onClick={onEnter}
              className="rounded-md bg-(--brand-500) px-4 py-2 text-[11px] font-extrabold text-white"
            >
              Enter battle
            </button>
          )}
          {challenge.canDecline && (
            <button
              type="button"
              disabled={busy}
              onClick={onDecline}
              className="rounded-md border border-(--border-subtle) px-4 py-2 text-[11px] font-bold disabled:opacity-50"
            >
              Decline
            </button>
          )}
          {challenge.canCancel && (
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className={cn(
                'rounded-md px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-500/8',
                busy && 'opacity-50'
              )}
            >
              Cancel
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
