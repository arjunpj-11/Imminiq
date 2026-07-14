import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { notificationKeys } from './notification-query-keys';
export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
