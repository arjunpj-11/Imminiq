import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import {
  NOTIFICATION_API_PATHS,
  NOTIFICATION_PAGE_LIMIT,
  NOTIFICATION_REFETCH_INTERVAL_MS,
} from '../constants/notification.constants';
import type { INotificationList } from '../types/notification.types';
import { notificationKeys } from './notifications.query-keys';

interface IApiResponse<T> {
  data: T;
}
export const useNotifications = (page = 1, enabled = true) =>
  useQuery({
    queryKey: notificationKeys.list(page, NOTIFICATION_PAGE_LIMIT),
    queryFn: async () =>
      (
        await api.get<IApiResponse<INotificationList>>(NOTIFICATION_API_PATHS.root, {
          params: { page, limit: NOTIFICATION_PAGE_LIMIT },
        })
      ).data.data,
    placeholderData: keepPreviousData,
    refetchInterval: NOTIFICATION_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    enabled,
  });
