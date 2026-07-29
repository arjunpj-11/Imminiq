import { useState } from 'react';

import Modal from '../../../../../components/overlays/Modal';
import type { ITrackerClanPerson } from '../../types/tracker.types';

type Props = {
  open: boolean;
  opponent: ITrackerClanPerson | null;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (input: { durationMinutes: number; questionCount: number }) => void;
};

export default function ClanChallengeDialog({
  open,
  opponent,
  isLoading,
  onClose,
  onCreate,
}: Props) {
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <Modal open={open} onClose={onClose} preventClose={isLoading} contentClassName="max-w-md">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-(--brand-500)">
        ⚔ Guild battle
      </p>
      <h2 className="mt-2 font-serif text-2xl font-extrabold">
        {opponent ? `Challenge ${opponent.name}` : 'Open 1v1 challenge'}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
        {opponent
          ? 'Only this member can accept.'
          : 'The first eligible guild member to accept becomes your opponent.'}{' '}
        Race through subject questions, risk hard checkpoints for powers, and reach the finish
        first.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="text-[11px] font-bold">
          Time limit
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-3 py-3 text-sm"
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </label>
        <label className="text-[11px] font-bold">
          Race nodes
          <select
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-(--border-subtle) bg-(--surface-canvas) px-3 py-3 text-sm"
          >
            <option value={5}>5 nodes</option>
            <option value={10}>10 nodes</option>
            <option value={15}>15 nodes</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="rounded-lg border border-(--border-subtle) px-4 py-2.5 text-xs font-bold"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onCreate({ durationMinutes, questionCount })}
          className="rounded-lg bg-[#171512] px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50 dark:bg-[#f2f0eb] dark:text-[#171512]"
        >
          {isLoading ? 'Creating battle...' : 'Issue challenge'}
        </button>
      </div>
    </Modal>
  );
}
