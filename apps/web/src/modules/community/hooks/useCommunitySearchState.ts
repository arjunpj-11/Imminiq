import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { CommunitySort } from '../types/community.types'

const VALID_SORTS = new Set<CommunitySort>([
  'top-rated',
  'most-cloned',
  'newest',
])

const positiveInteger = (value: string | null, fallback = 1) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const ratingValue = (value: string | null) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 5 ? parsed : null
}

export function useCommunitySearchState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => {
    const sortParam = searchParams.get('sort') as CommunitySort | null

    return {
      search: searchParams.get('q') ?? '',
      selectedTopics: (searchParams.get('topics') ?? '')
        .split(',')
        .map((topic) => topic.trim())
        .filter(Boolean),
      minRating: ratingValue(searchParams.get('rating')),
      verifiedOnly: searchParams.get('verified') === 'true',
      sort:
        sortParam && VALID_SORTS.has(sortParam) ? sortParam : 'top-rated',
      page: positiveInteger(searchParams.get('page')),
    }
  }, [searchParams])

  const update = useCallback(
    (
      patch: Partial<typeof state>,
      options: { resetPage?: boolean; replace?: boolean } = {},
    ) => {
      const next = new URLSearchParams(searchParams)
      const merged = { ...state, ...patch }

      const setOrDelete = (key: string, value: string, omit: boolean) => {
        if (omit) next.delete(key)
        else next.set(key, value)
      }

      setOrDelete('q', merged.search, !merged.search.trim())
      setOrDelete(
        'topics',
        merged.selectedTopics.join(','),
        merged.selectedTopics.length === 0,
      )
      setOrDelete(
        'rating',
        String(merged.minRating),
        merged.minRating === null,
      )
      setOrDelete('verified', 'true', !merged.verifiedOnly)
      setOrDelete('sort', merged.sort, merged.sort === 'top-rated')

      const nextPage = options.resetPage ? 1 : merged.page
      setOrDelete('page', String(nextPage), nextPage <= 1)

      setSearchParams(next, { replace: options.replace ?? true })
    },
    [searchParams, setSearchParams, state],
  )

  return {
    ...state,
    setSearch: (search: string) => update({ search }, { resetPage: true }),
    setSelectedTopics: (selectedTopics: string[]) =>
      update({ selectedTopics }, { resetPage: true }),
    setMinRating: (minRating: number | null) =>
      update({ minRating }, { resetPage: true }),
    setVerifiedOnly: (verifiedOnly: boolean) =>
      update({ verifiedOnly }, { resetPage: true }),
    setSort: (sort: CommunitySort) => update({ sort }, { resetPage: true }),
    setPage: (page: number) => update({ page }, { replace: false }),
    clearFilters: () =>
      update(
        {
          search: '',
          selectedTopics: [],
          minRating: null,
          verifiedOnly: false,
          sort: 'top-rated',
          page: 1,
        },
        { replace: false },
      ),
  }
}

export function useCommunityVerifyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = positiveInteger(searchParams.get('page'))

  return {
    page,
    setPage: (nextPage: number) => {
      const next = new URLSearchParams(searchParams)
      if (nextPage <= 1) next.delete('page')
      else next.set('page', String(nextPage))
      setSearchParams(next, { replace: false })
    },
  }
}
