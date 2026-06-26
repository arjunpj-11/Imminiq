import type { CommunitySort } from '../types/community.types'

export const COMMUNITY_PAGE_LIMIT = 12
export const COMMUNITY_VERIFY_PAGE_LIMIT = 8
export const COMMUNITY_REVIEW_REWARD_COINS = 50

export const COMMUNITY_SORT_OPTIONS: Array<{
  label: string
  value: CommunitySort
}> = [
  { label: 'Top rated', value: 'top-rated' },
  { label: 'Most cloned', value: 'most-cloned' },
  { label: 'Newest', value: 'newest' },
]

export const COMMUNITY_RATING_OPTIONS: Array<{
  label: string
  value: number | null
}> = [
  { label: 'Any rating', value: null },
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4 },
  { label: '3.5+', value: 3.5 },
]

export const COMMUNITY_STAT_ACCENTS = [
  { light: '#b84c2b', dark: '#e8816a' },
  { light: '#3b6cb7', dark: '#4a9eff' },
  { light: '#2d6a47', dark: '#3dbf82' },
  { light: '#c98000', dark: '#f0a832' },
]

export const COMMUNITY_VERIFY_STAT_ACCENTS = {
  amber: { light: '#c98000', dark: '#f0a832' },
  green: { light: '#2d6a47', dark: '#3dbf82' },
  rust: { light: '#b84c2b', dark: '#e8816a' },
  purple: { light: '#6b46c1', dark: '#a78bfa' },
} as const
