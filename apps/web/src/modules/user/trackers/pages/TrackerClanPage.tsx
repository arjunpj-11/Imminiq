import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  File as FileIcon,
  Image,
  MessageSquareReply,
  Mic,
  Paperclip,
  SmilePlus,
  Square,
  Trash2,
  Video,
  X,
} from 'lucide-react';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import UserAvatar from '../../../../components/data-display/UserAvatar';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { socket } from '../../../../lib/socket';
import { safeLocalStorage, safeSessionStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { useAuthStore } from '../../../../store/useAuthStore';
import { ROUTES } from '../../../../routes/config/route-paths';
import {
  useRemoveTrackerClanMember,
  useAcceptTrackerClanChallenge,
  useCancelTrackerClanChallenge,
  useCreateTrackerClanChallenge,
  useDeclineTrackerClanChallenge,
  useFetchTrackerClanChanges,
  useLeaveTrackerClan,
  useRequestTrackerClanJoin,
  useRespondTrackerClanRoleInvitation,
  useReviewTopicContribution,
  useTrackerClan,
  useTrackerClanMessages,
  useTrackerClanChallenges,
  useTrackerTopicContributions,
  useTransferTrackerClanOwnership,
  useUpdateTrackerClanMember,
} from '../hooks/useTrackers';
import type {
  ITrackerClanChallenge,
  ITrackerClanMessage,
  ITrackerClanPerson,
} from '../types/tracker.types';
import ClanChallengeCard from '../components/clan/ClanChallengeCard';
import ClanChallengeDialog from '../components/clan/ClanChallengeDialog';
import { useVoiceMessageRecorder, VoiceMessagePlayer } from '../../social';
import { mergeGuildMessages } from '../utils/merge-guild-messages';

type GuildTab = 'chat' | 'members' | 'requests';
type ClanChallengeEvent = {
  id: string;
  trackerId: string;
  status: ITrackerClanChallenge['status'];
  challengerId: string;
  opponentId: string | null;
};
type MemberAction = {
  type: 'promote' | 'demote' | 'transfer' | 'remove';
  member: ITrackerClanPerson;
};

const buttonClass =
  'rounded-md border border-(--border-subtle) bg-(--surface-card) px-3 py-2 text-[12px] font-bold transition hover:border-(--brand-500) hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15';
const CHAT_RETENTION_MS = 24 * 60 * 60 * 1000;

export default function TrackerClanPage() {
  const { trackerId = '' } = useParams<{ trackerId: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = useAuthStore((state) => state.user?._id);
  const clanQuery = useTrackerClan(trackerId);
  const clan = clanQuery.data;
  const isMember = Boolean(clan && clan.role !== 'outsider');
  const messagesQuery = useTrackerClanMessages(trackerId, isMember);
  const refetchMessages = messagesQuery.refetch;
  const challengesQuery = useTrackerClanChallenges(trackerId, isMember);
  const refetchChallenges = challengesQuery.refetch;
  const contributionsQuery = useTrackerTopicContributions(trackerId, Boolean(clan?.canManage));
  const joinClan = useRequestTrackerClanJoin();
  const leaveClan = useLeaveTrackerClan();
  const updateMember = useUpdateTrackerClanMember();
  const removeMember = useRemoveTrackerClanMember();
  const transferOwnership = useTransferTrackerClanOwnership();
  const respondToRoleInvitation = useRespondTrackerClanRoleInvitation();
  const fetchGuildChanges = useFetchTrackerClanChanges();
  const reviewContribution = useReviewTopicContribution();
  const createChallenge = useCreateTrackerClanChallenge();
  const acceptChallenge = useAcceptTrackerClanChallenge();
  const declineChallenge = useDeclineTrackerClanChallenge();
  const cancelChallenge = useCancelTrackerClanChallenge();
  const [tab, setTab] = useState<GuildTab>('chat');
  const [liveMessages, setLiveMessages] = useState<ITrackerClanMessage[]>([]);
  const guildDraftKey = `${STORAGE_KEYS.guildChatDraftPrefix}:${trackerId}`;
  const [draft, setDraft] = useState(() => safeSessionStorage.get(guildDraftKey) ?? '');
  const [chatError, setChatError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const [memberAction, setMemberAction] = useState<MemberAction | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [acceptedChangesConsumed, setAcceptedChangesConsumed] = useState(false);
  const [roleInvitationAction, setRoleInvitationAction] = useState<'accept' | 'decline' | null>(
    null
  );
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [challengeOpponent, setChallengeOpponent] = useState<ITrackerClanPerson | null | undefined>(
    undefined
  );
  const [chatClock, setChatClock] = useState(() => Date.now());
  const chatCanvasRef = useRef<HTMLDivElement | null>(null);
  const historySentinelRef = useRef<HTMLDivElement | null>(null);
  const prependHeightRef = useRef<number | null>(null);
  const initialScrollDoneRef = useRef(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<ITrackerClanMessage | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [deletingGuildMessage, setDeletingGuildMessage] = useState<ITrackerClanMessage | null>(
    null
  );
  const [guildDeletePending, setGuildDeletePending] = useState(false);
  const [deletedGuildMessageIds, setDeletedGuildMessageIds] = useState<Set<string>>(
    () => new Set()
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousAcceptedChangesRef = useRef(Boolean(clan?.hasAcceptedChanges));

  useEffect(() => {
    if (isMember) {
      safeLocalStorage.set(STORAGE_KEYS.onboardingGuildVisited, 'true');
    }
  }, [isMember]);

  useEffect(() => {
    const hasAcceptedChanges = Boolean(clan?.hasAcceptedChanges);
    if (hasAcceptedChanges && !previousAcceptedChangesRef.current) {
      setAcceptedChangesConsumed(false);
    }
    previousAcceptedChangesRef.current = hasAcceptedChanges;
  }, [clan?.hasAcceptedChanges]);

  const messages = useMemo(() => {
    const history = messagesQuery.data?.pages
      ? [...messagesQuery.data.pages].reverse().flatMap((page) => page.items)
      : [];
    const combined = mergeGuildMessages(history, liveMessages);
    const chatWindowStart = chatClock - CHAT_RETENTION_MS;
    return combined.filter(
      (message) =>
        !deletedGuildMessageIds.has(message.id) &&
        new Date(message.createdAt).getTime() >= chatWindowStart
    );
  }, [chatClock, deletedGuildMessageIds, liveMessages, messagesQuery.data]);

  useEffect(() => {
    if (draft) safeSessionStorage.set(guildDraftKey, draft);
    else safeSessionStorage.remove(guildDraftKey);
  }, [draft, guildDraftKey]);
  const incomingRoleInvitation = clan?.roleInvitations.find(
    (invitation) => invitation.userId === currentUserId && invitation.status === 'pending'
  );
  const pendingInvitationByMember = useMemo(
    () =>
      new Map((clan?.roleInvitations ?? []).map((invitation) => [invitation.userId, invitation])),
    [clan?.roleInvitations]
  );

  useEffect(() => {
    const timer = window.setInterval(() => setChatClock(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!trackerId || !accessToken || !isMember) return;
    socket.auth = { token: accessToken };
    const onConnect = () => {
      setConnected(true);
      setChatError(null);
      socket.emit(
        'tracker-clan:join',
        { trackerId },
        (result: { ok?: boolean; message?: string }) => {
          if (!result?.ok) {
            setConnected(false);
            setChatError(result?.message ?? 'Unable to enter guild chat.');
          }
        }
      );
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (error: Error) => {
      setConnected(false);
      setChatError(
        error.message === 'Unauthorized'
          ? 'Your chat session expired. Refresh the page to reconnect.'
          : 'Could not connect to guild chat. Check that the API is running, then retry.'
      );
    };
    const onMessage = (incoming: ITrackerClanMessage) => {
      const message = {
        ...incoming,
        reactions: (incoming.reactions ?? []).map((reaction) => ({
          ...reaction,
          reactedByViewer:
            reaction.userIds?.includes(currentUserId ?? '') ?? reaction.reactedByViewer,
        })),
      };
      if (message.trackerId !== trackerId) return;
      const canvas = chatCanvasRef.current;
      if (canvas && canvas.scrollHeight - canvas.scrollTop - canvas.clientHeight > 180) {
        setNewMessageCount((count) => count + 1);
      }
      setLiveMessages((current) =>
        current.some((item) => item.id === message.id)
          ? current.map((item) => (item.id === message.id ? message : item))
          : [...current, message].slice(-100)
      );
    };
    const onChallenge = (event: ClanChallengeEvent) => {
      if (event.trackerId !== trackerId) return;
      void refetchChallenges().then((result) => {
        const challenge = result.data?.find((item) => item.id === event.id);
        const isParticipant =
          challenge?.challenger.userId === currentUserId ||
          challenge?.opponent?.userId === currentUserId;
        if (challenge?.status === 'active' && isParticipant) {
          navigate(ROUTES.trackerClanBattle(trackerId, challenge.id));
        }
      });
    };
    const onMessageDeleted = (event: { trackerId?: string; messageId?: string }) => {
      if (event.trackerId !== trackerId || !event.messageId) return;
      setDeletedGuildMessageIds((current) => new Set(current).add(event.messageId!));
      setLiveMessages((current) => current.filter((message) => message.id !== event.messageId));
      void refetchMessages();
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('tracker-clan:message', onMessage);
    socket.on('tracker-clan:message-deleted', onMessageDeleted);
    socket.on('tracker-clan:challenge', onChallenge);
    if (!socket.connected) socket.connect();
    else onConnect();
    return () => {
      socket.emit('tracker-clan:leave', { trackerId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('tracker-clan:message', onMessage);
      socket.off('tracker-clan:message-deleted', onMessageDeleted);
      socket.off('tracker-clan:challenge', onChallenge);
    };
  }, [
    accessToken,
    currentUserId,
    isMember,
    navigate,
    refetchChallenges,
    refetchMessages,
    trackerId,
  ]);

  useEffect(() => {
    if (!memberMenuId) return;
    const closeMenu = () => setMemberMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [memberMenuId]);

  const pendingRequests = useMemo(
    () => (contributionsQuery.data ?? []).filter((item) => item.status === 'pending'),
    [contributionsQuery.data]
  );
  const challenges = useMemo(() => challengesQuery.data ?? [], [challengesQuery.data]);
  const timeline = useMemo(() => {
    const chatWindowStart = chatClock - CHAT_RETENTION_MS;
    const items: Array<
      | { key: string; kind: 'message'; at: number; message: ITrackerClanMessage }
      | { key: string; kind: 'challenge'; at: number; challenge: ITrackerClanChallenge }
      | { key: string; kind: 'result'; at: number; challenge: ITrackerClanChallenge }
    > = messages.map((message) => ({
      key: `message-${message.id}`,
      kind: 'message' as const,
      at: new Date(message.createdAt).getTime(),
      message,
    }));
    for (const challenge of challenges) {
      const challengeCreatedAt = new Date(challenge.createdAt).getTime();
      if (challengeCreatedAt >= chatWindowStart) {
        items.push({
          key: `challenge-${challenge.id}`,
          kind: 'challenge',
          at: challengeCreatedAt,
          challenge,
        });
      }
      const completedAt = challenge.completedAt ? new Date(challenge.completedAt).getTime() : null;
      if (challenge.status === 'completed' && completedAt && completedAt >= chatWindowStart) {
        items.push({
          key: `result-${challenge.id}`,
          kind: 'result',
          at: completedAt,
          challenge,
        });
      }
    }
    return items.sort((first, second) => first.at - second.at);
  }, [challenges, chatClock, messages]);
  const latestTimelineKey = timeline.at(-1)?.key;

  useEffect(() => {
    if (tab !== 'chat' || newMessageCount > 0 || prependHeightRef.current !== null) return;
    const canvas = chatCanvasRef.current;
    if (!canvas) return;
    canvas.scrollTo({
      top: canvas.scrollHeight,
      behavior: initialScrollDoneRef.current ? 'smooth' : 'auto',
    });
    if (timeline.length) initialScrollDoneRef.current = true;
  }, [latestTimelineKey, newMessageCount, tab, timeline.length]);

  const loadEarlierGuildMessages = useCallback(() => {
    const canvas = chatCanvasRef.current;
    if (
      !canvas ||
      !initialScrollDoneRef.current ||
      !messagesQuery.hasNextPage ||
      messagesQuery.isFetchingNextPage
    ) {
      return;
    }
    prependHeightRef.current = canvas.scrollHeight;
    void messagesQuery.fetchNextPage();
  }, [messagesQuery]);

  useEffect(() => {
    const root = chatCanvasRef.current;
    const target = historySentinelRef.current;
    if (!root || !target || tab !== 'chat') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadEarlierGuildMessages();
      },
      { root, rootMargin: '180px 0px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadEarlierGuildMessages, tab]);

  useEffect(() => {
    const canvas = chatCanvasRef.current;
    if (!canvas || prependHeightRef.current === null || messagesQuery.isFetchingNextPage) return;
    canvas.scrollTop += canvas.scrollHeight - prependHeightRef.current;
    prependHeightRef.current = null;
  }, [messagesQuery.data?.pages.length, messagesQuery.isFetchingNextPage]);
  const challengeBusy =
    createChallenge.isPending ||
    acceptChallenge.isPending ||
    declineChallenge.isPending ||
    cancelChallenge.isPending;
  const sendMessage = async (
    input?: string | { file?: File; kind?: 'image' | 'file' | 'voice'; durationSeconds?: number }
  ) => {
    const retryText = typeof input === 'string' ? input : undefined;
    const file = typeof input === 'object' ? input.file : (selectedFile ?? undefined);
    const text = (retryText ?? draft).trim();
    if ((!text && !file) || !connected) return;
    if (file && file.size > 10 * 1024 * 1024) {
      setChatError('Choose a file up to 10 MB.');
      return;
    }
    setChatError(null);
    const clientId = `guild-pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const kind = file
      ? input && typeof input === 'object' && input.kind === 'voice'
        ? 'voice'
        : file.type.startsWith('image/')
          ? 'image'
          : 'file'
      : 'text';
    const optimisticAttachmentUrl = file ? URL.createObjectURL(file) : null;
    const optimistic: ITrackerClanMessage = {
      id: clientId,
      clientId,
      trackerId,
      text,
      kind,
      replyTo: replyingTo
        ? {
            messageId: replyingTo.id,
            senderId: replyingTo.user.userId,
            text: replyingTo.text,
            kind: replyingTo.kind,
          }
        : null,
      reactions: [],
      ...(file
        ? {
            attachment: {
              url: optimisticAttachmentUrl ?? '',
              name: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
              durationSeconds:
                input && typeof input === 'object' ? (input.durationSeconds ?? null) : null,
            },
          }
        : {}),
      createdAt: new Date().toISOString(),
      user: {
        userId: currentUserId ?? '',
        name: 'You',
        username: '',
        avatarUrl: null,
      },
      deliveryState: 'sending',
    };
    setLiveMessages((current) => [...current, optimistic]);
    if (!retryText) {
      setDraft('');
      setSelectedFile(null);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      safeSessionStorage.remove(guildDraftKey);
    }
    const fileData = file ? await file.arrayBuffer() : undefined;
    socket.emit(
      'tracker-clan:message',
      {
        trackerId,
        text,
        kind,
        ...(file
          ? {
              file: {
                name: file.name,
                mimeType: file.type,
                size: file.size,
                data: fileData,
              },
            }
          : {}),
        ...(input && typeof input === 'object' && input.durationSeconds
          ? { durationSeconds: input.durationSeconds }
          : {}),
        ...(replyingTo ? { replyToMessageId: replyingTo.id } : {}),
      },
      (result: { ok?: boolean; message?: string }) => {
        if (optimisticAttachmentUrl) URL.revokeObjectURL(optimisticAttachmentUrl);
        if (result?.ok) {
          setLiveMessages((current) => current.filter((item) => item.clientId !== clientId));
        } else {
          setLiveMessages((current) =>
            current.map((item) =>
              item.clientId === clientId ? { ...item, deliveryState: 'failed' } : item
            )
          );
          setChatError(result?.message ?? 'Unable to send message.');
        }
      }
    );
  };
  const voice = useVoiceMessageRecorder(({ file, durationSeconds }) => {
    void sendMessage({ file, kind: 'voice', durationSeconds });
  });

  const confirmMemberAction = async () => {
    if (!memberAction) return;
    const { member, type } = memberAction;
    setMemberActionError(null);
    setMemberActionNotice(null);
    try {
      if (type === 'promote' || type === 'demote') {
        await updateMember.mutateAsync({
          trackerId,
          memberId: member.userId,
          role: type === 'promote' ? 'co_owner' : 'member',
        });
      } else if (type === 'transfer') {
        await transferOwnership.mutateAsync({ trackerId, newOwnerId: member.userId });
      } else {
        await removeMember.mutateAsync({ trackerId, memberId: member.userId });
      }
      if (type === 'promote' || type === 'transfer') {
        setMemberActionNotice(
          type === 'transfer'
            ? `Ownership invitation sent to ${member.name}. The tracker will transfer only after they accept.`
            : `Co-owner invitation sent to ${member.name}. Their role will change only after they accept.`
        );
      }
      setMemberAction(null);
    } catch (error) {
      setMemberActionError(getUserFacingError(error, 'Unable to update this guild member.'));
    }
  };

  const createGuildChallenge = (input: { durationMinutes: number; questionCount: number }) => {
    createChallenge.mutate(
      {
        trackerId,
        opponentId: challengeOpponent?.userId,
        ...input,
      },
      { onSuccess: () => setChallengeOpponent(undefined) }
    );
  };

  const fetchLatestGuildChanges = () => {
    setSyncNotice(null);
    fetchGuildChanges.mutate(
      { trackerId },
      {
        onSuccess: (response) => {
          const result = response.data;
          setAcceptedChangesConsumed(true);
          setSyncNotice(
            `Fetched ${result.addedTopics} new topic${result.addedTopics === 1 ? '' : 's'} and ${result.addedSubtopics} new subtopic${result.addedSubtopics === 1 ? '' : 's'}. Your personal additions were kept.`
          );
        },
      }
    );
  };

  if (clanQuery.isLoading) {
    return (
      <AppShellBoundary>
        <AppPageSkeleton kind="detail" label="Loading tracker guild" />
      </AppShellBoundary>
    );
  }

  if (!clan) {
    return (
      <AppShellBoundary>
        <div className="mx-auto w-full max-w-280 px-5 py-16 text-center">
          <h1 className="font-serif text-3xl font-extrabold">Guild unavailable</h1>
          <p className="mt-2 text-(--text-secondary)">
            This tracker is private or no longer exists.
          </p>
        </div>
      </AppShellBoundary>
    );
  }

  if (!isMember) {
    return (
      <AppShellBoundary>
        <main className="mx-auto flex w-full max-w-240 flex-1 items-center px-5 py-12">
          <section className="relative w-full overflow-hidden rounded-2xl bg-[#171512] px-6 py-14 text-center text-white shadow-2xl sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(244,201,93,.22),transparent_34%),radial-gradient(circle_at_15%_90%,rgba(184,76,43,.25),transparent_38%)]" />
            <div className="relative">
              <div className="text-5xl">🛡</div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[.2em] text-[#f4c95d]">
                Public tracker guild
              </p>
              <h1 className="mx-auto mt-2 max-w-2xl font-serif text-[clamp(32px,6vw,58px)] font-extrabold leading-none">
                {clan.trackerTitle}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65">
                Join instantly to meet the guild, chat in real time, and send improvements from your
                cloned tracker.
              </p>
              <div className="mt-7 flex justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-white/60">
                <span>{clan.topicsCount} topics</span>
                <span>{clan.members.length} members</span>
              </div>
              <button
                type="button"
                disabled={joinClan.isPending}
                onClick={() => joinClan.mutate({ trackerId })}
                className="mt-8 rounded-lg bg-[#f4c95d] px-8 py-3.5 text-sm font-extrabold text-[#171512] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(244,201,93,.25)] disabled:opacity-60"
              >
                {joinClan.isPending ? 'Joining guild...' : 'Join guild instantly'}
              </button>
            </div>
          </section>
        </main>
      </AppShellBoundary>
    );
  }

  const busy =
    updateMember.isPending ||
    removeMember.isPending ||
    transferOwnership.isPending ||
    respondToRoleInvitation.isPending ||
    fetchGuildChanges.isPending ||
    leaveClan.isPending;

  return (
    <AppShellBoundary>
      <main className="mx-auto flex w-full max-w-280 flex-1 flex-col gap-5 px-4 py-6 pb-28 sm:px-6 md:px-12 md:py-10">
        <section className="relative overflow-hidden rounded-2xl bg-[#171512] px-5 py-7 text-white shadow-xl sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(244,201,93,.20),transparent_30%),radial-gradient(circle_at_8%_100%,rgba(184,76,43,.24),transparent_35%)]" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.trackers)}
                className="mb-5 text-xs font-semibold text-white/55 hover:text-white"
              >
                ← Back to trackers
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[#f4c95d]">
                🛡 Learning guild
              </p>
              <h1 className="mt-2 font-serif text-[clamp(28px,5vw,46px)] font-extrabold leading-none">
                {clan.trackerTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                {clan.trackerDescription ||
                  'Build the roadmap together, share progress, and merge the best community improvements.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center">
                <strong className="block font-serif text-2xl text-[#f4c95d]">
                  {clan.topicsCount}
                </strong>
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
                  Topics
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center">
                <strong className="block font-serif text-2xl text-[#f4c95d]">
                  {clan.members.length}
                </strong>
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/50">
                  Members
                </span>
              </div>
              {clan.canManage && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.trackerManage(trackerId))}
                  className="rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-xs font-extrabold transition hover:bg-white/15"
                >
                  Edit tracker
                </button>
              )}
              {clan.role === 'member' &&
                clan.personalCloneTrackerId &&
                clan.hasAcceptedChanges &&
                !acceptedChangesConsumed && (
                  <button
                    type="button"
                    disabled={fetchGuildChanges.isPending}
                    onClick={fetchLatestGuildChanges}
                    className="rounded-lg border border-[#f4c95d]/35 bg-[#f4c95d]/12 px-4 py-3 text-xs font-extrabold text-[#f4c95d] transition hover:bg-[#f4c95d]/20 disabled:opacity-50"
                  >
                    {fetchGuildChanges.isPending
                      ? 'Updating your clone…'
                      : '↻ Apply accepted changes'}
                  </button>
                )}
              <button
                type="button"
                onClick={() => {
                  leaveClan.reset();
                  setLeaveDialogOpen(true);
                }}
                className="rounded-lg border border-red-300/25 bg-red-500/8 px-4 py-3 text-xs font-extrabold text-red-200 transition hover:bg-red-500/18"
              >
                Leave guild
              </button>
            </div>
          </div>
        </section>

        {(memberActionNotice || syncNotice || fetchGuildChanges.error) && (
          <div
            className={cn(
              'rounded-xl border px-4 py-3 text-[12px] font-semibold',
              fetchGuildChanges.error
                ? 'border-red-500/25 bg-red-500/8 text-red-600 dark:text-red-300'
                : 'border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300'
            )}
          >
            {fetchGuildChanges.error
              ? getUserFacingError(fetchGuildChanges.error, 'Unable to fetch guild changes.')
              : (memberActionNotice ?? syncNotice)}
          </div>
        )}

        {incomingRoleInvitation && (
          <section className="rounded-2xl border border-[#d6ad47]/40 bg-[linear-gradient(135deg,rgba(244,201,93,.16),rgba(184,76,43,.07))] p-5 shadow-(--shadow-1) dark:border-[#d6ad47]/25 sm:p-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#8a6509] dark:text-[#f4c95d]">
              Role invitation
            </p>
            <h2 className="mt-2 font-serif text-2xl font-extrabold">
              Become guild {incomingRoleInvitation.role === 'owner' ? 'owner' : 'co-owner'}?
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-(--text-secondary)">
              Before accepting, fetch the latest guild changes and send any private topics from your
              clone as merge requests. Your personal clone is retained after acceptance, so none of
              your work is deleted.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {clan.personalCloneTrackerId && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.trackerManage(clan.personalCloneTrackerId!))}
                  className={buttonClass}
                >
                  Review my clone
                </button>
              )}
              {clan.personalCloneTrackerId && (
                <button
                  type="button"
                  disabled={fetchGuildChanges.isPending}
                  onClick={fetchLatestGuildChanges}
                  className={buttonClass}
                >
                  ↻ Fetch guild changes
                </button>
              )}
              <button
                type="button"
                disabled={respondToRoleInvitation.isPending}
                onClick={() => setRoleInvitationAction('accept')}
                className="rounded-md bg-[#171512] px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]"
              >
                Accept invitation
              </button>
              <button
                type="button"
                disabled={respondToRoleInvitation.isPending}
                onClick={() => setRoleInvitationAction('decline')}
                className={buttonClass}
              >
                Decline
              </button>
            </div>
          </section>
        )}

        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-(--border-subtle) bg-(--surface-card) p-2 dark:border-white/15">
          {(
            [
              ['chat', `Guild chat${connected ? ' · live' : ''}`],
              ['members', `Members · ${clan.members.length}`],
              ...(clan.canManage
                ? [['requests', `Merge requests · ${pendingRequests.length}`]]
                : []),
            ] as Array<[GuildTab, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2.5 text-[12px] font-extrabold transition',
                tab === value
                  ? 'bg-[#171512] text-white dark:bg-[#f2f0eb] dark:text-[#171512]'
                  : 'text-(--text-secondary) hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'chat' && (
          <section className="flex h-150 flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-white/15 sm:h-170">
            <div className="border-b border-(--border-subtle) px-5 py-4 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-bold">Global guild chat</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] text-(--text-secondary)">
                      {connected
                        ? 'Live connection active'
                        : chatError
                          ? 'Guild chat is offline'
                          : 'Connecting to guild...'}
                    </p>
                    {!connected && chatError && (
                      <button
                        type="button"
                        className="text-[11px] font-bold text-(--brand-500) hover:underline"
                        onClick={() => {
                          setChatError(null);
                          socket.connect();
                        }}
                      >
                        Retry connection
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChallengeOpponent(null)}
                  className="rounded-lg border border-[#d6ad47]/45 bg-[#f4c95d]/12 px-4 py-2.5 text-[11px] font-extrabold text-[#8a6509] transition hover:-translate-y-px dark:text-[#f4c95d]"
                >
                  ⚔ Start open challenge
                </button>
              </div>
            </div>
            <div
              ref={chatCanvasRef}
              onScroll={(event) => {
                const element = event.currentTarget;
                if (element.scrollHeight - element.scrollTop - element.clientHeight < 80) {
                  setNewMessageCount(0);
                }
              }}
              className="relative min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-(--surface-canvas) p-5"
            >
              <div ref={historySentinelRef} className="h-px" aria-hidden="true" />
              {messagesQuery.hasNextPage && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={loadEarlierGuildMessages}
                    disabled={messagesQuery.isFetchingNextPage}
                    className={buttonClass}
                  >
                    {messagesQuery.isFetchingNextPage ? 'Loading…' : 'Load earlier messages'}
                  </button>
                </div>
              )}
              {timeline.length === 0 && (
                <div className="py-20 text-center text-sm text-(--text-secondary)">
                  No messages yet. Start the guild conversation.
                </div>
              )}
              {timeline.map((item) => {
                if (item.kind === 'challenge' || item.kind === 'result') {
                  const challenge = item.challenge;
                  return (
                    <ClanChallengeCard
                      key={item.key}
                      eventType={item.kind === 'result' ? 'result' : 'invite'}
                      challenge={challenge}
                      currentUserId={currentUserId}
                      busy={challengeBusy}
                      onProfile={(username) => navigate(ROUTES.publicProfileFor(username))}
                      onAccept={() =>
                        acceptChallenge.mutate(
                          { trackerId, challengeId: challenge.id },
                          {
                            onSuccess: (response) =>
                              navigate(ROUTES.trackerClanBattle(trackerId, response.data.id)),
                          }
                        )
                      }
                      onDecline={() =>
                        declineChallenge.mutate({ trackerId, challengeId: challenge.id })
                      }
                      onCancel={() =>
                        cancelChallenge.mutate({ trackerId, challengeId: challenge.id })
                      }
                      onEnter={() => navigate(ROUTES.trackerClanBattle(trackerId, challenge.id))}
                    />
                  );
                }
                const message = item.message;
                const mine = message.user.userId === currentUserId;
                const viewerReaction = message.reactions?.find(
                  (reaction) => reaction.reactedByViewer
                );
                const reactionCount = (message.reactions ?? []).reduce(
                  (total, reaction) => total + reaction.count,
                  0
                );
                return (
                  <div
                    key={message.id}
                    id={`guild-message-${message.id}`}
                    className={cn('flex items-start gap-3', mine && 'flex-row-reverse')}
                  >
                    <UserAvatar
                      name={message.user.name}
                      src={message.user.avatarUrl}
                      profileUsername={message.user.username}
                      sizeClassName="h-9 w-9 text-[10px]"
                    />
                    <div className={cn('max-w-[78%]', mine && 'text-right')}>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.publicProfileFor(message.user.username))}
                        className="mb-1 text-[10px] font-bold text-(--text-secondary) hover:text-(--brand-500)"
                      >
                        {message.user.name}
                      </button>
                      <div
                        className={cn(
                          'relative rounded-xl px-4 py-3 text-left text-sm leading-relaxed',
                          reactionCount > 0 && 'mb-3',
                          mine
                            ? 'rounded-tr-sm bg-(--brand-500) text-white dark:text-[#171512]'
                            : 'rounded-tl-sm border border-(--border-subtle) bg-(--surface-card) dark:border-white/10'
                        )}
                      >
                        {message.replyTo && (
                          <button
                            type="button"
                            onClick={() => {
                              const canvas = chatCanvasRef.current;
                              const target = document.getElementById(
                                `guild-message-${message.replyTo?.messageId}`
                              );
                              if (canvas && target) {
                                canvas.scrollTo({
                                  top:
                                    target.offsetTop -
                                    canvas.clientHeight / 2 +
                                    target.clientHeight / 2,
                                  behavior: 'smooth',
                                });
                              }
                            }}
                            className={cn(
                              'mb-2 block w-full rounded-lg border-l-3 px-3 py-2 text-left',
                              mine
                                ? 'border-white/60 bg-black/10'
                                : 'border-(--brand-500) bg-(--surface-muted)'
                            )}
                          >
                            <span className="block text-[8px] font-bold uppercase tracking-wide opacity-70">
                              Reply
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] opacity-80">
                              {message.replyTo.text || `${message.replyTo.kind} message`}
                            </span>
                          </button>
                        )}
                        {message.attachment?.mimeType.startsWith('image/') && (
                          <img
                            src={message.attachment.url}
                            alt={message.text || message.attachment.name}
                            className="mb-2 max-h-80 w-full rounded-lg object-cover"
                            loading="lazy"
                          />
                        )}
                        {message.attachment?.mimeType.startsWith('video/') && (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            src={message.attachment.url}
                            className="mb-2 max-h-80 w-full rounded-lg bg-black"
                          />
                        )}
                        {message.kind === 'voice' && message.attachment && (
                          <VoiceMessagePlayer attachment={message.attachment} mine={mine} />
                        )}
                        {message.attachment &&
                          message.kind === 'file' &&
                          !message.attachment.mimeType.startsWith('video/') && (
                            <a
                              href={message.attachment.url}
                              download={message.attachment.name}
                              target="_blank"
                              rel="noreferrer"
                              className="mb-2 flex min-w-[220px] items-center gap-2 rounded-lg border border-current/20 p-3 underline-offset-2 hover:underline"
                            >
                              <FileIcon size={18} />
                              <span className="min-w-0 truncate">{message.attachment.name}</span>
                            </a>
                          )}
                        {message.text && (
                          <p className="m-0 whitespace-pre-wrap break-words">{message.text}</p>
                        )}
                        {reactionPickerMessageId === message.id && (
                          <div
                            className={cn(
                              'absolute top-[calc(100%+0.5rem)] z-20 flex w-[228px] flex-wrap gap-1 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-1.5 text-(--text-primary) shadow-(--shadow-3)',
                              mine ? 'right-2' : 'left-2'
                            )}
                          >
                            {['👍', '❤️', '😂', '🎉', '🤔', '👏'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setReactionPickerMessageId(null);
                                  socket.emit(
                                    'tracker-clan:reaction',
                                    { trackerId, messageId: message.id, emoji },
                                    (result: { ok?: boolean; message?: string }) => {
                                      if (!result?.ok) {
                                        setChatError(
                                          result?.message ?? 'Unable to update reaction.'
                                        );
                                      }
                                    }
                                  );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-base hover:bg-(--surface-muted)"
                                aria-label={`React with ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                        {reactionCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (viewerReaction) {
                                socket.emit(
                                  'tracker-clan:reaction',
                                  {
                                    trackerId,
                                    messageId: message.id,
                                    emoji: viewerReaction.emoji,
                                  },
                                  (result: { ok?: boolean; message?: string }) => {
                                    if (!result?.ok) {
                                      setChatError(result?.message ?? 'Unable to update reaction.');
                                    }
                                  }
                                );
                              } else {
                                setReactionPickerMessageId(message.id);
                              }
                            }}
                            className={cn(
                              'absolute -bottom-3 inline-flex min-h-7 items-center gap-1 rounded-full border border-(--border-subtle) bg-(--surface-elevated) px-2 text-[11px] text-(--text-primary) shadow-(--shadow-1)',
                              mine ? 'right-3' : 'left-3',
                              viewerReaction && 'border-(--brand-500)'
                            )}
                            aria-label={
                              viewerReaction
                                ? `Remove ${viewerReaction.emoji} reaction`
                                : 'React to message'
                            }
                          >
                            <span>
                              {message.reactions
                                .slice(0, 2)
                                .map((reaction) => reaction.emoji)
                                .join('')}
                            </span>
                            {reactionCount > 1 && (
                              <span className="font-mono text-[9px]">{reactionCount}</span>
                            )}
                          </button>
                        )}
                        <div
                          className={cn(
                            'mt-2 flex items-center gap-1 font-mono text-[8px]',
                            mine
                              ? 'justify-end text-white/70 dark:text-black/55'
                              : 'justify-end text-(--text-secondary)/70'
                          )}
                        >
                          {!message.deliveryState && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(message);
                                  setReactionPickerMessageId(null);
                                }}
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full transition',
                                  mine
                                    ? 'bg-black/10 hover:bg-black/20'
                                    : 'bg-(--surface-muted) hover:text-(--brand-500)'
                                )}
                                aria-label="Reply to message"
                              >
                                <MessageSquareReply size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setReactionPickerMessageId((current) =>
                                    current === message.id ? null : message.id
                                  )
                                }
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full transition',
                                  mine
                                    ? 'bg-black/10 hover:bg-black/20'
                                    : 'bg-(--surface-muted) hover:text-(--brand-500)'
                                )}
                                aria-label="React to message"
                                aria-expanded={reactionPickerMessageId === message.id}
                              >
                                <SmilePlus size={14} />
                              </button>
                              {mine && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReactionPickerMessageId(null);
                                    setDeletingGuildMessage(message);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20 hover:text-red-200"
                                  aria-label="Delete message"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                          <time>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </div>
                      </div>
                      {message.deliveryState && (
                        <div className="mt-1 text-[9px] font-bold text-(--text-secondary)">
                          {message.deliveryState === 'sending' ? (
                            'Sending…'
                          ) : (
                            <button
                              type="button"
                              className="text-red-500 hover:underline"
                              onClick={() => {
                                setLiveMessages((current) =>
                                  current.filter((item) => item.id !== message.id)
                                );
                                sendMessage(message.text);
                              }}
                            >
                              Failed · Retry
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {newMessageCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNewMessageCount(0);
                    const canvas = chatCanvasRef.current;
                    canvas?.scrollTo({ top: canvas.scrollHeight, behavior: 'smooth' });
                  }}
                  className="sticky bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-(--brand-500) px-4 py-2 text-[10px] font-bold text-white shadow-lg"
                >
                  {newMessageCount} new message{newMessageCount === 1 ? '' : 's'}
                </button>
              )}
            </div>
            <div className="border-t border-(--border-subtle) p-4 dark:border-white/10">
              {chatError && (
                <p className="mb-2 text-[11px] font-semibold text-red-500">{chatError}</p>
              )}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--surface-muted) px-3 py-2 text-[11px]">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image size={16} />
                  ) : selectedFile.type.startsWith('video/') ? (
                    <Video size={16} />
                  ) : (
                    <FileIcon size={16} />
                  )}
                  <span className="min-w-0 flex-1 truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--surface-card)"
                    aria-label="Remove attachment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
              {voice.error && (
                <p className="mb-2 text-[11px] font-semibold text-red-500">{voice.error}</p>
              )}
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border-l-3 border-(--brand-500) bg-(--surface-muted) px-3 py-2 text-left">
                  <MessageSquareReply size={15} className="shrink-0 text-(--brand-500)" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-bold text-(--brand-500)">
                      Replying to {replyingTo.user.name}
                    </span>
                    <span className="block truncate text-[10px] text-(--text-secondary)">
                      {replyingTo.text || `${replyingTo.kind} message`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-(--surface-card)"
                    aria-label="Cancel reply"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf,.txt,.md,.csv,.zip,.mp3,.m4a,.wav,.ogg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > 10 * 1024 * 1024) {
                      setChatError('Choose a file up to 10 MB.');
                      event.target.value = '';
                      return;
                    }
                    setChatError(null);
                    setSelectedFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!connected || voice.isRecording}
                  className={
                    buttonClass + ' flex h-11 w-11 shrink-0 items-center justify-center p-0'
                  }
                  aria-label="Attach photo, video, or file"
                >
                  <Paperclip size={18} />
                </button>
                {voice.isSupported && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (voice.isRecording) voice.stop();
                        else void voice.start();
                      }}
                      disabled={!connected || Boolean(selectedFile)}
                      className={cn(
                        buttonClass,
                        'flex h-11 shrink-0 items-center justify-center gap-2 p-0',
                        voice.isRecording ? 'w-auto px-3 text-red-500' : 'w-11'
                      )}
                      aria-label={voice.isRecording ? 'Send voice message' : 'Record voice message'}
                    >
                      {voice.isRecording ? (
                        <Square size={15} fill="currentColor" />
                      ) : (
                        <Mic size={18} />
                      )}
                      {voice.isRecording && (
                        <span className="font-mono text-[10px]">
                          {Math.floor(voice.durationSeconds / 60)}:
                          {String(voice.durationSeconds % 60).padStart(2, '0')}
                        </span>
                      )}
                    </button>
                    {voice.isRecording && (
                      <button
                        type="button"
                        onClick={voice.cancel}
                        className={
                          buttonClass +
                          ' flex h-11 w-11 shrink-0 items-center justify-center p-0 text-red-500'
                        }
                        aria-label="Cancel voice recording"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={1000}
                  placeholder="Message your guild..."
                  className="min-w-0 flex-1 rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-4 py-3 text-sm outline-none focus:border-(--brand-500) dark:border-white/15"
                />
                <button
                  type="submit"
                  disabled={(!draft.trim() && !selectedFile) || !connected || voice.isRecording}
                  className="rounded-lg bg-[#171512] px-5 text-sm font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]"
                >
                  Send
                </button>
              </form>
            </div>
          </section>
        )}

        {tab === 'members' && (
          <section className="grid gap-3 sm:grid-cols-2">
            {clan.members.map((member) => (
              <article
                key={member.userId}
                className="flex items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15"
              >
                <div className="flex min-w-0 items-center gap-3 text-left">
                  <UserAvatar
                    name={member.name}
                    src={member.avatarUrl}
                    profileUsername={member.username}
                    sizeClassName="h-11 w-11 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.publicProfileFor(member.username))}
                    className="min-w-0 text-left"
                  >
                    <strong className="block truncate text-sm">{member.name}</strong>
                    <span className="text-[11px] text-(--text-secondary)">
                      @{member.username} · {member.role.replace('_', ' ')}
                    </span>
                    {pendingInvitationByMember.get(member.userId) && (
                      <span className="mt-1 block font-mono text-[8px] uppercase tracking-wider text-[#8a6509] dark:text-[#f4c95d]">
                        {pendingInvitationByMember.get(member.userId)?.role === 'owner'
                          ? 'Ownership'
                          : 'Co-owner'}{' '}
                        invite pending
                      </span>
                    )}
                  </button>
                </div>
                {member.userId !== currentUserId && (
                  <div className="relative">
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={`Actions for ${member.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMemberMenuId((current) =>
                          current === member.userId ? null : member.userId
                        );
                      }}
                      className="grid h-9 w-9 place-items-center rounded-md text-(--text-secondary) transition hover:bg-black/5 hover:text-(--text-primary) disabled:opacity-50 dark:hover:bg-white/8"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                    {memberMenuId === member.userId && (
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-lg border border-(--border-subtle) bg-(--surface-card) py-1 shadow-xl dark:border-white/15"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMemberMenuId(null);
                            setChallengeOpponent(member);
                          }}
                          className="block w-full px-4 py-3 text-left text-[12px] font-semibold text-[#9a7210] hover:bg-[#f4c95d]/10 dark:text-[#f4c95d]"
                        >
                          ⚔ Challenge to 1v1
                        </button>
                        {member.role !== 'owner' && clan.role === 'owner' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMemberMenuId(null);
                                setMemberAction({
                                  type: member.role === 'co_owner' ? 'demote' : 'promote',
                                  member,
                                });
                              }}
                              className="block w-full px-4 py-3 text-left text-[12px] font-semibold hover:bg-black/5 dark:hover:bg-white/8"
                            >
                              {member.role === 'co_owner'
                                ? 'Demote to member'
                                : 'Promote to co-owner'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMemberMenuId(null);
                                setMemberAction({ type: 'transfer', member });
                              }}
                              className="block w-full px-4 py-3 text-left text-[12px] font-semibold hover:bg-black/5 dark:hover:bg-white/8"
                            >
                              Transfer ownership
                            </button>
                          </>
                        )}
                        {member.role !== 'owner' &&
                          (clan.role === 'owner' ||
                            (clan.role === 'co_owner' && member.role === 'member')) && (
                            <button
                              type="button"
                              onClick={() => {
                                setMemberMenuId(null);
                                setMemberAction({ type: 'remove', member });
                              }}
                              className="block w-full px-4 py-3 text-left text-[12px] font-semibold text-red-500 hover:bg-red-500/8"
                            >
                              Remove from guild
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {tab === 'requests' && clan.canManage && (
          <section className="grid gap-3">
            {pendingRequests.length === 0 && (
              <div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-5 py-16 text-center text-(--text-secondary) dark:border-white/15">
                No open merge requests.
              </div>
            )}
            {pendingRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-5 dark:border-white/15"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-(--brand-500)">
                      Merge request from cloned tracker
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold">{request.title}</h3>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.publicProfileFor(request.requester.username))}
                      className="mt-1 text-xs text-(--text-secondary) hover:text-(--brand-500)"
                    >
                      by {request.requester.name}
                    </button>
                  </div>
                  <span className="rounded-full bg-[#f4c95d]/15 px-3 py-1 font-mono text-[8px] uppercase text-[#8a6509] dark:text-[#f4c95d]">
                    {request.subtopicsCount} subtopics
                  </span>
                </div>
                {request.description && (
                  <p className="mt-3 text-sm text-(--text-secondary)">{request.description}</p>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {request.subtopics.map((subtopic, index) => (
                    <div
                      key={`${subtopic.title}-${index}`}
                      className="rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-3 py-2 text-[12px] dark:border-white/10"
                    >
                      <strong>
                        {subtopic.depth > 1 ? '↳ ' : ''}
                        {subtopic.title}
                      </strong>
                      {subtopic.description && (
                        <p className="mt-1 text-(--text-secondary)">{subtopic.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    disabled={reviewContribution.isPending}
                    onClick={() =>
                      reviewContribution.mutate({
                        trackerId,
                        contributionId: request.id,
                        action: 'approve',
                        reviewNote: 'Merged by guild manager.',
                      })
                    }
                    className="rounded-lg bg-[#171512] px-4 py-2.5 text-xs font-extrabold text-white dark:bg-[#f2f0eb] dark:text-[#171512]"
                  >
                    Approve & merge
                  </button>
                  <button
                    type="button"
                    disabled={reviewContribution.isPending}
                    onClick={() =>
                      reviewContribution.mutate({
                        trackerId,
                        contributionId: request.id,
                        action: 'reject',
                        reviewNote: 'Declined by guild manager.',
                      })
                    }
                    className={buttonClass}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <ConfirmDialog
        open={Boolean(roleInvitationAction && incomingRoleInvitation)}
        title={
          roleInvitationAction === 'accept'
            ? `Accept ${incomingRoleInvitation?.role === 'owner' ? 'ownership' : 'co-owner'} invitation?`
            : 'Decline role invitation?'
        }
        description={
          <>
            {roleInvitationAction === 'accept'
              ? 'Your authority changes only after this confirmation. Your personal clone and its private topics stay stored; make any merge requests you want before continuing.'
              : 'Your current member role and personal clone will remain unchanged.'}
            {respondToRoleInvitation.error && (
              <span className="mt-2 block font-semibold text-red-500">
                {getUserFacingError(
                  respondToRoleInvitation.error,
                  'Unable to respond to this invitation.'
                )}
              </span>
            )}
          </>
        }
        confirmText={roleInvitationAction === 'accept' ? 'Accept invitation' : 'Decline invitation'}
        variant={roleInvitationAction === 'decline' ? 'danger' : 'default'}
        isLoading={respondToRoleInvitation.isPending}
        onClose={() => {
          if (!respondToRoleInvitation.isPending) {
            respondToRoleInvitation.reset();
            setRoleInvitationAction(null);
          }
        }}
        onConfirm={() => {
          if (!incomingRoleInvitation || !roleInvitationAction) return;
          respondToRoleInvitation.mutate(
            { trackerId, invitationId: incomingRoleInvitation.id, action: roleInvitationAction },
            { onSuccess: () => setRoleInvitationAction(null) }
          );
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingGuildMessage)}
        title="Delete this message?"
        description="This message will be removed from the guild chat for everyone."
        confirmText="Delete message"
        variant="danger"
        isLoading={guildDeletePending}
        onClose={() => {
          if (!guildDeletePending) setDeletingGuildMessage(null);
        }}
        onConfirm={() => {
          if (!deletingGuildMessage || guildDeletePending) return;
          setGuildDeletePending(true);
          socket.emit(
            'tracker-clan:delete-message',
            { trackerId, messageId: deletingGuildMessage.id },
            (result: { ok?: boolean; message?: string }) => {
              setGuildDeletePending(false);
              if (result?.ok) {
                setDeletingGuildMessage(null);
              } else {
                setChatError(result?.message ?? 'Unable to delete message.');
              }
            }
          );
        }}
      />
      <ConfirmDialog
        open={leaveDialogOpen}
        title={clan.role === 'owner' ? 'Transfer ownership before leaving' : 'Leave this guild?'}
        description={
          clan.role === 'owner' ? (
            'The guild must always have an owner. Transfer ownership to another member first, then you can leave as a co-owner.'
          ) : (
            <>
              {
                'You will lose access to guild chat, challenges, and merge requests. Your cloned tracker and learning progress will remain available.'
              }
              {leaveClan.error && (
                <span className="mt-2 block font-semibold text-red-500">
                  {getUserFacingError(leaveClan.error, 'Unable to leave this guild.')}
                </span>
              )}
            </>
          )
        }
        confirmText={clan.role === 'owner' ? 'Choose a new owner' : 'Leave guild'}
        variant={clan.role === 'owner' ? 'default' : 'danger'}
        isLoading={leaveClan.isPending}
        onClose={() => {
          if (!leaveClan.isPending) {
            leaveClan.reset();
            setLeaveDialogOpen(false);
          }
        }}
        onConfirm={() => {
          if (clan.role === 'owner') {
            setLeaveDialogOpen(false);
            setTab('members');
            return;
          }
          leaveClan.mutate(
            { trackerId },
            {
              onSuccess: () => {
                socket.emit('tracker-clan:leave', { trackerId });
                setLeaveDialogOpen(false);
                navigate(ROUTES.trackers);
              },
            }
          );
        }}
      />
      <ConfirmDialog
        open={Boolean(memberAction)}
        title={
          memberAction
            ? `${memberAction.type === 'promote' ? 'Invite' : memberAction.type === 'demote' ? 'Demote' : memberAction.type === 'transfer' ? 'Invite as owner:' : 'Remove'} ${memberAction.member.name}?`
            : 'Confirm member change'
        }
        description={
          memberAction ? (
            <>
              {memberAction.type === 'transfer'
                ? 'This sends an ownership invitation. Nothing changes until the member reviews their clone and accepts it; after acceptance, you become a co-owner.'
                : memberAction.type === 'promote'
                  ? 'This sends a co-owner invitation. Their current clone and private topics remain available while they decide and prepare merge requests.'
                  : memberAction.type === 'demote'
                    ? 'This co-owner will lose guild management permissions. Their retained personal clone becomes visible again.'
                    : 'This member will lose access to guild chat and guild features.'}
              {memberActionError && (
                <span className="mt-2 block font-semibold text-red-500">{memberActionError}</span>
              )}
            </>
          ) : undefined
        }
        confirmText={
          memberAction?.type === 'transfer'
            ? 'Send ownership invite'
            : memberAction?.type === 'remove'
              ? 'Remove member'
              : memberAction?.type === 'promote'
                ? 'Send co-owner invite'
                : 'Demote member'
        }
        variant={
          memberAction?.type === 'remove' || memberAction?.type === 'transfer'
            ? 'danger'
            : 'default'
        }
        isLoading={busy}
        onClose={() => {
          if (!busy) {
            setMemberAction(null);
            setMemberActionError(null);
          }
        }}
        onConfirm={() => void confirmMemberAction()}
      />
      <ClanChallengeDialog
        open={challengeOpponent !== undefined}
        opponent={challengeOpponent ?? null}
        isLoading={createChallenge.isPending}
        error={
          createChallenge.error
            ? getUserFacingError(createChallenge.error, 'Unable to create this challenge.')
            : null
        }
        onClose={() => {
          if (!createChallenge.isPending) {
            createChallenge.reset();
            setChallengeOpponent(undefined);
          }
        }}
        onCreate={createGuildChallenge}
      />
    </AppShellBoundary>
  );
}
