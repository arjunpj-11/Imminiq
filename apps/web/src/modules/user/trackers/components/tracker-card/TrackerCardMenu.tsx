import type { RefObject } from 'react';
import { Share2 } from 'lucide-react';

import { cn } from '../../../../../lib/cn';
import {
  ArchiveIcon,
  DeleteIcon,
  InfoIcon,
  MoreIcon,
  RevisionIcon,
  ShieldIcon,
  SpinnerIcon,
} from './TrackerCardIcons';

type TrackerCardMenuProps = {
  menuRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  disabled: boolean;
  isArchived: boolean;
  isPublished: boolean;
  isSharedCoOwner: boolean;
  isSendingVerification: boolean;
  verificationButtonDisabled: boolean;
  verificationLabel: string;
  canSendForVerification: boolean;
  onOpenChange: (open: boolean) => void;
  onInfo: () => void;
  onQuickRevision: () => void;
  onShare?: () => void;
  onSendForVerification: () => void;
  onArchive?: () => void;
  onDelete: () => void;
};

const menuItemClass =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.20)]';

export default function TrackerCardMenu({
  menuRef,
  open,
  disabled,
  isArchived,
  isPublished,
  isSharedCoOwner,
  isSendingVerification,
  verificationButtonDisabled,
  verificationLabel,
  canSendForVerification,
  onOpenChange,
  onInfo,
  onQuickRevision,
  onShare,
  onSendForVerification,
  onArchive,
  onDelete,
}: TrackerCardMenuProps) {
  const runAction = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label="More tracker actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-(--text-secondary) transition hover:border-(--border-subtle) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(184,76,43,0.20)] disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-[rgba(232,129,106,0.10)]"
      >
        <MoreIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-40 w-60 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-2 shadow-[0_18px_60px_rgba(26,23,20,0.20)] dark:bg-(--surface-elevated)"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-2 pb-1.5 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-(--text-secondary)">
            Tracker actions
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onInfo)}
            className={cn(
              menuItemClass,
              'text-(--text-primary) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500)'
            )}
          >
            <InfoIcon />
            Manage tracker
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onQuickRevision)}
            className={cn(
              menuItemClass,
              'text-(--text-primary) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500)'
            )}
          >
            <RevisionIcon />
            Quick revision
          </button>

          {onShare && (
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onShare)}
              className={cn(
                menuItemClass,
                'text-(--text-primary) hover:bg-[rgba(184,76,43,0.07)] hover:text-(--brand-500)'
              )}
            >
              <Share2 size={16} />
              Share with a friend
            </button>
          )}

          {!isSharedCoOwner && (
            <button
              type="button"
              role="menuitem"
              disabled={verificationButtonDisabled}
              onClick={() => runAction(onSendForVerification)}
              className={cn(
                menuItemClass,
                'disabled:cursor-not-allowed disabled:opacity-50',
                canSendForVerification || (!isPublished && !isArchived)
                  ? 'text-(--text-primary) hover:bg-[rgba(45,106,71,0.08)] hover:text-(--success)'
                  : 'text-(--text-secondary)'
              )}
            >
              {isSendingVerification ? <SpinnerIcon /> : <ShieldIcon />}
              {verificationLabel}
            </button>
          )}

          {(onArchive || !isSharedCoOwner) && <div className="my-1.5 h-px bg-(--border-subtle)" />}

          {onArchive && !isSharedCoOwner && (
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onArchive)}
              className={cn(
                menuItemClass,
                isArchived
                  ? 'text-(--success) hover:bg-[rgba(45,106,71,0.08)]'
                  : 'text-(--text-primary) hover:bg-[rgba(26,23,20,0.05)] dark:hover:bg-white/5'
              )}
            >
              <ArchiveIcon />
              {isArchived ? 'Restore tracker' : 'Archive tracker'}
            </button>
          )}

          {!isSharedCoOwner && (
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onDelete)}
              className={cn(
                menuItemClass,
                'text-[#b83232] hover:bg-[rgba(200,50,50,0.08)] dark:text-[#ff8c8c]'
              )}
            >
              <DeleteIcon />
              Delete tracker
            </button>
          )}
        </div>
      )}
    </div>
  );
}
