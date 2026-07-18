import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { notificationKeys } from '../modules/notifications';
import { friendsQueryKeys } from '../modules/user/friends';

const FRIEND_NOTIFICATION_TYPES = new Set([
  'friend_request_received',
  'friend_request_accepted',
]);

type NotificationCreatedEvent = {
  type?: string;
};

export const useRealtimeAppEvents = (accessToken: string | null, enabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !accessToken) return undefined;

    const refreshNotifications = (event?: NotificationCreatedEvent) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      if (event?.type && FRIEND_NOTIFICATION_TYPES.has(event.type)) {
        void queryClient.invalidateQueries({ queryKey: friendsQueryKeys.all });
      }
    };
    const refreshAfterReconnect = () => refreshNotifications();
    let active = true;
    let realtimeSocket: (typeof import('../lib/socket'))['socket'] | undefined;

    void import('../lib/socket').then(({ socket }) => {
      if (!active) return;
      realtimeSocket = socket;
      socket.auth = { token: accessToken };
      socket.on('notification:created', refreshNotifications);
      socket.on('connect', refreshAfterReconnect);
      if (!socket.connected) socket.connect();
    });

    return () => {
      active = false;
      realtimeSocket?.off('notification:created', refreshNotifications);
      realtimeSocket?.off('connect', refreshAfterReconnect);
      realtimeSocket?.disconnect();
    };
  }, [accessToken, enabled, queryClient]);
};
