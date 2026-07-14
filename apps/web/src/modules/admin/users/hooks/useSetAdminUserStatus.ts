import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { adminDashboardKeys } from '../../dashboard';
import { adminUsersKeys } from './admin-users.query-keys';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';

export const useSetAdminUserStatus = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: 'active' | 'blocked') =>
      (await api.patch(ADMIN_USERS_ENDPOINTS.status(userId), { status })).data,
    onMutate: (status) => ({
      toastId: toast.loading(status === 'blocked' ? 'Blocking user…' : 'Unblocking user…'),
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ]);
    },
    onSettled: (_data, _error, _input, context) => context && toast.dismiss(context.toastId),
  });
};
