import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import type { AdminUserMessagePayload } from '../types/admin-users.types';
import { adminUsersKeys } from './admin-users.query-keys';

export const useSendAdminUserMessage = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionPassword,
      ...payload
    }: AdminUserMessagePayload & { actionPassword: string }) =>
      api.post(ADMIN_USERS_ENDPOINTS.message(userId), payload, {
        headers: { 'x-admin-action-password': actionPassword },
      }),
    onSuccess: async () => {
      toast.success('Message sent', 'The user received an in-app notification.');
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(userId),
      });
    },
    onError: (error) => toast.error('Message failed', getUserFacingError(error)),
  });
};
