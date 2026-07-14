import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { ADMIN_BROADCAST_ENDPOINTS } from '../constants/admin-broadcast.constants';
import { adminBroadcastKeys } from './admin-broadcast.query-keys';

export const useCreateAdminBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      message: string;
      audience: 'all' | 'active';
      deepLink?: string;
    }) => api.post(ADMIN_BROADCAST_ENDPOINTS.create, input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminBroadcastKeys.all }),
  });
};
