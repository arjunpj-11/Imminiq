import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import type { AdminSettings } from "../types/admin-settings.types";
import { ADMIN_SETTINGS_ENDPOINTS } from "../constants/admin-settings.constants";
import { adminSettingsKeys } from "./admin-settings.query-keys";

type UpdateAdminSettingsInput = {
  settings: Omit<AdminSettings, "updatedAt">;
  actionPassword: string;
  changeReason: string;
};

export const useUpdateAdminSettings = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      settings,
      actionPassword,
      changeReason,
    }: UpdateAdminSettingsInput) =>
      (
        await api.put<ApiEnvelope<AdminSettings>>(
          ADMIN_SETTINGS_ENDPOINTS.update,
          settings,
          {
            headers: {
              "X-Admin-Action-Password": actionPassword,
              "X-Admin-Change-Reason": encodeURIComponent(changeReason),
            },
          },
        )
      ).data.data,
    onMutate: () => ({
      toastId: toast.loading(
        "Saving settings…",
        "Applying the reviewed platform policy.",
      ),
    }),
    onSuccess: async (settings, _input, context) => {
      client.setQueryData(adminSettingsKeys.detail(), settings);
      toast.update(context.toastId, {
        title: "Settings saved",
        description:
          "The new values are active and the change was added to the audit log.",
        tone: "success",
      });
      await client.invalidateQueries({ queryKey: adminSettingsKeys.all });
    },
    onError: (error, _input, context) => {
      if (!context) return;
      toast.update(context.toastId, {
        title: "Settings could not be saved",
        description: getUserFacingError(
          error,
          "Please check the values and try again.",
        ),
        tone: "error",
        duration: 5600,
      });
    },
  });
};
