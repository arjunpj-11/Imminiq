import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { ADMIN_TRACKERS_ENDPOINTS } from "../constants/admin-trackers.constants";
import type { AdminTrackerReportUpdatePayload } from "../types/admin-trackers.types";
import { adminTrackersKeys } from "./admin-trackers.query-keys";

export const useUpdateAdminTrackerReport = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdminTrackerReportUpdatePayload;
    }) => {
      const { mfaCode, ...body } = payload;
      return api.patch(ADMIN_TRACKERS_ENDPOINTS.updateReport(id), body, {
        headers: mfaCode ? { "X-Admin-MFA-Code": mfaCode } : undefined,
      });
    },
    onSuccess: async () => {
      toast.success(
        "Report updated",
        "The reporter received an in-app notification.",
      );
      await client.invalidateQueries({ queryKey: adminTrackersKeys.all });
    },
    onError: (error) =>
      toast.error("Report update failed", getUserFacingError(error)),
  });
};
