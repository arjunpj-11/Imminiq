import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import type { AdminSupportTicket } from "../types/admin-support-tickets.types";
import { ADMIN_SUPPORT_TICKETS_ENDPOINTS } from "../constants/admin-support-tickets.constants";
import { adminSupportTicketsKeys } from "./admin-support-tickets.query-keys";

export const useUpdateAdminSupportTicket = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
      notificationMessage,
    }: {
      id: string;
      status: AdminSupportTicket["status"];
      resolutionNote?: string;
      notificationMessage?: string;
    }) =>
      api.patch(ADMIN_SUPPORT_TICKETS_ENDPOINTS.update(id), {
        status,
        resolutionNote,
        notificationMessage,
      }),
    onMutate: () => ({
      toastId: toast.loading(
        "Updating support ticket…",
        "Saving the status and notifying the user.",
      ),
    }),
    onSuccess: async (_data, _input, context) => {
      toast.update(context.toastId, {
        title: "Support ticket updated",
        description:
          "The requester was notified and the audit trail was updated.",
        tone: "success",
      });
      await client.invalidateQueries({ queryKey: adminSupportTicketsKeys.all });
    },
    onError: (error, _input, context) => {
      if (!context) return;
      toast.update(context.toastId, {
        title: "Ticket update failed",
        description: getUserFacingError(
          error,
          "The ticket and notification could not be saved.",
        ),
        tone: "error",
        duration: 5600,
      });
    },
  });
};
