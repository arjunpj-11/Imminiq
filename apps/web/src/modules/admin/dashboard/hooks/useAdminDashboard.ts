import { useQuery } from "@tanstack/react-query";

import api from "../../../../lib/axios";
import {
  ADMIN_DASHBOARD_ENDPOINTS,
  ADMIN_DASHBOARD_REFETCH_INTERVAL_MS,
  ADMIN_DASHBOARD_STALE_TIME_MS,
} from "../constants/admin-dashboard.constants";
import type { AdminDashboardData } from "../types/admin-dashboard.types";
import { adminDashboardKeys } from "./admin-dashboard.query-keys";
import type { ApiEnvelope } from "../../../../lib/api.types";

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminDashboardKeys.overview(),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminDashboardData>>(
          ADMIN_DASHBOARD_ENDPOINTS.overview,
        )
      ).data.data,
    staleTime: ADMIN_DASHBOARD_STALE_TIME_MS,
    refetchInterval: ADMIN_DASHBOARD_REFETCH_INTERVAL_MS,
  });
