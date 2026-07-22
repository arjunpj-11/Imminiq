import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import { adminUsersKeys } from './admin-users.query-keys';

export const useDeleteAdminUserNote = (userId: string, actionPassword: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(ADMIN_USERS_ENDPOINTS.note(userId, noteId), {
        headers: { 'X-Admin-Action-Password': actionPassword },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersKeys.notes(userId) });
    },
  });
};
