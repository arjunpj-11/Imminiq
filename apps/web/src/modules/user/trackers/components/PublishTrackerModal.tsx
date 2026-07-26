import { useEffect, useState } from 'react';

import Modal from '../../../../components/overlays/Modal';
import { cn } from '../../../../lib/cn';
import type { ITracker } from '../types/tracker.types';
import { useTrackerDomains } from '../hooks/useTrackerQueries';

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11.5 3.5L3.5 11.5M3.5 3.5L11.5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
  </svg>
);

export type PublishFormData = {
  name: string;
  description: string;
  domain: string;
  difficulty: string;
  tags: string;
};

type PublishModalProps = {
  tracker: ITracker;
  isPublishing: boolean;
  publishError: string | null;
  onClose: () => void;
  onConfirm: (trackerId: string, data: PublishFormData) => Promise<void> | void;
};

const fieldLabel =
  'mb-1.5 block text-[11px] font-extrabold text-[var(--text-primary)] dark:text-[var(--text-primary)]';

const fieldInput =
  'w-full rounded-xl border-[1.5px] border-[var(--border-subtle)] bg-white px-3.5 py-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[#c0b8b0] transition-all duration-150 focus:border-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[rgba(184,76,43,0.14)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[var(--border-subtle)] dark:bg-[#26231f] dark:text-[var(--text-primary)] dark:placeholder:text-[#504840] dark:focus:border-[var(--brand-500)] dark:focus:ring-[rgba(232,129,106,0.16)]';

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

type DifficultyPickerProps = {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
};

