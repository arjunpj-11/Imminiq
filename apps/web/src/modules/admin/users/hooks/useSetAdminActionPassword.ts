import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import { adminUsersKeys } from './admin-users.query-keys';

export const useSetAdminActionPassword = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ password, actionPassword }: { password: string; actionPassword: string }) =>
      api.put(
        ADMIN_USERS_ENDPOINTS.actionPassword(userId),
        { password },
        {
          headers: { 'x-admin-action-password': actionPassword },
        }
      ),
    onSuccess: async () => {
      toast.success(
        'Action password saved',
        'The administrator can now authorize protected changes.'
      );
      await client.invalidateQueries({ queryKey: adminUsersKeys.detail(userId) });
    },
    onError: (error) => toast.error('Password update failed', getUserFacingError(error)),
  });
};
