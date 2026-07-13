import type { CommunitySort } from '../types/community.types';

export const COMMUNITY_PAGE_LIMIT = 12;
export const COMMUNITY_VERIFY_PAGE_LIMIT = 8;
export const COMMUNITY_REVIEW_REWARD_COINS = 50;

export const COMMUNITY_SORT_OPTIONS: Array<{
  label: string;
  value: CommunitySort;
}> = [
  { label: 'Top rated', value: 'top-rated' },
  { label: 'Most cloned', value: 'most-cloned' },
  { label: 'Newest', value: 'newest' },
];

export const COMMUNITY_RATING_OPTIONS: Array<{
  label: string;
  value: number | null;
}> = [
  { label: 'Any rating', value: null },
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4 },
  { label: '3.5+', value: 3.5 },
];

export const COMMUNITY_STAT_ACCENTS = [
  { light: 'var(--brand-500)', dark: 'var(--brand-500)' },
  { light: 'var(--info)', dark: 'var(--info)' },
  { light: 'var(--success)', dark: 'var(--success)' },
  { light: 'var(--warning)', dark: 'var(--warning)' },
];

export const COMMUNITY_VERIFY_STAT_ACCENTS = {
  amber: { light: 'var(--warning)', dark: 'var(--warning)' },
  green: { light: 'var(--success)', dark: 'var(--success)' },
  rust: { light: 'var(--brand-500)', dark: 'var(--brand-500)' },
  purple: { light: '#6b46c1', dark: '#a78bfa' },
} as const;
