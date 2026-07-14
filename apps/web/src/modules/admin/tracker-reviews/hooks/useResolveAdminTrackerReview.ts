import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_TRACKER_REVIEWS_ENDPOINTS } from '../constants/admin-tracker-reviews.constants';
import { adminTrackerReviewsKeys } from './admin-tracker-reviews.query-keys';

export const useResolveAdminTrackerReview = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.patch(ADMIN_TRACKER_REVIEWS_ENDPOINTS.status(id), { status }),
    onMutate: () => ({ toastId: toast.loading('Updating tracker review…') }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackerReviewsKeys.all }),
    onSettled: (_data, _error, _input, context) => context && toast.dismiss(context.toastId),
  });
};
