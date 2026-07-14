import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminSettings } from '../types/admin-settings.types';
export const useAdminSettings = () =>
  useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get<ApiEnvelope<AdminSettings>>('/admin/settings')).data.data,
  });
export const useUpdateAdminSettings = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AdminSettings, 'updatedAt'>) => api.put('/admin/settings', input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
};
