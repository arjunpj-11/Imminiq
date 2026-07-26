import {
  LoaderCircle,
  MessageCircle,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  RotateCcw,
} from 'lucide-react';

import UserAvatar from '../../../../components/data-display/UserAvatar';
import { cn } from '../../../../lib/cn';
import type { IFriendRequest, IFriendUser } from '../../friends';
import type { ICall } from '../types/call.types';
import type { IChatConversation, IChatMessage } from '../types/chat.types';

const conversationTime = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const messagePreview = (message: IChatMessage | null, viewerId: string) => {
  if (!message) return 'Start a conversation';
  const prefix = message.senderId === viewerId ? 'You: ' : '';
  if (message.kind === 'image') return `${prefix}Photo`;
  if (message.kind === 'voice') return `${prefix}Voice message`;
  if (message.kind === 'tracker') {
    return `${prefix}Tracker · ${message.sharedTracker?.title ?? 'Shared roadmap'}`;
  }
  if (message.kind === 'profile') {
    return `${prefix}Profile · ${message.sharedProfile?.fullName ?? 'Shared profile'}`;
  }
  if (message.kind === 'file') return `${prefix}${message.attachment?.name ?? 'File'}`;
  if (message.kind === 'code') return `${prefix}Code · ${message.codeLanguage ?? 'snippet'}`;
  return `${prefix}${message.text}`;
};

const formatDuration = (seconds: number) => {
  const normalized = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(
    normalized % 60
  ).padStart(2, '0')}`;
};

export function ConversationRow({
  conversation,
  selected,
  viewerId,
  onSelect,
}: {
  conversation: IChatConversation;
  selected: boolean;
  viewerId: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
        selected
          ? 'bg-[color-mix(in_srgb,var(--brand-500)_10%,var(--surface-elevated))] shadow-[inset_3px_0_0_var(--brand-500)]'
          : 'hover:bg-(--surface-muted)'
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          name={conversation.participant.fullName}
          src={conversation.participant.avatarUrl}
          initials={conversation.participant.initials}
          sizeClassName="h-12 w-12 text-[11px]"
        />
        {conversation.participant.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-(--surface-elevated) bg-[#36a26b]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-bold">
            {conversation.participant.fullName}
          </span>
          <time
            className={cn(
              'shrink-0 font-mono text-[9px]',
              conversation.unreadCount
                ? 'font-bold text-(--brand-500)'
                : 'text-(--text-muted)'
            )}
          >
            {conversationTime(conversation.lastMessageAt)}
          </time>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[11px] text-(--text-muted)">
            {messagePreview(conversation.lastMessage, viewerId)}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-(--brand-500) px-1.5 font-mono text-[9px] font-bold text-(--brand-contrast)">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function FriendRow({
  friend,
  loading,
  onMessage,
}: {
  friend: IFriendUser;
  loading: boolean;
  onMessage: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-(--surface-muted)">
      <UserAvatar
        name={friend.fullName}
        src={friend.avatarUrl}
        initials={friend.initials}
        sizeClassName="h-11 w-11 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{friend.fullName}</div>
        <div className="mt-1 truncate font-mono text-[9px] text-(--text-muted)">
          {friend.handle} · {friend.levelLabel}
        </div>
      </div>
      <button
        type="button"
        onClick={onMessage}
        disabled={loading}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-(--brand-500) px-3 text-[10.5px] font-bold text-(--brand-contrast) disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle size={13} className="animate-spin" />
        ) : (
          <MessageCircle size={13} />
        )}
        Message
      </button>
    </div>
  );
}

export function RequestRow({
  request,
  onAccept,
  onDecline,
  busy,
}: {
  request: IFriendRequest;
  onAccept: () => void;
  onDecline: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-3.5 shadow-(--shadow-1)">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={request.user.fullName}
          src={request.user.avatarUrl}
          initials={request.user.initials}
          sizeClassName="h-11 w-11 text-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold">{request.user.fullName}</div>
          <div className="mt-0.5 font-mono text-[9px] text-(--text-muted)">
            {request.user.handle}
          </div>
        </div>
      </div>
      {request.message && (
        <p className="mb-0 mt-3 rounded-lg bg-(--surface-muted) px-3 py-2.5 text-[11.5px] leading-5 text-(--text-secondary)">
          “{request.message}”
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          className="h-9 rounded-lg border border-(--border-subtle) text-[10.5px] font-bold"
        >
          Decline
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onAccept}
          className="h-9 rounded-lg bg-(--brand-500) text-[10.5px] font-bold text-(--brand-contrast)"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export function CallHistoryRow({
  call,
  onCallAgain,
}: {
  call: ICall;
  onCallAgain: () => void;
}) {
  const Icon =
    call.status === 'missed' || call.status === 'declined'
      ? PhoneMissed
      : call.direction === 'incoming'
        ? PhoneIncoming
        : PhoneOutgoing;
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-(--surface-muted)">
      <UserAvatar
        name={call.otherParticipant.fullName}
        src={call.otherParticipant.avatarUrl}
        initials={call.otherParticipant.initials}
        sizeClassName="h-11 w-11 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">
          {call.otherParticipant.fullName}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-(--text-muted)">
          <Icon size={11} className={call.status === 'missed' ? 'text-(--danger)' : ''} />
          <span className="capitalize">{call.status}</span>
          {call.durationSeconds > 0 && (
            <span>· {formatDuration(call.durationSeconds)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <time className="font-mono text-[9px] text-(--text-muted)">
          {conversationTime(call.createdAt)}
        </time>
        <button
          type="button"
          onClick={onCallAgain}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-(--border-subtle) px-3 text-[10px] font-bold text-(--text-secondary) hover:border-(--brand-500) hover:text-(--brand-500)"
          aria-label={`Call ${call.otherParticipant.fullName} again`}
        >
          <RotateCcw size={12} />
          Call again
        </button>
      </div>
    </div>
  );
}
