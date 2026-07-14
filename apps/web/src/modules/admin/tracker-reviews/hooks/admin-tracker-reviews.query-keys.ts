import type { AdminListQuery } from '../../shared';

export const adminTrackerReviewsKeys = {
  all: ['admin', 'tracker-reviews'] as const,
  list: (query: AdminListQuery) => [...adminTrackerReviewsKeys.all, 'list', query] as const,
};
