import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminListQuery, AdminPageData } from "../../shared";
import { ADMIN_TRACKERS_ENDPOINTS } from "../constants/admin-trackers.constants";
import type { AdminTrackerReview } from "../types/admin-trackers.types";
import { adminTrackersKeys } from "./admin-trackers.query-keys";

export const useAdminTrackerReviews = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminTrackersKeys.reviewList(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminTrackerReview>>>(
          ADMIN_TRACKERS_ENDPOINTS.reviews,
          { params: query },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
