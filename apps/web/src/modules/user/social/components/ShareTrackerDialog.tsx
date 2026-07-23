import { Check, LoaderCircle, Search, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import UserAvatar from '../../../../components/data-display/UserAvatar';
import Modal from '../../../../components/overlays/Modal';
import { toast } from '../../../../lib/toast';
import { CHAT_PAGE_SIZE } from '../constants/chat.constants';
import { useChatConversations, useShareTrackerToChat } from '../hooks/useChat';
import { useSocialShareStore } from '../store/useSocialShareStore';

export default function ShareTrackerDialog() {
  const tracker = useSocialShareStore((state) => state.tracker);
  const close = useSocialShareStore((state) => state.close);
  const [search, setSearch] = useState('');
  const [sentConversationId, setSentConversationId] = useState<string | null>(null);
  const conversationsQuery = useChatConversations(CHAT_PAGE_SIZE, Boolean(tracker));
  const shareTracker = useShareTrackerToChat();

  const conversations = useMemo(
    () => conversationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [conversationsQuery.data]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.participant.fullName} ${conversation.participant.username}`
        .toLowerCase()
        .includes(query)
    );
  }, [conversations, search]);

  if (!tracker) return null;

  const dismiss = () => {
    setSearch('');
    setSentConversationId(null);
    close();
  };

  return (
    <Modal
      open
      onClose={dismiss}
      titleId="share-tracker-title"
      preventClose={shareTracker.isPending}
      overlayClassName="z-190 bg-black/55"
      contentClassName="flex max-h-[min(680px,92vh)] max-w-md flex-col rounded-3xl p-0"
    >
        <header className="flex items-start gap-3 border-b border-(--border-subtle) px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)] text-(--brand-500)">
            <Send size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="share-tracker-title" className="m-0 text-[15px] font-bold">
              Share tracker in Social
            </h2>
            <p className="mb-0 mt-1 truncate text-[10px] text-(--text-muted)">
              {tracker.title}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-(--surface-muted)"
            aria-label="Close share dialog"
          >
            <X size={16} />
          </button>
        </header>

        <div className="p-4 pb-2">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-muted) px-3">
            <Search size={14} className="text-(--text-muted)" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {conversationsQuery.isPending ? (
            <div className="flex h-40 items-center justify-center">
              <LoaderCircle size={20} className="animate-spin text-(--text-muted)" />
            </div>
          ) : filtered.length ? (
            filtered.map((conversation) => {
              const sending =
                shareTracker.isPending &&
                shareTracker.variables?.targetConversationId === conversation.id;
              const sent = sentConversationId === conversation.id;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  disabled={shareTracker.isPending || sent}
                  onClick={() =>
                    shareTracker.mutate(
                      {
                        trackerId: tracker.trackerId,
                        targetConversationId: conversation.id,
                      },
                      {
                        onSuccess: () => {
                          setSentConversationId(conversation.id);
                          toast.success(
                            'Tracker shared',
                            `Sent to ${conversation.participant.fullName}.`
                          );
                        },
                        onError: (error) =>
                          toast.error(
                            'Could not share tracker',
                            error.response?.data?.message ?? 'Please try again.'
                          ),
                      }
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-(--surface-muted) disabled:opacity-60"
                >
                  <UserAvatar
                    name={conversation.participant.fullName}
                    src={conversation.participant.avatarUrl}
                    initials={conversation.participant.initials}
                    sizeClassName="h-11 w-11 text-[10px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-bold">
                      {conversation.participant.fullName}
                    </div>
                    <div className="mt-0.5 truncate text-[9px] text-(--text-muted)">
                      {conversation.participant.handle}
                    </div>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--brand-500) text-(--brand-contrast)">
                    {sending ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : sent ? (
                      <Check size={15} />
                    ) : (
                      <Send size={14} />
                    )}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="px-5 py-12 text-center text-[11px] text-(--text-muted)">
              No conversations match your search.
            </p>
          )}
        </div>
    </Modal>
  );
}
