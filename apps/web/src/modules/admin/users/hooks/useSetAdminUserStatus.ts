import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { adminDashboardKeys } from '../../dashboard';
import { adminUsersKeys } from './admin-users.query-keys';

export const useSetAdminUserStatus = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: 'active' | 'blocked') =>
      (await api.patch(`/admin/users/${userId}/status`, { status })).data,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ]);
    },
  });
};
