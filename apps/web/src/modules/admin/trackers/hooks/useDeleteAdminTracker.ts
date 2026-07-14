import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useDeleteAdminTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(ADMIN_TRACKERS_ENDPOINTS.detail(id)),
    onMutate: () => ({
      toastId: toast.loading('Deleting tracker…', 'Removing the tracker and notifying its owner.'),
    }),
    onSuccess: async (_data, _id, context) => {
      toast.update(context.toastId, {
        title: 'Tracker deleted',
        description: 'The tracker was removed and its owner was notified.',
        tone: 'success',
      });
      await client.invalidateQueries({ queryKey: adminTrackersKeys.all });
    },
    onError: (error, _id, context) => {
      if (!context) return;
      toast.update(context.toastId, {
        title: 'Tracker deletion failed',
        description: getUserFacingError(error),
        tone: 'error',
        duration: 5600,
      });
    },
  });
};
