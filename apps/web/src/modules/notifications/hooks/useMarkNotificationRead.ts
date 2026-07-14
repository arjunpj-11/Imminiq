import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { notificationKeys } from './notification-query-keys';
export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
