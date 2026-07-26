// apps/web/src/modules/user/community/hooks/useCommunityBrowse.ts

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import api from '../../../../lib/axios';
import { COMMUNITY_ENDPOINTS, COMMUNITY_PAGE_LIMIT } from '../constants/community.constants';
import type {
  IApiErrorResponse,
  IApiResponse,
  ICommunityBrowseData,
  ICommunityBrowseQuery,
} from '../types/community.types';
import { communityKeys } from './community.query-keys';

const buildCommunityParams = (query: ICommunityBrowseQuery) => {
  const params = new URLSearchParams();

  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.topics?.length) params.set('topics', query.topics.join(','));
  if (query.minRating !== null && query.minRating !== undefined) {
    params.set('minRating', String(query.minRating));
  }
  if (query.verifiedOnly) params.set('verifiedOnly', 'true');
  if (query.sort) params.set('sort', query.sort);
  if (query.recentSearches?.length) {
    params.set('recentSearches', query.recentSearches.join(','));
  }

  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? COMMUNITY_PAGE_LIMIT));

  return params;
};

const fetchCommunityBrowse = async (
  query: ICommunityBrowseQuery
): Promise<ICommunityBrowseData> => {
  const params = buildCommunityParams(query);
  const response = await api.get<IApiResponse<ICommunityBrowseData>>(
    COMMUNITY_ENDPOINTS.browse(params.toString())
  );

  if (!response.data.data) {
    throw new Error('Community browse data was not returned.');
  }

  return response.data.data;
};

export const useCommunityBrowse = (query: ICommunityBrowseQuery) => {
  return useQuery<ICommunityBrowseData, AxiosError<IApiErrorResponse>>({
    queryKey: communityKeys.browse({
      ...query,
      limit: query.limit ?? COMMUNITY_PAGE_LIMIT,
    }),
    queryFn: () => fetchCommunityBrowse(query),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};
