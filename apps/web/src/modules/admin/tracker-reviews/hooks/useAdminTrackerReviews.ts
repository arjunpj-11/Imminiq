import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminTrackerReview } from '../types/admin-tracker-reviews.types';
import { adminTrackerReviewsKeys } from './admin-tracker-reviews.query-keys';
import {
  ADMIN_TRACKER_REVIEWS_ENDPOINTS,
  ADMIN_TRACKER_REVIEWS_STALE_TIME_MS,
} from '../constants/admin-tracker-reviews.constants';
export const useAdminTrackerReviews = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminTrackerReviewsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminTrackerReview>>>(ADMIN_TRACKER_REVIEWS_ENDPOINTS.list, {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_TRACKER_REVIEWS_STALE_TIME_MS,
  });
