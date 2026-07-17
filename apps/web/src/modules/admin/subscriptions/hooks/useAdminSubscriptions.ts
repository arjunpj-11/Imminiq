import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminSubscriptionOverview } from "../types/admin-subscriptions.types";
import {
  adminSubscriptionsKeys,
  type AdminSubscriptionsQuery,
} from "./admin-subscriptions.query-keys";
import {
  ADMIN_SUBSCRIPTIONS_ENDPOINTS,
  ADMIN_SUBSCRIPTIONS_STALE_TIME_MS,
} from "../constants/admin-subscriptions.constants";

export const useAdminSubscriptions = (query: AdminSubscriptionsQuery) =>
  useQuery({
    queryKey: adminSubscriptionsKeys.overview(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminSubscriptionOverview>>(
          ADMIN_SUBSCRIPTIONS_ENDPOINTS.overview,
          {
            params: query,
          },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_SUBSCRIPTIONS_STALE_TIME_MS,
  });
