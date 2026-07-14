import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminSettings } from '../types/admin-settings.types';
import { adminSettingsKeys } from './admin-settings.query-keys';
export const useAdminSettings = () =>
  useQuery({
    queryKey: adminSettingsKeys.detail(),
    queryFn: async () => (await api.get<ApiEnvelope<AdminSettings>>('/admin/settings')).data.data,
  });
export const useUpdateAdminSettings = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AdminSettings, 'updatedAt'>) => api.put('/admin/settings', input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSettingsKeys.all }),
  });
};
