import { useEffect, useMemo, useRef, useState } from 'react';

import {
  COMMUNITY_RATING_OPTIONS,
  COMMUNITY_SORT_OPTIONS,
} from '../../constants/community.constants';
import type { CommunitySort } from '../../types/community.types';
import { cn } from '../../utils/community-ui';
import {
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  StarFilledIcon,
  VerifiedIcon,
  XSmallIcon,
} from '../icons/CommunityIcons';

interface ICommunityFiltersProps {
  search: string;
  topics: string[];
  selectedTopics: string[];
  minRating: number | null;
  verifiedOnly: boolean;
  sort: CommunitySort;
  resultCount: number;
  onSearchChange: (search: string) => void;
  onTopicsChange: (topics: string[]) => void;
  onMinRatingChange: (rating: number | null) => void;
  onVerifiedOnlyChange: (verifiedOnly: boolean) => void;
  onSortChange: (sort: CommunitySort) => void;
  onClearAll: () => void;
}

export default function CommunityFilters({
  search,
  topics,
  selectedTopics,
  minRating,
  verifiedOnly,
  sort,
  resultCount,
  onSearchChange,
  onTopicsChange,
  onMinRatingChange,
  onVerifiedOnlyChange,
  onSortChange,
  onClearAll,
}: ICommunityFiltersProps) {
  const [topicSearch, setTopicSearch] = useState('');
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTopicDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredTopics = useMemo(() => {
    const lowered = topicSearch.trim().toLowerCase();

    if (!lowered) return topics;

    return topics.filter((topic) => topic.toLowerCase().includes(lowered));
  }, [topicSearch, topics]);

  const activeFilterCount =
    selectedTopics.length + (minRating !== null ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const isAnyFilterActive = Boolean(search.trim()) || activeFilterCount > 0 || sort !== 'top-rated';

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter((item) => item !== topic));
      return;
    }

    onTopicsChange([...selectedTopics, topic]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 max-w-105 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9a92]">
            <SearchIcon />
          </span>
          <input
            type="search"
            aria-label="Search community trackers"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search trackers…"
            className="w-full rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) py-2.25 pl-9 pr-4 text-[13px] text-(--text-primary) outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-primary)"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setTopicDropdownOpen((value) => !value)}
            aria-expanded={topicDropdownOpen}
            aria-haspopup="listbox"
            className={cn(
              'inline-flex min-w-40 items-center justify-between gap-2 rounded-xl border-[1.5px] px-4 py-2.25 text-[13px] font-medium transition',
              selectedTopics.length > 0
                ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-(--brand-500) dark:border-[rgba(232,129,106,0.35)] dark:text-(--brand-500)'
                : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-[rgba(184,76,43,0.22)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)'
            )}
          >
            {selectedTopics.length > 0
              ? `${selectedTopics.length} topic${selectedTopics.length > 1 ? 's' : ''}`
              : 'All topics'}
            <ChevronDownIcon />
          </button>

          {topicDropdownOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-64 overflow-hidden rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-[0_16px_44px_rgba(26,23,20,0.14)] dark:border-(--border-subtle) dark:bg-(--surface-card)">
              <div className="border-b border-[#e8ddd6] p-3 dark:border-white/8">
                <input
                  type="search"
                  aria-label="Search community topics"
                  value={topicSearch}
                  onChange={(event) => setTopicSearch(event.target.value)}
                  placeholder="Find topic…"
                  className="w-full rounded-lg border border-(--border-subtle) bg-white px-3 py-2 text-[12px] outline-none placeholder:text-[#9b9a92] focus:border-[rgba(184,76,43,0.3)] dark:border-(--border-subtle) dark:bg-(--surface-canvas) dark:text-(--text-primary)"
                />
              </div>

              <div className="max-h-60 overflow-y-auto p-2">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => {
                    const selected = selectedTopics.includes(topic);

                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] transition',
                          selected
                            ? 'bg-[rgba(184,76,43,0.09)] font-bold text-(--brand-500) dark:text-(--brand-500)'
                            : 'text-(--text-secondary) hover:bg-[rgba(26,23,20,0.04)] dark:text-(--text-secondary) dark:hover:bg-white/6'
                        )}
                      >
                        {topic}
                        {selected && <VerifiedIcon />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-[12px] text-[#9b9a92]">
                    No topics found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <select
          aria-label="Sort community trackers"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as CommunitySort)}
          className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) px-4 py-2.25 text-[13px] text-(--text-secondary) outline-none focus:border-[rgba(184,76,43,0.3)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)"
        >
          {COMMUNITY_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFilterPanelOpen((value) => !value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border-[1.5px] px-4 py-2.25 text-[13px] font-medium transition',
            filterPanelOpen || activeFilterCount > 0
              ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-(--brand-500) dark:border-[rgba(232,129,106,0.35)] dark:text-(--brand-500)'
              : 'border-(--border-subtle) bg-(--surface-card) text-(--text-secondary) hover:border-[rgba(184,76,43,0.22)] dark:border-(--border-subtle) dark:bg-(--surface-card) dark:text-(--text-secondary)'
          )}
        >
          <FilterIcon />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-(--brand-500) px-1 font-mono text-[9px] font-bold text-white dark:bg-(--brand-500) dark:text-(--text-primary)">
              {activeFilterCount}
            </span>
          )}
        </button>

        {isAnyFilterActive && (
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#9b9a92]">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-[12px] text-[#9b9a92] underline underline-offset-2 transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-mono text-[11px] text-(--brand-500) dark:border-[rgba(232,129,106,0.25)] dark:text-(--brand-500)"
            >
              {topic}
              <button
                type="button"
                aria-label={`Remove ${topic}`}
                onClick={() => onTopicsChange(selectedTopics.filter((item) => item !== topic))}
                className="opacity-60 transition hover:opacity-100"
              >
                <XSmallIcon />
              </button>
            </span>
          ))}
        </div>
      )}

      {filterPanelOpen && (
        <div className="rounded-2xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-4 dark:border-(--border-subtle) dark:bg-(--surface-card)">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#9b9a92]">
                Min rating
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_RATING_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onMinRatingChange(option.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                      minRating === option.value
                        ? 'border-[rgba(196,154,44,0.4)] bg-[rgba(196,154,44,0.12)] text-[#c49a2c]'
                        : 'border-(--border-subtle) bg-white text-(--text-secondary) hover:border-[rgba(184,76,43,0.2)] dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary)'
                    )}
                  >
                    {option.value !== null && (
                      <span className="text-[#c49a2c]">
                        <StarFilledIcon />
                      </span>
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden w-px self-stretch bg-[#e8ddd6] dark:bg-white/8 sm:block" />

            <div>
              <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#9b9a92]">
                Status
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onVerifiedOnlyChange(false)}
                  className={cn(
                    'rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                    !verifiedOnly
                      ? 'border-[rgba(184,76,43,0.35)] bg-[rgba(184,76,43,0.09)] text-(--brand-500) dark:text-(--brand-500)'
                      : 'border-(--border-subtle) bg-white text-(--text-secondary) hover:border-[rgba(184,76,43,0.2)] dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary)'
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => onVerifiedOnlyChange(true)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-[12px] font-medium transition',
                    verifiedOnly
                      ? 'border-[rgba(45,106,71,0.35)] bg-[rgba(45,106,71,0.09)] text-(--success) dark:text-(--success)'
                      : 'border-(--border-subtle) bg-white text-(--text-secondary) hover:border-[rgba(184,76,43,0.2)] dark:border-(--border-subtle) dark:bg-transparent dark:text-(--text-secondary)'
                  )}
                >
                  <VerifiedIcon /> Verified only
                </button>
              </div>
            </div>

            <div className="ml-auto flex items-end">
              <button
                type="button"
                onClick={() => {
                  onMinRatingChange(null);
                  onVerifiedOnlyChange(false);
                }}
                className="text-[12px] text-[#9b9a92] underline underline-offset-2 transition hover:text-(--brand-500) dark:hover:text-(--brand-500)"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
