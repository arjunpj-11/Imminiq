import { useEffect, useMemo, useRef, useState } from 'react';

import Modal from '../../../../../components/overlays/Modal';
import { cn } from '../../../../../lib/cn';
import type { ITrackerClanChallenge } from '../../types/tracker.types';

type Props = {
  challenge: ITrackerClanChallenge | null;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => void;
};

export default function ClanBattleModal({ challenge, isSubmitting, error, onClose, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() =>
    challenge?.startsAt ? new Date(challenge.startsAt).getTime() : 0
  );
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (!challenge) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [challenge]);

  const secondsLeft = Math.max(0, Math.ceil(((challenge?.endsAt ? new Date(challenge.endsAt).getTime() : now) - now) / 1000));
  const answerList = useMemo(() => Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })), [answers]);

  useEffect(() => {
    if (challenge && secondsLeft === 0 && !autoSubmitted.current && !isSubmitting) {
      autoSubmitted.current = true;
      onSubmit(answerList);
    }
  }, [answerList, challenge, isSubmitting, onSubmit, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <Modal open={Boolean(challenge)} onClose={onClose} preventClose={isSubmitting} contentClassName="max-h-[92vh] max-w-3xl overflow-y-auto">
      {challenge && <>
        <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-(--border-subtle) bg-(--surface-card) px-6 py-4"><div><p className="font-mono text-[8px] uppercase tracking-[.16em] text-(--brand-500)">⚔ Live guild battle</p><h2 className="font-serif text-xl font-extrabold">{challenge.challenger.name} vs {challenge.opponent?.name}</h2></div><div className={cn('rounded-lg px-4 py-2 font-mono text-lg font-bold', secondsLeft < 60 ? 'bg-red-500/12 text-red-500' : 'bg-[#f4c95d]/15 text-[#8a6509] dark:text-[#f4c95d]')}>{minutes}:{seconds}</div></div>
        <div className="space-y-5">{challenge.questions.map((question, index) => <fieldset key={question.id} className="rounded-xl border border-(--border-subtle) p-4 dark:border-white/15"><legend className="px-2 font-mono text-[9px] font-bold uppercase text-(--text-secondary)">Question {index + 1} · {question.topicTitle}</legend><p className="mt-2 text-sm font-bold leading-relaxed">{question.prompt}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <label key={option} className={cn('cursor-pointer rounded-lg border px-3 py-3 text-[12px] font-semibold transition', answers[question.id] === option ? 'border-(--brand-500) bg-(--brand-500)/10 text-(--brand-500)' : 'border-(--border-subtle) hover:border-(--brand-500)/50')}><input type="radio" className="sr-only" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />{option}</label>)}</div></fieldset>)}</div>
        {error && <p className="mt-4 text-[11px] font-semibold text-red-500">{error}</p>}
        <div className="mt-6 flex items-center justify-between gap-3"><span className="text-[11px] text-(--text-secondary)">{answerList.length}/{challenge.questions.length} answered</span><button type="button" disabled={isSubmitting || secondsLeft === 0} onClick={() => onSubmit(answerList)} className="rounded-lg bg-[#171512] px-6 py-3 text-xs font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]">{isSubmitting ? 'Submitting...' : 'Finish battle'}</button></div>
      </>}
    </Modal>
  );
}
