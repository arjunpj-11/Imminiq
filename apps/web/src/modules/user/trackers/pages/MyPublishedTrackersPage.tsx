import { cn } from '../../../../lib/cn';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../routes/config/route-paths';

import { AppShellBoundary } from '../../../../components/layout/AppShell';
import PageHero from '../../../../components/layout/PageHero';
import Modal from '../../../../components/overlays/Modal';
import { normalizePercentage } from '../../../../lib/bounded-number';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { toast } from '../../../../lib/toast';
import { paginationConfig } from '../../../../config/pagination';
import { DomainCombobox } from '../components/PublishTrackerModal';
import { useTrackers, useUnpublishTracker, useUpdateTracker } from '../hooks/useTrackers';
import type { ITracker } from '../types/tracker.types';

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const domainLabel = (value: string | undefined) => {
  if (!value) return 'Tracker';
  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const levelColors: Record<string, { text: string; bg: string; border: string }> = {
  beginner: {
    text: 'text-[var(--success)] dark:text-[var(--success)]',
    bg: 'bg-[rgba(45,106,71,0.08)] dark:bg-[rgba(92,201,138,0.10)]',
    border: 'border-[rgba(45,106,71,0.20)] dark:border-[rgba(92,201,138,0.22)]',
  },
  intermediate: {
    text: 'text-[var(--brand-500)] dark:text-[var(--brand-500)]',
    bg: 'bg-[rgba(184,76,43,0.08)] dark:bg-[rgba(232,129,106,0.10)]',
    border: 'border-[rgba(184,76,43,0.16)] dark:border-[rgba(232,129,106,0.22)]',
  },
  advanced: {
    text: 'text-[#7c5a1e] dark:text-[#d4a84b]',
    bg: 'bg-[rgba(124,90,30,0.08)] dark:bg-[rgba(212,168,75,0.10)]',
    border: 'border-[rgba(124,90,30,0.20)] dark:border-[rgba(212,168,75,0.22)]',
  },
};

// ─── Icons ─────────────────────────────────────────────────────────────────────

const GlobeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="14" cy="14" rx="4.5" ry="10.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M3.5 14H24.5M4.5 9H23.5M4.5 19H23.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.25" />
  </svg>
);

const UnpublishIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 2L12 12M5.5 3.2A5 5 0 0 1 7 3c4 0 6 4 6 4s-.8 1.6-2.2 2.8M8.8 9.8C8.3 10.1 7.7 10.3 7 10.3c-4 0-6-3.3-6-3.3S2 5.4 3.5 4.2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M4.5 9.5H2.5A1 1 0 0 1 1.5 8.5V2.5A1 1 0 0 1 2.5 1.5H8.5A1 1 0 0 1 9.5 2.5V4.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M8.2 2.2 11.8 5.8M2 12l.8-3.6L9.7 1.5a1.4 1.4 0 0 1 2 0l.8.8a1.4 1.4 0 0 1 0 2L5.6 11.2 2 12Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path
      d="M11 2L20.5 19H1.5L11 2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M11 9V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="16.5" r="0.75" fill="currentColor" />
  </svg>
);

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M7 12S1.5 8 1.5 4.5A2.5 2.5 0 0 1 7 3.5a2.5 2.5 0 0 1 5.5 1C12.5 8 7 12 7 12Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Skeletons ─────────────────────────────────────────────────────────────────

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-full bg-[#e8ddd6] dark:bg-white/10', className)} />
);

const PublishedCardSkeleton = () => (
  <div className="animate-pulse rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 dark:border-(--border-subtle) dark:bg-(--surface-card)">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex gap-2">
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-7 w-20 rounded-lg" />
    </div>
    <SkeletonBlock className="mb-2 h-6 w-3/4 rounded-lg" />
    <SkeletonBlock className="mb-1 h-4 w-full rounded" />
    <SkeletonBlock className="mb-4 h-4 w-4/5 rounded" />
    <div className="mb-4 h-1.5 rounded-full bg-[#e8ddd6] dark:bg-white/10" />
    <div className="grid grid-cols-3 gap-2 border-y border-(--border-subtle) py-3 dark:border-(--border-subtle)">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <SkeletonBlock className="h-2 w-10 rounded-full" />
          <SkeletonBlock className="h-4 w-8 rounded" />
        </div>
      ))}
    </div>
    <div className="mt-4 flex gap-2">
      <SkeletonBlock className="h-8 w-22.5 rounded-sm" />
      <SkeletonBlock className="h-8 w-22.5 rounded-sm" />
      <SkeletonBlock className="ml-auto h-8 w-22.5 rounded-sm" />
    </div>
  </div>
);

