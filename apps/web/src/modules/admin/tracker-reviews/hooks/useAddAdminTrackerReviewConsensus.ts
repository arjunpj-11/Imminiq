import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_TRACKER_REVIEWS_ENDPOINTS } from '../constants/admin-tracker-reviews.constants';
import { adminTrackerReviewsKeys } from './admin-tracker-reviews.query-keys';

export const useAddAdminTrackerReviewConsensus = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, choice }: { id: string; choice: 'pass' | 'fail' }) =>
      api.patch(ADMIN_TRACKER_REVIEWS_ENDPOINTS.consensus(id), { choice }),
    onMutate: () => ({ toastId: toast.loading('Adding consensus vote…') }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackerReviewsKeys.all }),
    onSettled: (_data, _error, _input, context) => context && toast.dismiss(context.toastId),
  });
};
