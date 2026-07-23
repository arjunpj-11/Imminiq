import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowLeft,
  Check,
  Copy,
  LoaderCircle,
  MessageCircle,
  MoreVertical,
  Phone,
  PhoneCall,
  Search,
  ShieldOff,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Video,
  X,
} from 'lucide-react';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import UserAvatar from '../../../../components/data-display/UserAvatar';
import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageContainer from '../../../../components/layout/PageContainer';
import PageHeader from '../../../../components/layout/PageHeader';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import Modal from '../../../../components/overlays/Modal';
import { cn } from '../../../../lib/cn';
import { socket } from '../../../../lib/socket';
import { toast } from '../../../../lib/toast';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useAuthStore } from '../../../../store/useAuthStore';
import {
  FRIENDS_DEFAULT_PAGE_SIZE,
  mergeFriendRequestPages,
  mergeFriendUserPages,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useFriends,
  useReceivedFriendRequests,
  type IFriendUser,
} from '../../friends';
import {
  CallHistoryRow,
  ConversationRow,
  FriendRow,
  RequestRow,
} from '../components/SocialNavigationRows';
import SocialComposer from '../components/SocialComposer';
import SocialMessageBubble from '../components/SocialMessageBubble';
import { CALL_HISTORY_PAGE_SIZE } from '../constants/calls.constants';
import { CHAT_PAGE_SIZE } from '../constants/chat.constants';
import { socialQueryKeys } from '../hooks/social.query-keys';
import {
  useBlockUser,
  useBlockedUsers,
  useChatConversations,
  useChatMessages,
  useCreateConversation,
  useForwardChatMessage,
  useMarkChatRead,
  useUnblockUser,
} from '../hooks/useChat';
import { useCallHistory } from '../hooks/useCalls';
import { useCallLauncherStore } from '../store/useCallLauncherStore';
import type {
  ChatSection,
  IChatConversation,
  IChatMessage,
  IChatPage,
  IUserBlocks,
} from '../types/chat.types';
import { getChatDateLabel } from '../utils/chat-date-label';

const callQueryKeys = socialQueryKeys.calls;
const chatQueryKeys = socialQueryKeys.chat;

