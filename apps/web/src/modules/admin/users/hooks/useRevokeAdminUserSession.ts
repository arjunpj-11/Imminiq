import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import { adminUsersKeys } from './admin-users.query-keys';

export const useRevokeAdminUserSession = (userId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, mfaCode }: { sessionId: string; mfaCode?: string }) =>
      api.delete(ADMIN_USERS_ENDPOINTS.session(userId, sessionId), {
        headers: mfaCode ? { 'X-Admin-MFA-Code': mfaCode } : undefined,
      }),
    onSuccess: async () => {
      toast.success('Session revoked', 'That device will need to sign in again.');
      await client.invalidateQueries({ queryKey: adminUsersKeys.detail(userId) });
    },
    onError: (error) => toast.error('Could not revoke session', getUserFacingError(error)),
  });
};
