import { create } from 'zustand'

import type { CommunitySort } from '../types/community.types'

interface CommunityStore {
  search: string
  selectedTopics: string[]
  minRating: number | null
  verifiedOnly: boolean
  sort: CommunitySort
  page: number
  verifyPage: number

  setSearch: (search: string) => void
  setSelectedTopics: (topics: string[]) => void
  setMinRating: (rating: number | null) => void
  setVerifiedOnly: (verifiedOnly: boolean) => void
  setSort: (sort: CommunitySort) => void
  setPage: (page: number) => void
  setVerifyPage: (page: number) => void
  clearFilters: () => void
}

export const useCommunityStore = create<CommunityStore>()((set) => ({
  search: '',
  selectedTopics: [],
  minRating: null,
  verifiedOnly: false,
  sort: 'top-rated',
  page: 1,
  verifyPage: 1,

  setSearch: (search) => set({ search, page: 1 }),
  setSelectedTopics: (selectedTopics) => set({ selectedTopics, page: 1 }),
  setMinRating: (minRating) => set({ minRating, page: 1 }),
  setVerifiedOnly: (verifiedOnly) => set({ verifiedOnly, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  setVerifyPage: (verifyPage) => set({ verifyPage }),
  clearFilters: () =>
    set({
      search: '',
      selectedTopics: [],
      minRating: null,
      verifiedOnly: false,
      sort: 'top-rated',
      page: 1,
    }),
}))
