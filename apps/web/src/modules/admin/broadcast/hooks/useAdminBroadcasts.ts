import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminBroadcast } from '../types/admin-broadcast.types';
import { adminBroadcastKeys } from './admin-broadcast.query-keys';
export const useAdminBroadcasts = (page: number) =>
  useQuery({
    queryKey: adminBroadcastKeys.list(page),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminBroadcast>>>('/admin/broadcasts', {
          params: { page, limit: 5 },
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });
export const useCreateAdminBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      message: string;
      audience: 'all' | 'active';
      deepLink?: string;
    }) => api.post('/admin/broadcasts', input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminBroadcastKeys.all }),
  });
};
