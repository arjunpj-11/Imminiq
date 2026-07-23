import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import { adminUsersKeys } from './admin-users.query-keys';

export const useUpdateAdminUserRole = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      role,
      reason,
      actionPassword,
    }: {
      role: 'user' | 'moderator' | 'admin';
      reason: string;
      actionPassword?: string;
    }) =>
      api.patch(
        ADMIN_USERS_ENDPOINTS.role(userId),
        { role, reason },
        { headers: actionPassword ? { 'X-Admin-Action-Password': actionPassword } : undefined }
      ),
    onSuccess: async () => {
      toast.success('Role updated', 'Existing sessions were revoked and the user was notified.');
      await client.invalidateQueries({ queryKey: adminUsersKeys.all });
    },
    onError: (error) => toast.error('Role update failed', getUserFacingError(error)),
  });
};
