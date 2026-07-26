import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../routes/config/route-paths';

import CommunityErrorState from '../components/shared/CommunityErrorState';
import CommunityFilters from '../components/browse/CommunityFilters';
import CommunityLayout from '../components/shared/CommunityLayout';
import CommunityPageSkeleton from '../components/shared/CommunityPageSkeleton';
import CloneTrackerConfirmDialog from '../components/shared/CloneTrackerConfirmDialog';
import CommunityPagination from '../components/shared/CommunityPagination';
import StatCard from '../../../../components/data-display/StatCard';
import CommunityTrackerCard from '../components/browse/CommunityTrackerCard';
import { BookOpenIcon } from '../components/icons/CommunityIcons';
import { COMMUNITY_PAGE_LIMIT, COMMUNITY_STAT_ACCENTS } from '../constants/community.constants';
import { useCloneCommunityTracker } from '../hooks/useCloneCommunityTracker';
import { useCommunityBrowse } from '../hooks/useCommunityBrowse';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { useCommunitySearchState } from '../hooks/useCommunitySearchState';
import { getApiErrorMessage } from '../utils/community-formatters';
import { communityPageClass, cn } from '../utils/community-ui';
import { validateSearch } from '../utils/community-validation';
import type { ICommunityTracker } from '../types/community.types';