// ─── Unpublish Confirmation Modal ──────────────────────────────────────────────

type UnpublishConfirmModalProps = {
  tracker: ITracker | null;
  isUnpublishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function UnpublishConfirmModal({
  tracker,
  isUnpublishing,
  onConfirm,
  onCancel,
}: UnpublishConfirmModalProps) {
  return (
    <Modal
      open={Boolean(tracker)}
      onClose={onCancel}
      preventClose={isUnpublishing}
      ariaLabel="Unpublish tracker"
      overlayClassName="z-200 bg-(--surface-canvas)/98 backdrop-blur-xl"
      contentClassName="max-h-[calc(100dvh-2rem)] max-w-100 overflow-y-auto border-[rgba(200,50,50,0.18)] p-0"
    >
      {tracker && (
        <div className="w-full bg-(--surface-card) dark:bg-(--surface-card)">
          {/* Red accent top bar */}
          <div className="h-0.5 w-full bg-linear-to-r from-[#c83232] to-[#e05555]" />

          <div className="p-6">
            {/* Warning icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border-[1.5px] border-[rgba(200,50,50,0.20)] bg-[rgba(200,50,50,0.08)] text-[#b83232] dark:border-[rgba(255,120,120,0.18)] dark:bg-[rgba(255,120,120,0.08)] dark:text-[#ff8c8c]">
              <WarningIcon />
            </div>

            {/* Title */}
            <h2 className="font-ui text-[19px] font-extrabold leading-[1.2] tracking-[-0.3px] text-(--text-primary) dark:text-(--text-primary)">
              Unpublish this tracker?
            </h2>

            {/* Tracker name */}
            <p className="mt-1 text-[12.5px] font-semibold text-(--text-secondary) dark:text-(--text-secondary)">
              "{tracker.title}"
            </p>

            {/* Warning message */}
            <p className="mt-3 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
              This will remove it from the community. The following will be{' '}
              <span className="font-bold text-[#b83232] dark:text-[#ff8c8c]">permanently lost</span>{' '}
              and cannot be recovered:
            </p>

            {/* Loss list */}
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2.5 rounded-md border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
                <span className="text-[#b83232] dark:text-[#ff8c8c]">
                  <HeartIcon />
                </span>
                <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">
                  All likes from the community
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-md border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
                <span className="text-[#b83232] dark:text-[#ff8c8c]">
                  <CommentIcon />
                </span>
                <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">
                  All comments & replies
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-md border-[1.5px] border-[rgba(200,50,50,0.12)] bg-[rgba(200,50,50,0.05)] px-3 py-2 dark:border-[rgba(255,120,120,0.10)] dark:bg-[rgba(255,120,120,0.05)]">
                <span className="text-[#b83232] dark:text-[#ff8c8c]">
                  <GlobeSmallIcon />
                </span>
                <span className="text-[12.5px] font-medium text-[#4a3f3a] dark:text-[#c8c4bc]">
                  Public share link & visibility
                </span>
              </li>
            </ul>

            <p className="mt-3 text-[11.5px] italic leading-normal text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
              Your tracker itself and your personal progress are safe — only the community data is
              lost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 border-t border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle)">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUnpublishing}
              className="flex-1 rounded-md border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[13px] font-bold text-(--text-secondary) transition hover:border-[rgba(26,23,20,0.25)] hover:text-(--text-primary) disabled:opacity-50 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-[#f2f0eb]"
            >
              Keep it public
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isUnpublishing}
              className="flex-1 rounded-md bg-[#b83232] px-4 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#9a2828] hover:shadow-[0_6px_20px_rgba(184,50,50,0.28)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#c84444] dark:hover:bg-[#b03030]"
            >
              {isUnpublishing ? 'Unpublishing…' : 'Yes, unpublish'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

type PublishedTrackerEditForm = {
  title: string;
  description: string;
  domain: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string;
};

type PublishedTrackerEditModalProps = {
  tracker: ITracker | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (form: PublishedTrackerEditForm) => Promise<void>;
};

const editFieldClass =
  'mt-2 w-full rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-3.5 py-3 text-[13px] text-(--text-primary) outline-none transition focus:border-(--brand-500) focus:ring-2 focus:ring-[rgba(184,76,43,0.12)] disabled:cursor-not-allowed disabled:opacity-60';

function PublishedTrackerEditModal({
  tracker,
  isSaving,
  onClose,
  onSave,
}: PublishedTrackerEditModalProps) {
  const [form, setForm] = useState<PublishedTrackerEditForm>(() => ({
    title: tracker?.title ?? '',
    description: tracker?.description ?? tracker?.goal ?? '',
    domain: tracker?.domain ?? tracker?.category ?? '',
    level: tracker?.level ?? 'beginner',
    tags: (tracker?.tags ?? []).join(', '),
  }));
  const isValid = form.title.trim().length >= 2 && Boolean(form.domain.trim());

  if (!tracker) return null;

  return (
    <Modal
      open
      onClose={onClose}
      preventClose={isSaving}
      ariaLabel="Edit published tracker"
      contentClassName="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto"
    >
      <h2 className="font-ui text-2xl font-extrabold text-(--text-primary)">
        Edit published tracker
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-(--text-secondary)">
        These changes update the tracker and its public community page.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-[12px] font-bold text-(--text-primary)">
          Title <span className="text-(--brand-500)">*</span>
          <input
            type="text"
            maxLength={120}
            value={form.title}
            disabled={isSaving}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            className={editFieldClass}
          />
        </label>

        <label className="block text-[12px] font-bold text-(--text-primary)">
          Description
          <textarea
            rows={4}
            maxLength={500}
            value={form.description}
            disabled={isSaving}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            className={`${editFieldClass} resize-none leading-6`}
          />
        </label>

        <div>
          <label
            htmlFor={`published-domain-${tracker._id}`}
            className="block text-[12px] font-bold text-(--text-primary)"
          >
            Domain <span className="text-(--brand-500)">*</span>
          </label>
          <DomainCombobox
            inputId={`published-domain-${tracker._id}`}
            value={form.domain}
            disabled={isSaving}
            onChange={(domain) => setForm((current) => ({ ...current, domain }))}
          />
        </div>

        <label className="block text-[12px] font-bold text-(--text-primary)">
          Difficulty
          <select
            value={form.level}
            disabled={isSaving}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                level: event.target.value as PublishedTrackerEditForm['level'],
              }))
            }
            className={editFieldClass}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label className="block text-[12px] font-bold text-(--text-primary)">
          Tags
          <input
            type="text"
            value={form.tags}
            disabled={isSaving}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            placeholder="react, frontend, interview"
            className={editFieldClass}
          />
          <span className="mt-1.5 block text-[11px] font-normal text-(--text-secondary)">
            Separate up to 10 tags with commas.
          </span>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-(--border-subtle) pt-5">
        <button
          type="button"
          disabled={isSaving}
          onClick={onClose}
          className="rounded-xl border border-(--border-subtle) px-4 py-2.5 text-[13px] font-bold text-(--text-secondary) disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!isValid || isSaving}
          onClick={() => void onSave(form)}
          className="rounded-xl bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#141412]"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}

// Small globe icon for the modal list item
const GlobeSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.25" />
    <ellipse cx="7" cy="7" rx="2.25" ry="5.25" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M1.75 7H12.25M2.25 4.5H11.75M2.25 9.5H11.75"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Published Tracker Card ────────────────────────────────────────────────────

type PublishedTrackerCardProps = {
  tracker: ITracker;
  onView: (trackerId: string) => void;
  onEdit: (tracker: ITracker) => void;
  onRequestUnpublish: (tracker: ITracker) => void;
  isUnpublishing: boolean;
  canUnpublish: boolean;
};

function PublishedTrackerCard({
  tracker,
  onView,
  onEdit,
  onRequestUnpublish,
  isUnpublishing,
  canUnpublish,
}: PublishedTrackerCardProps) {
  const levelCfg = levelColors[tracker.level ?? 'beginner'] ?? levelColors.beginner;
  const progress = normalizePercentage(tracker.progressPercent);
  const totalTopics = Number(tracker.topicsCount ?? tracker.totalTopics ?? 0);
  const completedTopics = Number(tracker.completedTopics ?? 0);
  const remainingTopics = Math.max(0, totalTopics - completedTopics);

  const handleCopyLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const url = `${window.location.origin}/community/trackers/${tracker._id}`;
    void navigator.clipboard.writeText(url).then(
      () => toast.success('Public tracker link copied'),
      () => toast.error('Link not copied', 'Copy the address from your browser instead.')
    );
  };

  return (
    <article className="group relative flex min-h-107.5 flex-col overflow-hidden rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) transition duration-200 hover:-translate-y-1 hover:border-[rgba(45,106,71,0.28)] hover:shadow-(--shadow-2)">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(45,106,71,0.08)] blur-3xl dark:bg-[rgba(92,201,138,0.08)]" />
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-(--success) to-transparent opacity-45" />

      <header className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] px-2.5 py-1 text-[10.5px] font-extrabold text-(--success)">
            <span className="h-2 w-2 rounded-full bg-(--success)" /> Public
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10.5px] font-bold capitalize',
              levelCfg.text,
              levelCfg.bg,
              levelCfg.border
            )}
          >
            {tracker.level ?? 'beginner'}
          </span>
          <span className="rounded-full border border-(--border-subtle) bg-[rgba(26,23,20,0.03)] px-2.5 py-1 text-[10.5px] font-semibold text-(--text-secondary) dark:bg-white/4">
            {domainLabel(tracker.domain ?? tracker.category)}
          </span>
        </div>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[rgba(45,106,71,0.18)] bg-[rgba(45,106,71,0.07)] text-(--success)"
          aria-label="Published tracker"
        >
          <GlobeSmallIcon />
        </span>
      </header>

      <div className="relative mt-5 flex-1">
        <h2 className="line-clamp-2 font-ui text-[22px] font-extrabold leading-[1.18] tracking-[-0.45px] text-(--text-primary) transition group-hover:text-(--success)">
          {tracker.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-11 text-[13.5px] leading-[1.6] text-(--text-secondary)">
          {tracker.description ??
            tracker.goal ??
            'A public learning roadmap shared with the community.'}
        </p>
      </div>

      <section
        className="relative mt-5 rounded-xl border border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.05)] p-4 dark:bg-[rgba(92,201,138,0.06)]"
        aria-label={`${progress}% complete`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-(--success)">
              Your progress
            </p>
            <p className="mt-1 text-[12px] text-(--text-secondary)">
              Published {formatDate(tracker.publishedAt)}
            </p>
          </div>
          <div className="font-ui text-[28px] font-extrabold leading-none tracking-[-0.8px] text-(--text-primary)">
            {progress}%
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(26,23,20,0.08)] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#70d49a] to-(--success) transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ['Topics', totalTopics],
            ['Completed', completedTopics],
            ['Remaining', remainingTopics],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-(--border-subtle) bg-(--surface-card) px-3 py-2.5 text-center dark:bg-white/3"
            >
              <div className="text-[15px] font-extrabold leading-none text-(--text-primary)">
                {value}
              </div>
              <div className="mt-1 text-[10.5px] font-semibold text-(--text-secondary)">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative mt-auto pt-5">
        <div className="flex gap-2.5 max-[420px]:flex-col">
          <button
            type="button"
            onClick={() => onView(tracker._id)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-4 text-[13px] font-extrabold text-[#fdf8f5] shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:-translate-y-px hover:bg-(--brand-600) dark:text-[#141412]"
          >
            <EyeIcon /> View
          </button>
          <button
            type="button"
            onClick={() => onEdit(tracker)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[1.5px] border-(--border-subtle) px-4 text-[13px] font-bold text-(--text-secondary) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.06)] hover:text-(--brand-500)"
          >
            <EditIcon /> Edit
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[1.5px] border-(--border-subtle) px-4 text-[13px] font-bold text-(--text-secondary) transition hover:-translate-y-px hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.06)] hover:text-(--brand-500)"
          >
            <CopyIcon />
            Copy link
          </button>
        </div>

        <div className="mt-3 flex min-h-9 items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
          <span className="text-[11.5px] font-semibold text-(--text-secondary)">
            Community visibility is active
          </span>
          {canUnpublish ? (
            <button
              type="button"
              disabled={isUnpublishing}
              onClick={() => onRequestUnpublish(tracker)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-bold text-[#b83232] transition hover:bg-[rgba(200,50,50,0.08)] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#ff8c8c]"
            >
              <UnpublishIcon />
              {isUnpublishing ? 'Unpublishing…' : 'Unpublish'}
            </button>
          ) : (
            <span className="text-[10.5px] font-semibold text-[#8a6509] dark:text-[#f4c95d]">
              Owner controls visibility
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}

// ─── Skeleton page ─────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <AppShellBoundary>
      <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
        <header className="relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) sm:p-6">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
            <div className="min-w-0">
              <SkeletonBlock className="h-7 w-36 rounded-full" />
              <SkeletonBlock className="mt-3 h-10 w-[min(34rem,86%)] rounded-xl" />
              <SkeletonBlock className="mt-3 h-4 w-[min(42rem,96%)]" />
              <SkeletonBlock className="mt-2 h-4 w-[min(32rem,76%)]" />
              <SkeletonBlock className="mt-5 h-10 w-32 rounded-lg" />
            </div>
            <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) p-4.5">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="mt-3 h-9 w-14 rounded-lg" />
              <SkeletonBlock className="mt-3 h-3 w-52" />
            </div>
          </div>
        </header>
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-3">
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
          <SkeletonBlock className="h-4 w-[min(28rem,72%)]" />
        </div>
        <div className="grid grid-cols-3 gap-5 max-[1220px]:grid-cols-2 max-[760px]:grid-cols-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <PublishedCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </AppShellBoundary>
  );
}

