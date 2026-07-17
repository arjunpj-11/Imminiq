import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { ADMIN_USERS_ENDPOINTS } from "../constants/admin-users.constants";
import type { AdminUserAppealUpdatePayload } from "../types/admin-users.types";
import { adminUsersKeys } from "./admin-users.query-keys";

export const useUpdateAdminUserAppeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdminUserAppealUpdatePayload;
    }) => {
      const { actionPassword, ...body } = payload;
      return api.patch(ADMIN_USERS_ENDPOINTS.appeal(id), body, {
        headers: actionPassword ? { "X-Admin-Action-Password": actionPassword } : undefined,
      });
    },
    onMutate: () => ({ toastId: toast.loading("Updating appeal…") }),
    onSuccess: async () => {
      toast.success(
        "Appeal updated",
        "The decision was recorded and the user was notified.",
      );
      await Promise.all([
        client.invalidateQueries({ queryKey: adminUsersKeys.appeals() }),
        client.invalidateQueries({ queryKey: adminUsersKeys.lists() }),
      ]);
    },
    onError: (error) =>
      toast.error("Appeal update failed", getUserFacingError(error)),
    onSettled: (_data, _error, _input, context) =>
      context && toast.dismiss(context.toastId),
  });
};
