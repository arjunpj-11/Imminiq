import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useRateAdminPublishedTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      api.put(ADMIN_TRACKERS_ENDPOINTS.ratePublished(id), { rating }),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackersKeys.published() }),
  });
};
