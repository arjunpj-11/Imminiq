import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import { AppPageSkeleton } from '../../../../components/feedback/RouteSkeleton';
import UserAvatar from '../../../../components/data-display/UserAvatar';
import ConfirmDialog from '../../../../components/overlays/ConfirmDialog';
import Modal from '../../../../components/overlays/Modal';
import { cn } from '../../../../lib/cn';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { socket } from '../../../../lib/socket';
import { toast } from '../../../../lib/toast';
import { ROUTES } from '../../../../routes/config/route-paths';
import { useAuthStore } from '../../../../store/useAuthStore';
import {
  useAnswerTrackerClanNode,
  useChooseTrackerClanCheckpoint,
  useExtendTrackerClanChallenge,
  useQuitTrackerClanChallenge,
  useTrackerClanChallengePower,
  useTrackerClanChallenge,
  useTrackerClanChallengeHistory,
} from '../hooks/useTrackers';
import {
  downloadBattleHistoryPdf,
  getBattleHistoryQuestions,
} from '../utils/downloadBattleHistoryPdf';
import { syncTrackerClanChallengeCache } from '../hooks/syncTrackerClanChallengeCache';
import {
  getTrackerClanChallengeTerminalMessage,
  isTrackerClanChallengeTerminal,
} from '../utils/tracker-clan-challenge-status';

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

