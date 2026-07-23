import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import type { AdminUserTagsPayload } from '../types/admin-users.types';
import { adminUsersKeys } from './admin-users.query-keys';

export const useUpdateAdminUserTags = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tags, actionPassword }: AdminUserTagsPayload) => {
      await api.put(
        ADMIN_USERS_ENDPOINTS.tags(userId),
        { tags },
        { headers: { 'X-Admin-Action-Password': actionPassword } }
      );
    },
    onSuccess: async () => {
      toast.success('Account tags updated');
      await queryClient.invalidateQueries({ queryKey: adminUsersKeys.notes(userId) });
    },
  });
};
