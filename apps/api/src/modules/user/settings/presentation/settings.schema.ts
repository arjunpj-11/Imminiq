import { z } from 'zod';

export const submitDataPrivacyRequestSchema = z.object({
  type: z.enum(['access', 'export', 'delete', 'correction']),
  details: z.string().trim().min(10).max(3000),
});

export const updateAppearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const updateNotificationsSchema = z.object({
  globalEnabled: z.boolean().optional(),
  types: z.object({ adminBroadcasts: z.boolean().optional() }).optional(),
});

export const updatePrivacySchema = z.object({
  showProfile: z.boolean().optional(),
  showStats: z.boolean().optional(),
  showActivity: z.boolean().optional(),
});

export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;
export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
