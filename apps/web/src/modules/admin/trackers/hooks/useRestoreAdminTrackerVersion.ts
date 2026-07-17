import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { ADMIN_TRACKERS_ENDPOINTS } from "../constants/admin-trackers.constants";
import { adminTrackersKeys } from "./admin-trackers.query-keys";
export const useRestoreAdminTrackerVersion = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      version,
      reason,
      mfaCode,
    }: {
      id: string;
      version: number;
      reason: string;
      mfaCode: string;
    }) =>
      api.post(
        ADMIN_TRACKERS_ENDPOINTS.restoreVersion(id, version),
        { reason },
        { headers: mfaCode ? { "X-Admin-MFA-Code": mfaCode } : undefined },
      ),
    onSuccess: async () => {
      toast.success("Tracker version restored");
      await client.invalidateQueries({ queryKey: adminTrackersKeys.all });
    },
    onError: (error) =>
      toast.error("Restore failed", getUserFacingError(error)),
  });
};
