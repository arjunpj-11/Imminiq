import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminSettings } from '../types/admin-settings.types';
import { ADMIN_SETTINGS_ENDPOINTS } from '../constants/admin-settings.constants';
import { adminSettingsKeys } from './admin-settings.query-keys';

export const useUpdateAdminSettings = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AdminSettings, 'updatedAt'>) =>
      api.put(ADMIN_SETTINGS_ENDPOINTS.update, input),
    onSuccess: () => client.invalidateQueries({ queryKey: adminSettingsKeys.all }),
  });
};