function DifficultyPicker({ value, disabled = false, onChange }: DifficultyPickerProps) {
  return (
    <div className="flex gap-2">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(d.value)}
          className={cn(
            'flex-1 rounded-xl border-[1.5px] py-2.5 text-[12px] font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60',
            value === d.value
              ? 'border-(--brand-500) bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-(--brand-500) dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)'
              : 'border-(--border-subtle) bg-transparent text-(--text-secondary) hover:border-[rgba(184,76,43,0.30)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:border-[rgba(232,129,106,0.30)] dark:hover:text-(--brand-500)'
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

const useDebouncedValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
};

type DomainComboboxProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  inputId?: string;
};

export function DomainCombobox({
  value,
  disabled,
  onChange,
  inputId = 'publish-domain',
}: DomainComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedSearch = useDebouncedValue(value.trim(), 250);
  const domainsQuery = useTrackerDomains(debouncedSearch);
  const domains = domainsQuery.data ?? [];
  const hasExactMatch = domains.some(
    (domain) => domain.toLocaleLowerCase() === value.trim().toLocaleLowerCase()
  );
  const showCustomOption = Boolean(value.trim()) && !hasExactMatch;
  const optionCount = domains.length + (showCustomOption ? 1 : 0);

  const selectDomain = (domain: string) => {
    onChange(domain);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, optionCount - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (showCustomOption && activeIndex === 0) {
        selectDomain(value.trim());
        return;
      }
      const domainIndex = activeIndex - (showCustomOption ? 1 : 0);
      if (domainIndex >= 0 && domains[domainIndex]) selectDomain(domains[domainIndex]);
      else if (value.trim()) selectDomain(value.trim());
    }
  };

  return (
    <div className="relative">
      <input
        id={inputId}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${inputId}-options`}
        autoComplete="off"
        value={value}
        disabled={disabled}
        maxLength={80}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 100)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search or type a domain, e.g. English"
        className={cn(fieldInput, 'pr-9')}
      />
      <svg
        className="pointer-events-none absolute right-3 top-[21px] -translate-y-1/2 text-(--text-secondary)"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="m9 9 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>

      {open && (
        <div
          id={`${inputId}-options`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-(--border-subtle) bg-(--surface-card) p-1.5 shadow-[0_12px_36px_rgba(26,23,20,0.18)] dark:bg-[#26231f]"
          onMouseDown={(event) => event.preventDefault()}
        >
          {showCustomOption && (
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === 0}
              onClick={() => selectDomain(value.trim())}
              className={cn(
                'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-[13px] transition',
                activeIndex === 0
                  ? 'bg-[rgba(184,76,43,0.10)] text-(--brand-500)'
                  : 'text-(--text-primary) hover:bg-[rgba(184,76,43,0.07)]'
              )}
            >
              <span className="truncate">Use “{value.trim()}”</span>
              <span className="ml-3 shrink-0 font-mono text-[8px] uppercase tracking-wider text-(--brand-500)">
                New
              </span>
            </button>
          )}

          {domains.map((domain, index) => {
            const optionIndex = index + (showCustomOption ? 1 : 0);
            return (
              <button
                key={domain.toLocaleLowerCase()}
                type="button"
                role="option"
                aria-selected={activeIndex === optionIndex}
                onMouseEnter={() => setActiveIndex(optionIndex)}
                onClick={() => selectDomain(domain)}
                className={cn(
                  'w-full truncate rounded-sm px-3 py-2 text-left text-[13px] transition',
                  activeIndex === optionIndex
                    ? 'bg-[rgba(184,76,43,0.10)] text-(--brand-500)'
                    : 'text-(--text-primary) hover:bg-[rgba(184,76,43,0.07)]'
                )}
              >
                {domain}
              </button>
            );
          })}

          {domainsQuery.isFetching && (
            <div className="px-3 py-2.5 text-[12px] text-(--text-secondary)">
              Searching domains…
            </div>
          )}
          {!domainsQuery.isFetching && !domains.length && !showCustomOption && (
            <div className="px-3 py-2.5 text-[12px] text-(--text-secondary)">
              Start typing to add a domain.
            </div>
          )}
        </div>
      )}
      <p className="mt-1.5 text-[11px] leading-[1.45] text-(--text-secondary)">
        Choose a saved domain or type a new one. Up to 10 matching domains are shown.
      </p>
    </div>
  );
}

export default function PublishTrackerModal({
  tracker,
  isPublishing,
  publishError,
  onClose,
  onConfirm,
}: PublishModalProps) {
  const [form, setForm] = useState<PublishFormData>({
    name: tracker.title ?? '',
    description: tracker.description ?? tracker.goal ?? '',
    domain: tracker.domain ?? tracker.category ?? '',
    difficulty: tracker.level ?? 'intermediate',
    tags: '',
  });

  const setField =
    (field: keyof PublishFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = form.name.trim().length > 0 && form.domain.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || isPublishing) return;
    await onConfirm(tracker._id, {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      domain: form.domain.trim(),
      difficulty: form.difficulty.trim(),
      tags: form.tags.trim(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      titleId="publish-modal-title"
      descriptionId="publish-modal-description"
      ariaLabel="Publish tracker"
      preventClose={isPublishing}
      overlayClassName="items-end p-0 sm:items-center sm:p-4"
      contentClassName="flex max-h-[calc(100dvh-0.75rem)] w-full !max-w-[540px] flex-col overflow-hidden rounded-t-3xl border-t border-x border-[var(--border-subtle)] bg-[var(--surface-card)] p-0 shadow-[0_-8px_48px_rgba(26,23,20,0.18)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[var(--radius-xl)] sm:border-[1.5px] sm:shadow-[0_24px_72px_rgba(26,23,20,0.24)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]"
    >
      <div className="flex shrink-0 justify-center pb-1 pt-3 sm:hidden">
        <div className="h-1 w-10 rounded-full bg-(--border-subtle) dark:bg-white/15" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-2.5 py-0.5 text-[10px] font-extrabold text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)">
              <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true">
                <circle cx="3" cy="3" r="3" />
              </svg>
              Publishing
            </div>
            <h2
              id="publish-modal-title"
              className="font-ui text-[25px] font-extrabold leading-[1.15] tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)"
            >
              Share your tracker
            </h2>
            <p
              id="publish-modal-description"
              className="mt-1.5 text-[13px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)"
            >
              Fill in the details so others can discover and learn from your roadmap.
            </p>
          </div>
          <button
            type="button"
            disabled={isPublishing}
            onClick={onClose}
            aria-label="Close publish modal"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--text-secondary) transition hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:text-(--text-secondary) dark:hover:bg-[rgba(232,129,106,0.10)] dark:hover:text-(--brand-500)"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-(--brand-500) dark:text-(--brand-500)">
            01
          </span>
          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-(--text-secondary) dark:text-(--text-secondary)">
            Basic info
          </span>
          <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/9" />
        </div>

        <div className="mb-4 mt-3 space-y-4">
          <div>
            <label htmlFor="publish-name" className={fieldLabel}>
              Tracker name <span className="text-(--brand-500)">*</span>
            </label>
            <input
              id="publish-name"
              type="text"
              value={form.name}
              disabled={isPublishing}
              onChange={setField('name')}
              placeholder="e.g. DSA Mastery — Striver Sheet"
              required
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="publish-description" className={fieldLabel}>
              Description
            </label>
            <textarea
              id="publish-description"
              value={form.description}
              disabled={isPublishing}
              onChange={setField('description')}
              rows={3}
              placeholder="What will learners gain from this tracker?"
              className={cn(fieldInput, 'resize-none leading-relaxed')}
            />
          </div>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-(--brand-500) dark:text-(--brand-500)">
            02
          </span>
          <span className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-(--text-secondary) dark:text-(--text-secondary)">
            Categorise
          </span>
          <div className="h-px flex-1 bg-(--border-subtle) dark:bg-white/9" />
        </div>

        <div className="mb-4 mt-3 space-y-4">
          <div>
            <label htmlFor="publish-domain" className={fieldLabel}>
              Domain <span className="text-(--brand-500)">*</span>
            </label>
            <DomainCombobox
              value={form.domain}
              disabled={isPublishing}
              onChange={(domain) => setForm((previous) => ({ ...previous, domain }))}
            />
          </div>
          <div>
            <p className={cn(fieldLabel, 'mb-2')}>Difficulty level</p>
            <DifficultyPicker
              value={form.difficulty}
              disabled={isPublishing}
              onChange={(v) => setForm((prev) => ({ ...prev, difficulty: v }))}
            />
          </div>
          <div>
            <label htmlFor="publish-tags" className={fieldLabel}>
              Tags{' '}
              <span className="normal-case font-normal tracking-normal opacity-60">
                — comma separated
              </span>
            </label>
            <input
              id="publish-tags"
              type="text"
              value={form.tags}
              disabled={isPublishing}
              onChange={setField('tags')}
              placeholder="algorithms, coding, interview-prep"
              className={fieldInput}
            />
          </div>
        </div>

        {publishError && (
          <div className="mb-4 rounded-md border border-[rgba(200,50,50,0.22)] bg-[rgba(200,50,50,0.08)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#b83232] dark:border-[rgba(255,120,120,0.20)] dark:bg-[rgba(255,120,120,0.08)] dark:text-[#ff8c8c]">
            {publishError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t max-[460px]:flex-col-reverse max-[460px]:items-stretch border-(--border-subtle) pt-5 dark:border-(--border-subtle)">
          <p className="text-[11px] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
            <span className="text-(--brand-500)">*</span> required fields
          </p>
          <div className="flex items-center gap-2.5 max-[460px]:w-full">
            <button
              type="button"
              disabled={isPublishing}
              onClick={onClose}
              className="rounded-xl border-[1.5px] border-(--border-subtle) px-4 py-2.5 text-[13px] font-semibold text-(--text-secondary) transition hover:bg-[rgba(26,23,20,0.05)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isValid || isPublishing}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-500) px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#9a3e23] hover:shadow-[0_6px_20px_rgba(184,76,43,0.30)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
            >
              {isPublishing ? (
                <>
                  <SpinnerIcon />
                  Publishing...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path
                      d="M6.5 1L11.5 6.5L6.5 12"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.5 6.5H11.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                  Publish tracker
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
