// ============================================================
// MockTestRow.tsx — aligned with Trackers card style
// ============================================================

import type { IMockTestListItem } from '../types/mock-tests.types';
import {
  difficultyBadge,
  formatDate,
  getProgressLabel,
  getTestScore,
  isHighScore,
} from '../utils/mock-tests-formatters';
import { ArrowRightIcon, ClipboardIcon } from './MockTestIcons';

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M8.7 12.8L15.3 16.2M15.3 7.8L8.7 11.2M18 9.5C19.3807 9.5 20.5 8.38071 20.5 7C20.5 5.61929 19.3807 4.5 18 4.5C16.6193 4.5 15.5 5.61929 15.5 7C15.5 8.38071 16.6193 9.5 18 9.5ZM6 14.5C7.38071 14.5 8.5 13.3807 8.5 12C8.5 10.6193 7.38071 9.5 6 9.5C4.61929 9.5 3.5 10.6193 3.5 12C3.5 13.3807 4.61929 14.5 6 14.5ZM18 19.5C19.3807 19.5 20.5 18.3807 20.5 17C20.5 15.6193 19.3807 14.5 18 14.5C16.6193 14.5 15.5 15.6193 15.5 17C15.5 18.3807 16.6193 19.5 18 19.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function MockTestRow({
  test,
  onOpen,
  onShare,
  onStart,
}: {
  test: IMockTestListItem;
  onOpen: () => void;
  onShare: () => void;
  onStart: () => void;
}) {
  const score = getTestScore(test);
  const isUnavailable = test.moderationStatus !== 'active';

  return (
    <div className="render-lazy group flex flex-col gap-4 rounded-2xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.22)] hover:shadow-(--shadow-2) sm:flex-row sm:items-center dark:border-(--border-subtle) dark:bg-(--surface-card) dark:hover:border-white/20">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-(--brand-500)/20 dark:bg-(--brand-500)/10 dark:text-(--brand-500)">
        <ClipboardIcon />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-ui text-[17px] font-black text-(--text-primary) dark:text-(--text-primary)">
            {test.title}
          </h3>

          <span className="rounded-full border border-[rgba(184,76,43,0.24)] bg-[rgba(184,76,43,0.08)] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-(--brand-500) dark:border-(--brand-500)/30 dark:bg-(--brand-500)/10 dark:text-(--brand-500)">
            {difficultyBadge(test.difficulty)}
          </span>

          {test.sourceTestId ? (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-blue-700 dark:text-blue-300">
              Shared
            </span>
          ) : null}

          {isUnavailable ? (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-700 dark:text-amber-300">
              {test.moderationStatus === 'deleted' ? 'Removed by admin' : 'Under review'}
            </span>
          ) : null}

          {isHighScore(score) && (
            <span className="rounded-full border border-[rgba(45,106,71,0.22)] bg-[rgba(45,106,71,0.10)] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-(--success) dark:border-(--success)/30 dark:bg-(--success)/10 dark:text-(--success)">
              High score
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[12.5px] text-(--text-secondary) dark:text-[#6b6560]">
          {test.description || 'No description added'} · {test.questionCount} questions ·{' '}
          {test.timeLimitMinutes} min · {formatDate(test.createdAt)}
        </p>
        {isUnavailable && test.moderationReason ? (
          <p className="mt-1 line-clamp-2 text-[12px] font-semibold text-amber-700 dark:text-amber-300">
            Admin note: {test.moderationReason}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <div className="font-ui text-[22px] font-black text-(--text-primary) dark:text-(--text-primary)">
            {score}%
          </div>

          <div className="font-mono text-[9px] uppercase tracking-widest text-(--text-secondary) dark:text-[#6b6560]">
            Score
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-md border border-(--border-subtle) bg-white/35 px-3 py-2 text-[12px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary) dark:hover:border-white/20 dark:hover:text-[#f2f0eb]"
        >
          Details
        </button>

        <button
          type="button"
          onClick={onShare}
          disabled={isUnavailable}
          title={
            isUnavailable ? 'Sharing is disabled while this test is under moderation.' : undefined
          }
          className="inline-flex items-center gap-2 rounded-md border border-(--border-subtle) bg-white/35 px-3 py-2 text-[12px] font-bold text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary) dark:hover:border-white/20 dark:hover:text-[#f2f0eb]"
        >
          <ShareIcon />
          Share
        </button>

        <button
          type="button"
          onClick={onStart}
          disabled={isUnavailable}
          title={isUnavailable ? 'This test is unavailable following an admin review.' : undefined}
          className="inline-flex items-center gap-2 rounded-md bg-(--brand-500) px-4 py-2 text-[12px] font-bold text-white shadow-[0_2px_12px_rgba(184,76,43,0.22)] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:bg-(--brand-500) dark:shadow-none dark:hover:bg-[#d9522d]"
        >
          {isUnavailable ? 'Unavailable' : getProgressLabel(test)} <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

export default MockTestRow;
