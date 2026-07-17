import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { AdminListQuery, AdminPageData } from "../../shared";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminPublishedTracker } from "../types/admin-trackers.types";
import {
  ADMIN_TRACKERS_ENDPOINTS,
  ADMIN_TRACKERS_STALE_TIME_MS,
} from "../constants/admin-trackers.constants";
import { adminTrackersKeys } from "./admin-trackers.query-keys";

export const useAdminPublishedTrackers = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminTrackersKeys.publishedList(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminPublishedTracker>>>(
          ADMIN_TRACKERS_ENDPOINTS.published,
          { params: query },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_TRACKERS_STALE_TIME_MS,
  });