const lastActivity = (value: string | null, now: number) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (now - date.getTime() < 60_000) return 'last active just now';
  const today = new Date(now);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === today.toDateString()) return `last active today at ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `last active yesterday at ${time}`;
  }
  return `last active ${date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })} at ${time}`;
};

export default function SocialPage() {
  const queryClient = useQueryClient();
  const viewerId = useAuthStore((state) => state.user?._id ?? '');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('conversation');
  const section = (searchParams.get('view') as ChatSection | null) ?? 'chats';
  const [search, setSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [presenceClock, setPresenceClock] = useState(() => Date.now());
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [blockConfirmationOpen, setBlockConfirmationOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<IChatMessage | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useChatConversations(CHAT_PAGE_SIZE);
  const messagesQuery = useChatMessages(selectedId, CHAT_PAGE_SIZE);
  const callHistoryQuery = useCallHistory(CALL_HISTORY_PAGE_SIZE, section === 'calls');
  const friendsQuery = useFriends({
    search: search.trim(),
    limit: FRIENDS_DEFAULT_PAGE_SIZE,
  });
  const requestsQuery = useReceivedFriendRequests({ limit: FRIENDS_DEFAULT_PAGE_SIZE });
  const blockedUsersQuery = useBlockedUsers();
  const createConversation = useCreateConversation();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const markRead = useMarkChatRead();
  const forwardMessage = useForwardChatMessage();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const openCall = useCallLauncherStore((state) => state.open);

  const conversations = useMemo(
    () => conversationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [conversationsQuery.data]
  );
  const selectedConversation = conversations.find((item) => item.id === selectedId);
  const blockedUserIds = blockedUsersQuery.data?.blockedUserIds ?? [];
  const blockedByUserIds = blockedUsersQuery.data?.blockedByUserIds ?? [];
  const viewerBlockedSelectedUser = Boolean(
    selectedConversation && blockedUserIds.includes(selectedConversation.participant.id)
  );
  const selectedUserBlockedViewer = Boolean(
    selectedConversation &&
      blockedByUserIds.includes(selectedConversation.participant.id)
  );
  const conversationBlocked =
    viewerBlockedSelectedUser || selectedUserBlockedViewer;
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.participant.fullName} ${conversation.participant.username} ${conversation.lastMessage?.text ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [conversations, search]);
  const messages = useMemo(
    () =>
      messagesQuery.data
        ? [...messagesQuery.data.pages].reverse().flatMap((page) => page.items)
        : [],
    [messagesQuery.data]
  );
  const visibleMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) =>
      `${message.text} ${message.codeLanguage ?? ''} ${message.attachment?.name ?? ''} ${message.sharedTracker?.title ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [messageSearch, messages]);
  const friends = useMemo(
    () => mergeFriendUserPages(friendsQuery.data?.pages ?? []),
    [friendsQuery.data]
  );
  const requests = useMemo(
    () => mergeFriendRequestPages(requestsQuery.data?.pages ?? []),
    [requestsQuery.data]
  );
  const calls = useMemo(
    () => callHistoryQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [callHistoryQuery.data]
  );

  const selectConversation = useCallback(
    (conversationId: string) => {
      const next = new URLSearchParams(searchParams);
      next.set('conversation', conversationId);
      next.set('view', 'chats');
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const changeSection = (nextSection: ChatSection) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', nextSection);
    if (nextSection !== 'chats') next.delete('conversation');
    setSearch('');
    setSearchParams(next);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setPresenceClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!optionsOpen) return undefined;
    const close = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) setOptionsOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [optionsOpen]);

  useEffect(() => {
    if (selectedId) markRead.mutate(selectedId);
    // A conversation selection is the only trigger needed for this write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    const receiveMessage = (message: IChatMessage) => {
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        chatQueryKeys.messages(message.conversationId),
        (current) => {
          if (!current?.pages[0]) return current;
          if (current.pages.some((page) => page.items.some((item) => item.id === message.id))) {
            return current;
          }
          const firstPage = current.pages[0];
          return {
            ...current,
            pages: [
              {
                ...firstPage,
                items: [...firstPage.items, message],
                pagination: {
                  ...firstPage.pagination,
                  total: firstPage.pagination.total + 1,
                },
              },
              ...current.pages.slice(1),
            ],
          };
        }
      );
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      if (message.conversationId === selectedId && message.senderId !== viewerId) {
        markRead.mutate(message.conversationId);
      }
    };
    const receiveTyping = (event: {
      conversationId?: string;
      userId?: string;
      isTyping?: boolean;
    }) => {
      if (event.userId !== viewerId) {
        setTypingConversationId(event.isTyping ? event.conversationId ?? null : null);
      }
    };
    const receiveRead = (event: { conversationId?: string; userId?: string }) => {
      if (!event.conversationId || event.userId === viewerId) return;
      queryClient.setQueryData<InfiniteData<IChatPage<IChatMessage>>>(
        chatQueryKeys.messages(event.conversationId),
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items.map((message) =>
                    message.senderId === viewerId ? { ...message, isRead: true } : message
                  ),
                })),
              }
            : current
      );
    };
    const receivePresence = (event: {
      userId?: string;
      isOnline?: boolean;
      lastActiveAt?: string | null;
      presenceVisible?: boolean;
    }) => {
      if (!event.userId) return;
      setPresenceClock(Date.now());
      queryClient.setQueriesData<InfiniteData<IChatPage<IChatConversation>>>(
        { queryKey: chatQueryKeys.conversations() },
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items.map((conversation) =>
                    conversation.participant.id === event.userId
                      ? {
                          ...conversation,
                          participant: {
                            ...conversation.participant,
                            isOnline: Boolean(event.isOnline),
                            lastActiveAt: event.lastActiveAt ?? null,
                            presenceVisible: event.presenceVisible ?? true,
                          },
                        }
                      : conversation
                  ),
                })),
              }
            : current
      );
    };
    const refreshCalls = () => {
      void queryClient.invalidateQueries({ queryKey: callQueryKeys.all });
    };
    const refreshBlockState = (event?: {
      blockerUserId?: string;
      blockedUserId?: string;
      isBlocked?: boolean;
    }) => {
      if (
        event?.blockerUserId &&
        event.blockedUserId &&
        typeof event.isBlocked === 'boolean'
      ) {
        queryClient.setQueryData<IUserBlocks>(
          chatQueryKeys.blocks(),
          (current) => {
            if (!current) return current;
            const updateIds = (ids: string[], userId: string) =>
              event.isBlocked
                ? Array.from(new Set([...ids, userId]))
                : ids.filter((id) => id !== userId);
            if (event.blockerUserId === viewerId) {
              return {
                ...current,
                blockedUserIds: updateIds(
                  current.blockedUserIds,
                  event.blockedUserId!
                ),
              };
            }
            if (event.blockedUserId === viewerId) {
              return {
                ...current,
                blockedByUserIds: updateIds(
                  current.blockedByUserIds,
                  event.blockerUserId!
                ),
              };
            }
            return current;
          }
        );
      }
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.blocks(),
      });
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });
      void queryClient.invalidateQueries({ queryKey: callQueryKeys.all });
    };
    socket.on('chat:message', receiveMessage);
    socket.on('chat:typing', receiveTyping);
    socket.on('chat:read', receiveRead);
    socket.on('chat:presence', receivePresence);
    socket.on('call:updated', refreshCalls);
    socket.on('chat:block-updated', refreshBlockState);
    return () => {
      socket.off('chat:message', receiveMessage);
      socket.off('chat:typing', receiveTyping);
      socket.off('chat:read', receiveRead);
      socket.off('chat:presence', receivePresence);
      socket.off('call:updated', refreshCalls);
      socket.off('chat:block-updated', refreshBlockState);
    };
  }, [markRead, queryClient, selectedId, viewerId]);

  useEffect(() => {
    if (!showJumpButton) messageEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, showJumpButton]);

  const handleStartConversation = (friend: IFriendUser) => {
    createConversation.mutate(
      { friendUserId: friend.id },
      { onSuccess: (conversation) => selectConversation(conversation.id) }
    );
  };

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (selectedId) {
        socket.emit('chat:typing', { conversationId: selectedId, isTyping });
      }
    },
    [selectedId]
  );

  const copySelectedHandle = async () => {
    if (!selectedConversation) return;
    try {
      await navigator.clipboard.writeText(
        selectedConversation.participant.handle
      );
      toast.success('Handle copied');
      setOptionsOpen(false);
    } catch {
      toast.error(
        'Could not copy',
        'Clipboard access is unavailable in this browser.'
      );
    }
  };

  const sidebarVisibleOnMobile = !selectedId;
  const tabs = [
    ['chats', 'Chats', MessageCircle],
    ['friends', 'Friends', Users],
    ['requests', 'Requests', UserPlus],
    ['calls', 'Calls', PhoneCall],
  ] as const;
  const activeTabLabel =
    tabs.find(([value]) => value === section)?.[1] ?? 'Chats';

  return (
    <AppShellBoundary withFooter={!selectedId}>
      <PageContainer
        density="compact"
        className={cn(
          'flex-1',
          selectedId &&
            'h-[calc(100dvh-var(--topbar-height))] min-h-0 gap-0 overflow-hidden !mt-0 !pb-0 max-[640px]:!w-full'
        )}
      >
        {!selectedId && (
          <PageHeader
            eyebrow="Connection hub"
            title="Social"
            description="Keep conversations, calls, friends, and shared learning paths together."
            actions={
              <Link
                to={ROUTES.friendsSearch}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-5 text-[13px] font-bold text-(--brand-contrast) no-underline shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600)"
              >
                <UserPlus size={15} />
                Find people
              </Link>
            }
          />
        )}

        <div
          className={cn(
            'relative flex flex-1 overflow-hidden rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1)',
            selectedId
              ? 'h-full min-h-0 max-h-none max-[640px]:rounded-none max-[640px]:border-x-0 max-[640px]:border-b-0'
              : 'h-[calc(100dvh-var(--topbar-height)-220px)] min-h-[620px] max-h-[780px] max-[640px]:h-[calc(100dvh-var(--topbar-height)-190px)] max-[640px]:min-h-[560px]'
          )}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-linear-to-r from-transparent via-(--brand-500) to-transparent opacity-40" />
        <aside
          className={cn(
            'min-h-0 w-full flex-col border-r border-(--border-subtle) bg-(--surface-card) min-[760px]:w-[360px] min-[760px]:shrink-0',
            sidebarVisibleOnMobile ? 'flex' : 'hidden min-[760px]:flex'
          )}
          aria-label="Social navigation"
        >
          <div className="border-b border-(--border-subtle) px-4 pb-4 pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-(--brand-500)">
                  Your circle
                </div>
                <h2 className="m-0 mt-1 font-ui text-[21px] font-extrabold tracking-[-0.4px] text-(--text-primary)">
                  {activeTabLabel}
                </h2>
              </div>
              {section === 'chats' && conversations.length > 0 && (
                <span className="rounded-full border border-(--border-subtle) bg-(--surface-muted) px-2.5 py-1 font-mono text-[9px] font-semibold text-(--text-secondary)">
                  {conversations.length}
                </span>
              )}
            </div>
            <label className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-(--border-subtle) bg-(--surface-canvas) px-3.5 shadow-inner focus-within:border-[color-mix(in_srgb,var(--brand-500)_45%,var(--border-subtle))] focus-within:ring-2 focus-within:ring-[rgba(184,76,43,0.08)]">
              <Search size={15} className="text-(--text-muted)" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={section === 'friends' ? 'Find a friend' : 'Search Social'}
                className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] outline-none placeholder:text-(--text-muted)"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </label>
          </div>

          <div className="grid grid-cols-4 border-b border-(--border-subtle) bg-(--surface-elevated)/60 px-2">
            {tabs.map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeSection(value)}
                className={cn(
                  'relative flex h-13 items-center justify-center gap-1.5 text-[10.5px] font-bold transition',
                  section === value ? 'text-(--brand-500)' : 'text-(--text-muted)'
                )}
              >
                <Icon size={14} />
                {label}
                {value === 'requests' &&
                  (requestsQuery.data?.pages[0]?.pendingReceivedCount ?? 0) > 0 && (
                    <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--brand-500) px-1 font-mono text-[8px] text-(--brand-contrast)">
                      {requestsQuery.data?.pages[0]?.pendingReceivedCount}
                    </span>
                  )}
                {section === value && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-(--brand-500)" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {section === 'chats' &&
              (conversationsQuery.isPending ? (
                <div className="flex h-48 items-center justify-center">
                  <LoaderCircle size={20} className="animate-spin text-(--text-muted)" />
                </div>
              ) : filteredConversations.length ? (
                filteredConversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    selected={conversation.id === selectedId}
                    viewerId={viewerId}
                    onSelect={() => selectConversation(conversation.id)}
                  />
                ))
              ) : (
                <div className="px-6 py-14 text-center">
                  <MessageCircle size={28} className="mx-auto text-(--text-muted)" />
                  <h2 className="mb-0 mt-3 text-[13px]">No conversations yet</h2>
                  <p className="mt-1 text-[10px] text-(--text-muted)">
                    Open Friends and start the conversation.
                  </p>
                </div>
              ))}

            {section === 'friends' &&
              (friendsQuery.isPending ? (
                <div className="flex h-48 items-center justify-center">
                  <LoaderCircle size={20} className="animate-spin text-(--text-muted)" />
                </div>
              ) : friends.length ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-(--text-muted)">
                      {friends.length} friends
                    </span>
                    <Link
                      to={ROUTES.friendsSearch}
                      className="text-[9px] font-bold text-(--brand-500) no-underline"
                    >
                      Find people
                    </Link>
                  </div>
                  {friends.map((friend) => (
                    <FriendRow
                      key={friend.id}
                      friend={friend}
                      loading={
                        createConversation.isPending &&
                        createConversation.variables?.friendUserId === friend.id
                      }
                      onMessage={() => handleStartConversation(friend)}
                    />
                  ))}
                </>
              ) : (
                <div className="px-6 py-14 text-center text-[10px] text-(--text-muted)">
                  No friends match your search.
                </div>
              ))}

            {section === 'requests' &&
              (requestsQuery.isPending ? (
                <div className="flex h-48 items-center justify-center">
                  <LoaderCircle size={20} className="animate-spin text-(--text-muted)" />
                </div>
              ) : requests.length ? (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <RequestRow
                      key={request.id}
                      request={request}
                      busy={acceptRequest.isPending || declineRequest.isPending}
                      onAccept={() => acceptRequest.mutate({ requestId: request.id })}
                      onDecline={() => declineRequest.mutate({ requestId: request.id })}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-14 text-center">
                  <UserCheck size={28} className="mx-auto text-(--text-muted)" />
                  <h2 className="mb-0 mt-3 text-[13px]">You’re all caught up</h2>
                  <p className="mt-1 text-[10px] text-(--text-muted)">
                    No pending friend requests.
                  </p>
                </div>
              ))}

            {section === 'calls' &&
              (callHistoryQuery.isPending ? (
                <div className="flex h-48 items-center justify-center">
                  <LoaderCircle size={20} className="animate-spin text-(--text-muted)" />
                </div>
              ) : calls.length ? (
                <>
                  {calls.map((call) => (
                    <CallHistoryRow key={call.id} call={call} />
                  ))}
                  {callHistoryQuery.hasNextPage && (
                    <button
                      type="button"
                      onClick={() => void callHistoryQuery.fetchNextPage()}
                      className="w-full py-3 text-[9px] font-bold text-(--brand-500)"
                    >
                      Load earlier calls
                    </button>
                  )}
                </>
              ) : (
                <div className="px-6 py-14 text-center">
                  <PhoneCall size={28} className="mx-auto text-(--text-muted)" />
                  <h2 className="mb-0 mt-3 text-[13px]">No calls yet</h2>
                  <p className="mt-1 text-[10px] text-(--text-muted)">
                    Your call history and duration will appear here.
                  </p>
                </div>
              ))}
          </div>
        </aside>

        <section
          className={cn(
            'min-h-0 min-w-0 flex-1 flex-col bg-(--surface-card)',
            selectedId ? 'flex' : 'hidden min-[760px]:flex'
          )}
          aria-label="Conversation"
        >
          {selectedConversation ? (
            <>
              <header className="relative z-10 flex h-[80px] shrink-0 items-center gap-3 border-b border-(--border-subtle) bg-(--surface-card)/95 px-3 shadow-[0_8px_28px_rgba(26,23,20,0.04)] backdrop-blur sm:px-5">
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('conversation');
                    setSearchParams(next);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-(--surface-muted) min-[760px]:hidden"
                  aria-label="Back to Social"
                >
                  <ArrowLeft size={18} />
                </button>
                <Link
                  to={ROUTES.publicProfileFor(selectedConversation.participant.username)}
                  aria-label={`Open ${selectedConversation.participant.fullName}'s profile`}
                  className="group/profile flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--brand-500)/40"
                >
                  <div className="relative shrink-0 transition group-hover/profile:scale-[1.03]">
                    <UserAvatar
                      name={selectedConversation.participant.fullName}
                      src={selectedConversation.participant.avatarUrl}
                      initials={selectedConversation.participant.initials}
                      sizeClassName="h-12 w-12 text-[11px]"
                    />
                    {selectedConversation.participant.isOnline && !conversationBlocked && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-(--surface-elevated) bg-[#36a26b]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <h2 className="m-0 truncate text-[14.5px] font-extrabold transition group-hover/profile:text-(--brand-500)">
                        {selectedConversation.participant.fullName}
                      </h2>
                      {!conversationBlocked && (
                        <span className="hidden rounded-full border border-(--border-subtle) bg-(--surface-muted) px-2 py-0.5 font-mono text-[8px] text-(--text-muted) sm:inline">
                          {selectedConversation.participant.handle}
                        </span>
                      )}
                    </div>
                    <p className="m-0 mt-1 truncate text-[10.5px] text-(--text-muted)">
                      {selectedUserBlockedViewer
                        ? `${selectedConversation.participant.fullName.split(' ')[0]} blocked you`
                        : viewerBlockedSelectedUser
                          ? `You blocked ${selectedConversation.participant.fullName.split(' ')[0]}`
                        : typingConversationId === selectedConversation.id
                          ? 'typing…'
                          : selectedConversation.participant.isOnline
                            ? 'online'
                            : selectedConversation.participant.presenceVisible
                              ? lastActivity(
                                  selectedConversation.participant.lastActiveAt,
                                  presenceClock
                                ) ?? selectedConversation.participant.handle
                              : selectedConversation.participant.handle}
                    </p>
                  </div>
                </Link>
                {!conversationBlocked && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        openCall({
                          participant: selectedConversation.participant,
                          type: 'audio',
                        })
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-3 text-[10px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.28)] hover:text-(--brand-500)"
                      aria-label="Audio call"
                    >
                      <Phone size={16} />
                      <span className="hidden lg:inline">Voice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openCall({
                          participant: selectedConversation.participant,
                          type: 'video',
                        })
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) px-3 text-[10px] font-bold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.28)] hover:text-(--brand-500)"
                      aria-label="Video call"
                    >
                      <Video size={17} />
                      <span className="hidden lg:inline">Video</span>
                    </button>
                  </>
                )}
                {!selectedUserBlockedViewer && (
                  <div ref={optionsRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOptionsOpen((current) => !current)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent hover:border-(--border-subtle) hover:bg-(--surface-muted)"
                    aria-label="Conversation options"
                    aria-expanded={optionsOpen}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {optionsOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-12 w-56 rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) p-2 shadow-(--shadow-3)"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowMessageSearch(true);
                          setOptionsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] font-semibold hover:bg-(--surface-muted)"
                      >
                        <Search size={14} /> Search conversation
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void copySelectedHandle()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] font-semibold hover:bg-(--surface-muted)"
                      >
                        <Copy size={14} /> Copy profile handle
                      </button>
                      <div className="my-1 h-px bg-(--border-subtle)" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOptionsOpen(false);
                          if (viewerBlockedSelectedUser) {
                            unblockUser.mutate(selectedConversation.participant.id, {
                              onSuccess: () => toast.success('User unblocked'),
                              onError: (error) =>
                                toast.error(
                                  'Could not unblock user',
                                  error.response?.data?.message ?? 'Please try again.'
                                ),
                            });
                          } else {
                            setBlockConfirmationOpen(true);
                          }
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] font-semibold hover:bg-(--surface-muted)',
                          viewerBlockedSelectedUser
                            ? 'text-(--success)'
                            : 'text-(--danger)'
                        )}
                      >
                        {viewerBlockedSelectedUser ? (
                          <UserCheck size={14} />
                        ) : (
                          <UserX size={14} />
                        )}
                        {viewerBlockedSelectedUser ? 'Unblock user' : 'Block user'}
                      </button>
                    </div>
                  )}
                  </div>
                )}
              </header>

              {showMessageSearch && (
                <div className="flex items-center gap-2 border-b border-(--border-subtle) bg-(--surface-elevated) px-4 py-2">
                  <Search size={14} className="text-(--text-muted)" />
                  <input
                    autoFocus
                    value={messageSearch}
                    onChange={(event) => setMessageSearch(event.target.value)}
                    placeholder="Search this conversation"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
                  />
                  <span className="font-mono text-[8px] text-(--text-muted)">
                    {visibleMessages.length} found
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessageSearch(false);
                      setMessageSearch('');
                    }}
                    aria-label="Close conversation search"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <div
                onScroll={(event) => {
                  const element = event.currentTarget;
                  setShowJumpButton(
                    element.scrollHeight - element.scrollTop - element.clientHeight > 240
                  );
                }}
                className="chat-message-canvas relative min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-7 sm:py-6"
              >
                {messagesQuery.hasNextPage && (
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void messagesQuery.fetchNextPage()}
                      className="rounded-full border border-(--border-subtle) bg-(--surface-elevated) px-4 py-2 text-[8px] font-bold shadow-(--shadow-1)"
                    >
                      {messagesQuery.isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}
                    </button>
                  </div>
                )}
                {messagesQuery.isPending ? (
                  <div className="flex h-full items-center justify-center">
                    <LoaderCircle size={22} className="animate-spin text-(--text-muted)" />
                  </div>
                ) : visibleMessages.length ? (
                  <div className="mx-auto flex w-full max-w-[820px] flex-col gap-3">
                    <div className="mb-3 flex justify-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--surface-elevated)/90 px-3 py-1.5 text-[9px] text-(--text-muted) shadow-(--shadow-1) backdrop-blur">
                        <ShieldOff size={10} />
                        Private conversation
                      </span>
                    </div>
                    {visibleMessages.map((message, index) => {
                      const dateLabel = getChatDateLabel(message.createdAt);
                      const previousDateLabel =
                        index > 0
                          ? getChatDateLabel(visibleMessages[index - 1]!.createdAt)
                          : null;
                      return (
                        <Fragment key={message.id}>
                          {dateLabel !== previousDateLabel && (
                            <div className="sticky top-2 z-2 my-3 flex justify-center">
                              <span className="rounded-full border border-(--border-subtle) bg-(--surface-elevated)/95 px-3 py-1.5 font-mono text-[9px] font-bold text-(--text-muted) shadow-(--shadow-1) backdrop-blur">
                                {dateLabel}
                              </span>
                            </div>
                          )}
                          <SocialMessageBubble
                            message={message}
                            mine={message.senderId === viewerId}
                            onForward={setForwardingMessage}
                          />
                        </Fragment>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <div className="rounded-3xl border border-(--border-subtle) bg-(--surface-elevated)/80 px-8 py-9 shadow-(--shadow-1) backdrop-blur">
                      <UserAvatar
                        name={selectedConversation.participant.fullName}
                        src={selectedConversation.participant.avatarUrl}
                        initials={selectedConversation.participant.initials}
                        sizeClassName="mx-auto h-20 w-20 text-[18px]"
                      />
                      <h2 className="mb-0 mt-5 font-ui text-[20px] font-extrabold tracking-[-0.35px]">
                        {messageSearch
                          ? 'No matching messages'
                          : `Start a conversation with ${selectedConversation.participant.fullName.split(' ')[0]}`}
                      </h2>
                      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-(--text-secondary)">
                        Share messages, voice notes, code, files, and trackers.
                      </p>
                    </div>
                  </div>
                )}
                {showJumpButton && (
                  <button
                    type="button"
                    onClick={() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="sticky bottom-3 left-full flex h-10 w-10 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-elevated) text-(--brand-500) shadow-(--shadow-2)"
                    aria-label="Jump to latest message"
                  >
                    <ArrowDown size={16} />
                  </button>
                )}
              </div>
              {conversationBlocked ? (
                <div
                  role="status"
                  className="border-t border-(--border-subtle) bg-(--surface-elevated) px-5 py-4 text-center"
                >
                  <div className="text-[11px] font-bold text-(--text-primary)">
                    {selectedUserBlockedViewer
                      ? `${selectedConversation.participant.fullName} blocked you`
                      : `You blocked ${selectedConversation.participant.fullName}`}
                  </div>
                  <div className="mt-1 text-[9px] text-(--text-muted)">
                    Messages and calls are unavailable for this conversation.
                  </div>
                  {viewerBlockedSelectedUser && (
                    <button
                      type="button"
                      onClick={() =>
                        unblockUser.mutate(selectedConversation.participant.id, {
                          onSuccess: () => toast.success('User unblocked'),
                          onError: (error) =>
                            toast.error(
                              'Could not unblock user',
                              error.response?.data?.message ?? 'Please try again.'
                            ),
                        })
                      }
                      disabled={unblockUser.isPending}
                      className="mt-3 rounded-full border border-(--border-subtle) px-4 py-2 text-[9px] font-bold text-(--brand-500) disabled:opacity-50"
                    >
                      {unblockUser.isPending ? 'Unblocking…' : 'Unblock'}
                    </button>
                  )}
                </div>
              ) : (
                <SocialComposer
                  conversationId={selectedConversation.id}
                  onTyping={emitTyping}
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] border border-(--border-subtle) bg-[color-mix(in_srgb,var(--brand-500)_9%,var(--surface-elevated))] text-(--brand-500) shadow-(--shadow-2)">
                  {section === 'calls' ? <PhoneCall size={36} /> : <MessageCircle size={36} />}
                </div>
                <h2 className="mb-0 mt-6 font-ui text-[23px] font-extrabold tracking-[-0.5px]">
                  {section === 'calls' ? 'Your call history' : 'Welcome to Social'}
                </h2>
                <p className="mx-auto mb-0 mt-2 max-w-sm text-[13px] leading-6 text-(--text-secondary)">
                  {section === 'calls'
                    ? 'Call outcomes and duration are saved automatically.'
                    : 'Choose a conversation to message, share, or call a friend.'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
      </PageContainer>

      {forwardingMessage && (
        <Modal
          open
          onClose={() => setForwardingMessage(null)}
          ariaLabel="Forward message"
          preventClose={forwardMessage.isPending}
          overlayClassName="z-190 bg-black/55"
          contentClassName="flex max-h-[80vh] max-w-md flex-col rounded-3xl p-0"
        >
            <header className="flex items-center gap-3 border-b border-(--border-subtle) px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-[15px] font-bold">Forward message</h2>
                <p className="mb-0 mt-1 text-[9px] text-(--text-muted)">
                  Choose a conversation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForwardingMessage(null)}
                aria-label="Close forward dialog"
              >
                <X size={16} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {conversations.map((conversation) => {
                const sending =
                  forwardMessage.isPending &&
                  forwardMessage.variables?.targetConversationId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    disabled={forwardMessage.isPending}
                    onClick={() =>
                      forwardMessage.mutate(
                        {
                          messageId: forwardingMessage.id,
                          targetConversationId: conversation.id,
                        },
                        {
                          onSuccess: () => {
                            toast.success(
                              'Message forwarded',
                              `Sent to ${conversation.participant.fullName}.`
                            );
                            setForwardingMessage(null);
                          },
                          onError: (error) =>
                            toast.error(
                              'Could not forward message',
                              error.response?.data?.message ?? 'Please try again.'
                            ),
                        }
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-(--surface-muted)"
                  >
                    <UserAvatar
                      name={conversation.participant.fullName}
                      src={conversation.participant.avatarUrl}
                      initials={conversation.participant.initials}
                      sizeClassName="h-11 w-11 text-[10px]"
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
                      {conversation.participant.fullName}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--brand-500) text-(--brand-contrast)">
                      {sending ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
        </Modal>
      )}

      <ConfirmDialog
        open={blockConfirmationOpen && Boolean(selectedConversation)}
        title={`Block ${selectedConversation?.participant.fullName ?? 'this user'}?`}
        description="Neither of you will be able to message or call the other until you unblock them."
        confirmText="Block"
        variant="danger"
        icon={<UserX size={20} />}
        isLoading={blockUser.isPending}
        onClose={() => setBlockConfirmationOpen(false)}
        onConfirm={() => {
          if (!selectedConversation) return;
          blockUser.mutate(selectedConversation.participant.id, {
            onSuccess: () => {
              toast.success('User blocked');
              setBlockConfirmationOpen(false);
            },
            onError: (error) =>
              toast.error(
                'Could not block user',
                error.response?.data?.message ?? 'Please try again.'
              ),
          });
        }}
      />
    </AppShellBoundary>
  );
}