export default function CommunityBrowsePage() {
  const navigate = useNavigate();
  const [activeCloneId, setActiveCloneId] = useState<string | null>(null);
  const [cloneCandidate, setCloneCandidate] = useState<ICommunityTracker | null>(null);

  const {
    search,
    selectedTopics,
    minRating,
    verifiedOnly,
    sort,
    page,
    setSearch,
    setSelectedTopics,
    setMinRating,
    setVerifiedOnly,
    setSort,
    setPage,
    clearFilters,
  } = useCommunitySearchState();

  const debouncedSearch = useDebouncedValue(search, 400);
  const searchError = validateSearch(search);
  const debouncedSearchError = validateSearch(debouncedSearch);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem('imminiq.community.recent-searches') ?? '[]'
      );
      return Array.isArray(stored)
        ? stored.filter((value): value is string => typeof value === 'string').slice(0, 8)
        : [];
    } catch {
      return [];
    }
  });
  const hasDiscoveryFilters =
    Boolean(debouncedSearch.trim()) ||
    selectedTopics.length > 0 ||
    minRating !== null ||
    verifiedOnly ||
    sort !== 'top-rated';

  useEffect(() => {
    const normalized = debouncedSearch.trim();
    if (debouncedSearchError || normalized.length < 2) return;
    const timer = window.setTimeout(() => {
      setRecentSearches((current) => {
        const next = [
          normalized,
          ...current.filter((value) => value.toLowerCase() !== normalized.toLowerCase()),
        ].slice(0, 8);
        window.localStorage.setItem('imminiq.community.recent-searches', JSON.stringify(next));
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, debouncedSearchError, recentSearches]);

  const browseQuery = useMemo(
    () => ({
      search: debouncedSearchError ? '' : debouncedSearch,
      topics: selectedTopics,
      minRating,
      verifiedOnly,
      sort,
      page: hasDiscoveryFilters ? page : 1,
      limit: COMMUNITY_PAGE_LIMIT,
      recentSearches: hasDiscoveryFilters ? [] : recentSearches,
    }),
    [
      debouncedSearch,
      debouncedSearchError,
      hasDiscoveryFilters,
      minRating,
      page,
      recentSearches,
      selectedTopics,
      sort,
      verifiedOnly,
    ]
  );

  const browse = useCommunityBrowse(browseQuery);
  const cloneTracker = useCloneCommunityTracker();

  const handleClone = (trackerId: string) => {
    const tracker = browse.data?.trackers.find((item) => item._id === trackerId);
    if (tracker) setCloneCandidate(tracker);
  };

  const confirmClone = () => {
    if (!cloneCandidate || cloneTracker.isPending) return;

    setActiveCloneId(cloneCandidate._id);

    cloneTracker.mutate(
      { trackerId: cloneCandidate._id },
      {
        onSuccess: () => {
          setActiveCloneId(null);
          setCloneCandidate(null);
        },
        onError: () => {
          setActiveCloneId(null);
          setCloneCandidate(null);
        },
      }
    );
  };

  const handleOpenTracker = (trackerId: string) => {
    navigate(`/community/trackers/${trackerId}`);
  };

  const isInitialLoading = browse.isLoading && !browse.data;
  const isUpdatingResults = browse.isFetching && Boolean(browse.data);

  if (isInitialLoading) {
    return <CommunityPageSkeleton variant="browse" />;
  }

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        {browse.isError || !browse.data ? (
          <CommunityErrorState
            title="Community unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading community data.',
              browse.error?.response?.data?.message
            )}
            actionLabel="Try again"
            onAction={() => void browse.refetch()}
          />
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card) sm:p-7 lg:p-9">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(184,76,43,0.18)_0%,transparent_68%)] dark:bg-[radial-gradient(circle,rgba(232,129,106,0.18)_0%,transparent_68%)]" />
              <div className="relative grid items-center gap-7 lg:grid-cols-[1.35fr_0.65fr]">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.18)] bg-[rgba(184,76,43,0.08)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-(--brand-500) dark:border-[rgba(232,129,106,0.24)] dark:bg-[rgba(232,129,106,0.10)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--success) shadow-[0_0_10px_var(--success)]" />
                    Community library
                  </div>
                  <h1 className="max-w-180 font-ui text-[clamp(30px,4.5vw,52px)] font-extrabold leading-[1.04] tracking-[-1.5px] text-(--text-primary)">
                    Learn from paths shaped by{' '}
                    <span className="text-(--brand-500)">real learners.</span>
                  </h1>
                  <p className="mt-4 max-w-155 text-[14px] leading-6 text-(--text-secondary) sm:text-[15px]">
                    Discover proven roadmaps, clone what works, and help the community verify the
                    clearest learning paths.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.verifyAndEarn)}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--brand-500) px-5 text-[13px] font-bold text-(--brand-contrast) shadow-[0_8px_22px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600)"
                    >
                      Review &amp; earn {browse.data.verifyBanner.rewardCoins} coins
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.publishedTrackers)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-(--border-subtle) bg-(--surface-elevated) px-5 text-[13px] font-bold text-(--text-primary) transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.32)] hover:text-(--brand-500)"
                    >
                      <BookOpenIcon />
                      My publications
                    </button>
                  </div>

                  {browse.data.topics.length > 0 && (
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <span className="mr-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-(--text-muted)">
                        Popular
                      </span>
                      {browse.data.topics.slice(0, 5).map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSelectedTopics([topic])}
                          className="rounded-full border border-(--border-subtle) bg-(--surface-canvas) px-3 py-1.5 text-[11px] font-semibold text-(--text-secondary) transition hover:border-[rgba(184,76,43,0.3)] hover:text-(--brand-500)"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <aside
                  className="rounded-2xl border border-[rgba(184,76,43,0.18)] bg-[color-mix(in_srgb,var(--surface-elevated)_86%,var(--brand-500)_4%)] p-5 shadow-(--shadow-1)"
                  aria-label="Live community activity"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-ui text-[17px] font-extrabold text-(--text-primary)">
                      Live community
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-(--success)">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--success)" /> Active
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                        Awaiting review
                      </div>
                      <div className="mt-2 font-ui text-2xl font-extrabold text-(--brand-500)">
                        {browse.data.verifyBanner.queueCount}
                      </div>
                    </div>
                    <div className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted)">
                        Weekly reviewers
                      </div>
                      <div className="mt-2 font-ui text-2xl font-extrabold text-(--success)">
                        {browse.data.verifyBanner.activeReviewersThisWeek}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[12px] leading-5 text-(--text-secondary)">
                    Every review strengthens recommendations for the next learner.
                  </p>
                </aside>
              </div>
            </section>

            {cloneTracker.isError && (
              <div className="rounded-xl border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-4 py-3 text-[12px] leading-normal text-(--brand-500) dark:border-[rgba(232,129,106,0.25)] dark:text-(--brand-500)">
                {getApiErrorMessage(
                  'Unable to clone tracker. Please try again.',
                  cloneTracker.error?.response?.data?.message
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {browse.data.stats.map((card, index) => (
                <StatCard
                  key={card.label}
                  {...card}
                  accent={COMMUNITY_STAT_ACCENTS[index] ?? COMMUNITY_STAT_ACCENTS[0]}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--brand-500)">
                  {hasDiscoveryFilters ? 'Browse library' : 'Personalised discovery'}
                </div>
                <h2 className="mt-1 font-ui text-[24px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
                  {hasDiscoveryFilters ? 'Search community roadmaps' : 'Suggestions for you'}
                </h2>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-(--text-muted)">
                {browse.data.pagination.total} {hasDiscoveryFilters ? 'result' : 'suggestion'}
                {browse.data.pagination.total !== 1 ? 's' : ''}
              </span>
            </div>

            <CommunityFilters
              search={search}
              topics={browse.data.topics}
              selectedTopics={selectedTopics}
              minRating={minRating}
              verifiedOnly={verifiedOnly}
              sort={sort}
              resultCount={browse.data.pagination.total}
              onSearchChange={setSearch}
              onTopicsChange={setSelectedTopics}
              onMinRatingChange={setMinRating}
              onVerifiedOnlyChange={setVerifiedOnly}
              onSortChange={setSort}
              onClearAll={clearFilters}
            />

            <div className="min-h-5">
              {searchError ? (
                <p className="text-[12px] font-medium text-(--brand-500) dark:text-(--brand-500)">
                  {searchError}
                </p>
              ) : isUpdatingResults ? (
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#9b9a92]">
                  Updating results…
                </p>
              ) : null}
            </div>

            <div
              className={cn('transition-opacity duration-200', isUpdatingResults && 'opacity-70')}
            >
              {browse.data.trackers.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[540px]:grid-cols-1">
                  {browse.data.trackers.map((tracker) => (
                    <CommunityTrackerCard
                      key={tracker._id}
                      tracker={tracker}
                      cloning={activeCloneId === tracker._id && cloneTracker.isPending}
                      onClone={handleClone}
                      onOpen={handleOpenTracker}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-[1.5px] border-dashed border-(--border-subtle) bg-(--surface-card) px-6 py-10 text-center dark:border-(--border-subtle) dark:bg-(--surface-card)">
                  <h2 className="font-ui text-[20px] font-extrabold text-(--text-primary) dark:text-(--text-primary)">
                    No trackers found
                  </h2>
                  <p className="mt-2 text-[13px] leading-normal text-(--text-secondary) dark:text-(--text-secondary)">
                    Try clearing filters or searching another topic.
                  </p>
                </div>
              )}
            </div>

            {hasDiscoveryFilters && (
              <CommunityPagination
                pagination={browse.data.pagination}
                onPageChange={setPage}
                disabled={browse.isFetching}
              />
            )}
          </>
        )}
      </div>
      <CloneTrackerConfirmDialog
        open={Boolean(cloneCandidate)}
        trackerTitle={cloneCandidate?.title ?? ''}
        isLoading={cloneTracker.isPending}
        onConfirm={confirmClone}
        onClose={() => {
          if (!cloneTracker.isPending) setCloneCandidate(null);
        }}
      />
    </CommunityLayout>
  );
}
