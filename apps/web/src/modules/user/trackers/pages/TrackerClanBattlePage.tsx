import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { socket } from '../../../../lib/socket';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useAuthStore } from '../../../../store/useAuthStore';
import {
  useAnswerTrackerClanNode,
  useChooseTrackerClanCheckpoint,
  useTrackerClanChallengePower,
  useTrackerClanChallenges,
} from '../hooks/useTrackers';

type ChallengeEvent = { id: string; trackerId: string };

const buildNodes = (count: number) => {
  const values = Array.from({ length: count }, (_, index) => index + 1);
  const rows: number[][] = [];
  for (let index = 0; index < values.length; index += 5) {
    const row = values.slice(index, index + 5);
    rows.push(rows.length % 2 ? row.reverse() : row);
  }
  return rows.flat();
};

const avatar = (name: string, url?: string | null) =>
  url ? <img src={url} alt="" className="h-full w-full object-cover" /> : name.slice(0, 2).toUpperCase();

export default function TrackerClanBattlePage() {
  const { trackerId = '', challengeId = '' } = useParams<{ trackerId: string; challengeId: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = useAuthStore((state) => state.user?._id);
  const challengesQuery = useTrackerClanChallenges(trackerId, Boolean(trackerId));
  const refetchChallenges = challengesQuery.refetch;
  const challenge = challengesQuery.data?.find((item) => item.id === challengeId);
  const chooseCheckpoint = useChooseTrackerClanCheckpoint();
  const answerNode = useAnswerTrackerClanNode();
  const usePower = useTrackerClanChallengePower();
  const [selection, setSelection] = useState({ questionId: '', answer: '' });
  const [clock, setClock] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isChallenger = challenge?.challenger.userId === currentUserId;
  const me = isChallenger ? challenge?.challenger : challenge?.opponent;
  const rival = isChallenger ? challenge?.opponent : challenge?.challenger;
  const isParticipant = Boolean(me && rival && (isChallenger || challenge?.opponent?.userId === currentUserId));
  const busy = chooseCheckpoint.isPending || answerNode.isPending || usePower.isPending;
  const error = chooseCheckpoint.error || answerNode.error || usePower.error;
  const secondsLeft = Math.max(0, Math.ceil(((challenge?.endsAt ? new Date(challenge.endsAt).getTime() : clock) - clock) / 1000));
  const timer = `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
  const question = challenge?.questions[0];
  const selectedAnswer = selection.questionId === question?.id ? selection.answer : '';

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!trackerId || !accessToken) return;
    socket.auth = { token: accessToken };
    const join = () => socket.emit('tracker-clan:join', { trackerId });
    const refresh = (event: ChallengeEvent) => {
      if (event.trackerId === trackerId && event.id === challengeId) void refetchChallenges();
    };
    socket.on('connect', join);
    socket.on('tracker-clan:challenge', refresh);
    if (!socket.connected) socket.connect(); else join();
    return () => {
      socket.emit('tracker-clan:leave', { trackerId });
      socket.off('connect', join);
      socket.off('tracker-clan:challenge', refresh);
      socket.disconnect();
    };
  }, [accessToken, challengeId, refetchChallenges, trackerId]);

  const nodes = buildNodes(challenge?.totalNodes ?? 0);

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    answerNode.mutate(
      { trackerId, challengeId, answer: selectedAnswer },
      {
        onSuccess: (response) => {
          const correct = response.data.lastAnswerCorrect;
          setFeedback(correct ? 'Correct — you advanced one node!' : 'Not quite — try another option.');
          void refetchChallenges();
        },
      }
    );
  };

  if (challengesQuery.isLoading) {
    return <AppShellBoundary><main className="mx-auto w-full max-w-300 animate-pulse px-5 py-10"><div className="h-150 rounded-3xl bg-(--surface-card)" /></main></AppShellBoundary>;
  }

  if (!challenge || !isParticipant) {
    return <AppShellBoundary><main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center"><div><h1 className="font-serif text-3xl font-extrabold">Battle unavailable</h1><p className="mt-3 text-sm text-(--text-secondary)">This arena is only available to its two competitors.</p><button onClick={() => navigate(ROUTES.trackerClan(trackerId))} className="mt-6 rounded-lg bg-(--brand-500) px-5 py-3 text-xs font-bold text-white">Return to guild</button></div></main></AppShellBoundary>;
  }

  const finished = challenge.status === 'completed';
  const won = challenge.winnerId === currentUserId;

  return (
    <AppShellBoundary>
      <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-6 px-4 py-5 pb-20 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate(ROUTES.trackerClan(trackerId))} className="text-xs font-bold text-(--text-secondary) hover:text-(--brand-500)">← Guild chat</button>
          <span className="rounded-full bg-(--brand-500) px-4 py-2 font-mono text-[9px] font-black uppercase tracking-[.16em] text-white">Live challenge</span>
        </div>

        <section className="grid items-center gap-5 rounded-2xl border border-(--border-subtle) bg-(--surface-card) px-5 py-6 shadow-sm md:grid-cols-[1fr_auto_1fr] dark:border-white/15">
          <Player name={me!.name} avatarUrl={me!.avatarUrl} position={challenge.viewerPosition} total={challenge.totalNodes} align="left" />
          <div className="text-center"><p className="font-mono text-[9px] uppercase tracking-[.18em] text-(--text-secondary)">Guild node race</p><strong className={cn('mt-1 block font-serif text-4xl', secondsLeft < 60 ? 'text-red-500' : 'text-(--brand-500)')}>{timer}</strong></div>
          <Player name={rival!.name} avatarUrl={rival!.avatarUrl} position={challenge.opponentPosition} total={challenge.totalNodes} align="right" />
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" disabled={busy || challenge.pushBackPowers < 1 || finished} onClick={() => usePower.mutate({ trackerId, challengeId }, { onSuccess: () => { setFeedback('Power used — your opponent moved back two nodes.'); void refetchChallenges(); } })} className="rounded-full border border-(--border-subtle) bg-(--surface-card) px-5 py-2.5 text-[11px] font-extrabold shadow-sm disabled:opacity-40 dark:border-white/15">⚡ Push back ×2 <span className="ml-2 text-(--brand-500)">{challenge.pushBackPowers}</span></button>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-[linear-gradient(145deg,var(--surface-card),var(--surface-canvas))] p-5 shadow-sm sm:p-9 dark:border-white/15">
          <div className="grid grid-cols-5 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-16">
            {nodes.map((node) => {
              const checkpoint = challenge.checkpointNodes.includes(node);
              const mine = challenge.viewerPosition === node;
              const theirs = challenge.opponentPosition === node;
              const passed = node <= Math.max(challenge.viewerPosition, challenge.opponentPosition);
              return <div key={node} className="relative grid place-items-center">
                {(mine || theirs) && <div className="absolute -top-9 flex gap-1">
                  {mine && <span title={me!.name} className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border-2 border-(--brand-500) bg-[#171512] text-[7px] font-black text-white">{avatar(me!.name, me!.avatarUrl)}</span>}
                  {theirs && <span title={rival!.name} className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border-2 border-[#d6ad47] bg-[#171512] text-[7px] font-black text-white">{avatar(rival!.name, rival!.avatarUrl)}</span>}
                </div>}
                <div className={cn('relative grid aspect-square w-full max-w-16 place-items-center rounded-full border text-sm font-black transition-all', checkpoint ? 'border-[#d6ad47] bg-[#f4c95d]/15 text-[#9a7210] dark:text-[#f4c95d]' : passed ? 'border-[#34714e] bg-[#34714e] text-white' : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary)', mine && 'ring-4 ring-(--brand-500)/25 shadow-xl')}>
                  {checkpoint ? '★' : node}
                </div>
              </div>;
            })}
          </div>
          <div className="mt-12 flex items-center gap-3"><span className="text-lg">🏁</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-(--border-subtle)"><div className="h-full bg-(--brand-500) transition-all" style={{ width: `${(challenge.viewerPosition / Math.max(1, challenge.totalNodes)) * 100}%` }} /></div><span className="font-mono text-[9px] font-bold">{challenge.viewerPosition}/{challenge.totalNodes}</span></div>
        </section>

        {finished ? (
          <section className="rounded-2xl border border-[#d6ad47]/40 bg-[#f4c95d]/10 p-8 text-center"><div className="text-5xl">{challenge.winnerId ? '🏆' : '🤝'}</div><h2 className="mt-3 font-serif text-3xl font-extrabold">{challenge.winnerId ? (won ? 'You won the node race!' : `${rival!.name} won the race`) : 'The battle ended in a draw'}</h2><p className="mt-2 text-sm text-(--text-secondary)">{challenge.viewerScore} – {challenge.opponentLiveScore} correct answers</p></section>
        ) : challenge.checkpointDecisionRequired ? (
          <section className="mx-auto w-full max-w-190 rounded-2xl border border-[#d6ad47]/45 bg-(--surface-card) p-7 text-center shadow-xl"><div className="text-4xl">★</div><p className="mt-3 font-mono text-[9px] font-black uppercase tracking-[.18em] text-[#9a7210] dark:text-[#f4c95d]">Hard checkpoint</p><h2 className="mt-2 font-serif text-2xl font-extrabold">Attempt before revealing the question?</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-(--text-secondary)">The same hard question waits for both players. Solve it to earn a power that sends your opponent back two nodes, or skip safely without seeing it.</p><div className="mt-6 flex justify-center gap-3"><button disabled={busy} onClick={() => chooseCheckpoint.mutate({ trackerId, challengeId, decision: 'skip' }, { onSuccess: () => void refetchChallenges() })} className="rounded-lg border border-(--border-subtle) px-5 py-3 text-xs font-bold">Skip checkpoint</button><button disabled={busy} onClick={() => chooseCheckpoint.mutate({ trackerId, challengeId, decision: 'attempt' }, { onSuccess: () => void refetchChallenges() })} className="rounded-lg bg-(--brand-500) px-6 py-3 text-xs font-extrabold text-white">Attempt for power</button></div></section>
        ) : question ? (
          <section className="mx-auto w-full max-w-190 overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-xl dark:border-white/15"><header className="flex items-center justify-between border-b border-(--border-subtle) bg-(--brand-500)/8 px-6 py-4"><div><p className="font-mono text-[8px] font-black uppercase tracking-[.16em] text-(--brand-500)">Node {challenge.viewerPosition + 1} · {question.topicTitle}</p><h2 className="mt-1 font-serif text-xl font-extrabold">{question.isCheckpoint ? 'Hard checkpoint question' : 'Advance to the next node'}</h2></div><span className="rounded-md bg-(--brand-500)/12 px-2 py-1 font-mono text-[8px] font-bold text-(--brand-500)">{question.isCheckpoint ? 'HARD' : 'RACE'}</span></header><div className="p-6"><p className="text-lg font-bold leading-relaxed">{question.prompt}</p><div className="mt-6 grid gap-3">{question.options.map((option, index) => <button type="button" key={option} disabled={busy} onClick={() => setSelection({ questionId: question.id, answer: option })} className={cn('flex items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition', selectedAnswer === option ? 'border-(--brand-500) bg-(--brand-500)/10' : 'border-(--border-subtle) hover:border-(--brand-500)/50')}><span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs', selectedAnswer === option && 'border-(--brand-500) bg-(--brand-500) text-white')}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><button type="button" disabled={!selectedAnswer || busy} onClick={submitAnswer} className="mt-6 w-full rounded-xl bg-(--brand-500) px-6 py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-40">{answerNode.isPending ? 'Checking answer...' : 'Submit answer'}</button></div></section>
        ) : null}

        {(feedback || error) && <div className={cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-xs font-bold text-white shadow-2xl', error || challenge.lastAnswerCorrect === false ? 'bg-red-600' : 'bg-[#34714e]')}>{error ? getUserFacingError(error, 'The arena could not process that move.') : feedback}</div>}
      </main>
    </AppShellBoundary>
  );
}

function Player({ name, avatarUrl, position, total, align }: { name: string; avatarUrl?: string | null; position: number; total: number; align: 'left' | 'right' }) {
  return <div className={cn('flex items-center gap-3', align === 'right' && 'md:flex-row-reverse md:text-right')}><span className="grid h-13 w-13 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-(--brand-500) bg-[#171512] text-xs font-black text-white">{avatar(name, avatarUrl)}</span><div className="min-w-0 flex-1"><p className="truncate font-serif text-xl font-extrabold">{name}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--border-subtle)"><div className="h-full bg-(--brand-500)" style={{ width: `${(position / Math.max(1, total)) * 100}%` }} /></div><p className="mt-1 font-mono text-[8px] uppercase text-(--text-secondary)">Node {position} of {total}</p></div></div>;
}