export default function TrackerClanBattlePage() {
  const { trackerId = '', challengeId = '' } = useParams<{
    trackerId: string;
    challengeId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = useAuthStore((state) => state.user?._id);
  const challengeQuery = useTrackerClanChallenge(
    trackerId,
    challengeId,
    Boolean(trackerId && challengeId)
  );
  const refetchChallenge = challengeQuery.refetch;
  const challenge = challengeQuery.data;
  const chooseCheckpoint = useChooseTrackerClanCheckpoint();
  const answerNode = useAnswerTrackerClanNode();
  const usePower = useTrackerClanChallengePower();
  const quitChallenge = useQuitTrackerClanChallenge();
  const extendChallenge = useExtendTrackerClanChallenge();
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyQuery = useTrackerClanChallengeHistory(trackerId, challengeId, historyOpen);
  const [selection, setSelection] = useState({ questionId: '', answer: '' });
  const [clock, setClock] = useState(() => Date.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const [unavailableChallengeId, setUnavailableChallengeId] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const extensionRequestRef = useRef('');

  const isChallenger = challenge?.challenger.userId === currentUserId;
  const me = isChallenger ? challenge?.challenger : challenge?.opponent;
  const rival = isChallenger ? challenge?.opponent : challenge?.challenger;
  const isParticipant = Boolean(
    me && rival && (isChallenger || challenge?.opponent?.userId === currentUserId)
  );
  const busy =
    chooseCheckpoint.isPending ||
    answerNode.isPending ||
    usePower.isPending ||
    quitChallenge.isPending;
  const error = chooseCheckpoint.error || answerNode.error || usePower.error || quitChallenge.error;
  const timerClock =
    challenge && isTrackerClanChallengeTerminal(challenge.status) && challenge.completedAt
      ? new Date(challenge.completedAt).getTime()
      : clock;
  const secondsLeft = Math.max(
    0,
    Math.ceil(
      ((challenge?.endsAt ? new Date(challenge.endsAt).getTime() : timerClock) - timerClock) / 1000
    )
  );
  const timer = `${Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
  const question = challenge?.questions[0];
  const selectedAnswer = selection.questionId === question?.id ? selection.answer : '';
  const historyQuestions = historyQuery.data ? getBattleHistoryQuestions(historyQuery.data) : [];

  useEffect(() => {
    if (challenge?.status !== 'active') return;
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [challenge?.status]);

  useEffect(() => {
    if (!trackerId || !challenge) return;
    syncTrackerClanChallengeCache(queryClient, trackerId, challenge);
  }, [challenge, queryClient, trackerId]);

  useEffect(() => {
    if (!trackerId || !accessToken) return;
    socket.auth = { token: accessToken };
    const join = () => socket.emit('tracker-clan:join', { trackerId });
    const refresh = (event: ChallengeEvent) => {
      if (event.trackerId === trackerId && event.id === challengeId) void refetchChallenge();
    };
    socket.on('connect', join);
    socket.on('tracker-clan:challenge', refresh);
    if (!socket.connected) socket.connect();
    else join();
    return () => {
      socket.emit('tracker-clan:leave', { trackerId });
      socket.off('connect', join);
      socket.off('tracker-clan:challenge', refresh);
    };
  }, [accessToken, challengeId, refetchChallenge, trackerId]);

  useEffect(() => {
    if (challenge) return;
    void refetchChallenge();
    const timer = window.setTimeout(() => setUnavailableChallengeId(challengeId), 4_000);
    return () => window.clearTimeout(timer);
  }, [challenge, challengeId, refetchChallenge]);

  useEffect(() => {
    if (!challenge || challenge.status !== 'active' || challenge.questionsRemaining > 5) return;
    const requestKey = `${challenge.id}:${challenge.questionsRemaining}:${question?.id ?? 'empty'}`;
    if (extensionRequestRef.current === requestKey || extendChallenge.isPending) return;
    extensionRequestRef.current = requestKey;
    extendChallenge.mutate(
      { trackerId, challengeId, questionCount: 10 },
      {
        onError: () => {
          extensionRequestRef.current = '';
          void refetchChallenge();
        },
      }
    );
  }, [challenge, challengeId, extendChallenge, question?.id, refetchChallenge, trackerId]);

  const nodes = buildNodes(challenge?.totalNodes ?? 0);

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    const wasCheckpoint = Boolean(question?.isCheckpoint);
    setSelection({ questionId: '', answer: '' });
    setFeedback(null);
    answerNode.mutate(
      { trackerId, challengeId, questionId: question!.id, answer: selectedAnswer },
      {
        onSuccess: (response) => {
          const correct = response.data.lastAnswerCorrect;
          setFeedback(
            correct
              ? 'Correct — you advanced one node!'
              : wasCheckpoint
                ? 'Checkpoint missed — you moved back three nodes. A new question is ready.'
                : 'Incorrect — you moved back one node. A new question is ready.'
          );
        },
      }
    );
  };

  if (challengeQuery.isLoading || (!challenge && unavailableChallengeId !== challengeId)) {
    return (
      <AppShellBoundary>
        <AppPageSkeleton kind="detail" label="Loading guild battle" />
      </AppShellBoundary>
    );
  }

  if (!challenge || !isParticipant) {
    return (
      <AppShellBoundary>
        <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
          <div>
            <h1 className="font-serif text-3xl font-extrabold">Battle unavailable</h1>
            <p className="mt-3 text-sm text-(--text-secondary)">
              This arena is only available to its two competitors.
            </p>
            <button
              onClick={() => navigate(ROUTES.trackerClan(trackerId))}
              className="mt-6 rounded-lg bg-(--brand-500) px-5 py-3 text-xs font-bold text-white"
            >
              Return to guild
            </button>
          </div>
        </main>
      </AppShellBoundary>
    );
  }

  const finished = isTrackerClanChallengeTerminal(challenge.status);
  const terminalMessage = getTrackerClanChallengeTerminalMessage(challenge.status);
  const won = challenge.winnerId === currentUserId;

  return (
    <AppShellBoundary>
      <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-6 px-4 py-5 pb-20 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.trackerClan(trackerId))}
            className="text-xs font-bold text-(--text-secondary) hover:text-(--brand-500)"
          >
            ← Guild chat
          </button>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-4 py-2 font-mono text-[9px] font-black uppercase tracking-[.16em] text-white',
                finished ? 'bg-(--text-secondary)' : 'bg-(--brand-500)'
              )}
            >
              {finished ? 'Battle ended' : 'Live challenge'}
            </span>
            {challenge.canQuit && (
              <button
                type="button"
                onClick={() => setQuitDialogOpen(true)}
                className="rounded-full border border-red-500/30 px-4 py-2 text-[10px] font-extrabold text-red-500 hover:bg-red-500/8"
              >
                Quit battle
              </button>
            )}
          </div>
        </div>

        <section className="grid items-center gap-5 rounded-2xl border border-(--border-subtle) bg-(--surface-card) px-5 py-6 shadow-sm md:grid-cols-[1fr_auto_1fr] dark:border-white/15">
          <Player
            name={me!.name}
            username={me!.username}
            avatarUrl={me!.avatarUrl}
            position={challenge.viewerPosition}
            total={challenge.totalNodes}
            align="left"
          />
          <div className="text-center">
            <p className="font-mono text-[9px] uppercase tracking-[.18em] text-(--text-secondary)">
              {finished ? 'Final time remaining' : 'Guild node race'}
            </p>
            <strong
              className={cn(
                'mt-1 block font-serif text-4xl',
                !finished && secondsLeft < 60 ? 'text-red-500' : 'text-(--brand-500)'
              )}
            >
              {timer}
            </strong>
          </div>
          <Player
            name={rival!.name}
            username={rival!.username}
            avatarUrl={rival!.avatarUrl}
            position={challenge.opponentPosition}
            total={challenge.totalNodes}
            align="right"
          />
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={busy || challenge.pushBackPowers < 1 || finished}
            onClick={() =>
              usePower.mutate(
                { trackerId, challengeId },
                {
                  onSuccess: () => {
                    setFeedback('Power used — your opponent moved back two nodes.');
                  },
                }
              )
            }
            className="rounded-full border border-(--border-subtle) bg-(--surface-card) px-5 py-2.5 text-[11px] font-extrabold shadow-sm disabled:opacity-40 dark:border-white/15"
          >
            ⚡ Push back ×2{' '}
            <span className="ml-2 text-(--brand-500)">{challenge.pushBackPowers}</span>
          </button>
        </div>

        <section aria-label="Battle rules" className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-center text-[11px] font-bold dark:border-white/15">
            <span className="text-emerald-600">Correct</span> · move forward 1
          </div>
          <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) px-4 py-3 text-center text-[11px] font-bold dark:border-white/15">
            <span className="text-red-500">Incorrect</span> · move back 1, never below start
          </div>
          <div className="rounded-xl border border-[#d6ad47]/40 bg-[#f4c95d]/10 px-4 py-3 text-center text-[11px] font-bold">
            <span className="text-[#9a7210] dark:text-[#f4c95d]">Checkpoint</span> · one try; miss
            moves back 3
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-[linear-gradient(145deg,var(--surface-card),var(--surface-canvas))] p-5 shadow-sm sm:p-9 dark:border-white/15">
          <div className="grid grid-cols-5 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-16">
            {nodes.map((node) => {
              const checkpoint = challenge.checkpointNodes.includes(node);
              const mine = challenge.viewerPosition === node;
              const theirs = challenge.opponentPosition === node;
              const passed = node <= Math.max(challenge.viewerPosition, challenge.opponentPosition);
              return (
                <div key={node} className="relative grid place-items-center">
                  {(mine || theirs) && (
                    <div className="absolute -top-9 flex gap-1">
                      {mine && (
                        <UserAvatar
                          name={me!.name}
                          src={me!.avatarUrl}
                          profileUsername={me!.username}
                          sizeClassName="h-7 w-7 text-[7px]"
                          className="border-2 border-(--brand-500)"
                        />
                      )}
                      {theirs && (
                        <UserAvatar
                          name={rival!.name}
                          src={rival!.avatarUrl}
                          profileUsername={rival!.username}
                          sizeClassName="h-7 w-7 text-[7px]"
                          className="border-2 border-[#d6ad47]"
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      'relative grid aspect-square w-full max-w-16 place-items-center rounded-full border text-sm font-black transition-all',
                      checkpoint
                        ? 'border-[#d6ad47] bg-[#f4c95d]/15 text-[#9a7210] dark:text-[#f4c95d]'
                        : passed
                          ? 'border-[#34714e] bg-[#34714e] text-white'
                          : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary)',
                      mine && 'ring-4 ring-(--brand-500)/25 shadow-xl'
                    )}
                  >
                    {checkpoint ? '★' : node}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 flex items-center gap-3">
            <span className="text-lg">🏁</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--border-subtle)">
              <div
                className="h-full bg-(--brand-500) transition-all"
                style={{
                  width: `${(challenge.viewerPosition / Math.max(1, challenge.totalNodes)) * 100}%`,
                }}
              />
            </div>
            <span className="font-mono text-[9px] font-bold">
              {challenge.viewerPosition}/{challenge.totalNodes}
            </span>
          </div>
        </section>

        {finished ? (
          <section className="rounded-2xl border border-[#d6ad47]/40 bg-[#f4c95d]/10 p-8 text-center">
            <div className="text-5xl">{challenge.winnerId ? '🏆' : '🤝'}</div>
            <h2 className="mt-3 font-serif text-3xl font-extrabold">
              {terminalMessage?.title ??
                (challenge.quitById === currentUserId
                  ? 'You left the battle'
                  : challenge.quitById
                    ? `${rival!.name} left — you win!`
                    : challenge.winnerId
                      ? won
                        ? 'You won the node race!'
                        : `${rival!.name} won the race`
                      : 'The battle ended in a draw')}
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              {terminalMessage?.description ??
                `${challenge.viewerScore} – ${challenge.opponentLiveScore} correct answers`}
            </p>
            {challenge.status === 'completed' && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="mt-5 rounded-xl bg-[#171512] px-6 py-3 text-xs font-extrabold text-white dark:bg-[#f2f0eb] dark:text-[#171512]"
              >
                View question history
              </button>
            )}
          </section>
        ) : challenge.checkpointDecisionRequired ? (
          <section className="mx-auto w-full max-w-190 rounded-2xl border border-[#d6ad47]/45 bg-(--surface-card) p-7 text-center shadow-xl">
            <div className="text-4xl">★</div>
            <p className="mt-3 font-mono text-[9px] font-black uppercase tracking-[.18em] text-[#9a7210] dark:text-[#f4c95d]">
              Hard checkpoint
            </p>
            <h2 className="mt-2 font-serif text-2xl font-extrabold">
              Attempt before revealing the question?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-(--text-secondary)">
              You get one attempt. Solve it to earn a power that sends your opponent back two nodes;
              a wrong answer sends you back three. You may skip without seeing it.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                disabled={busy}
                onClick={() =>
                  chooseCheckpoint.mutate({ trackerId, challengeId, decision: 'skip' })
                }
                className="rounded-lg border border-(--border-subtle) px-5 py-3 text-xs font-bold"
              >
                Skip checkpoint
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  chooseCheckpoint.mutate({ trackerId, challengeId, decision: 'attempt' })
                }
                className="rounded-lg bg-(--brand-500) px-6 py-3 text-xs font-extrabold text-white"
              >
                Attempt for power
              </button>
            </div>
          </section>
        ) : question ? (
          <section className="mx-auto w-full max-w-190 overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card) shadow-xl dark:border-white/15">
            <header className="flex items-center justify-between border-b border-(--border-subtle) bg-(--brand-500)/8 px-6 py-4">
              <div>
                <p className="font-mono text-[8px] font-black uppercase tracking-[.16em] text-(--brand-500)">
                  Node {challenge.viewerPosition + 1} · {question.topicTitle}
                </p>
                <h2 className="mt-1 font-serif text-xl font-extrabold">
                  {question.isCheckpoint ? 'Hard checkpoint question' : 'Advance to the next node'}
                </h2>
              </div>
              <span className="rounded-md bg-(--brand-500)/12 px-2 py-1 font-mono text-[8px] font-bold text-(--brand-500)">
                {question.isCheckpoint ? 'HARD' : 'RACE'}
              </span>
            </header>
            <div className="p-6">
              <p className="text-lg font-bold leading-relaxed">{question.prompt}</p>
              <div className="mt-6 grid gap-3">
                {question.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    disabled={busy}
                    onClick={() => setSelection({ questionId: question.id, answer: option })}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition',
                      selectedAnswer === option
                        ? 'border-(--brand-500) bg-(--brand-500)/10'
                        : 'border-(--border-subtle) hover:border-(--brand-500)/50'
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs',
                        selectedAnswer === option &&
                          'border-(--brand-500) bg-(--brand-500) text-white'
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!selectedAnswer || busy}
                onClick={submitAnswer}
                className="mt-6 w-full rounded-xl bg-(--brand-500) px-6 py-4 text-sm font-extrabold text-white shadow-lg disabled:opacity-40"
              >
                {answerNode.isPending ? 'Checking answer...' : 'Submit answer'}
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-auto w-full max-w-190 rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-8 text-center shadow-xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-(--brand-500)/25 border-t-(--brand-500)" />
            <h2 className="mt-4 font-serif text-xl font-extrabold">Preparing more questions…</h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Your position is safe. The battle will continue as soon as the next question arrives.
            </p>
          </section>
        )}

        {!finished && (feedback || error) && (
          <div
            className={cn(
              'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-xs font-bold text-white shadow-2xl',
              error || challenge.lastAnswerCorrect === false ? 'bg-red-600' : 'bg-[#34714e]'
            )}
          >
            {error ? getUserFacingError(error, 'The arena could not process that move.') : feedback}
          </div>
        )}
      </main>
      <ConfirmDialog
        open={quitDialogOpen}
        title="Quit this battle?"
        description="Your opponent will win immediately. This cannot be undone."
        confirmText="Quit battle"
        variant="danger"
        isLoading={quitChallenge.isPending}
        onClose={() => {
          if (!quitChallenge.isPending) setQuitDialogOpen(false);
        }}
        onConfirm={() =>
          quitChallenge.mutate(
            { trackerId, challengeId },
            { onSuccess: () => setQuitDialogOpen(false) }
          )
        }
      />
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        ariaLabel="Battle question history"
        contentClassName="max-h-[90vh] max-w-5xl overflow-y-auto p-0"
      >
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) bg-(--surface-elevated) px-5 py-4">
          <div>
            <p className="font-mono text-[8px] font-black uppercase tracking-[.16em] text-(--brand-500)">
              Study review
            </p>
            <h2 className="font-serif text-2xl font-extrabold">Battle question history</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!historyQuery.data || pdfDownloading}
              onClick={() => {
                if (!historyQuery.data) return;
                setPdfDownloading(true);
                void downloadBattleHistoryPdf(historyQuery.data)
                  .then(() => toast.success('Battle history PDF downloaded'))
                  .catch(() =>
                    toast.error(
                      'PDF not created',
                      'The battle history PDF could not be created. Please try again.'
                    )
                  )
                  .finally(() => setPdfDownloading(false));
              }}
              className="rounded-lg bg-(--brand-500) px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
            >
              {pdfDownloading ? 'Creating PDF…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              className="rounded-lg border border-(--border-subtle) px-4 py-2.5 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </header>
        <div className="p-5">
          {historyQuery.isLoading && (
            <div className="py-16 text-center text-sm text-(--text-secondary)">
              Loading both players’ answers…
            </div>
          )}
          {historyQuery.error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm font-semibold text-red-600">
              {getUserFacingError(historyQuery.error, 'Unable to load battle history.')}
            </div>
          )}
          {historyQuery.data &&
            (historyQuestions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-(--border-subtle) p-8 text-center text-sm text-(--text-secondary)">
                No questions were asked in this battle.
              </p>
            ) : (
              <div className="space-y-4">
                {historyQuestions.map((question, index) => (
                  <article
                    key={question.questionId}
                    className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-card)"
                  >
                    <div className="p-5">
                      <p className="font-mono text-[8px] font-black uppercase tracking-wider text-(--text-secondary)">
                        Question {index + 1} · {question.topicTitle}
                        {question.isCheckpoint ? ' · Checkpoint' : ''}
                      </p>
                      <p className="mt-2 text-sm font-bold leading-relaxed">{question.prompt}</p>
                      <div className="mt-4 rounded-lg bg-emerald-500/8 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          Correct answer
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                          {question.correctAnswer}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-(--border-subtle) bg-(--surface-canvas) p-5">
                      <p className="mb-3 font-mono text-[8px] font-black uppercase tracking-wider text-(--text-secondary)">
                        Attempts
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {question.attempts.map(({ player, answer }) => (
                          <div
                            key={player.userId}
                            className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-xs font-extrabold">{player.name}</p>
                              {answer && (
                                <span
                                  className={cn(
                                    'text-[10px] font-black',
                                    answer.isCorrect ? 'text-emerald-600' : 'text-red-500'
                                  )}
                                >
                                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                'mt-2 text-sm font-semibold',
                                !answer && 'italic text-(--text-secondary)'
                              )}
                            >
                              {answer?.answer ?? 'Not asked'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
        </div>
      </Modal>
    </AppShellBoundary>
  );
}

function Player({
  name,
  username,
  avatarUrl,
  position,
  total,
  align,
}: {
  name: string;
  username: string;
  avatarUrl?: string | null;
  position: number;
  total: number;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        align === 'right' && 'md:flex-row-reverse md:text-right'
      )}
    >
      <UserAvatar
        name={name}
        src={avatarUrl}
        profileUsername={username}
        sizeClassName="h-13 w-13 text-xs"
        className="border-2 border-(--brand-500)"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-xl font-extrabold">{name}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--border-subtle)">
          <div
            className="h-full bg-(--brand-500)"
            style={{ width: `${(position / Math.max(1, total)) * 100}%` }}
          />
        </div>
        <p className="mt-1 font-mono text-[8px] uppercase text-(--text-secondary)">
          Node {position} of {total}
        </p>
      </div>
    </div>
  );
}
