import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useResolveAdminTrackerReview = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.patch(ADMIN_TRACKERS_ENDPOINTS.reviewStatus(id), { status }),
    onMutate: () => ({ toastId: toast.loading('Updating tracker review…') }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackersKeys.reviews() }),
    onSettled: (_data, _error, _input, context) => context && toast.dismiss(context.toastId),
  });
};
