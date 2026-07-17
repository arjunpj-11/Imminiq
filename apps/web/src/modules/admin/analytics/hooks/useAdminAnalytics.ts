import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminAnalytics } from "../types/admin-analytics.types";
import { adminAnalyticsKeys } from "./admin-analytics.query-keys";
import {
  ADMIN_ANALYTICS_ENDPOINTS,
  ADMIN_ANALYTICS_STALE_TIME_MS,
} from "../constants/admin-analytics.constants";
export const useAdminAnalytics = (range: { from: string; to: string }) =>
  useQuery({
    queryKey: adminAnalyticsKeys.range(range),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminAnalytics>>(
          ADMIN_ANALYTICS_ENDPOINTS.overview,
          {
            params: range,
          },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_ANALYTICS_STALE_TIME_MS,
  });
