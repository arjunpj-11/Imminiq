import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { NOTIFICATION_API_PATHS } from '../constants/notification.constants';
import { notificationKeys } from './notifications.query-keys';

export const useVoteNotificationPoll = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationId, optionIndex }: { notificationId: string; optionIndex: number }) =>
      api.post(NOTIFICATION_API_PATHS.vote(notificationId), { optionIndex }),
    onSuccess: () => client.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};