// ─── Summary strip ─────────────────────────────────────────────────────────────

function SummaryStrip({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[rgba(45,106,71,0.16)] bg-[rgba(45,106,71,0.05)] px-4 py-3 dark:border-[rgba(92,201,138,0.15)] dark:bg-[rgba(92,201,138,0.06)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(45,106,71,0.12)] text-(--success) dark:bg-[rgba(92,201,138,0.14)] dark:text-(--success)">
        <GlobeIcon />
      </div>
      <p className="text-[12.5px] leading-normal text-(--success) dark:text-(--success)">
        <span className="font-bold">{count}</span> tracker
        {count === 1 ? '' : 's'} currently <span className="font-bold">live</span> in the community.
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyPublishedTrackersPage() {
  const navigate = useNavigate();
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [confirmTracker, setConfirmTracker] = useState<ITracker | null>(null);
  const [editTracker, setEditTracker] = useState<ITracker | null>(null);

  const trackersQuery = useTrackers({
    status: 'all',
    domain: 'all',
    sortBy: 'lastActive',
    page: 1,
    limit: paginationConfig.batchLimit,
  });
  const unpublishMutation = useUnpublishTracker();
  const updateTrackerMutation = useUpdateTracker();

  const allTrackers = trackersQuery.data?.trackers ?? [];
  const publishedTrackers = allTrackers.filter(
    (t) => t.visibility === 'public' || Boolean(t.publishedAt)
  );

  const isLoading = trackersQuery.isLoading && !trackersQuery.data;

  const handleRequestUnpublish = (tracker: ITracker) => {
    if (tracker.clanRole === 'co_owner') return;
    setConfirmTracker(tracker);
  };

  const handleConfirmUnpublish = async () => {
    if (!confirmTracker) return;
    setUnpublishingId(confirmTracker._id);
    try {
      await unpublishMutation.mutateAsync(confirmTracker._id);
      setConfirmTracker(null);
      toast.success('Tracker unpublished');
    } catch (error) {
      toast.error(
        'Tracker not unpublished',
        getUserFacingError(error, 'Unable to unpublish this tracker.')
      );
    } finally {
      setUnpublishingId(null);
    }
  };

  const handleCancelUnpublish = () => {
    setConfirmTracker(null);
  };

  const handleEdit = (tracker: ITracker) => {
    setEditTracker(tracker);
  };

  const handleSaveEdit = async (form: PublishedTrackerEditForm) => {
    if (!editTracker) return;
    try {
      await updateTrackerMutation.mutateAsync({
        trackerId: editTracker._id,
        title: form.title.trim(),
        description: form.description.trim(),
        domain: form.domain.trim(),
        level: form.level,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setEditTracker(null);
      toast.success('Published tracker updated');
    } catch (error) {
      toast.error(
        'Published tracker not updated',
        getUserFacingError(error, 'Unable to update this tracker.')
      );
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <AppShellBoundary>
      {/* ── Unpublish confirmation modal ── */}
      <UnpublishConfirmModal
        tracker={confirmTracker}
        isUnpublishing={unpublishingId === confirmTracker?._id}
        onConfirm={handleConfirmUnpublish}
        onCancel={handleCancelUnpublish}
      />
      <PublishedTrackerEditModal
        key={editTracker?._id ?? 'closed'}
        tracker={editTracker}
        isSaving={updateTrackerMutation.isPending}
        onClose={() => {
          if (!updateTrackerMutation.isPending) setEditTracker(null);
        }}
        onSave={handleSaveEdit}
      />

      <div className="mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]">
        <PageHero
          eyebrow="Published library"
          title={
            <>
              Public roadmaps <span className="text-(--success)">you manage</span>
            </>
          }
          description={
            <>
              {publishedTrackers.length > 0
                ? `${publishedTrackers.length} tracker${publishedTrackers.length === 1 ? '' : 's'} shared with the community. Review the public page, copy its link, or manage visibility.`
                : 'Share your learning roadmaps with the community and help others grow.'}
            </>
          }
          compact
          actions={
            <button
              type="button"
              onClick={() => navigate(ROUTES.trackers)}
              className="inline-flex min-h-10 items-center rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-4 text-[13px] font-bold text-(--text-secondary) transition hover:-translate-y-0.5 hover:border-(--brand-500) hover:text-(--brand-500)"
            >
              Back to trackers
            </button>
          }
          aside={
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                Community footprint
              </div>
              <div className="mt-3 font-ui text-[34px] font-extrabold leading-none text-(--success)">
                {publishedTrackers.length}
              </div>
              <div className="mt-2 text-[12px] text-(--text-secondary)">
                Public roadmap{publishedTrackers.length === 1 ? '' : 's'} available to learners.
              </div>
            </div>
          }
        />

        {/* ── Summary strip (only when trackers exist) ── */}
        <SummaryStrip count={publishedTrackers.length} />

        {/* ── Grid or empty state ── */}
        {publishedTrackers.length > 0 ? (
          <section className="grid grid-cols-3 gap-5 max-[1220px]:grid-cols-2 max-[760px]:grid-cols-1">
            {publishedTrackers.map((tracker) => (
              <PublishedTrackerCard
                key={tracker._id}
                tracker={tracker}
                onView={(id) => navigate(`/community/trackers/${id}`)}
                onEdit={handleEdit}
                onRequestUnpublish={handleRequestUnpublish}
                isUnpublishing={unpublishingId === tracker._id}
                canUnpublish={tracker.clanRole !== 'co_owner'}
              />
            ))}
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-2xl border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) p-12 text-center shadow-(--shadow-1) max-[640px]:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-32 max-w-md bg-[rgba(45,106,71,0.06)] blur-3xl" />
            <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border-[1.5px] border-[rgba(45,106,71,0.20)] bg-[rgba(45,106,71,0.08)] text-(--success)">
              <GlobeIcon />
            </div>
            <h2 className="relative mt-5 font-ui text-[26px] font-extrabold text-(--text-primary)">
              Nothing published yet
            </h2>
            <p className="relative mx-auto mt-2 max-w-lg text-[13.5px] leading-[1.65] text-(--text-secondary)">
              Open a tracker card and use Publish when the roadmap is ready for other learners to
              discover.
            </p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.trackers)}
              className="relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-(--success) px-5 text-[13px] font-extrabold text-white transition hover:-translate-y-px hover:bg-[#245638] dark:text-[#141412]"
            >
              Go to my trackers
            </button>
          </section>
        )}
      </div>
    </AppShellBoundary>
  );
}
