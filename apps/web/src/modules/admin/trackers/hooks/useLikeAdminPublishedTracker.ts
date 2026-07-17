import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { ADMIN_TRACKERS_ENDPOINTS } from "../constants/admin-trackers.constants";
import { adminTrackersKeys } from "./admin-trackers.query-keys";

export const useLikeAdminPublishedTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post(ADMIN_TRACKERS_ENDPOINTS.likePublished(id)),
    onMutate: () => ({ toastId: toast.loading("Saving like…") }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: adminTrackersKeys.published() }),
    onSettled: (_data, _error, _input, context) =>
      context && toast.dismiss(context.toastId),
  });
};
