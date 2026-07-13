import { z } from 'zod'
export const adminSettingsSchema = z.object({ maintenanceMode: z.boolean(), allowBroadcasts: z.boolean(), supportEmail: z.email(), auditRetentionDays: z.number().int().min(30).max(3650) })
