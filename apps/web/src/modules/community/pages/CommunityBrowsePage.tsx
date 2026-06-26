// apps/web/src/modules/community/pages/CommunityBrowsePage.tsx

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CommunityErrorState from '../components/CommunityErrorState'
import CommunityFilters from '../components/CommunityFilters'
import CommunityLayout from '../components/CommunityLayout'
import CommunityPageSkeleton from '../components/CommunityPageSkeleton'
import CommunityPagination from '../components/CommunityPagination'
import CommunityStatCard from '../components/CommunityStatCard'
import CommunityTrackerCard from '../components/CommunityTrackerCard'
import VerifyEarnBanner from '../components/VerifyEarnBanner'
import { BookOpenIcon } from '../components/icons/CommunityIcons'
import {
  COMMUNITY_PAGE_LIMIT,
  COMMUNITY_STAT_ACCENTS,
} from '../constants/community.constants'
import { useCloneCommunityTracker } from '../hooks/useCloneCommunityTracker'
import { useCommunityBrowse } from '../hooks/useCommunityBrowse'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useCommunityStore } from '../store/useCommunityStore'
import { getApiErrorMessage } from '../utils/community-formatters'
import { communityPageClass, cn } from '../utils/community-ui'
import { validateSearch } from '../utils/community-validation'

export default function CommunityBrowsePage() {
  const navigate = useNavigate()
  const [activeCloneId, setActiveCloneId] = useState<string | null>(null)

  const search = useCommunityStore((state) => state.search)
  const selectedTopics = useCommunityStore((state) => state.selectedTopics)
  const minRating = useCommunityStore((state) => state.minRating)
  const verifiedOnly = useCommunityStore((state) => state.verifiedOnly)
  const sort = useCommunityStore((state) => state.sort)
  const page = useCommunityStore((state) => state.page)

  const setSearch = useCommunityStore((state) => state.setSearch)
  const setSelectedTopics = useCommunityStore((state) => state.setSelectedTopics)
  const setMinRating = useCommunityStore((state) => state.setMinRating)
  const setVerifiedOnly = useCommunityStore((state) => state.setVerifiedOnly)
  const setSort = useCommunityStore((state) => state.setSort)
  const setPage = useCommunityStore((state) => state.setPage)
  const clearFilters = useCommunityStore((state) => state.clearFilters)

  const debouncedSearch = useDebouncedValue(search, 400)
  const searchError = validateSearch(search)
  const debouncedSearchError = validateSearch(debouncedSearch)

  const browseQuery = useMemo(
    () => ({
      search: debouncedSearchError ? '' : debouncedSearch,
      topics: selectedTopics,
      minRating,
      verifiedOnly,
      sort,
      page,
      limit: COMMUNITY_PAGE_LIMIT,
    }),
    [
      debouncedSearch,
      debouncedSearchError,
      minRating,
      page,
      selectedTopics,
      sort,
      verifiedOnly,
    ],
  )

  const browse = useCommunityBrowse(browseQuery)
  const cloneTracker = useCloneCommunityTracker()

  const handleClone = (trackerId: string) => {
    setActiveCloneId(trackerId)

    cloneTracker.mutate(
      { trackerId },
      {
        onSuccess: () => {
          setActiveCloneId(null)
        },
        onError: () => {
          setActiveCloneId(null)
        },
      },
    )
  }

  const handleOpenTracker = (trackerId: string) => {
  navigate(`/community/trackers/${trackerId}`)
}

  const isInitialLoading = browse.isLoading && !browse.data
  const isUpdatingResults = browse.isFetching && Boolean(browse.data)

  if (isInitialLoading) {
    return <CommunityPageSkeleton variant="browse" />
  }

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        {browse.isError || !browse.data ? (
          <CommunityErrorState
            title="Community unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading community data.',
              browse.error?.response?.data?.message,
            )}
            actionLabel="Try again"
            onAction={() => void browse.refetch()}
          />
        ) : (
          <>
            <section className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-[#e8816a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4caf7d] dark:bg-[#5cc98a]" />
                  Community
                </div>
                <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                  Exchange your{' '}
                  <span className="text-[#b84c2b] dark:text-[#e8816a]">
                    knowledge
                  </span>
                </h1>
                <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                  Join the collective effort to curate the finest academic paths.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/trackers/published')}
                className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-5 py-2.5 text-[13px] font-bold text-[#b84c2b] transition hover:-translate-y-px hover:border-[rgba(184,76,43,0.35)] hover:bg-[rgba(184,76,43,0.12)] dark:border-[rgba(232,129,106,0.25)] dark:bg-[rgba(232,129,106,0.08)] dark:text-[#e8816a] max-[560px]:w-full max-[560px]:justify-center"
              >
                <BookOpenIcon />
                My publications
                <span className="ml-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#b84c2b] px-1 font-['DM_Mono',monospace] text-[9px] font-bold text-white dark:bg-[#e8816a] dark:text-[#1a1714]">
                  {browse.data.stats[0]?.value ?? '0'}
                </span>
              </button>
            </section>

            {cloneTracker.isError && (
              <div className="rounded-xl border border-[rgba(184,76,43,0.22)] bg-[rgba(184,76,43,0.07)] px-4 py-3 text-[12px] leading-normal text-[#b84c2b] dark:border-[rgba(232,129,106,0.25)] dark:text-[#e8816a]">
                {getApiErrorMessage(
                  'Unable to clone tracker. Please try again.',
                  cloneTracker.error?.response?.data?.message,
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {browse.data.stats.map((card, index) => (
                <CommunityStatCard
                  key={card.label}
                  {...card}
                  accent={
                    COMMUNITY_STAT_ACCENTS[index] ?? COMMUNITY_STAT_ACCENTS[0]
                  }
                />
              ))}
            </div>

            <VerifyEarnBanner
              banner={browse.data.verifyBanner}
              onGo={() => navigate('/verify-and-earn')}
            />

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
                <p className="text-[12px] font-medium text-[#b84c2b] dark:text-[#e8816a]">
                  {searchError}
                </p>
              ) : isUpdatingResults ? (
                <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-widest text-[#9b9a92]">
                  Updating results…
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                'transition-opacity duration-200',
                isUpdatingResults && 'opacity-70',
              )}
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
                <div className="rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] px-6 py-10 text-center dark:border-white/10 dark:bg-[#1e1c19]">
                  <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                    No trackers found
                  </h2>
                  <p className="mt-2 text-[13px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                    Try clearing filters or searching another topic.
                  </p>
                </div>
              )}
            </div>

            <CommunityPagination
              pagination={browse.data.pagination}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </CommunityLayout>
  )
}