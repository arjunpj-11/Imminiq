import { z } from 'zod';
import {
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_MAX_LIMIT,
  NOTIFICATION_MIN_LIMIT,
} from '../domain';

export const notificationsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(NOTIFICATION_DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(NOTIFICATION_MIN_LIMIT)
    .max(NOTIFICATION_MAX_LIMIT)
    .default(NOTIFICATION_DEFAULT_LIMIT),
});
export type NotificationsListQueryInput = z.infer<typeof notificationsListQuerySchema>;
