import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import type { AdminTrackerLifecyclePayload } from '../types/admin-trackers.types';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useUpdateAdminTrackerLifecycle = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminTrackerLifecyclePayload }) =>
      api.patch(ADMIN_TRACKERS_ENDPOINTS.lifecycle(id), payload),
    onSuccess: async () => {
      toast.success('Tracker moderation updated', 'The owner received the decision and reason.');
      await client.invalidateQueries({ queryKey: adminTrackersKeys.all });
    },
    onError: (error) => toast.error('Tracker update failed', getUserFacingError(error)),
  });
};
