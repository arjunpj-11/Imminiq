import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import type { AdminUserNotePayload } from '../types/admin-users.types';
import { adminUsersKeys } from './admin-users.query-keys';

export const useAddAdminUserNote = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ note, tags, actionPassword }: AdminUserNotePayload) => {
      await api.post(
        ADMIN_USERS_ENDPOINTS.notes(userId),
        { note, tags },
        { headers: { 'X-Admin-Action-Password': actionPassword } },
      );
    },
    onSuccess: async () => {
      toast.success('Internal note added');
      await queryClient.invalidateQueries({ queryKey: adminUsersKeys.notes(userId) });
    },
  });
};
