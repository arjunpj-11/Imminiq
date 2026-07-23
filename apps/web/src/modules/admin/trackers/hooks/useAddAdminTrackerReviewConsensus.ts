import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useAddAdminTrackerReviewConsensus = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      choice,
      actionPassword,
    }: {
      id: string;
      choice: 'pass' | 'fail';
      actionPassword: string;
    }) =>
      api.patch(
        ADMIN_TRACKERS_ENDPOINTS.reviewConsensus(id),
        { choice },
        {
          headers: { 'x-admin-action-password': actionPassword },
        }
      ),
    onMutate: () => ({ toastId: toast.loading('Adding consensus vote…') }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackersKeys.reviews() }),
    onSettled: (_data, _error, _input, context) => context && toast.dismiss(context.toastId),
  });
};
