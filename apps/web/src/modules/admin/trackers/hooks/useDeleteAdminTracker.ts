import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { ADMIN_TRACKERS_ENDPOINTS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useDeleteAdminTracker = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(ADMIN_TRACKERS_ENDPOINTS.detail(id)),
    onSuccess: () => client.invalidateQueries({ queryKey: adminTrackersKeys.all }),
  });
};
