import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminSettings } from "../types/admin-settings.types";
import { adminSettingsKeys } from "./admin-settings.query-keys";
import {
  ADMIN_SETTINGS_ENDPOINTS,
  ADMIN_SETTINGS_STALE_TIME_MS,
} from "../constants/admin-settings.constants";
export const useAdminSettings = () =>
  useQuery({
    queryKey: adminSettingsKeys.detail(),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminSettings>>(
          ADMIN_SETTINGS_ENDPOINTS.detail,
        )
      ).data.data,
    staleTime: ADMIN_SETTINGS_STALE_TIME_MS,
  });
