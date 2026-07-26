import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';

import { notificationKeys } from '../modules/notifications';
import { friendsQueryKeys } from '../modules/user/friends';
import { socialQueryKeys } from '../modules/user/social';
import { profileQueryKeys } from '../modules/user/users';
import { trackerKeys } from '../modules/user/trackers/hooks/trackers.query-keys';

const FRIEND_NOTIFICATION_TYPES = new Set(['friend_request_received', 'friend_request_accepted']);
const TRACKER_CHANGE_NOTIFICATION_TYPES = new Set(['tracker_topic_contribution_approved']);

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
      if (event?.type && TRACKER_CHANGE_NOTIFICATION_TYPES.has(event.type)) {
        void queryClient.invalidateQueries({ queryKey: trackerKeys.all });
      }
    };
    const refreshChat = () => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.chat.all });
    };
    const refreshSocialBlocks = () => {
      refreshChat();
      void queryClient.invalidateQueries({
        queryKey: socialQueryKeys.calls.all,
      });
      queryClient.removeQueries({
        queryKey: profileQueryKeys.publicProfiles(),
      });
    };
    const refreshAfterReconnect = () => {
      refreshNotifications();
      refreshChat();
    };
    let active = true;
    let realtimeSocket: Socket | undefined;

    void import('../lib/socket').then(({ socket }) => {
      if (!active) return;
      realtimeSocket = socket;
      socket.auth = { token: accessToken };
      socket.on('notification:created', refreshNotifications);
      socket.on('chat:message', refreshChat);
      socket.on('chat:read', refreshChat);
      socket.on('chat:block-updated', refreshSocialBlocks);
      socket.on('connect', refreshAfterReconnect);
      if (!socket.connected) socket.connect();
    });

    return () => {
      active = false;
      realtimeSocket?.off('notification:created', refreshNotifications);
      realtimeSocket?.off('chat:message', refreshChat);
      realtimeSocket?.off('chat:read', refreshChat);
      realtimeSocket?.off('chat:block-updated', refreshSocialBlocks);
      realtimeSocket?.off('connect', refreshAfterReconnect);
      realtimeSocket?.disconnect();
    };
  }, [accessToken, enabled, queryClient]);
};
