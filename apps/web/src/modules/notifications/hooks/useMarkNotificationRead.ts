import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { NOTIFICATION_API_PATHS } from '../constants/notification.constants';
import { notificationKeys } from './notifications.query-keys';
export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(NOTIFICATION_API_PATHS.readOne(id)),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
