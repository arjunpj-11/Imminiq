import type { ICommunityBrowseQuery } from '../types/community.types';

export const communityKeys = {
  all: ['community'] as const,
  browseRoot: () => [...communityKeys.all, 'browse'] as const,
  browse: (query: ICommunityBrowseQuery) =>
    [
      ...communityKeys.browseRoot(),
      query.search?.trim() ?? '',
      query.topics?.join(',') ?? '',
      query.minRating ?? 'all',
      query.verifiedOnly ? 'verified' : 'all',
      query.sort ?? 'top-rated',
      query.page ?? 1,
      query.limit,
      query.recentSearches?.join(',') ?? '',
    ] as const,
  trackers: () => [...communityKeys.all, 'trackers'] as const,
  tracker: (trackerId: string) => [...communityKeys.trackers(), trackerId] as const,
  verification: () => [...communityKeys.all, 'verify'] as const,
  verificationDashboard: (query: { page?: number; limit?: number }) =>
    [...communityKeys.verification(), 'dashboard', query] as const,
  verificationSubmission: (submissionId: string) =>
    [...communityKeys.verification(), 'submission', submissionId] as const,
};
