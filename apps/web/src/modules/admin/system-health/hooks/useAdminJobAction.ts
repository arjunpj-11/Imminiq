import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { ADMIN_SYSTEM_HEALTH_ENDPOINTS } from '../constants/admin-system-health.constants';
import { adminSystemHealthKeys } from './admin-system-health.query-keys';

export const useAdminJobAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      queue: string;
      jobId: string;
      action: 'cancel' | 'retry' | 'remove';
      actionPassword: string;
    }) =>
      api.patch(
        ADMIN_SYSTEM_HEALTH_ENDPOINTS.job(input.queue, input.jobId),
        { action: input.action },
        {
          headers: input.actionPassword
            ? { 'X-Admin-Action-Password': input.actionPassword }
            : undefined,
        }
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: adminSystemHealthKeys.all });
    },
  });
};
