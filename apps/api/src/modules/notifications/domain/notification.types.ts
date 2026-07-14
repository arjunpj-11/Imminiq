import type { NOTIFICATION_TYPES } from './notification.constants';

export type NotificationType = (typeof NOTIFICATION_TYPES)[number] | string;
export type NotificationMetadata = Record<string, unknown>;
