import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import UserAvatar from '../../../../components/data-display/UserAvatar';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { socket } from '../../../../lib/socket';
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
import type { ITrackerClanChallenge, ITrackerClanMessage, ITrackerClanPerson } from '../types/tracker.types';
import ClanChallengeCard from '../components/clan/ClanChallengeCard';
import ClanChallengeDialog from '../components/clan/ClanChallengeDialog';

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
  const [draft, setDraft] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const [memberAction, setMemberAction] = useState<MemberAction | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [memberActionNotice, setMemberActionNotice] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [roleInvitationAction, setRoleInvitationAction] = useState<'accept' | 'decline' | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [challengeOpponent, setChallengeOpponent] = useState<ITrackerClanPerson | null | undefined>(undefined);
  const [chatClock, setChatClock] = useState(() => Date.now());
  const endRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(() => {
    const combined = [...(messagesQuery.data ?? []), ...liveMessages];
    const chatWindowStart = chatClock - CHAT_RETENTION_MS;
    return combined.filter((message, index) =>
      new Date(message.createdAt).getTime() >= chatWindowStart &&
      combined.findIndex((candidate) => candidate.id === message.id) === index
    );
  }, [chatClock, liveMessages, messagesQuery.data]);
  const incomingRoleInvitation = clan?.roleInvitations.find(
    (invitation) => invitation.userId === currentUserId && invitation.status === 'pending'
  );
  const pendingInvitationByMember = useMemo(
    () => new Map((clan?.roleInvitations ?? []).map((invitation) => [invitation.userId, invitation])),
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
      socket.emit('tracker-clan:join', { trackerId }, (result: { ok?: boolean; message?: string }) => {
        if (!result?.ok) {
          setConnected(false);
          setChatError(result?.message ?? 'Unable to enter guild chat.');
        }
      });
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
    const onMessage = (message: ITrackerClanMessage) => {
      if (message.trackerId !== trackerId) return;
      setLiveMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message].slice(-100)
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
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('tracker-clan:message', onMessage);
    socket.on('tracker-clan:challenge', onChallenge);
    if (!socket.connected) socket.connect();
    else onConnect();
    return () => {
      socket.emit('tracker-clan:leave', { trackerId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('tracker-clan:message', onMessage);
      socket.off('tracker-clan:challenge', onChallenge);
      socket.disconnect();
    };
  }, [accessToken, currentUserId, isMember, navigate, refetchChallenges, trackerId]);

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
      const completedAt = challenge.completedAt
        ? new Date(challenge.completedAt).getTime()
        : null;
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
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [latestTimelineKey, tab]);
  const challengeBusy =
    createChallenge.isPending ||
    acceptChallenge.isPending ||
    declineChallenge.isPending ||
    cancelChallenge.isPending;
  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !connected) return;
    setChatError(null);
    socket.emit(
      'tracker-clan:message',
      { trackerId, text },
      (result: { ok?: boolean; message?: string }) => {
        if (result?.ok) setDraft('');
        else setChatError(result?.message ?? 'Unable to send message.');
      }
    );
  };

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
      setMemberActionError(getUserFacingError(error, 'Unable to update this clan member.'));
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
        <div className="mx-auto w-full max-w-280 animate-pulse px-5 py-10">
          <div className="h-56 rounded-2xl bg-(--surface-card)" />
        </div>
      </AppShellBoundary>
    );
  }

  if (!clan) {
    return (
      <AppShellBoundary>
        <div className="mx-auto w-full max-w-280 px-5 py-16 text-center">
          <h1 className="font-serif text-3xl font-extrabold">Guild unavailable</h1>
          <p className="mt-2 text-(--text-secondary)">This tracker is private or no longer exists.</p>
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
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[.2em] text-[#f4c95d]">Public tracker guild</p>
              <h1 className="mx-auto mt-2 max-w-2xl font-serif text-[clamp(32px,6vw,58px)] font-extrabold leading-none">{clan.trackerTitle}</h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65">Join instantly to meet the guild, chat in real time, and send improvements from your cloned tracker.</p>
              <div className="mt-7 flex justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-white/60">
                <span>{clan.topicsCount} topics</span><span>{clan.members.length} members</span>
              </div>
              <button type="button" disabled={joinClan.isPending} onClick={() => joinClan.mutate({ trackerId })} className="mt-8 rounded-lg bg-[#f4c95d] px-8 py-3.5 text-sm font-extrabold text-[#171512] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(244,201,93,.25)] disabled:opacity-60">
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
              <button type="button" onClick={() => navigate(ROUTES.trackers)} className="mb-5 text-xs font-semibold text-white/55 hover:text-white">← Back to trackers</button>
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-[#f4c95d]">🛡 Learning guild</p>
              <h1 className="mt-2 font-serif text-[clamp(28px,5vw,46px)] font-extrabold leading-none">{clan.trackerTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{clan.trackerDescription || 'Build the roadmap together, share progress, and merge the best community improvements.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center"><strong className="block font-serif text-2xl text-[#f4c95d]">{clan.topicsCount}</strong><span className="font-mono text-[8px] uppercase tracking-wider text-white/50">Topics</span></div>
              <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center"><strong className="block font-serif text-2xl text-[#f4c95d]">{clan.members.length}</strong><span className="font-mono text-[8px] uppercase tracking-wider text-white/50">Members</span></div>
              {clan.canManage && <button type="button" onClick={() => navigate(ROUTES.trackerManage(trackerId))} className="rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-xs font-extrabold transition hover:bg-white/15">Edit tracker</button>}
              {clan.role === 'member' && clan.personalCloneTrackerId && <button type="button" disabled={fetchGuildChanges.isPending} onClick={fetchLatestGuildChanges} className="rounded-lg border border-[#f4c95d]/35 bg-[#f4c95d]/12 px-4 py-3 text-xs font-extrabold text-[#f4c95d] transition hover:bg-[#f4c95d]/20 disabled:opacity-50">{fetchGuildChanges.isPending ? 'Fetching…' : '↻ Fetch changes'}</button>}
              <button type="button" onClick={() => { leaveClan.reset(); setLeaveDialogOpen(true); }} className="rounded-lg border border-red-300/25 bg-red-500/8 px-4 py-3 text-xs font-extrabold text-red-200 transition hover:bg-red-500/18">Leave guild</button>
            </div>
          </div>
        </section>

        {(memberActionNotice || syncNotice || fetchGuildChanges.error) && (
          <div className={cn('rounded-xl border px-4 py-3 text-[12px] font-semibold', fetchGuildChanges.error ? 'border-red-500/25 bg-red-500/8 text-red-600 dark:text-red-300' : 'border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300')}>
            {fetchGuildChanges.error ? getUserFacingError(fetchGuildChanges.error, 'Unable to fetch guild changes.') : memberActionNotice ?? syncNotice}
          </div>
        )}

        {incomingRoleInvitation && (
          <section className="rounded-2xl border border-[#d6ad47]/40 bg-[linear-gradient(135deg,rgba(244,201,93,.16),rgba(184,76,43,.07))] p-5 shadow-(--shadow-1) dark:border-[#d6ad47]/25 sm:p-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#8a6509] dark:text-[#f4c95d]">Role invitation</p>
            <h2 className="mt-2 font-serif text-2xl font-extrabold">Become guild {incomingRoleInvitation.role === 'owner' ? 'owner' : 'co-owner'}?</h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-(--text-secondary)">
              Before accepting, fetch the latest guild changes and send any private topics from your clone as merge requests. Your personal clone is retained after acceptance, so none of your work is deleted.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {clan.personalCloneTrackerId && <button type="button" onClick={() => navigate(ROUTES.trackerManage(clan.personalCloneTrackerId!))} className={buttonClass}>Review my clone</button>}
              {clan.personalCloneTrackerId && <button type="button" disabled={fetchGuildChanges.isPending} onClick={fetchLatestGuildChanges} className={buttonClass}>↻ Fetch guild changes</button>}
              <button type="button" disabled={respondToRoleInvitation.isPending} onClick={() => setRoleInvitationAction('accept')} className="rounded-md bg-[#171512] px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]">Accept invitation</button>
              <button type="button" disabled={respondToRoleInvitation.isPending} onClick={() => setRoleInvitationAction('decline')} className={buttonClass}>Decline</button>
            </div>
          </section>
        )}

        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-(--border-subtle) bg-(--surface-card) p-2 dark:border-white/15">
          {([
            ['chat', `Guild chat${connected ? ' · live' : ''}`],
            ['members', `Members · ${clan.members.length}`],
            ...(clan.canManage ? [['requests', `Merge requests · ${pendingRequests.length}`]] : []),
          ] as Array<[GuildTab, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={cn('whitespace-nowrap rounded-lg px-4 py-2.5 text-[12px] font-extrabold transition', tab === value ? 'bg-[#171512] text-white dark:bg-[#f2f0eb] dark:text-[#171512]' : 'text-(--text-secondary) hover:bg-black/5 dark:hover:bg-white/5')}>{label}</button>
          ))}
        </nav>

        {tab === 'chat' && (
          <section className="flex h-150 flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-1) dark:border-white/15 sm:h-170">
            <div className="border-b border-(--border-subtle) px-5 py-4 dark:border-white/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-xl font-bold">Global guild chat</h2><div className="flex flex-wrap items-center gap-2"><p className="text-[11px] text-(--text-secondary)">{connected ? 'Live connection active' : chatError ? 'Guild chat is offline' : 'Connecting to guild...'}</p>{!connected && chatError && <button type="button" className="text-[11px] font-bold text-(--brand-500) hover:underline" onClick={() => { setChatError(null); socket.connect(); }}>Retry connection</button>}</div></div><button type="button" onClick={() => setChallengeOpponent(null)} className="rounded-lg border border-[#d6ad47]/45 bg-[#f4c95d]/12 px-4 py-2.5 text-[11px] font-extrabold text-[#8a6509] transition hover:-translate-y-px dark:text-[#f4c95d]">⚔ Start open challenge</button></div></div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-(--surface-canvas) p-5">
              {timeline.length === 0 && <div className="py-20 text-center text-sm text-(--text-secondary)">No messages yet. Start the guild conversation.</div>}
              {timeline.map((item) => {
                if (item.kind === 'challenge' || item.kind === 'result') {
                  const challenge = item.challenge;
                  return <ClanChallengeCard key={item.key} eventType={item.kind === 'result' ? 'result' : 'invite'} challenge={challenge} currentUserId={currentUserId} busy={challengeBusy} onProfile={(username) => navigate(ROUTES.publicProfileFor(username))} onAccept={() => acceptChallenge.mutate({ trackerId, challengeId: challenge.id }, { onSuccess: (response) => navigate(ROUTES.trackerClanBattle(trackerId, response.data.id)) })} onDecline={() => declineChallenge.mutate({ trackerId, challengeId: challenge.id })} onCancel={() => cancelChallenge.mutate({ trackerId, challengeId: challenge.id })} onEnter={() => navigate(ROUTES.trackerClanBattle(trackerId, challenge.id))} />;
                }
                const message = item.message;
                const mine = message.user.userId === currentUserId;
                return <div key={message.id} className={cn('flex gap-3', mine && 'flex-row-reverse')}>
                  <button type="button" onClick={() => navigate(ROUTES.publicProfileFor(message.user.username))} className="shrink-0 rounded-full transition hover:ring-2 hover:ring-(--brand-500)/30">
                    <UserAvatar name={message.user.name} src={message.user.avatarUrl} sizeClassName="h-9 w-9 text-[10px]" />
                  </button>
                  <div className={cn('max-w-[78%]', mine && 'text-right')}><button type="button" onClick={() => navigate(ROUTES.publicProfileFor(message.user.username))} className="mb-1 text-[10px] font-bold text-(--text-secondary) hover:text-(--brand-500)">{message.user.name}</button><div className={cn('rounded-xl px-4 py-3 text-left text-sm leading-relaxed', mine ? 'rounded-tr-sm bg-(--brand-500) text-white dark:text-[#171512]' : 'rounded-tl-sm border border-(--border-subtle) bg-(--surface-card) dark:border-white/10')}>{message.text}</div><time className="mt-1 block font-mono text-[8px] text-(--text-secondary)/60">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
                </div>;
              })}
              <div ref={endRef} />
            </div>
            <div className="border-t border-(--border-subtle) p-4 dark:border-white/10">
              {chatError && <p className="mb-2 text-[11px] font-semibold text-red-500">{chatError}</p>}
              <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1000} placeholder="Message your guild..." className="min-w-0 flex-1 rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-4 py-3 text-sm outline-none focus:border-(--brand-500) dark:border-white/15" /><button type="submit" disabled={!draft.trim() || !connected} className="rounded-lg bg-[#171512] px-5 text-sm font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]">Send</button></form>
            </div>
          </section>
        )}

        {tab === 'members' && (
          <section className="grid gap-3 sm:grid-cols-2">
            {clan.members.map((member) => <article key={member.userId} className="flex items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4 dark:border-white/15">
              <button type="button" onClick={() => navigate(ROUTES.publicProfileFor(member.username))} className="flex min-w-0 items-center gap-3 text-left"><UserAvatar name={member.name} src={member.avatarUrl} sizeClassName="h-11 w-11 text-xs" /><span className="min-w-0"><strong className="block truncate text-sm">{member.name}</strong><span className="text-[11px] text-(--text-secondary)">@{member.username} · {member.role.replace('_', ' ')}</span>{pendingInvitationByMember.get(member.userId) && <span className="mt-1 block font-mono text-[8px] uppercase tracking-wider text-[#8a6509] dark:text-[#f4c95d]">{pendingInvitationByMember.get(member.userId)?.role === 'owner' ? 'Ownership' : 'Co-owner'} invite pending</span>}</span></button>
              {member.userId !== currentUserId && <div className="relative"><button type="button" disabled={busy} aria-label={`Actions for ${member.name}`} onClick={(event) => { event.stopPropagation(); setMemberMenuId((current) => current === member.userId ? null : member.userId); }} className="grid h-9 w-9 place-items-center rounded-md text-(--text-secondary) transition hover:bg-black/5 hover:text-(--text-primary) disabled:opacity-50 dark:hover:bg-white/8"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>{memberMenuId === member.userId && <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-lg border border-(--border-subtle) bg-(--surface-card) py-1 shadow-xl dark:border-white/15"><button type="button" onClick={() => { setMemberMenuId(null); setChallengeOpponent(member); }} className="block w-full px-4 py-3 text-left text-[12px] font-semibold text-[#9a7210] hover:bg-[#f4c95d]/10 dark:text-[#f4c95d]">⚔ Challenge to 1v1</button>{member.role !== 'owner' && clan.role === 'owner' && <><button type="button" onClick={() => { setMemberMenuId(null); setMemberAction({ type: member.role === 'co_owner' ? 'demote' : 'promote', member }); }} className="block w-full px-4 py-3 text-left text-[12px] font-semibold hover:bg-black/5 dark:hover:bg-white/8">{member.role === 'co_owner' ? 'Demote to member' : 'Promote to co-owner'}</button><button type="button" onClick={() => { setMemberMenuId(null); setMemberAction({ type: 'transfer', member }); }} className="block w-full px-4 py-3 text-left text-[12px] font-semibold hover:bg-black/5 dark:hover:bg-white/8">Transfer ownership</button></>}{member.role !== 'owner' && (clan.role === 'owner' || (clan.role === 'co_owner' && member.role === 'member')) && <button type="button" onClick={() => { setMemberMenuId(null); setMemberAction({ type: 'remove', member }); }} className="block w-full px-4 py-3 text-left text-[12px] font-semibold text-red-500 hover:bg-red-500/8">Remove from clan</button>}</div>}</div>}
            </article>)}
          </section>
        )}

        {tab === 'requests' && clan.canManage && (
          <section className="grid gap-3">
            {pendingRequests.length === 0 && <div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--surface-card) px-5 py-16 text-center text-(--text-secondary) dark:border-white/15">No open merge requests.</div>}
            {pendingRequests.map((request) => <article key={request.id} className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-5 dark:border-white/15"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[8px] uppercase tracking-wider text-(--brand-500)">Merge request from cloned tracker</p><h3 className="mt-1 font-serif text-xl font-bold">{request.title}</h3><button type="button" onClick={() => navigate(ROUTES.publicProfileFor(request.requester.username))} className="mt-1 text-xs text-(--text-secondary) hover:text-(--brand-500)">by {request.requester.name}</button></div><span className="rounded-full bg-[#f4c95d]/15 px-3 py-1 font-mono text-[8px] uppercase text-[#8a6509] dark:text-[#f4c95d]">{request.subtopicsCount} subtopics</span></div>{request.description && <p className="mt-3 text-sm text-(--text-secondary)">{request.description}</p>}<div className="mt-4 grid gap-2 sm:grid-cols-2">{request.subtopics.map((subtopic, index) => <div key={`${subtopic.title}-${index}`} className="rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-3 py-2 text-[12px] dark:border-white/10"><strong>{subtopic.depth > 1 ? '↳ ' : ''}{subtopic.title}</strong>{subtopic.description && <p className="mt-1 text-(--text-secondary)">{subtopic.description}</p>}</div>)}</div><div className="mt-5 flex gap-2"><button type="button" disabled={reviewContribution.isPending} onClick={() => reviewContribution.mutate({ trackerId, contributionId: request.id, action: 'approve', reviewNote: 'Merged by guild manager.' })} className="rounded-lg bg-[#171512] px-4 py-2.5 text-xs font-extrabold text-white dark:bg-[#f2f0eb] dark:text-[#171512]">Approve & merge</button><button type="button" disabled={reviewContribution.isPending} onClick={() => reviewContribution.mutate({ trackerId, contributionId: request.id, action: 'reject', reviewNote: 'Declined by guild manager.' })} className={buttonClass}>Reject</button></div></article>)}
          </section>
        )}
      </main>
      <ConfirmDialog
        open={Boolean(roleInvitationAction && incomingRoleInvitation)}
        title={roleInvitationAction === 'accept' ? `Accept ${incomingRoleInvitation?.role === 'owner' ? 'ownership' : 'co-owner'} invitation?` : 'Decline role invitation?'}
        description={<>{roleInvitationAction === 'accept' ? 'Your authority changes only after this confirmation. Your personal clone and its private topics stay stored; make any merge requests you want before continuing.' : 'Your current member role and personal clone will remain unchanged.'}{respondToRoleInvitation.error && <span className="mt-2 block font-semibold text-red-500">{getUserFacingError(respondToRoleInvitation.error, 'Unable to respond to this invitation.')}</span>}</>}
        confirmText={roleInvitationAction === 'accept' ? 'Accept invitation' : 'Decline invitation'}
        variant={roleInvitationAction === 'decline' ? 'danger' : 'default'}
        isLoading={respondToRoleInvitation.isPending}
        onClose={() => { if (!respondToRoleInvitation.isPending) { respondToRoleInvitation.reset(); setRoleInvitationAction(null); } }}
        onConfirm={() => {
          if (!incomingRoleInvitation || !roleInvitationAction) return;
          respondToRoleInvitation.mutate(
            { trackerId, invitationId: incomingRoleInvitation.id, action: roleInvitationAction },
            { onSuccess: () => setRoleInvitationAction(null) }
          );
        }}
      />
      <ConfirmDialog
        open={leaveDialogOpen}
        title={clan.role === 'owner' ? 'Transfer ownership before leaving' : 'Leave this guild?'}
        description={clan.role === 'owner'
          ? 'The guild must always have an owner. Transfer ownership to another member first, then you can leave as a co-owner.'
          : <>{'You will lose access to guild chat, challenges, and merge requests. Your cloned tracker and learning progress will remain available.'}{leaveClan.error && <span className="mt-2 block font-semibold text-red-500">{getUserFacingError(leaveClan.error, 'Unable to leave this guild.')}</span>}</>}
        confirmText={clan.role === 'owner' ? 'Choose a new owner' : 'Leave guild'}
        variant={clan.role === 'owner' ? 'default' : 'danger'}
        isLoading={leaveClan.isPending}
        onClose={() => { if (!leaveClan.isPending) { leaveClan.reset(); setLeaveDialogOpen(false); } }}
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
        title={memberAction ? `${memberAction.type === 'promote' ? 'Invite' : memberAction.type === 'demote' ? 'Demote' : memberAction.type === 'transfer' ? 'Invite as owner:' : 'Remove'} ${memberAction.member.name}?` : 'Confirm member change'}
        description={memberAction ? <>{memberAction.type === 'transfer' ? 'This sends an ownership invitation. Nothing changes until the member reviews their clone and accepts it; after acceptance, you become a co-owner.' : memberAction.type === 'promote' ? 'This sends a co-owner invitation. Their current clone and private topics remain available while they decide and prepare merge requests.' : memberAction.type === 'demote' ? 'This co-owner will lose clan management permissions. Their retained personal clone becomes visible again.' : 'This member will lose access to guild chat and clan features.'}{memberActionError && <span className="mt-2 block font-semibold text-red-500">{memberActionError}</span>}</> : undefined}
        confirmText={memberAction?.type === 'transfer' ? 'Send ownership invite' : memberAction?.type === 'remove' ? 'Remove member' : memberAction?.type === 'promote' ? 'Send co-owner invite' : 'Demote member'}
        variant={memberAction?.type === 'remove' || memberAction?.type === 'transfer' ? 'danger' : 'default'}
        isLoading={busy}
        onClose={() => { if (!busy) { setMemberAction(null); setMemberActionError(null); } }}
        onConfirm={() => void confirmMemberAction()}
      />
      <ClanChallengeDialog
        open={challengeOpponent !== undefined}
        opponent={challengeOpponent ?? null}
        isLoading={createChallenge.isPending}
        error={createChallenge.error ? getUserFacingError(createChallenge.error, 'Unable to create this challenge.') : null}
        onClose={() => { if (!createChallenge.isPending) { createChallenge.reset(); setChallengeOpponent(undefined); } }}
        onCreate={createGuildChallenge}
      />
    </AppShellBoundary>
  );
}
