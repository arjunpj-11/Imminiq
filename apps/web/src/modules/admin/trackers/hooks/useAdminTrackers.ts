import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { AdminListQuery, AdminPageData } from "../../../../components/admin";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminTracker } from "../types/admin-trackers.types";
import { adminTrackersKeys } from "./admin-trackers.query-keys";
import {
  ADMIN_TRACKERS_ENDPOINTS,
  ADMIN_TRACKERS_STALE_TIME_MS,
} from "../constants/admin-trackers.constants";
export const useAdminTrackers = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminTrackersKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminTracker>>>(
          ADMIN_TRACKERS_ENDPOINTS.list,
          {
            params: query,
          },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_TRACKERS_STALE_TIME_MS,
  });
